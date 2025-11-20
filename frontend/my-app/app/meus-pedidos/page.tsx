// frontend/my-app/app/meus-pedidos/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Package } from "lucide-react";

// Tipagem básica para Order (BASEADO NO SEU MAPA DO FRONTEND)
interface Order {
  id: string;
  status: string;
  createdAt: string;
  total: number;
  paymentMethod: string;
  orderitem?: any[];
}

// Importar componentes UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Corrigido a importação do Badge

// Importar o serviço do cliente
import { fetchOrdersByUserId } from "@/services/orderService";

export default function MyOrdersPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]); // <--- TIPADO!
  const [isLoading, setIsLoading] = useState(true); // Função auxiliar para mapear status

  const getStatusColor = (status: string): string => {
    // <--- TIPADO!
    switch (status) {
      case "PENDING":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "PROCESSING":
      case "PREPARING":
        return "bg-amber-500 hover:bg-amber-600";
      case "OUT_FOR_DELIVERY":
        return "bg-blue-500 hover:bg-blue-600";
      case "DELIVERED":
        return "bg-green-500 hover:bg-green-600";
      case "CANCELLED":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const statusLabel = (status: string) => {
    // <--- TIPADO!
    const labels: Record<string, string> = {
      PENDING: "Pendente",
      PROCESSING: "Processando",
      PREPARING: "Preparando",
      OUT_FOR_DELIVERY: "A caminho",
      DELIVERED: "Entregue",
      CANCELLED: "Cancelado",
    };
    return labels[status] || status;
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user || !token) {
      toast.error("Faça login para ver seus pedidos.");
      return;
    }

    const loadMyOrders = async () => {
      setIsLoading(true);
      try {
        // user.id é um BigInt no backend, mas aqui esperamos que seja uma string
        // Você deve garantir que user.id seja uma string para ser usado na URL
        const data = await fetchOrdersByUserId(token, String(user.id));
        setOrders(data);
      } catch (err) {
        toast.error("Falha ao carregar seus pedidos.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMyOrders();
  }, [user, token, authLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />     {" "}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
           {" "}
      <h1 className="text-3xl font-extrabold flex items-center gap-2">
                <Package className="h-7 w-7 text-amber-500" /> Meus Pedidos    
         {" "}
      </h1>
           {" "}
      <p className="text-gray-600">
        Acompanhe o status e o histórico dos seus pedidos.
      </p>
           {" "}
      {orders.length === 0 ? (
        <p className="text-gray-500">Você ainda não fez nenhum pedido.</p>
      ) : (
        <div className="space-y-4">
                   {" "}
          {orders.map(
            (
              order // <-- O TypeScript agora sabe o que 'order' contém!
            ) => (
              <Card key={order.id} className="border-l-4 border-amber-500">
                             {" "}
                <CardHeader className="flex flex-row justify-between items-center py-3">
                                 {" "}
                  <CardTitle className="text-lg">Pedido #{order.id}</CardTitle> 
                               {" "}
                  <Badge
                    className={`${getStatusColor(order.status)} text-white`}
                  >
                                      {statusLabel(order.status)}               {" "}
                  </Badge>
                               {" "}
                </CardHeader>
                             {" "}
                <CardContent className="pt-2 text-sm text-gray-700">
                                 {" "}
                  <p>
                    <span className="font-semibold">Data:</span>{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                                 {" "}
                  <p>
                    <span className="font-semibold">Total:</span> R${" "}
                    {order.total.toFixed(2)}
                  </p>
                                 {" "}
                  <p className="mt-2">
                    <span className="font-semibold">Método de Pagamento:</span>{" "}
                    {order.paymentMethod}
                  </p>
                               {" "}
                </CardContent>
                           {" "}
              </Card>
            )
          )}
                 {" "}
        </div>
      )}
         {" "}
    </div>
  );
}
