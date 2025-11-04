import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateTabelaData {
  conta: string;
  anoAnterior: number | null;
  anoAtual: number | null;
  ordem: number;
  contasVinculadasIds?: string[];
}

export interface UpdateTabelaData {
  conta?: string;
  anoAnterior?: number | null;
  anoAtual?: number | null;
  ordem?: number;
  contasVinculadasIds?: string[];
}


export const getTabelasByNota = async (notaId: string) => {
    try {
      const tabelas = await prisma.tabelaDemonstrativa.findMany({
        where: { notaId },
        orderBy: { ordem: 'asc' },
        include: {
          contasVinculadas: true
        }
      });

      return tabelas;
    } catch (error) {
      console.error('Erro ao buscar tabelas da nota:', error);
      throw error;
    }
  }

  /**
   * Criar uma nova linha na tabela
   */
export const createTabela = async (notaId: string, data: CreateTabelaData) => {
    try {
      // Verifica se a nota existe
      const nota = await prisma.notasExplicativas.findUnique({
        where: { id: notaId }
      });

      if (!nota) {
        throw new Error('Nota não encontrada');
      }

      const tabela = await prisma.tabelaDemonstrativa.create({
        data: {
          notaId,
          conta: data.conta,
          anoAnterior: data.anoAnterior,
          anoAtual: data.anoAtual,
          ordem: data.ordem,
          contasVinculadas: data.contasVinculadasIds && data.contasVinculadasIds.length > 0 
          ? {
              connect: data.contasVinculadasIds.map(id => ({ id }))
            }
          : undefined
      },
      include: {
        contasVinculadas: true
      }
    });

      return tabela;
    } catch (error) {
      console.error('Erro ao criar linha da tabela:', error);
      throw error;
    }
  }

  /**
   * Atualizar uma linha da tabela
   */
  export const updateTabela = async (id: string, data: UpdateTabelaData) => {
    try {
      const tabela = await prisma.tabelaDemonstrativa.update({
        where: { id },
        data: {
          conta: data.conta,
          anoAnterior: data.anoAnterior,
          anoAtual: data.anoAtual,
          ordem: data.ordem,
          updatedAt: new Date(),
          contasVinculadas: data.contasVinculadasIds !== undefined
          ? {
              // Primeiro desconecta todas as contas atuais
              set: [],
              // Depois conecta as novas contas
              connect: data.contasVinculadasIds.map(contaId => ({ id: contaId }))
            }
          : undefined
      },
      include: {
        contasVinculadas: true
      }
    });

      return tabela;
    } catch (error) {
      console.error('Erro ao atualizar linha da tabela:', error);
      throw error;
    }
  }

  /**
   * Deletar uma linha da tabela
   */
 export const deleteTabela = async (id: string) => {
    try {
      await prisma.tabelaDemonstrativa.delete({
        where: { id }
      });

      return { success: true, message: 'Linha da tabela deletada com sucesso' };
    } catch (error) {
      console.error('Erro ao deletar linha da tabela:', error);
      throw error;
    }
  }

  /**
   * Reordenar as linhas da tabela
   */
  export const reorderTabelas = async (notaId: string, novasOrdens: { id: string; ordem: number }[]) => {
    try {
      // Usa transação para garantir que todas as atualizações sejam feitas
      const result = await prisma.$transaction(
        novasOrdens.map((item) =>
          prisma.tabelaDemonstrativa.update({
            where: { id: item.id },
            data: { ordem: item.ordem }
          })
        )
      );

      return result;
    } catch (error) {
      console.error('Erro ao reordenar tabela:', error);
      throw error;
    }
  }
