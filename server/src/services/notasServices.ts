
import { prisma } from '../prismaClient';

// Types para as notas
export interface CreateNotaData {
  companyId: string;
  number: number;
  title: string;
  content: string;
}

export interface UpdateNotaData {
  title?: string;
  content?: string;
}

export const createNota = async (data: CreateNotaData) => {
    try {
      // Verifica se a empresa existe
      const empresa = await prisma.company.findUnique({
        where: { id: data.companyId }
      });

      if (!empresa) {
        throw new Error('Empresa não encontrada');
      }

      // Verifica se já existe uma nota com o mesmo número para esta empresa
      const notaExistente = await prisma.notasExplicativas.findUnique({
        where: {
          companyId_number: {
            companyId: data.companyId,
            number: data.number
          }
        }
      });

      if (notaExistente) {
        throw new Error('Já existe uma nota com este número para esta empresa');
      }

      // Cria a nova nota
      const nota = await prisma.notasExplicativas.create({
        data: {
          companyId: data.companyId,
          number: data.number,
          title: data.title,
          content: data.content
        }
      });

      return nota;
    } catch (error) {
      console.error('Erro ao criar nota explicativa:', error);
      throw error;
    }
  }


  /**
   * Editar uma nota explicativa existente
   */
export const updateNota = async (companyId: string, number: number, data: UpdateNotaData) => {
    try {
      // Verifica se a nota existe
      const notaExistente = await prisma.notasExplicativas.findUnique({
        where: {
          companyId_number: {
            companyId,
            number
          }
        }
      });

      if (!notaExistente) {
        throw new Error('Nota não encontrada');
      }

      // Atualiza a nota
      const notaAtualizada = await prisma.notasExplicativas.update({
        where: {
          companyId_number: {
            companyId,
            number
          }
        },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });

      return notaAtualizada;
    } catch (error) {
      console.error('Erro ao atualizar nota explicativa:', error);
      throw error;
    }
  }

  /**
   * Deletar uma nota explicativa
   */
export const deleteNota = async (companyId: string, number: number) => {
    try {
      // Verifica se a nota existe
      const notaExistente = await prisma.notasExplicativas.findUnique({
        where: {
          companyId_number: {
            companyId,
            number
          }
        }
      });

      if (!notaExistente) {
        throw new Error('Nota não encontrada');
      }

      // Deleta a nota
      await prisma.notasExplicativas.delete({
        where: {
          companyId_number: {
            companyId,
            number
          }
        }
      });

      return { success: true, message: 'Nota deletada com sucesso' };
    } catch (error) {
      console.error('Erro ao deletar nota explicativa:', error);
      throw error;
    }
  }

  /**
 * Reordenar as notas - atualiza os números baseado na nova ordem
 */
export const reorderNotas = async (companyId: string, novasOrdens: { id: string; number: number }[]) => {
  try {
    // Verifica se todas as notas pertencem à mesma empresa
    const notasIds = novasOrdens.map(item => item.id);
    const notas = await prisma.notasExplicativas.findMany({
      where: { 
        id: { in: notasIds },
        companyId 
      },
      select: { id: true, number: true }
    });

    if (notas.length !== notasIds.length) {
      throw new Error('Algumas notas não foram encontradas ou não pertencem a esta empresa');
    }

    // Estratégia: primeiro atualiza todos os números para valores temporários negativos
    // para evitar conflitos com a constraint única
    
    // Passo 1: Atualizar para números temporários negativos
    const updatesTemporarios = notasIds.map((id, index) =>
      prisma.notasExplicativas.update({
        where: { id },
        data: { number: -(index + 1) } // Números negativos como temporários
      })
    );

    await prisma.$transaction(updatesTemporarios);

    // Passo 2: Atualizar para os números finais
    const updatesFinais = novasOrdens.map((item) =>
      prisma.notasExplicativas.update({
        where: { id: item.id },
        data: { number: item.number }
      })
    );

    const result = await prisma.$transaction(updatesFinais);

    return result;
  } catch (error) {
    console.error('Erro ao reordenar notas:', error);
    throw error;
  }
}


  /**
   * Listar todas as notas de uma empresa
   */
  export const listNotasByEmpresa = async (companyId: string) => {
    try {
      // Verifica se a empresa existe
      const empresa = await prisma.company.findUnique({
        where: { id: companyId }
      });

      if (!empresa) {
        throw new Error('Empresa não encontrada');
      }

      // Busca todas as notas da empresa, ordenadas por número
      const notas = await prisma.notasExplicativas.findMany({
        where: {
          companyId
        },
        orderBy: {
          number: 'asc'
        },
        include: {
          tabelas: {
            include: {
              contasVinculadas: true
            },
            orderBy: {
              ordem: 'asc'
            }
          }
        }
      });

      return notas;
    } catch (error) {
      console.error('Erro ao listar notas da empresa:', error);
      throw error;
    }
  }
