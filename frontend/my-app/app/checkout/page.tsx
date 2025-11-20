"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "sonner";

import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface AddressFormData {
  zipCode?: string;
  street: string;
  number: string;
  district: string;
  city: string;
  state: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const auth = useAuth();
  const ctxToken = auth?.token ?? null;

  const { register, handleSubmit, reset } = useForm<AddressFormData>({
    defaultValues: {
      zipCode: "",
      street: "",
      number: "",
      district: "",
      city: "",
      state: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const getTokenAndUserId = () => {
    // Try context first, then localStorage keys used in your AuthContext
    const token = ctxToken ?? localStorage.getItem("@App:token");
    const userJson = localStorage.getItem("@App:user");
    let userId: string | null = null;
    if (userJson) {
      try {
        const u = JSON.parse(userJson);
        userId = u?.id ?? null;
      } catch {
        userId = null;
      }
    }
    return { token, userId };
  };

  const onSubmit: SubmitHandler<AddressFormData> = async (addressData) => {
    if (items.length === 0) {
      toast.error("Carrinho vazio.");
      return;
    }

    const { token, userId } = getTokenAndUserId();

    if (!token || !userId) {
      toast.error("Você precisa estar logado para finalizar o pedido.");
      router.push("/"); // leva ao login/home
      return;
    }

    setIsLoading(true);

    try {
      const orderPayload = {
        // 🚨 CORREÇÃO 1: Adiciona o ID do Cliente logado (userClient)
        userClient: userId,

        // 🚨 CORREÇÃO 2: Corrige o método de pagamento para PIX (maiúsculo)
        paymentMethod: "PIX",

        // 🚨 CORREÇÃO 3: Mapeia para itemId (Back-end) em vez de productId/id
        items: items.map((it) => ({
          itemId: String(it.productId), // Se o seu carrinho usa 'id', use String(it.id)
          quantity: it.quantity,
        })),
        address: {
          zipCode: addressData.zipCode ?? "",
          street: addressData.street,
          number: addressData.number,
          district: addressData.district ?? "Não Informado", // Adiciona fallback para district, city, state se não estiverem no form
          city: addressData.city ?? "Não Informado",
          state: addressData.state ?? "SP",
        }, // Remove o totalPrice se o Back-end não espera este campo no schema
      };

      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // seu middleware espera "Bearer ..."
        },
        body: JSON.stringify(orderPayload),
      });

      // Se o servidor respondeu com HTML ou erro, trate:
      if (!res.ok) {
        const text = await res.text();
        console.error("Erro ao criar pedido:", text);
        // tente parsear json se for json
        try {
          const parsed = JSON.parse(text);
          toast.error(parsed.message || "Falha ao criar pedido.");
        } catch {
          toast.error("Falha ao criar pedido.");
        }
        return;
      }

      // Tenta ler JSON normalmente
      let json: any = null;
      try {
        json = await res.json();
      } catch {
        json = null;
      }

      toast.success("Pedido realizado com sucesso!");
      clearCart();
      reset();

      // redireciona para a página do pedido. Ajuste a propriedade do id recebido do back.
      const orderId = json?.orderId ?? json?.id ?? null;
      if (orderId) {
        router.push(`/order/${orderId}`);
      } else {
        router.push("/home");
      }
    } catch (err: any) {
      console.error("Erro no checkout:", err);
      toast.error("Erro ao finalizar pedido. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-6">Finalizar Pedido</h1>

      <Card>
        <CardHeader>
          <CardTitle>Endereço de Entrega</CardTitle>
        </CardHeader>

        <CardContent>
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
              <Input id="street" {...register("street")} />
            </div>

            <div>
              <Label htmlFor="number">Número</Label>
              <Input id="number" {...register("number")} />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 text-white"
              >
                {isLoading ? "Enviando..." : "Confirmar Pedido"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
