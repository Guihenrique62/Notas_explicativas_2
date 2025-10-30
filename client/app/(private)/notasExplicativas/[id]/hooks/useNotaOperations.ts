// src/hooks/useNotaOperations.ts
import { Toast } from "primereact/toast";
import { NotaExplicativa, TabelaDemonstrativa } from "../types";
import api from "@/app/api/api";

interface UseNotaOperationsProps {
  companyId: string;
  toast: React.RefObject<Toast>;
  refreshNotas: () => Promise<void>;
  setSelectedNota: (nota: NotaExplicativa | null) => void;
}

export const useNotaOperations = (
  companyId: string, 
  toast: React.RefObject<Toast>,
  refreshNotas: () => Promise<void>,
  setSelectedNota: (nota: NotaExplicativa | null) => void
) => {
  
  const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  const handleError = (err: any, defaultMessage: string) => {
    console.error(defaultMessage, err);
    const errorMessage = err.response?.data?.error || err.message || defaultMessage;
    showToast('error', 'Erro', errorMessage);
    throw err;
  };

  const handleCreateNota = async (titulo: string, proximoNumero: number): Promise<NotaExplicativa> => {
    try {
      const res = await api.post(`/notas`, {
        companyId,
        number: proximoNumero,
        title: titulo,
        content: "<p></p>"
      });

      if (res.status >= 200 && res.status < 300) {
        const novaNota = {
          ...res.data,
          tabelas: []
        };
        
        await refreshNotas();
        showToast('success', 'Sucesso', `Nota ${proximoNumero} criada com sucesso!`);

        return novaNota;
      } else {
        throw new Error('Erro ao criar nota');
      }
    } catch (err: any) {
      return handleError(err, 'Erro ao criar a nota.');
    }
  };

  const handleDeleteNota = async (
    nota: NotaExplicativa, 
    selectedNota: NotaExplicativa | null,
    setSelectedNota: (nota: NotaExplicativa | null) => void
  ): Promise<void> => {
    try {
      const res = await api.delete(`/notas/${companyId}/${nota.number}`);

      if (res.status >= 200 && res.status < 300) {
        await refreshNotas();
        
        if (selectedNota?.id === nota.id) {
          setSelectedNota(null);
        }

        showToast('success', 'Sucesso', 'Nota deletada com sucesso!');
      } else {
        throw new Error('Erro ao deletar nota');
      }
    } catch (err: any) {
      handleError(err, 'Erro ao deletar a nota.');
    }
  };

  const handleUpdateNota = async (
    selectedNota: NotaExplicativa,
    editTitle: string,
    editContent: string,
    tabelasAtualizadas?: TabelaDemonstrativa[],
    setSelectedNota?: (nota: NotaExplicativa) => void
  ): Promise<void> => {
    try {
      const res = await api.put(`/notas/${companyId}`, {
        number: selectedNota.number,
        title: editTitle,
        content: editContent
      });

      if (res.status >= 200 && res.status < 300) {
        await refreshNotas();
        
        // Atualiza a nota selecionada localmente se necessário
        if (setSelectedNota) {
          const notaAtualizada = {
            ...selectedNota,
            title: editTitle,
            content: editContent,
            tabelas: tabelasAtualizadas || selectedNota.tabelas,
            updatedAt: new Date().toISOString()
          };
          setSelectedNota(notaAtualizada);
        }

        showToast('success', 'Sucesso', 'Nota atualizada com sucesso!');
      } else {
        throw new Error('Erro ao atualizar nota');
      }
    } catch (err: any) {
      handleError(err, 'Erro ao atualizar a nota.');
    }
  };

  const calcularProximoNumero = (notas: NotaExplicativa[]): number => {
    if (notas.length === 0) return 1;
    
    const maiorNumero = Math.max(...notas.map(nota => nota.number));
    return maiorNumero + 1;
  };

  return {
    handleCreateNota,
    handleDeleteNota,
    handleUpdateNota,
    calcularProximoNumero
  };
};