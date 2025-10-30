import { prisma } from "../prismaClient";


interface CreateComentarioData {
  notaId: string;
  userId: string;
  content: string;
}

export const createComentario = async (data: CreateComentarioData) => {
  // Verificar se a nota existe
  const nota = await prisma.notasExplicativas.findUnique({
    where: { id: data.notaId }
  });

  if (!nota) {
    throw new Error("Nota não encontrada");
  }

  // Verificar se o usuário existe
  const user = await prisma.user.findUnique({
    where: { id: data.userId }
  });

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  const comentario = await prisma.notaComments.create({
    data: {
      notaId: data.notaId,
      userId: data.userId,
      content: data.content
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return comentario;
};

export const getComentariosByNota = async (notaId: string) => {
  const comentarios = await prisma.notaComments.findMany({
    where: { notaId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  return comentarios;
};





export const updateComentario = async (
  comentarioId: string, 
  userId: string, 
  content: string
) => {
  // Verificar se o comentário existe e pertence ao usuário
  const comentarioExistente = await prisma.notaComments.findFirst({
    where: { 
      id: comentarioId,
      userId: userId 
    }
  });

  if (!comentarioExistente) {
    throw new Error("Comentário não encontrado ou você não tem permissão para editá-lo");
  }

  const comentario = await prisma.notaComments.update({
    where: { id: comentarioId },
    data: { content: content },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return comentario;
};




export const deleteComentario = async (
  comentarioId: string, 
  userId: string
) => {
  // Verificar se o comentário existe e pertence ao usuário
  const comentarioExistente = await prisma.notaComments.findFirst({
    where: { 
      id: comentarioId,
      userId: userId
    }
  });

  if (!comentarioExistente) {
    throw new Error("Comentário não encontrado ou você não tem permissão para deletá-lo");
  }

  await prisma.notaComments.delete({
    where: { id: comentarioId }
  });
};