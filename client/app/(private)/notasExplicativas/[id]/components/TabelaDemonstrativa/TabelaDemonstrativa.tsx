// src/components/TabelaDemonstrativa/TabelaDemonstrativa.tsx
import { useState, useEffect } from 'react';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { ContaBalancete, DadosBalancete, TabelaDemonstrativa as TabelaType } from '../../types';
import TabelaHeader from './TabelaHeader';
import TabelaBody from './TabelaBody';
import InfoBox from './InfoBox';
import api from '@/app/api/api';

interface TabelaDemonstrativaProps {
  notaId: string;
  tabelas: TabelaType[];
  onTabelasChange: (tabelas: TabelaType[]) => void;
  companyId: string;
}

export default function TabelaDemonstrativa({ 
  notaId, 
  tabelas, 
  onTabelasChange,
  companyId 
}: TabelaDemonstrativaProps) {
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(false);
  const [loadingContas, setLoadingContas] = useState(false);
  const [contasBalancete, setContasBalancete] = useState<ContaBalancete[]>([]);

  const [anoAtual] = useState<number>(new Date().getFullYear());
  const [anoAnterior] = useState<number>(new Date().getFullYear() - 1);

  const handleAddRow = async () => {
    try {
      setLoading(true);
      const novaOrdem = tabelas.length > 0 ? Math.max(...tabelas.map(t => t.ordem)) + 1 : 1;
      
      const res = await api.post(`demoTable/${notaId}`, {
        conta: '',
        anoAnterior: null,
        anoAtual: null,
        ordem: novaOrdem,
        contasVinculadasIds: []
      });

      if (res.status === 201) {
        const novasTabelas = [...tabelas, res.data];
        onTabelasChange(novasTabelas);
        toast.current?.show({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Nova linha adicionada.',
          life: 2000,
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar linha:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao adicionar nova linha.',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  }

  const fetchContasBalancete = async () => {
    setLoadingContas(true);
    try {
      const response = await api.get(`/balancete/${companyId}/contas`);
      setContasBalancete(response.data);
    } catch (error) {
      console.error('Erro ao carregar contas do balancete:', error);
      setContasBalancete([]);
    }
    setLoadingContas(false);
  }

  const buscarDadosBalancete = async (codigoConta: string, ano: number): Promise<DadosBalancete | null> => {
    try {
      const res = await api.get(`/balancete/${companyId}/${ano}/${codigoConta}`);
      
      if (res.status === 200 && res.data) {
        return res.data;
      }
      return null;
    } catch (error) {
      console.error(`Erro ao buscar dados do balancete para conta ${codigoConta} no ano ${ano}:`, error);
      return null;
    }
  }

  const buscarDadosAutomaticos = async (codigoConta: string) => {
    try {
      const [dadosAnoAtual, dadosAnoAnterior] = await Promise.all([
        buscarDadosBalancete(codigoConta, anoAtual),
        buscarDadosBalancete(codigoConta, anoAnterior)
      ]);

      return {
        anoAtual: dadosAnoAtual ? Number(dadosAnoAtual.currentBalance) : null,
        anoAnterior: dadosAnoAnterior ? Number(dadosAnoAnterior.currentBalance) : null
      };
    } catch (error) {
      console.error('Erro ao buscar dados automáticos:', error);
      return { anoAtual: null, anoAnterior: null };
    }
  }

  // NOVA FUNÇÃO: Calcular valores das contas selecionadas
  const calcularValoresContas = async (contasSelecionadas: ContaBalancete[]) => {
    if (!contasSelecionadas || contasSelecionadas.length === 0) {
      return { anoAtual: null, anoAnterior: null };
    }

    try {
      let somaAnoAtual = 0;
      let somaAnoAnterior = 0;

      // Itera sobre cada conta selecionada para buscar seus dados
      for (const conta of contasSelecionadas) {
        // Busca dados do ano atual
        const dadosAnoAtual = await buscarDadosBalancete(conta.accountingAccount, anoAtual);
        if (dadosAnoAtual && dadosAnoAtual.currentBalance) {
          somaAnoAtual += Number(dadosAnoAtual.currentBalance);
        }

        // Busca dados do ano anterior
        const dadosAnoAnterior = await buscarDadosBalancete(conta.accountingAccount, anoAnterior);
        if (dadosAnoAnterior && dadosAnoAnterior.currentBalance) {
          somaAnoAnterior += Number(dadosAnoAnterior.currentBalance);
        }
      }

      return {
        anoAtual: somaAnoAtual,
        anoAnterior: somaAnoAnterior
      };
    } catch (error) {
      console.error('Erro ao calcular valores das contas:', error);
      return { anoAtual: null, anoAnterior: null };
    }
  }

  const handleUpdateRow = async (id: string, field: string, value: any) => {
    try {
      // Atualiza o estado local primeiro
      const updatedTabelas = tabelas.map(tabela =>
        tabela.id === id ? { ...tabela, [field]: value } : tabela
      );
      onTabelasChange(updatedTabelas);

      // Se for a conta principal, busca dados automáticos
      if (field === 'conta' && value) {
        const dados = await buscarDadosAutomaticos(value);
        if (dados.anoAtual !== null || dados.anoAnterior !== null) {
          const tabelaComDados = updatedTabelas.map(tabela =>
            tabela.id === id 
              ? { ...tabela, anoAtual: dados.anoAtual, anoAnterior: dados.anoAnterior }
              : tabela
          );
          onTabelasChange(tabelaComDados);

          // Atualiza no backend com os dados automáticos
          await api.put(`demoTable/${id}`, {
            conta: value,
            anoAtual: dados.anoAtual,
            anoAnterior: dados.anoAnterior
          });
          return;
        }
      }

      // Atualização normal no backend
      await api.put(`demoTable/${id}`, { [field]: value });
      
    } catch (error) {
      console.error('Erro ao atualizar linha:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao atualizar a linha.',
        life: 3000,
      });
    }
  }

  const handleDeleteRow = async (id: string) => {
    try {
      setLoading(true);
      await api.delete(`demoTable/${id}`);
      const updatedTabelas = tabelas.filter(t => t.id !== id);
      onTabelasChange(updatedTabelas);
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Linha deletada com sucesso.',
        life: 2000,
      });
    } catch (error) {
      console.error('Erro ao deletar linha:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao deletar a linha.',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  }

  // FUNÇÃO ATUALIZADA: Agora também calcula os valores automaticamente
  const handleContasSelect = async (id: string, contasSelecionadas: ContaBalancete[]) => {
    try {
      setLoading(true);

      // Calcula os valores das contas selecionadas
      const valores = await calcularValoresContas(contasSelecionadas);

      // Atualiza as contas vinculadas e os valores no backend
      const contasVinculadasIds = contasSelecionadas.map(conta => conta.id);
      
      await api.put(`demoTable/${id}`, {
        contasVinculadasIds: contasVinculadasIds,
        anoAtual: valores.anoAtual,
        anoAnterior: valores.anoAnterior
      });

      // Atualiza o estado local com contas e valores
      const updatedTabelas = tabelas.map(tabela => {
        if (tabela.id === id) {
          return {
            ...tabela,
            contasVinculadas: contasSelecionadas,
            anoAtual: valores.anoAtual,
            anoAnterior: valores.anoAnterior
          };
        }
        return tabela;
      });

      onTabelasChange(updatedTabelas);

      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: `Contas vinculadas atualizadas (${contasSelecionadas.length} conta(s) selecionada(s))`,
        life: 3000,
      });

    } catch (error) {
      console.error('Erro ao atualizar contas vinculadas:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao atualizar contas vinculadas.',
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (companyId) {
      fetchContasBalancete();
    }
  }, [companyId, notaId]);

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center p-4">
        <i className="pi pi-spin pi-spinner mr-2"></i>
        Carregando tabela...
      </div>
    );
  }
  
  return (
    <div className="tabela-demonstrativa">
      <Toast ref={toast} />

      <TabelaHeader 
        onAddRow={handleAddRow}
      />

      <TabelaBody
        tabelas={tabelas}
        contasBalancete={contasBalancete}
        loadingContas={loadingContas}
        anoAnterior={anoAnterior}
        anoAtual={anoAtual}
        onContaSelect={handleContasSelect}
        onUpdateRow={handleUpdateRow}
        onDeleteRow={handleDeleteRow}
      />

      {contasBalancete.length === 0 && !loadingContas && (
        <InfoBox
          type="warning"
          icon="pi pi-exclamation-triangle"
          message="Nenhuma conta encontrada no balancete. Faça o upload do balancete primeiro."
        />
      )}
    </div>
  );
}