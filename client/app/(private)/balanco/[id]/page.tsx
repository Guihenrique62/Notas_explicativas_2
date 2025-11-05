'use client';

import api from "@/app/api/api";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import { Balanco } from "../types";
import BalancoTable from "./components/balancoTable";
import { useParams } from "next/navigation";
import { InputSwitch } from "primereact/inputswitch";
import Resumo from "./components/resumo";
import ShowCentsInput from "../../globalComponents/ShowCentsInput";

const BalancoPage = () => {
  const toast = useRef<Toast>(null);
  const [balances, setBalances] = useState<Balanco[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const year = new Date().getFullYear();
  const [showCents, setShowCents] = useState(true);

  

  useEffect(() => {
    const fetchBalances = async () => {
    try {
      setLoading(true);
      const res = await api.get('/balanco', {
        params: { companyId: params.id, year: year }
      });

      if (res.status >= 200 && res.status < 300) {
        setBalances(res.data);
      } else {
        console.error('Erro ao buscar os balanços:', res.statusText);
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao buscar os balanços.',
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
      fetchBalances();
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
          <p className="mt-3">Carregando balanços...</p>
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
              <h1 className="text-2xl font-bold m-0">Balanço Patrimonial</h1>
              <span className="text-lg text-color-secondary">Ano: {year}</span>
            </div>

             <ShowCentsInput companyId={params.id} showCents={showCents} setShowCents={setShowCents} />

          </div>
        </div>

        {/* ATIVO */}
        <div className="card mb-4">
          <h2 className="text-xl font-semibold mb-3">ATIVO</h2>

          {/* Ativo Circulante */}
          <div className="mb-4">
            <BalancoTable formatCurrency={formatCurrency} balances={balances} year={year} group={'ATIVO_CIRCULANTE'} />
          </div>

          {/* Ativo Não Circulante */}
          <div className="mb-4">
            <BalancoTable formatCurrency={formatCurrency} balances={balances} year={year} group={'ATIVO_NAO_CIRCULANTE'} />
          </div>
        </div>

        {/* PASSIVO*/}
        <div className="card mb-4">
          <h2 className="text-xl font-semibold mb-3">PASSIVO</h2>

          {/* Passivo Circulante */}
          <div className="mb-4">
            <BalancoTable formatCurrency={formatCurrency} balances={balances} year={year} group={'PASSIVO_CIRCULANTE'} />
          </div>

          {/* Passivo Não Circulante */}
          <div className="mb-4">
            <BalancoTable formatCurrency={formatCurrency} balances={balances} year={year} group={'PASSIVO_NAO_CIRCULANTE'} />
          </div>
        </div>

        {/* PATRIMÔNIO LÍQUIDO */}
        <div className="card mb-4">
          <h2 className="text-xl font-semibold mb-3">PATRIMÔNIO LÍQUIDO</h2>

          {/* Patrimônio Líquido */}
          <div>
            <BalancoTable formatCurrency={formatCurrency} balances={balances} year={year} group={'PATRIMONIO_LIQUIDO'} />
          </div>
        </div>

        {/* Resumo */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-3">RESUMO {year}</h2>
          <Resumo balances={balances} formatCurrency={formatCurrency} currentYear={true} />
          <h2 className="text-xl font-semibold mb-3">RESUMO {year - 1}</h2>
          <Resumo balances={balances} formatCurrency={formatCurrency} currentYear={false} />


        </div>
      </div>
    </div>
  );
}

export default BalancoPage;