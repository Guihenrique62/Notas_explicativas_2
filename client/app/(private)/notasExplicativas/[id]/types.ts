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
// Adicione ao seu arquivo types.ts
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

export interface ContaBalancete {
  codigo: string;
  nome: string;
}

export interface TabelaDemonstrativa {
  id?: string;
  conta: string;
  anoAnterior: number | null;
  anoAtual: number | null;
  ordem: number;
}


export interface DadosBalancete {
  previousBalance: number;
  currentBalance: number;
  accountingAccount: string;
  accountName: string;
  debit?: number;
  credit?: number;
  monthBalance?: number;
}