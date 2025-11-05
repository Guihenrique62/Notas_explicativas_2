import { prisma } from "../prismaClient"
import { NOTAS_PADRAO } from "../utils/notas_padrao"


interface CreateCompanyInput {
  name: string
  cnpj: string
}

interface updateCompanyInput {
  companyId: string
  name?: string
  cnpj?: string
}

// Create Company
export const createCompany = async (data: CreateCompanyInput) => {
  try {
    const companyExists = await prisma.company.findFirst({ where: { name: data.name} })
    if (companyExists) throw new Error('Empresa com esse nome já existe!')

    const cnpjExists = await prisma.company.findFirst({ where: { cnpj: data.cnpj} })
    if (cnpjExists) throw new Error('CNPJ já está em uso!')

    // Cria a empresa e as notas em uma transação
      const result = await prisma.$transaction(async (tx) => {
        // Cria a empresa
        const company = await tx.company.create({ 
          data: {
            name: data.name,
            cnpj: data.cnpj,
          } 
        });

        // Prepara os dados das notas
        const notasData = NOTAS_PADRAO.map(nota => ({
          companyId: company.id,
          number: nota.number,
          title: nota.title,
          content: nota.content
        }));

        // Cria todas as notas
        await tx.notasExplicativas.createMany({
          data: notasData
        });

        return company;
      });

      return result;
  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    if (error instanceof Error) {
      throw error; // Já é um erro conhecido (como "Empresa já existe")
    }
  }
}

// List Company
export const listCompanies = async () => {
  return prisma.company.findMany()
}

export const checkCompanyPlan = async (companyId: string) => {
  const company = await prisma.company.findUnique({ where: { id: companyId } })
  if (!company) throw new Error('Empresa não encontrada!')
  return company.planOfCountsAgrocontar
}

export const checkCompanyShowCents = async (companyId: string) => {
  const company = await prisma.company.findUnique({ where: { id: companyId } })
  if (!company) throw new Error('Empresa não encontrada!')
  return company.showCents
}

export const updateCompanyPlan = async (companyId: string) => {
  const company = await prisma.company.findUnique({ where: { id: companyId } })
  if (!company) throw new Error('Empresa não encontrada!')
  
  const updatedCompany = await prisma.company.update({
    where: { id: companyId },
    data: { planOfCountsAgrocontar: !company.planOfCountsAgrocontar }
  })

  return updatedCompany
}

export const updateCompanyShowCents = async (companyId: string) => {
  const company = await prisma.company.findUnique({ where: { id: companyId } })
  if (!company) throw new Error('Empresa não encontrada!')
  
  const updatedCompany = await prisma.company.update({
    where: { id: companyId },
    data: { showCents: !company.showCents }
  })

  return updatedCompany
}

// List Companies per user group
export const listUserCompanies = async (userId: string) => {

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('Usuário não encontrado!')

  const groupCompanies = await prisma.groupCompanies.findMany({
    where: {
      users: {
        some: {
          id: userId
        }
      }

    }, include: {
      companies: true
    }
  })

  // Flatter and remove duplicateds
  const companyMap = new Map<string, typeof groupCompanies[0]['companies'][0]>();
  groupCompanies.forEach(group => {
    group.companies.forEach(company => {
      companyMap.set(company.id, company);
    });
  });

  const uniqueCompanies = Array.from(companyMap.values());

  return uniqueCompanies
}

export const updateCompany = async ({ companyId, cnpj, name }: updateCompanyInput) => {
  if (!companyId) throw new Error("Id da empresa não informado");

  const company = await prisma.company.findUnique({
    where: { id: companyId }
  });

  if (!company) throw new Error("Empresa não encontrada");

  // verify if cnpj is active
  if (cnpj && company.cnpj !== cnpj) {

    const existingCompanyWithCnpj = await prisma.company.findFirst({
      where: {
        cnpj: cnpj,
        id: { not: companyId } // Except the current company
      }
    });

    if (existingCompanyWithCnpj) {
      throw new Error("CNPJ já está sendo utilizado por outra empresa");
    }
  }

  const data: any = {};

  if (cnpj) data.cnpj = cnpj;
  if (name) data.name = name;


  if (Object.keys(data).length === 0) {
    return company;
  }

  const updatedCompany = await prisma.company.update({
    where: { id: companyId },
    data
  });

  return updatedCompany;
};

export const deleteCompany = async (companyId: string) => {
  const company = await prisma.company.findUnique({ where: { id: companyId } })
  if (!company) throw new Error('Empresa não encontrada!')

  await prisma.company.delete({ where: { id: companyId } })

  return {
    id: company.id,
    name: company.name,
    cnpj: company.cnpj,
    createdAt: company.createdAt
  }
}

export const listUniqueCompany = async (companyId: string) => {
  const company = await prisma.company.findUnique({ where: { id: companyId } })
  if (!company) throw new Error('Empresa não encontrada!')
  return company
}