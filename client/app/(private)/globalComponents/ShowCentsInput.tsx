'use client';
import api from "@/app/api/api";
import { InputSwitch } from "primereact/inputswitch";
import { useEffect, useState } from "react";

const updateCompanyPlan = async (companyId: string) => {
  try {
    const response = await api.put(`/companies/showCents/${companyId}`);

    if (!response.status || response.status !== 200) {
      throw new Error(response.data?.error || 'Erro ao atualizar plano da empresa');
    }

    return response.data as {showCents: boolean};
  } catch (error) {
    console.error('Erro ao atualizar plano da empresa:', error);
    return 
  }
};

export const fetchCompanyPlan = async (companyId: string) => {
  try {
    const response = await api.get(`/companies/showCents/${companyId}`);

    if (!response.status || response.status !== 200) {
      throw new Error(response.data?.error || 'Erro ao buscar plano da empresa');
    }

    return response.data as {showCents: boolean};
  } catch (error) {
    console.error('Erro ao buscar plano da empresa:', error);
    return 
  }
};


const ShowCentsInput = ({ companyId }: { companyId: string }) => {
  const [checked, setChecked] = useState(false);

  useEffect(()=> {
    fetchCompanyPlan(companyId).then(
      (data) => {
        if(data) {
          setChecked(data.showCents);
        }
      }
    )
  },[companyId])
  return (
    <div className="flex items-center justify-between w-1/3 h-full gap-3 p-2">
      <span className="text-lg">Mostrar centavos</span>
      <InputSwitch checked={checked} onChange={(e) => {
        setChecked(e.value)
        updateCompanyPlan(companyId)
        }} />
    </div>
  );
};


export default ShowCentsInput;