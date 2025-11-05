// src/services/exportService.ts
import { PrismaClient } from '@prisma/client';
import { Response } from 'express';
import { DocxConverter } from './converters/DocxConverter';
import { ResponseHandler } from './handlers/ResponseHandler';

const prisma = new PrismaClient();

export class ExportService {
  private docxConverter: DocxConverter;
  private responseHandler: ResponseHandler;

  constructor() {
    this.docxConverter = new DocxConverter();
    this.responseHandler = new ResponseHandler();
  }

  async exportNotasToWord(companyId: string, res: Response): Promise<Buffer> {
    try {
      const company = await prisma.company.findUnique({
        where: { id: companyId }
      });
      if (!company) {
        throw new Error('Empresa não encontrada');
      }
      const notas = await this.fetchNotas(companyId);
      const buffer = await this.docxConverter.convertNotasToDocx(notas, company.showCents);
      
      this.responseHandler.setDownloadHeaders(res, company.name, buffer.length);
      return buffer;
      
    } catch (error) {
      console.error('Erro ao exportar notas para Word:', error);
      throw error;
    }
  }

  private async fetchNotas(companyId: string) {
    const notas = await prisma.notasExplicativas.findMany({
      where: { companyId },
      include: {
        tabelas: {
          orderBy: { ordem: 'asc' }
        }
      },
      orderBy: { number: 'asc' }
    });

    if (notas.length === 0) {
      throw new Error('Nenhuma nota encontrada para exportação');
    }

    return notas;
  }
}

// Exportação das funções existentes para compatibilidade
export const exportNotasToWord = (companyId: string, res: Response) => {
  return new ExportService().exportNotasToWord(companyId, res);
};