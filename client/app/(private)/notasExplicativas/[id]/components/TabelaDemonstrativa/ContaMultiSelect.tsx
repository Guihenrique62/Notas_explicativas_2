// src/components/TabelaDemonstrativa/ContaMultiSelect.tsx
import { MultiSelect } from 'primereact/multiselect';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Chip } from 'primereact/chip';
import { ContaBalancete, TabelaDemonstrativa as TabelaType } from '../../types';
import { useEffect, useMemo } from 'react';

interface ContaMultiSelectProps {
  linha: TabelaType;
  contasBalancete: ContaBalancete[];
  loadingContas: boolean;
  onContasSelect: (id: string, contasSelecionadas: ContaBalancete[]) => void;
  onContasChange?: (id: string, contasSelecionadas: ContaBalancete[]) => void; // Nova prop
}

export default function ContaMultiSelect({
  linha,
  contasBalancete,
  loadingContas,
  onContasSelect,
  onContasChange
}: ContaMultiSelectProps) {

  const contasSelecionadas = useMemo(() => {
    if (!linha.contasVinculadas || !contasBalancete.length) {
      return [];
    }
    
    return contasBalancete.filter(contaDisponivel => 
      linha.contasVinculadas!.some(contaSelecionada => 
        contaSelecionada.id === contaDisponivel.id
      )
    );
  }, [linha.contasVinculadas, contasBalancete]);

  const handleContasChange = (e: { value: ContaBalancete[] }) => {
    // Chama a função para atualizar no backend
    onContasSelect(linha.id!, e.value);
    
    // Chama a função para calcular e atualizar os valores (se fornecida)
    if (onContasChange) {
      onContasChange(linha.id!, e.value);
    }
  };

  // ... resto do código permanece igual
  const contaTemplate = (option: ContaBalancete) => {
    if (!option) return null;
    
    return (
      <div className="flex flex-column">
        <span className="font-semibold">{option.accountingAccount}</span>
        <span className="text-sm text-color-secondary">{option.accountName}</span>
      </div>
    );
  };

  const selectedContaTemplate = (option: ContaBalancete) => {
    if (!option) return null;
    
    return (
      <Chip 
        label={option.accountingAccount} 
        className="mr-1 mb-1 text-xs" 
        removable={false}
      />
    );
  };

  const panelFooterTemplate = () => {
    const selectedCount = contasSelecionadas.length;
    return (
      <div className="py-2 px-3 border-top-1 surface-border">
        <span className="text-sm">
          {selectedCount === 0 ? 'Nenhuma conta selecionada' : 
           `${selectedCount} conta${selectedCount > 1 ? 's' : ''} selecionada${selectedCount > 1 ? 's' : ''}`}
        </span>
      </div>
    );
  };

  const compareContas = (contaA: ContaBalancete, contaB: ContaBalancete) => {
    return contaA.id === contaB.id;
  };

  if (loadingContas) {
    return (
      <div className="flex align-items-center gap-2 w-full p-inputtext p-component p-disabled">
        <ProgressSpinner style={{ width: '20px', height: '20px' }} />
        <span>Carregando contas...</span>
      </div>
    );
  }

  return (
    <MultiSelect
      value={contasSelecionadas}
      options={contasBalancete}
      onChange={handleContasChange}
      optionLabel="accountName"
      placeholder="Selecione as contas vinculadas"
      itemTemplate={contaTemplate}
      selectedItemTemplate={selectedContaTemplate}
      panelFooterTemplate={panelFooterTemplate}
      className="w-full"
      filter
      filterBy="accountingAccount,accountName"
      showSelectAll={false}
      maxSelectedLabels={3}
      display="chip"
      disabled={loadingContas}
      selectedItemsLabel="{0} contas selecionadas"
      virtualScrollerOptions={{ itemSize: 38 }}
    />
  );
}