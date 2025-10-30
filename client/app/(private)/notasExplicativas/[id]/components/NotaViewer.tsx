// components/NotaViewer.tsx
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
import { useState, useRef } from "react";
import { NotaExplicativa, Comentario } from "../types";
import api from "@/app/api/api";

interface NotaViewerProps {
  selectedNota: NotaExplicativa | null;
  onEdit: () => void;
  onDelete: (nota: NotaExplicativa) => void;
}

export default function NotaViewer({ selectedNota, onEdit, onDelete }: NotaViewerProps) {
  const [showComentariosModal, setShowComentariosModal] = useState(false);
  const [novoComentario, setNovoComentario] = useState("");
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);

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
    await carregarComentarios();
  };

  const carregarComentarios = async () => {
    if (!selectedNota) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/comments/${selectedNota.id}`);
      
      if (response.status >= 200 && response.status < 300) {
        setComentarios(response.data);
      } else {
        throw new Error('Erro ao carregar comentários');
      }
      
    } catch (error) {
      console.error("Erro ao carregar comentários:", error);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não foi possível carregar os comentários',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionarComentario = async () => {
    if (!selectedNota || !novoComentario.trim()) return;

    try {
      setLoading(true);
      const response = await api.post('/comments', {
          notaId: selectedNota.id,
          content: novoComentario.trim()
      });

      if (response.status >= 200 && response.status < 300) {
        setNovoComentario("");
        await carregarComentarios();
        toast.current?.show({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Comentário adicionado com sucesso',
          life: 3000
        });
      } else {
        throw new Error("Erro ao adicionar comentário");
      }
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não foi possível adicionar o comentário',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
              <Button
                icon="pi pi-comments"
                tooltip="Comentários"
                tooltipOptions={{ position: 'top' }}
                className="p-button-outlined p-button-info p-button-sm"
                onClick={handleOpenComentarios}
              />
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
                      <th className="text-left p-2 font-semibold bg-gray-50">Conta</th>
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
        onHide={() => setShowComentariosModal(false)}
      >
        <div className="flex flex-column gap-3">
          {/* Lista de Comentários */}
          <div className="flex flex-column gap-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {comentarios.length === 0 ? (
              <div className="text-center p-4 text-color-secondary">
                <i className="pi pi-comment text-2xl mb-2"></i>
                <p>Nenhum comentário ainda.</p>
                <p className="text-sm">Seja o primeiro a comentar!</p>
              </div>
            ) : (
              comentarios.map((comentario) => (
                <div key={comentario.id} className="p-3 border-round surface-border bg-gray-50">
                  <div className="flex justify-content-between align-items-start mb-2">
                    <span className="font-semibold text-sm">{comentario.user.name}</span>
                    <span className="text-xs text-color-secondary">
                      {formatDate(comentario.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm m-0">{comentario.content}</p>
                </div>
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
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}