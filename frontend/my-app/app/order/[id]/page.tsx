"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// --- INTERFACES DO BACK-END CORRIGIDAS ---
interface RawOrder {
  id: string;
  status: string;
  orderitem?: Array<{
    quantity: number;
    item?: {
      description: string;
      unitPrice: number;
    };
  }>;
  // ✅ O endereço agora é esperado ANINHADO no objeto user
  user?: {
    address?: {
      street: string;
      number: string;
      district: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };
}

// --- INTERFACE DO FRONT-END (O que o componente espera no estado 'order') ---
interface FinalOrder {
  id: string;
  status: string;
  totalPrice: number;
  address: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export default function OrderConfirmationPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ? String(params.id) : undefined;

  const router = useRouter();
  const { token } = useAuth();

  const [order, setOrder] = useState<FinalOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrderDetails() {
      if (!token || !id) {
        setError("Pedido ou autenticação não encontrados.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.error("ERRO DE API - Status:", response.status);
          throw new Error("Não foi possível carregar os detalhes do pedido.");
        }

        const data: RawOrder = await response.json();

        // --- Mapeamento e Cálculo dos Dados ---

        // 1. Mapear os itens
        const itemsList = (data.orderitem || []).map((oi) => ({
          name: oi.item?.description || "Item desconhecido",
          quantity: oi.quantity,
          price: oi.item?.unitPrice || 0,
        }));

        // 2. Calcular o Preço Total
        const totalPrice = itemsList.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        // 3. Formatar o Endereço para a string de exibição
        // PEGA O OBJETO ANINHADO: data.user?.address
        const addressData = data.user?.address;

        const formattedAddress = addressData
          ? `${addressData.street}, ${addressData.number} - ${addressData.district} | ${addressData.city}/${addressData.state} (${addressData.zipCode})`
          : "Endereço não informado";

        // 4. Criar o objeto final
        const finalOrder: FinalOrder = {
          id: data.id,
          status: data.status,
          totalPrice,
          items: itemsList,
          address: formattedAddress,
        };

        setOrder(finalOrder);
      } catch (err: any) {
        const msg = err?.message || "Erro inesperado ao carregar o pedido.";
        setError(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrderDetails();
  }, [id, token]);

  // --- FUNÇÕES DE RENDERIZAÇÃO DE ESTADO ---

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
        <p className="text-xl">Processando pedido...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center p-12 min-h-screen pt-40">
        <h2 className="text-3xl font-bold text-red-600">
          Erro ao Carregar Pedido
        </h2>
        <p className="text-gray-600 mt-2">
          {error || "Pedido não encontrado ou acesso negado."}
        </p>
        <button
          onClick={() => router.push("/home")}
          className="mt-6 bg-primary text-white px-6 py-2 rounded-full hover:bg-orange-600 transition"
        >
          Voltar ao Cardápio
        </button>
      </div>
    );
  }

  // --- RENDERIZAÇÃO FINAL (Pedido Confirmado) ---
  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 pt-16 min-h-screen">
      <div className="text-center mb-10">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-green-600 mb-2">
          Pedido #{order.id} Confirmado!
        </h1>
        <p className="text-xl text-gray-700">Obrigado pela sua compra.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h2 className="text-2xl font-semibold mb-3 border-b pb-2">
            Resumo da Entrega
          </h2>
          <p className="font-medium">Endereço:</p>
          <p className="text-gray-600">{order.address}</p>
          <p className="font-medium mt-3">Status Atual:</p>
          <p className="text-green-500 font-semibold">{order.status}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-md">
          <h2 className="text-2xl font-semibold mb-3 border-b pb-2">Itens</h2>
          <ul className="space-y-2">
            {order.items.map((item, index) => (
              <li key={index} className="flex justify-between text-gray-700">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span>
                  R$ {(item.quantity * item.price).toFixed(2).replace(".", ",")}
                </span>
              </li>
            ))}
          </ul>
          <div className="pt-4 mt-4 border-t flex justify-between font-bold text-xl">
            <span>Total Pago:</span>
            <span className="text-primary">
              R$ {order.totalPrice.toFixed(2).replace(".", ",")}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => router.push("/home")}
        className="w-full mt-8 bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition"
      >
        Voltar para o Cardápio
      </button>
    </div>
  );
}
