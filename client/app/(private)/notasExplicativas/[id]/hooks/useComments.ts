
import { useState } from 'react';
import { Toast } from 'primereact/toast';
import { Comentario } from '../types';
import api from '@/app/api/api';

export const useComments = (toast: React.RefObject<Toast>) => {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(false);

  const carregarComentarios = async (notaId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/comments/${notaId}`);
      
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

  const adicionarComentario = async (notaId: string, content: string) => {
    try {
      setLoading(true);
      const response = await api.post('/comments', {
        notaId,
        content: content.trim()
      });

      if (response.status >= 200 && response.status < 300) {
        await carregarComentarios(notaId);
        toast.current?.show({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Comentário adicionado com sucesso',
          life: 3000
        });
        return true;
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
      return false;
    } finally {
      setLoading(false);
    }
  };

  const excluirComentario = async (comentarioId: string, notaId: string) => {
    try {
      setLoading(true);
      const response = await api.delete(`/comments/${comentarioId}`);

      if (response.status >= 200 && response.status < 300) {
        await carregarComentarios(notaId);
        toast.current?.show({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Comentário excluído com sucesso',
          life: 3000
        });
        return true;
      } else {
        throw new Error("Erro ao excluir comentário");
      }
    } catch (error) {
      console.error("Erro ao excluir comentário:", error);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não foi possível excluir o comentário',
        life: 3000
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    comentarios,
    loading,
    carregarComentarios,
    adicionarComentario,
    excluirComentario,
    setComentarios
  };
};