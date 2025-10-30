
import { Request, Response } from "express";
import * as comentariosService from "../services/commentsService";
import z from "zod";
import jwt from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_SECRET || "secret";

const createCommentSchema = z.object({
  notaId: z.string().uuid('ID da nota inválido'),
  content: z.string().min(1).max(500, 'Conteúdo do comentário deve ter entre 1 e 500 caracteres')
});



export const create = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: "Token não fornecido" });
    }
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };

    const { notaId, content } = createCommentSchema.parse(req.body);

    const comentario = await comentariosService.createComentario({
      notaId,
      userId: decoded.userId,
      content
    });

    res.status(201).json(comentario);
  } catch (error) {
    console.error("Erro ao criar comentário:", error);
    res.status(500).json({
      error: "Erro interno do servidor ao criar comentário"
    });
  }
};


export const getComentariosByNota = async (req: Request, res: Response) => {
  try {
    const { notaId } = req.params;

    if (!notaId) {
      return res.status(400).json({ error: "notaId é obrigatório" });
    }

    const comentarios = await comentariosService.getComentariosByNota(notaId);
    res.json(comentarios);
  } catch (error) {
    console.error("Erro ao buscar comentários:", error);
    res.status(500).json({ 
      error: "Erro interno do servidor ao buscar comentários" 
    });
  }
};

export const updateComentario = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: "Token não fornecido" });
    }
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };

    const { id } = req.params;
    const { content } = req.body;

    if (!decoded.userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    if (!content) {
      return res.status(400).json({ error: "Conteúdo é obrigatório" });
    }

    const comentario = await comentariosService.updateComentario(
      id, 
      decoded.userId, 
      content
    );

    res.json(comentario);
  } catch (error) {
    console.error("Erro ao atualizar comentário:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("não encontrado") || 
          error.message.includes("não autorizado")) {
        return res.status(404).json({ error: error.message });
      }
    }
    
    res.status(500).json({ 
      error: "Erro interno do servidor ao atualizar comentário" 
    });
  }
};

export const deleteComentario = async (req: Request, res: Response) => {
  try {

    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: "Token não fornecido" });
    }
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };

    const { id } = req.params;

    if (!decoded.userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    await comentariosService.deleteComentario(id, decoded.userId);

    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar comentário:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("não encontrado") || 
          error.message.includes("não autorizado")) {
        return res.status(404).json({ error: error.message });
      }
    }
    
    res.status(500).json({ 
      error: "Erro interno do servidor ao deletar comentário" 
    });
  }
};