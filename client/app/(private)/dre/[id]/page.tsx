'use client';

import api from "@/app/api/api";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { InputSwitch } from "primereact/inputswitch";
import { Dre } from "../types";
import DreTable from "./components/dreTable";
import ShowCentsInput from "../../globalComponents/ShowCentsInput";


const BalancoPage = () => {
  const toast = useRef<Toast>(null);
  const [data, setData] = useState<Dre>({} as Dre);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const year = new Date().getFullYear();
  const [showCents, setShowCents] = useState(true);

  

  useEffect(() => {
    const fetchDre = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dre', {
        params: { companyId: params.id, year: year }
      });

      if (res.status >= 200 && res.status < 300) {
        setData(res.data);
      } else {
        console.error('Erro ao buscar a DRE:', res.statusText);
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao buscar a DRE.',
          life: 3000,
        });
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao conectar com o servidor.',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };
  
    if (params.id) {
      fetchDre();
    }
  }, [params.id]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: showCents ? 2 : 0,
      maximumFractionDigits: showCents ? 2 : 0,
    }).format(value);
  }

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="text-center">
          <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
          <p className="mt-3">Carregando DRE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid">
      <div className="col-12">
        <Toast ref={toast} />

        {/* Cabeçalho */}
        <div className="card mb-4">
          <div className="flex justify-content-between align-items-center">
            <div>
              <h1 className="text-2xl font-bold m-0">Demonstração do Resultado do Exercício</h1>
              <span className="text-lg text-color-secondary">Ano: {year}</span>
            </div>

             <ShowCentsInput companyId={params.id} showCents={showCents} setShowCents={setShowCents} />

          </div>
        </div>

        {/* RECEITAS LIQUIDAS */}
        <div className="card mb-4">
          
          {/* Receitas Líquidas */}
          <div className="mb-4">
            <DreTable formatCurrency={formatCurrency} data={data} year={year} group={'RECEITAS_LIQUIDAS'} />
          </div>
        </div>

        {/* CUSTOS */}
        <div className="card mb-4">
          {/* Custos */}
          <div className="mb-4">
            <DreTable formatCurrency={formatCurrency} data={data} year={year} group={'CUSTOS'} />
          </div>

        </div>

        {/* DESPESAS OPERACIONAIS */}
        <div className="card mb-4">

          {/* Despesas Operacionais */}
          <div>
            <DreTable formatCurrency={formatCurrency} data={data} year={year} group={'DESPESAS_OPERACIONAIS'} />
          </div>
        </div>

        {/* RESULTADO FINANCEIRO */}
        <div className="card mb-4">

          {/* Resultado Financeiro */}
          <div>
            <DreTable formatCurrency={formatCurrency} data={data} year={year} group={'RESULTADO_FINANCEIRO'} />
          </div>
        </div>

        {/* IMPOSTOS */}
        <div className="card mb-4">
          {/* Impostos */}
          <div>
            <DreTable formatCurrency={formatCurrency} data={data} year={year} group={'IMPOSTOS'} />
          </div>
        </div>

      </div>
    </div>
  );
}

export default BalancoPage;