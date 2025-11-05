'use client';

import api from "@/app/api/api";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import { NotaExplicativa, NotasExplicativasPageProps, TabelaDemonstrativa } from "./types";
import NotasHeader from "./components/NotasHeader";
import NotasList from "./components/NotasList";
import NotaViewer from "./components/NotaViewer";
import NotaEditor from "./components/NotaEditor";
import CriarNotaModal from "./components/CreateNotaModal";
import LoadingState from "./components/LoadingState";
import 'react-quill/dist/quill.snow.css';
import { useNotaOperations } from "./hooks/useNotaOperations";
import { useNotas } from "./hooks/useNotas";

export default function NotasExplicativasPage({ params }: NotasExplicativasPageProps) {
  const toast = useRef<Toast>(null);
  const [selectedNota, setSelectedNota] = useState<NotaExplicativa | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [criarNotaVisible, setCriarNotaVisible] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [exportLoading, setExportLoading] = useState(false);

  // Hooks personalizados
  const { notas, loading, error, onReorder, refreshNotas, exportToWord} = useNotas(params.id);
  const { 
    handleCreateNota, 
    handleDeleteNota, 
    handleUpdateNota,
    calcularProximoNumero 
  } = useNotaOperations(params.id, toast, refreshNotas, setSelectedNota);

  // Handlers de UI
  const handleNotaSelect = (nota: NotaExplicativa) => {
    setSelectedNota(nota);
  };

  const handleEdit = () => {
    if (selectedNota) {
      setEditTitle(selectedNota.title);
      setEditContent(selectedNota.content);
      setDialogVisible(true);
    }
  };

  const handleDelete = async (nota: NotaExplicativa) => {
    await handleDeleteNota(nota, selectedNota, setSelectedNota);
  };

  const handleSave = async (tabelasAtualizadas?: TabelaDemonstrativa[]) => {
    if (!selectedNota) return;
    
    await handleUpdateNota(
      selectedNota, 
      editTitle, 
      editContent, 
      tabelasAtualizadas,
      setSelectedNota
    );
    setDialogVisible(false);
  };

  const handleCreateNotaWrapper = async (titulo: string) => {
    const novaNota = await handleCreateNota(titulo, calcularProximoNumero(notas));
    setSelectedNota(novaNota);
    return novaNota;
  };

  const handleDialogHide = () => {
    setDialogVisible(false);
  };

  const handleCriarNotaHide = () => {
    setCriarNotaVisible(false);
  };

  // Efeitos
  useEffect(() => {
    if (dialogVisible && selectedNota) {
      setEditTitle(selectedNota.title);
      setEditContent(selectedNota.content);
    }
  }, [dialogVisible, selectedNota]);

  useEffect(() => {
    if (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: error,
        life: 5000,
      });
    }
  }, [error]);

  // Calcula o próximo número para exibir na modal
  const proximoNumero = calcularProximoNumero(notas);

  if (loading) {
    return <LoadingState />;
  }

  const handleExport = async () => {
    try {
      setExportLoading(true);
      
      toast.current?.show({
        severity: 'info',
        summary: 'Exportando',
        detail: 'Gerando arquivo Word...',
        life: 2000,
      });

      await exportToWord();

      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Notas exportadas com sucesso!',
        life: 3000,
      });
      
    } catch (err: any) {
      console.error('Erro na exportação:', err);
      
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: err.message || 'Erro ao exportar notas',
        life: 5000,
      });
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="grid">
      <div className="col-12">
        <Toast ref={toast} />

        <NotasHeader 
          onRefresh={refreshNotas} 
          onCreateClick={() => setCriarNotaVisible(true)}
          onExportClick={handleExport}
          totalNotas={notas.length}
          exportLoading={exportLoading}
          companyId={params.id}
        />

        <div className="grid">
          <NotasList
            notas={notas}
            selectedNota={selectedNota}
            onNotaSelect={handleNotaSelect}
            onReorder={onReorder}
            companyId={params.id}
          />

          <NotaViewer
            selectedNota={selectedNota}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        <NotaEditor
          selectedNota={selectedNota}
          visible={dialogVisible}
          editTitle={editTitle}
          editContent={editContent}
          onTitleChange={setEditTitle}
          onContentChange={setEditContent}
          onSave={handleSave}
          onHide={handleDialogHide}
          companyId={params.id}
        />

        <CriarNotaModal
          visible={criarNotaVisible}
          onHide={handleCriarNotaHide}
          onCreate={handleCreateNotaWrapper}
          proximoNumero={proximoNumero}
        />
      </div>
    </div>
  );
}