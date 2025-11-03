// src/hooks/useNotas.ts
import { useState, useEffect } from 'react';
import { NotaExplicativa } from '../types';
import api from '@/app/api/api';

interface UseNotasReturn {
  notas: NotaExplicativa[];
  loading: boolean;
  error: string | null;
  onReorder: (reorderedNotas: NotaExplicativa[]) => Promise<void>;
  refreshNotas: () => Promise<void>;
  exportToWord: () => Promise<void>;
}

export const useNotas = (companyId: string): UseNotasReturn => {
  const [notas, setNotas] = useState<NotaExplicativa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarComentariosDaNota = async (notaId: string): Promise<number> => {
    try {
      const response = await api.get(`/comments/${notaId}`);
      return response.data.length;
    } catch (error) {
      console.error(`Erro ao carregar comentários da nota ${notaId}:`, error);
      return 0;
    }
  };

  const fetchNotas = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/notas/${companyId}`);
      
      if (response.status >= 200 && response.status < 300) {
        // Carrega comentários para cada nota em paralelo
        const notasComDadosCompletos = await Promise.all(
          response.data.map(async (nota: any) => {
            const totalComentarios = await carregarComentariosDaNota(nota.id);
            
            return {
              ...nota,
              tabelas: nota.tabelas || [],
              totalComentarios
            };
          })
        );
        
        setNotas(notasComDadosCompletos);
      } else {
        throw new Error('Erro ao buscar notas');
      }
    } catch (err: any) {
      console.error('Erro ao carregar notas:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao carregar notas';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (reorderedNotas: NotaExplicativa[]): Promise<void> => {
    try {
      // Valida se a reordenação é válida
      if (reorderedNotas.length === 0) return;

      // Prepara os dados para enviar ao backend
      const novasOrdens = reorderedNotas.map((nota, index) => ({
        id: nota.id,
        number: index + 1 // Garante números sequenciais começando de 1
      }));

      // Envia para o backend
      await api.patch(`/notas/${companyId}/reorder`, {
        novasOrdens
      });

      // Atualiza os números localmente para refletir a nova ordem
      const notasComNumerosAtualizados = reorderedNotas.map((nota, index) => ({
        ...nota,
        number: index + 1
      }));
      
      setNotas(notasComNumerosAtualizados);

    } catch (err: any) {
      console.error('Erro ao reordenar notas:', err);
      // Em caso de erro, recarrega as notas do servidor
      await fetchNotas();
      
      const errorMessage = err.response?.data?.error || 'Erro ao reordenar notas';
      throw new Error(errorMessage);
    }
  };

  const exportToWord = async (): Promise<void> => {
    try {
      const response = await api.get(`/export/${companyId}/word`, {
        responseType: 'blob' // Importante para receber arquivos
      });

      // Criar URL para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // pegar nome da empresa para nome do arquivo
      const company = await api.get(`/companies/${companyId}/unique`);
      const companyName = company.data.name;
      const filename = `Notas Explicativas - ${companyName}.docx`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err: any) {
      console.error('Erro ao exportar notas:', err);
      const errorMessage = err.response?.data?.error || 'Erro ao exportar notas para Word';
      throw new Error(errorMessage);
    }
  };

  const refreshNotas = async (): Promise<void> => {
    await fetchNotas();
  };

  useEffect(() => {
    if (companyId) {
      fetchNotas();
    }
  }, [companyId]);

  return {
    notas,
    loading,
    error,
    onReorder: handleReorder,
    refreshNotas,
    exportToWord
  };
};