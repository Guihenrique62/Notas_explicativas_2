// src/components/TabelaDemonstrativa/TabelaHeader.tsx
import { Button } from 'primereact/button';

interface TabelaHeaderProps {
  onAddRow: () => void;
}

export default function TabelaHeader({onAddRow }: TabelaHeaderProps) {
  return (
    <div className="flex justify-content-between align-items-center mb-3">
      <div>
        <h4 className="font-semibold m-0">Tabela Demonstrativa</h4>
      </div>
      <Button
        icon="pi pi-plus"
        label="Adicionar Linha"
        className="p-button-outlined p-button-sm"
        onClick={onAddRow}
      />
    </div>
  );
}