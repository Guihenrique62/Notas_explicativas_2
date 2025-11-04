// components/NotaViewer.tsx
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
import { useState, useRef, useEffect } from "react";
import { NotaExplicativa } from "../types";
import { useComments } from "../hooks/useComments";
import { ComentarioItem } from "./ComentarioItem";

interface NotaViewerProps {
  selectedNota: NotaExplicativa | null;
  onEdit: () => void;
  onDelete: (nota: NotaExplicativa) => void;
}

export default function NotaViewer({ selectedNota, onEdit, onDelete }: NotaViewerProps) {
  const [showComentariosModal, setShowComentariosModal] = useState(false);
  const [novoComentario, setNovoComentario] = useState("");
  const toast = useRef<Toast>(null);
  
  const {
    comentarios,
    loading,
    carregarComentarios,
    adicionarComentario,
    excluirComentario
  } = useComments(toast);

  // Atualiza o total quando comentários são adicionados/removidos no modal
  const handleAdicionarComentario = async () => {
    if (!selectedNota || !novoComentario.trim()) return;

    const success = await adicionarComentario(selectedNota.id, novoComentario);
    if (success) {
      setNovoComentario("");
      // Atualiza o total localmente - AGORA USA totalComentarios DA NOTA
      if (selectedNota.totalComentarios !== undefined) {
        selectedNota.totalComentarios += 1;
      }
    }
  };

  const handleExcluirComentario = async (comentarioId: string) => {
    if (!selectedNota) return;
    await excluirComentario(comentarioId, selectedNota.id);
    // Atualiza o total localmente - AGORA USA totalComentarios DA NOTA
    if (selectedNota.totalComentarios !== undefined && selectedNota.totalComentarios > 0) {
      selectedNota.totalComentarios -= 1;
    }
  };

  const handleDeleteClick = (nota: NotaExplicativa) => {
    confirmDialog({
      message: `Tem certeza que deseja deletar a nota "${nota.title}"? Esta ação não pode ser desfeita.`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => onDelete(nota),
      rejectClassName: 'p-button-secondary p-button-text',
    });
  };

  const handleOpenComentarios = async () => {
    if (!selectedNota) return;
    
    setShowComentariosModal(true);
    await carregarComentarios(selectedNota.id);
  };

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (!selectedNota) {
    return (
      <div className="col-12 lg:col-6 xl:col-7 mt-3 lg:mt-0">
        <div className="card h-full">
          <div className="flex flex-column align-items-center justify-content-center text-center p-4" style={{ height: '350px' }}>
            <i className="pi pi-file text-4xl text-color-secondary mb-2"></i>
            <h3 className="text-lg font-semibold mb-1">Nenhuma nota selecionada</h3>
            <p className="text-color-secondary text-sm mb-3">
              Selecione uma nota na lista ao lado para visualizar seu conteúdo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const footerComentariosModal = (
    <div>
      <Button 
        label="Cancelar" 
        icon="pi pi-times" 
        onClick={() => setShowComentariosModal(false)} 
        className="p-button-text" 
        disabled={loading}
      />
      <Button 
        label="Adicionar Comentário" 
        icon="pi pi-check" 
        onClick={handleAdicionarComentario} 
        disabled={!novoComentario.trim() || loading}
        loading={loading}
      />
    </div>
  );

  return (
    <div className="col-12 lg:col-6 xl:col-7 mt-3 lg:mt-0">
      <div className="card h-full">
        <Toast ref={toast} />
        <ConfirmDialog />
        
        <div className="flex flex-column h-full">
          <div className="flex flex-column sm:flex-row justify-content-between align-items-start sm:align-items-center gap-2 mb-3 pb-2 border-bottom-1 surface-border">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold m-0 truncate">{selectedNota.title}</h2>
              <span className="text-color-secondary text-xs">
                Nota {selectedNota.number} • 
                Atualizada: {new Date(selectedNota.updatedAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
            
            <div className="flex gap-2 flex-shrink-0">
              {/* Botão de Comentários com Indicador - USA totalComentarios DA NOTA */}
              <div className="relative" style={{ position: 'relative', display: 'inline-block' }}>
                <Button
                  icon="pi pi-comments"
                  tooltip="Comentários"
                  tooltipOptions={{ position: 'top' }}
                  className="p-button-outlined p-button-info p-button-sm"
                  onClick={handleOpenComentarios}
                />
                {/* Indicador de comentários - USA totalComentarios DA NOTA */}
                {selectedNota.totalComentarios > 0 && (
                  <span 
                    className="absolute bg-red-500 text-white text-xs rounded-full w-5 h-5 flex align-items-center justify-content-center shadow-md"
                    style={{ 
                      top: '-8px', 
                      right: '-8px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      zIndex: 10
                    }}
                  >
                    {selectedNota.totalComentarios}
                  </span>
                )}
              </div>
              
              <Button
                icon="pi pi-pencil"
                label="Editar"
                className="p-button-outlined p-button-secondary p-button-sm"
                onClick={onEdit}
              />
              <Button
                icon="pi pi-trash"
                label="Deletar"
                className="p-button-outlined p-button-danger p-button-sm"
                onClick={() => handleDeleteClick(selectedNota)}
              />
            </div>
          </div>

          <div 
            className="flex-grow-1 overflow-auto prose max-w-none p-1 mb-3"
            style={{ 
              maxHeight: '40vh',
              minHeight: '150px'
            }}
            dangerouslySetInnerHTML={{ __html: selectedNota.content }}
          />

          {/* Tabela Demonstrativa na Visualização */}
          {selectedNota.tabelas && selectedNota.tabelas.length > 0 && (
            <div className="border-top-1 surface-border pt-3">
              <h4 className="font-semibold mb-2">Tabela Demonstrativa</h4>
              <div className="card">
                <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr className="border-bottom-1 surface-border">
                      <th className="text-left p-2 font-semibold bg-gray-50">Nomenclatura</th>
                      <th className="text-right p-2 font-semibold bg-gray-50">Ano Anterior</th>
                      <th className="text-right p-2 font-semibold bg-gray-50">Ano Atual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedNota.tabelas.map((linha, index) => (
                      <tr key={index} className="border-bottom-1 surface-border">
                        <td className="p-2">{linha.conta || '-'}</td>
                        <td className="p-2 text-right">{formatCurrency(linha.anoAnterior)}</td>
                        <td className="p-2 text-right">{formatCurrency(linha.anoAtual)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Comentários */}
      <Dialog 
        header={`Comentários - ${selectedNota.title}`}
        visible={showComentariosModal}
        style={{ width: '50vw' }}
        footer={footerComentariosModal}
        onHide={() => {
          setShowComentariosModal(false);
          setNovoComentario("");
        }}
      >
        <div className="flex flex-column gap-3">
          {/* Lista de Comentários */}
          <div className="flex flex-column gap-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {loading && comentarios.length === 0 ? (
              <div className="text-center p-4">
                <i className="pi pi-spin pi-spinner text-2xl"></i>
                <p className="mt-2">Carregando comentários...</p>
              </div>
            ) : comentarios.length === 0 ? (
              <div className="text-center p-4 text-color-secondary">
                <i className="pi pi-comment text-2xl mb-2"></i>
                <p>Nenhum comentário ainda.</p>
                <p className="text-sm">Seja o primeiro a comentar!</p>
              </div>
            ) : (
              comentarios.map((comentario: any) => (
                <ComentarioItem
                  key={comentario.id}
                  comentario={comentario}
                  onExcluir={handleExcluirComentario}
                />
              ))
            )}
          </div>

          {/* Área para novo comentário */}
          <div className="border-top-1 surface-border pt-3">
            <label htmlFor="novoComentario" className="font-semibold block mb-2">
              Adicionar Comentário
            </label>
            <InputTextarea
              id="novoComentario"
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
              rows={3}
              placeholder="Digite seu comentário..."
              className="w-full"
              disabled={loading}
            />
            <small className="text-color-secondary">
              {novoComentario.length}/500 caracteres
            </small>
          </div>
        </div>
      </Dialog>
    </div>
  );
}