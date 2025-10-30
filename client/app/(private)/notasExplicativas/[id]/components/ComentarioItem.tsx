import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Comentario } from '../types';

interface ComentarioItemProps {
  comentario: Comentario;
  onExcluir: (comentarioId: string) => void;
}

export const ComentarioItem = ({ comentario, onExcluir }: ComentarioItemProps) => {
  const handleExcluirClick = () => {
    confirmDialog({
      message: 'Tem certeza que deseja excluir este comentário?',
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => onExcluir(comentario.id),
      rejectClassName: 'p-button-secondary p-button-text',
    });
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

  return (
    <div className="p-3 border-round border-1 surface-border bg-yellow-50 hover:bg-yellow-100 transition-duration-150 transition-colors relative comment-item">
      {/* Botão de excluir com melhor posicionamento */}
      <Button
        icon="pi pi-trash"
        className="p-button-text p-button-danger p-button-sm absolute"
        style={{ top: '12px', right: '12px' }}
        onClick={handleExcluirClick}
        tooltip="Excluir comentário"
        tooltipOptions={{ position: 'top' }}
      />
      
      {/* Cabeçalho do comentário com layout melhorado */}
      <div className="flex justify-content-between align-items-start mb-3 pr-6"> {/* pr-6 para dar espaço ao botão */}
        <div className="flex flex-column flex-1 min-w-0">
          <div className="flex align-items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-gray-900 truncate">
              {comentario.user.name}
            </span>
          </div>
        </div>
        <span className="text-xs text-gray-500 font-medium flex-shrink-0 ml-2">
          {formatDate(comentario.createdAt)}
        </span>
      </div>

      {/* Conteúdo do comentário */}
      <div className="pr-6"> {/* pr-6 para dar espaço ao botão */}
        <p className="text-sm text-gray-800 m-0 leading-6 whitespace-pre-wrap">
          {comentario.content}
        </p>
      </div>
      
      <style jsx>{`
        .comment-item {
          border-left: 4px solid #fbbf24;
          margin-bottom: 0.75rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
        }
        
        .comment-item:last-child {
          margin-bottom: 0;
        }
        
        .comment-item:hover {
          box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.08);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};