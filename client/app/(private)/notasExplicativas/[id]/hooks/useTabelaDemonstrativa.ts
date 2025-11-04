// src/components/TabelaDemonstrativa/hooks/useTabelaDemonstrativa.ts
import { useState, useCallback, useEffect } from 'react';
import { Toast } from 'primereact/toast';
import { TabelaDemonstrativa, ContaBalancete, DadosBalancete } from '../types';
import api from '@/app/api/api';

interface UseTabelaDemonstrativaProps {
  notaId: string;
  tabelas: TabelaDemonstrativa[];
  onTabelasChange: (tabelas: TabelaDemonstrativa[]) => void;
  companyId: string;
  toast: React.RefObject<Toast>;
}

export const useTabelaDemonstrativa = ({
  notaId,
  tabelas,
  onTabelasChange,
  companyId,
  toast
}: UseTabelaDemonstrativaProps) => {
  const [loading, setLoading] = useState(false);
  const [contasBalancete, setContasBalancete] = useState<ContaBalancete[]>([]);
  const [loadingContas, setLoadingContas] = useState(false);
  const [anoAtual] = useState<number>(new Date().getFullYear());
  const [anoAnterior] = useState<number>(new Date().getFullYear() - 1);

  // Carrega as contas do balancete quando o companyId mudar
  useEffect(() => {
    if (companyId) {
      fetchContasBalancete();
    }
  }, [companyId]);

  const fetchContasBalancete = useCallback(async () => {
    if (!companyId) return;
    
    try {
      setLoadingContas(true);
      const res = await api.get(`/balancete/${companyId}/contas`);
      
      if (res.status === 200) {
        setContasBalancete(res.data);
      }
    } catch (error) {
      console.error('Erro ao carregar contas do balancete:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao carregar contas do balancete.',
        life: 3000,
      });
    } finally {
      setLoadingContas(false);
    }
  }, [companyId, toast]);

  // Função para buscar dados específicos do balancete
  const buscarDadosBalancete = useCallback(async (codigoConta: string, ano: number): Promise<DadosBalancete | null> => {
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
  }, [companyId]);

  // Função para lidar com a seleção de múltiplas contas
  const handleContasSelect = useCallback(async (id: string, contasSelecionadas: ContaBalancete[]) => {
    try {
      setLoading(true);

      // Atualiza as contas vinculadas no backend
      const contasVinculadasIds = contasSelecionadas.map(conta => conta.id);
      
      await api.put(`demoTable/${id}`, {
        contasVinculadasIds: contasVinculadasIds
      });

      // Atualiza o estado local
      const updatedTabelas = tabelas.map(tabela => {
        if (tabela.id === id) {
          return {
            ...tabela,
            contasVinculadas: contasSelecionadas
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
  }, [tabelas, onTabelasChange, toast]);

  // Função para buscar dados do balancete para preencher automaticamente
  const buscarDadosAutomaticos = useCallback(async (codigoConta: string) => {
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
  }, [buscarDadosBalancete, anoAtual, anoAnterior]);

  const handleAddRow = useCallback(async () => {
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
  }, [notaId, tabelas, onTabelasChange, toast]);

  const handleDeleteRow = useCallback(async (id: string) => {
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
  }, [tabelas, onTabelasChange, toast]);

  const handleUpdateRow = useCallback(async (id: string, field: string, value: any) => {
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
  }, [tabelas, onTabelasChange, buscarDadosAutomaticos]);

  return {
    loading,
    contasBalancete,
    loadingContas,
    anoAtual,
    anoAnterior,
    fetchContasBalancete,
    handleAddRow,
    handleDeleteRow,
    handleUpdateRow,
    handleContasSelect,
    buscarDadosAutomaticos
  };
};