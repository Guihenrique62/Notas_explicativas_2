import { Request, Response } from 'express';
import * as tabelaDemonstrativaService from '../services/demoTableServices';

export const getByNota = async (req: Request, res: Response) => {
  try {
    const { notaId } = req.params;
    const tabelas = await tabelaDemonstrativaService.getTabelasByNota(notaId);
    return res.json(tabelas);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

export const create = async (req: Request, res: Response) => {
  try {
    const { notaId } = req.params;
    const { conta, anoAnterior, anoAtual, ordem, contasVinculadasIds } = req.body;

    const tabela = await tabelaDemonstrativaService.createTabela(notaId, {
      conta,
      anoAnterior: anoAnterior !== null ? parseFloat(anoAnterior) : null,
      anoAtual: anoAtual !== null ? parseFloat(anoAtual) : null,
      ordem: parseInt(ordem),
      contasVinculadasIds: contasVinculadasIds
    });

    return res.status(201).json(tabela);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { conta, anoAnterior, anoAtual, ordem, contasVinculadasIds } = req.body;

    const tabela = await tabelaDemonstrativaService.updateTabela(id, {
      conta,
      anoAnterior: anoAnterior !== undefined ? parseFloat(anoAnterior) : undefined,
      anoAtual: anoAtual !== undefined ? parseFloat(anoAtual) : undefined,
      ordem: ordem !== undefined ? parseInt(ordem) : undefined,
      contasVinculadasIds: contasVinculadasIds
    });

    return res.json(tabela);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

export const deleteDemoTable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await tabelaDemonstrativaService.deleteTabela(id);
    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

export const reorder = async (req: Request, res: Response) => {
  try {
    const { notaId } = req.params;
    const { novasOrdens } = req.body;

    const result = await tabelaDemonstrativaService.reorderTabelas(notaId, novasOrdens);
    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}
