import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import dynamic from 'next/dynamic';
import { NotaExplicativa, TabelaDemonstrativa } from "../types";
import TabelaDemonstrativaComponent from "./TabelaDemonstrativa/TabelaDemonstrativa";
import { useState, useEffect } from 'react';

// Carregar ReactQuill dinamicamente
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="flex align-items-center justify-content-center p-4 text-base">Carregando editor...</div>
});

export interface NotaEditorProps {
  selectedNota: NotaExplicativa | null;
  visible: boolean;
  editTitle: string;
  editContent: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onSave: (tabelasAtualizadas?: TabelaDemonstrativa[]) => void;
  onHide: () => void;
  companyId: string; 
}

// Configuração AVANÇADA do ReactQuill
const modules = {
  toolbar: {
    container: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }], // Mais opções de cabeçalho
      ['bold', 'italic', 'underline', 'strike'], // Formatação básica
      [{ 'color': [] }, { 'background': [] }], // Cores do texto e fundo
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }], // Listas e indentação
      [{ 'direction': 'rtl' }], // Direção do texto
      [{ 'align': [] }], // Alinhamento
      ['blockquote', 'code-block'], // Blocos especiais
      ['clean'] // Limpar formatação
    ],
    handlers: {
      // Handlers personalizados podem ser adicionados aqui
    }
  },
  clipboard: {
    // toggle to add extra line breaks when pasting HTML:
    matchVisual: false,
  }
};

const formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image', 'video',
  'color', 'background',
  'script', 'code-block',
  'align', 'direction'
];

// Estilos CSS personalizados para o Quill
const quillStyles = `
  .ql-editor {
    font-size: 1.1rem;
    line-height: 1.6;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  .ql-toolbar {
    border-top: 1px solid #e5e7eb !important;
    border-left: 1px solid #e5e7eb !important;
    border-right: 1px solid #e5e7eb !important;
    border-bottom: 1px solid #e5e7eb !important;
    background: #f9fafb;
  }
  
  .ql-container {
    border-bottom: 1px solid #e5e7eb !important;
    border-left: 1px solid #e5e7eb !important;
    border-right: 1px solid #e5e7eb !important;
    border-top: none !important;
    font-size: 1.1rem;
    min-height: 300px;
  }
  
  .ql-toolbar .ql-formats {
    margin-right: 15px;
  }
  
  .ql-toolbar button {
    border-radius: 4px;
    margin: 2px;
  }
  
  .ql-toolbar button:hover {
    background: #e5e7eb;
  }
  
  /* Melhorar a aparência dos selects */
  .ql-toolbar .ql-font, 
  .ql-toolbar .ql-size, 
  .ql-toolbar .ql-header {
    border-radius: 4px;
  }
  
  /* Preview com melhor formatação */
  .preview-content h1 { font-size: 2rem; font-weight: bold; margin: 1rem 0; }
  .preview-content h2 { font-size: 1.75rem; font-weight: bold; margin: 0.875rem 0; }
  .preview-content h3 { font-size: 1.5rem; font-weight: bold; margin: 0.75rem 0; }
  .preview-content h4 { font-size: 1.25rem; font-weight: bold; margin: 0.625rem 0; }
  .preview-content h5 { font-size: 1.1rem; font-weight: bold; margin: 0.5rem 0; }
  .preview-content h6 { font-size: 1rem; font-weight: bold; margin: 0.5rem 0; }
  .preview-content p { margin: 0.5rem 0; }
  .preview-content ul, .preview-content ol { margin: 0.5rem 0; padding-left: 2rem; }
  .preview-content blockquote { 
    border-left: 4px solid #3b82f6; 
    padding-left: 1rem; 
    margin: 1rem 0;
    font-style: italic;
    color: #6b7280;
  }
`;

export default function NotaEditor({
  selectedNota,
  visible,
  editTitle,
  editContent,
  onTitleChange,
  onContentChange,
  onSave,
  onHide,
  companyId
}: NotaEditorProps) {
  const [tabelas, setTabelas] = useState<TabelaDemonstrativa[]>([]);

  // Inicializa as tabeluzuudxtpmqjnas quando a nota selecionada muda ou o dialog abre
  useEffect(() => {
    if (selectedNota && visible) {
      setTabelas(selectedNota.tabelas || []);
    }
  }, [selectedNota, visible]);

  const handleTabelasChange = (novasTabelas: TabelaDemonstrativa[]) => {
    setTabelas(novasTabelas);
  };

  const handleSave = () => {
    onSave(tabelas);
  };

  return (
    <Dialog
      header={`Editar Nota ${selectedNota?.number}`}
      visible={visible}
      style={{ 
        width: '95vw', 
        height: '95vh',
        maxWidth: '1400px' // Aumentei um pouco a largura máxima
      }}
      className="w-full max-w-7xl"
      onHide={onHide}
      footer={
        <div className="flex flex-wrap gap-2 justify-content-end">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            className="p-button-text p-button-sm text-base"
            onClick={onHide}
          />
          <Button
            label="Salvar"
            icon="pi pi-check"
            className="p-button-primary p-button-sm text-base"
            onClick={handleSave}
          />
        </div>
      }
    >
      {/* Adiciona os estilos CSS personalizados */}
      <style jsx global>{quillStyles}</style>
      
      <div className="flex flex-column gap-4 h-full text-base" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        <div className="field">
          <label htmlFor="title" className="font-semibold block mb-2 text-lg">
            Título
          </label>
          <InputText
            id="title"
            value={editTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full p-inputtext-lg"
            style={{ fontSize: '1.1rem' }}
          />
        </div>

        <div className="field flex-grow-1 flex flex-column">
          <label htmlFor="content" className="font-semibold block mb-2 text-lg">
            Conteúdo
          </label>
          <div className="flex-grow-1" style={{ minHeight: '400px' }}>
            <ReactQuill
              value={editContent}
              onChange={onContentChange}
              modules={modules}
              formats={formats}
              theme="snow"
              style={{ 
                height: '400px',
                marginBottom: '50px',
                fontSize: '1.1rem'
              }}
              placeholder="Digite seu conteúdo aqui..."
            />
          </div>
        </div>

        <div className="bg-gray-50 p-3 border-round">
          <h4 className="font-semibold mb-2 text-lg">Preview do Conteúdo:</h4>
          <div 
            className="p-3 border-1 border-round surface-border bg-white max-h-10rem overflow-auto text-base preview-content"
            style={{ 
              maxHeight: '200px',
              minHeight: '80px'
            }}
            dangerouslySetInnerHTML={{ __html: editContent }}
          />
        </div>

        {/* Seção da Tabela Demonstrativa */}
        {selectedNota && (
          <div className="border-top-1 surface-border pt-4">
            <TabelaDemonstrativaComponent
              notaId={selectedNota.id}
              tabelas={tabelas}
              onTabelasChange={handleTabelasChange}
              companyId={companyId} // Adicione esta linha
            />
          </div>
        )}
      </div>
    </Dialog>
  );
}