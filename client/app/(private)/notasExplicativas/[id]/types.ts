// src/types/index.ts
export interface NotaExplicativa {
  id: string;
  number: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tabelas: TabelaDemonstrativa[];
  totalComentarios: number;
}

export interface Comentario {
  id: string;
  notaId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface NotasExplicativasPageProps {
  params: {
    id: string;
  };
}

// Interface para as contas do balancete (retorno da API /balancete/companyId/contas)
export interface ContaBalancete {
  id: string;
  accountingAccount: string;
  accountName: string;
}

// Interface para os dados completos do balancete
export interface DadosBalancete {
  id: string;
  accountingAccount: string;
  accountName: string;
  previousBalance: number;
  currentBalance: number;
  debit?: number;
  credit?: number;
  monthBalance?: number;
  referenceDate: number;
  uploadedAt: string;
  companyId: string;
}

export interface TabelaDemonstrativa {
  id?: string;
  conta: string;
  anoAnterior: number | null;
  anoAtual: number | null;
  ordem: number;
  contasVinculadas?: ContaBalancete[]; // Agora usa ContaBalancete em vez de DadosBalancete
}