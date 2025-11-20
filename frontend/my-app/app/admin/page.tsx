"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { fetchAllOrders, updateOrderStatus } from "@/services/orderService";
import { fetchOrderItems } from "@/services/orderItemService";
import { createItem, fetchCategories } from "@/services/itemService";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminDashboard() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal para criar item
  const [openCreate, setOpenCreate] = useState(false);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // ⬅️ ESTADO DA URL AQUI
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [isCreating, setIsCreating] = useState(false);

  // Modal para acompanhar pedido
  const [openTrack, setOpenTrack] = useState(false);
  const [currentOrderItems, setCurrentOrderItems] = useState<any[]>([]);
  const [currentOrderId, setCurrentOrderId] = useState<string>("");
  // O estado imageUrl foi movido daqui ⬆️

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "ADMIN") {
      router.push("/home");
      toast.error("Acesso negado. Esta página é restrita.");
      return;
    }

    loadOrders();

    // Buscar categorias
    if (token) {
      fetchCategories(token)
        .then(setCategories)
        .catch((err) => toast.error(err.message));
    }
  }, [user, authLoading, token]);

  const loadOrders = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await fetchAllOrders(token);
      setOrders(data);
    } catch (err: any) {
      toast.error(err.message || "Falha ao carregar pedidos.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsCreating(true);
    try {
      await createItem(token, {
        description,
        unitPrice: parseFloat(price),
        categoryId,
        imageUrl, // ⬅️ ENVIANDO A URL PARA O SERVICE
      });
      toast.success("Item criado com sucesso!");
      setDescription("");
      setPrice("");
      setCategoryId("");
      setImageUrl(""); // ⬅️ LIMPA O CAMPO APÓS O SUCESSO
      setOpenCreate(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar item");
    } finally {
      setIsCreating(false);
    }
  };

  const handleTrackOrder = async (orderId: string) => {
    if (!token) return;
    setCurrentOrderId(orderId);
    setOpenTrack(true);

    try {
      const items = await fetchOrderItems(token, orderId);
      setCurrentOrderItems(items);
    } catch (err: any) {
      toast.error(err.message || "Falha ao buscar itens do pedido");
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    if (!token) return;

    try {
      await updateOrderStatus(token, orderId, status);
      toast.success(`Pedido ${orderId} atualizado para ${status}`);
      loadOrders(); // Recarrega lista de pedidos
    } catch (err: any) {
      toast.error(err.message || "Falha ao atualizar status");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-extrabold">Monitor de Pedidos (Admin)</h1>

      <Button
        onClick={() => setOpenCreate(true)}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" /> Criar Item
      </Button>

      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="animate-spin h-8 w-8 mx-auto" />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">Nenhum pedido ativo no momento.</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Pedido #{order.id}</CardTitle>
              </CardHeader>
              <CardContent>
                {/* NOVO CONTAINER FLEXÍVEL */}
                <div className="flex justify-between items-start">
                  {/* LADO ESQUERDO: DETALHES DO PEDIDO */}
                  <div className="space-y-1">
                    <p>Cliente: {order.clientName}</p>
                    <p>Total: R$ {order.total.toFixed(2)}</p>
                  </div>

                  {/* LADO DIREITO: CONTROLE DE STATUS */}
                  <div className="w-[180px] text-right relative">
                    <label className="text-sm font-medium block mb-1">
                      Alterar Status:
                    </label>

                    <Select
                      defaultValue={order.status}
                      onValueChange={(newStatus) =>
                        handleUpdateStatus(order.id, newStatus)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pendente</SelectItem>
                        <SelectItem value="PROCESSING">Processando</SelectItem>
                        <SelectItem value="DELIVERED">Entregue</SelectItem>
                        <SelectItem value="CANCELLED">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Criação de Item */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Criar Novo Item</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateItem}>
            <div className="space-y-1">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Ex: Mega Burger de Picanha"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            
            {/* CAMPO DE URL ADICIONADO E CORRIGIDO */}            
            <div className="space-y-1">
              <Label htmlFor="imageUrl">URL da Imagem (Opcional)</Label>
              <Input
                id="imageUrl"
                type="url" 
                placeholder="https://exemplo.com/foto-do-burger.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)} 
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="price">Preço</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="Ex: 35.90"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="category">Categoria</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isCreating}>
              {isCreating ? "Criando..." : "Criar Item"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Acompanhar Pedido */}
      <Dialog open={openTrack} onOpenChange={setOpenTrack}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Itens do Pedido #{currentOrderId}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {currentOrderItems.length === 0 ? (
              <p className="text-gray-500">Nenhum item neste pedido.</p>
            ) : (
              currentOrderItems.map((item) => (
                <Card key={item.id}>
                  <CardContent>
                    {item.item.description} - R$
                    {item.item.unitPrice.toFixed(2)} x {item.quantity}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}