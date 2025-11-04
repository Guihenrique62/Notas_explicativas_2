// src/components/TabelaDemonstrativa/TabelaBody.tsx
import { TabelaDemonstrativa as TabelaType, ContaBalancete } from '../../types';
import TabelaLinha from './TabelaLinha';

interface TabelaBodyProps {
  tabelas: TabelaType[];
  contasBalancete: ContaBalancete[];
  loadingContas: boolean;
  anoAnterior: number;
  anoAtual: number;
  onContaSelect: (id: string, contasSelecionadas: ContaBalancete[]) => void;
  onUpdateRow: (id: string, field: string, value: any) => void;
  onDeleteRow: (id: string) => void;
}

export default function TabelaBody({
  tabelas,
  contasBalancete,
  loadingContas,
  anoAnterior,
  anoAtual,
  onContaSelect,
  onUpdateRow,
  onDeleteRow
}: TabelaBodyProps) {
  return (
    <div className="card">
      <div className="p-datatable p-component">
        <div className="p-datatable-wrapper">
          <table className="p-datatable-table w-full">
            <thead>
              <tr>
                <th className="p-column-header" style={{ width: '30%' }}>
                  <span className="p-column-title">Nomenclatura</span>
                </th>
                <th className="p-column-header" style={{ width: '30%' }}>
                  <span className="p-column-title">{"Conta(s)"}</span>
                </th>
                <th className="p-column-header text-right" style={{ width: '15%' }}>
                  <span className="p-column-title">Ano Anterior ({anoAnterior})</span>
                </th>
                <th className="p-column-header text-right" style={{ width: '15%' }}>
                  <span className="p-column-title">Ano Atual ({anoAtual})</span>
                </th>
                <th className="p-column-header" style={{ width: '10%' }}>
                  <span className="p-column-title">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {tabelas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-4 text-color-secondary">
                    Nenhuma linha adicionada. Clique em Adicionar Linha para começar.
                  </td>
                </tr>
              ) : (
                tabelas.map((linha, index) => (
                  <TabelaLinha
                    key={linha.id || index}
                    linha={linha}
                    contasBalancete={contasBalancete}
                    loadingContas={loadingContas}
                    onContaSelect={onContaSelect}
                    onUpdateRow={onUpdateRow}
                    onDeleteRow={onDeleteRow}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}