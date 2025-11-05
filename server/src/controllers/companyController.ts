import z from "zod";
import * as companyService from '../services/companyServices'
import { handleZodError } from "../utils/handleZodError";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { NotFoundError } from "../utils/errors";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

const companySchema = z.object({
  name: z.string(),
  cnpj: z.string()
})

const updateCompanySchema = z.object({
  name: z.string().optional(),
  cnpj: z.string().optional()
})

export const createCompany = async (req: Request, res: Response) => {

  try {

    const data = companySchema.parse(req.body)
    const company = await companyService.createCompany(data)
    res.json(company)

  } catch (err) {
    if (err instanceof z.ZodError) {
        return res.status(400).json({ errors: handleZodError(err) });
      }
    if (err instanceof NotFoundError) {
      return res.status(404).json({ error: err.message });
    }
    
    res.status(400).json({ error: err instanceof Error ? err.message : err });
  }
}

export const listCompanies = async (_: Request, res: Response) => {
  const companies = await companyService.listCompanies()
  res.json(companies)
}

export const checkCompanyPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const plan = await companyService.checkCompanyPlan(id)
    res.json({ planOfCountsAgrocontar: plan })
    
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : error });
  }
}

export const checkCompanyShowCents = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const showCents = await companyService.checkCompanyShowCents(id)
    res.json({ showCents: showCents })
    
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : error });
  }
}

export const updateCompanyPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updatedPlan = await companyService.updateCompanyPlan(id)
    res.json({ planOfCountsAgrocontar: updatedPlan })
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : error });
  }
}

export const updateCompanyShowCents = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updatedShowCents = await companyService.updateCompanyShowCents(id)
    res.json({ showCents: updatedShowCents })
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : error });
  }
}

export const listUserCompanies = async (req: Request, res: Response) => {

  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: "Token não fornecido" });
    }
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };

    const groupCompanies = await companyService.listUserCompanies(decoded.userId)

    res.json(groupCompanies)

  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : err });

  }
}


export const updateCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const parsed = updateCompanySchema.parse(req.body)

    const updatedCompany = await companyService.updateCompany({...parsed, companyId: id});
    res.json(updatedCompany);
  } catch (err) {
    res.status(401).json({ error: err instanceof Error ? err.message : err });
  }
}


export const deleteCompany = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if(!id) res.status(400).json({message: "Parametro nao enviado!"})

    const deletedCompany = await companyService.deleteCompany(id)
    res.json(deletedCompany)
  } catch (err) {
    res.status(401).json({ error: err instanceof Error ? err.message : err });
  }
}

export const listUniqueCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const company = await companyService.listUniqueCompany(id)
    res.json(company)
  } catch (err) {
    res.status(401).json({ error: err instanceof Error ? err.message : err });
  }
}