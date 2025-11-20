"use client";
import { useState } from "react";

import { useForm, SubmitHandler } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface AddressFormData {
  zipCode?: string;
  street: string;
  number: string;
  district: string;
  city: string;
  state: string;
}

export default function Page() {
  const { register, handleSubmit, reset } = useForm<AddressFormData>();
  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit: SubmitHandler<AddressFormData> = async (data) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("@App:token");
      const user = localStorage.getItem("@App:user");

      if (!token || !user) {
        alert("Usuário não autenticado. Faça login novamente.");
        return;
      }

      let userData: { id: string } | null = null;
      try {
        userData = JSON.parse(user);
      } catch {
        alert("Dados do usuário inválidos. Faça login novamente.");
        return;
      }

      const userId = userData?.id;
      if (!userId) {
        alert("ID do usuário não encontrado. Faça login novamente.");
        return;
      }

      const res = await fetch(`http://localhost:3000/users/${userId}/address`, {
        method: "PUT", // seu backend usa PUT para upsert
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Erro do servidor:", text);
        alert("Erro ao salvar endereço: " + (text || res.statusText));
        return;
      }

      // tenta ler json, mas aceita caso não seja json
      let json = null;
      try {
        json = await res.json();
      } catch {
        json = null;
      }

      console.log("Resposta do back:", json);
      alert("Endereço salvo com sucesso!");
      reset();
    } catch (err) {
      console.error("Erro ao enviar:", err);
      alert("Erro ao enviar formulário");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <h2 className="text-2xl font-semibold mb-6">Endereço de Entrega</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="zipCode">CEP</Label>
          <Input
            id="zipCode"
            {...register("zipCode")}
            placeholder="00000-000"
          />
        </div>

        <div>
          <Label htmlFor="street">Rua</Label>
          <Input id="street" {...register("street", { required: true })} />
        </div>

        <div>
          <Label htmlFor="number">Número</Label>
          <Input id="number" {...register("number", { required: true })} />
        </div>

        <div>
          <Label htmlFor="district">Bairro</Label>
          <Input id="district" {...register("district", { required: true })} />
        </div>

        <div>
          <Label htmlFor="city">Cidade</Label>
          <Input id="city" {...register("city", { required: true })} />
        </div>

        <div>
          <Label htmlFor="state">Estado (UF)</Label>
          <Input
            id="state"
            maxLength={2}
            {...register("state", { required: true })}
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Enviando..." : "Salvar Endereço"}
        </Button>
      </form>
    </div>
  );
}
