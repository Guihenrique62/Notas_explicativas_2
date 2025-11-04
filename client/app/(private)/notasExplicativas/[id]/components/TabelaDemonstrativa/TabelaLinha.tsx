// src/components/TabelaDemonstrativa/TabelaLinha.tsx
import { TabelaDemonstrativa as TabelaType, ContaBalancete } from '../../types';
import ValorCell from './ValorCell';
import AcoesCell from './AcoesCell';
import ContaMultiSelect from './ContaMultiSelect';

interface TabelaLinhaProps {
  linha: TabelaType;
  contasBalancete: ContaBalancete[];
  loadingContas: boolean;
  onContaSelect: (id: string, contasSelecionadas: ContaBalancete[]) => void;
  onUpdateRow: (id: string, field: string, value: any) => void;
  onDeleteRow: (id: string) => void;
}

export default function TabelaLinha({
  linha,
  contasBalancete,
  loadingContas,
  onContaSelect,
  onUpdateRow,
  onDeleteRow
}: TabelaLinhaProps) {
  return (
    <tr className="p-datatable-row">
      {/* Coluna Nomenclatura */}
      <td className="p-datatable-cell">
        <input
          type="text"
          value={linha.conta}
          onChange={(e) => onUpdateRow(linha.id!, 'conta', e.target.value)}
          className="p-inputtext p-component w-full"
          placeholder="Digite a nomenclatura"
        />
      </td>
      
      {/* Coluna Contas */}
      <td className="p-datatable-cell">
        <ContaMultiSelect
          linha={linha}
          contasBalancete={contasBalancete}
          loadingContas={loadingContas}
          onContasSelect={onContaSelect}
        />
      </td>
      
      {/* Coluna Ano Anterior */}
      <td className="p-datatable-cell text-right">
        <ValorCell
          value={linha.anoAnterior}
          onValueChange={(value) => onUpdateRow(linha.id!, 'anoAnterior', value)}
        />
      </td>
      
      {/* Coluna Ano Atual */}
      <td className="p-datatable-cell text-right">
        <ValorCell
          value={linha.anoAtual}
          onValueChange={(value) => onUpdateRow(linha.id!, 'anoAtual', value)}
        />
      </td>
      
      {/* Coluna Ações */}
      <td className="p-datatable-cell">
        <AcoesCell onDelete={() => onDeleteRow(linha.id!)} />
      </td>
    </tr>
  );
}