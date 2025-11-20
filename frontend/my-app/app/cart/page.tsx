// frontend/my-app/app/cart/page.tsx

"use client";

import React, { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

// Imports de UI (assumindo que você tem os componentes na pasta 'ui')
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function CartPage() {
  const { items, totalPrice, removeFromCart, updateQuantity, clearCart } =
    useCart();
  const { token } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  // Estado para o formulário de endereço e pagamento (Simplificado)
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pix"); // Default: pix

  // Lógica de finalização de pedido
  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("O carrinho está vazio!");
      return;
    }

    if (!token) {
      toast.error("Você precisa estar logado para finalizar o pedido.");
      router.push("/");
      return;
    }

    // Redireciona para a tela de confirmação/checkout
    router.push("/checkout");
  };

  // Se o carrinho estiver vazio, redireciona para o cardápio
  if (items.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Seu carrinho está vazio!</h2>
        <p className="text-gray-600 mb-6">
          Volte ao cardápio para adicionar itens.
        </p>
        <Button onClick={() => router.push("/home")}>Ver Cardápio</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pt-12">
      <h1 className="text-4xl font-bold text-primary mb-8 border-b pb-3">
        Seu Carrinho
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* === COLUNA PRINCIPAL: ITENS DO CARRINHO === */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.productId}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      R$ {item.price.toFixed(2).replace(".", ",")} cada
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Controle de Quantidade */}
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(
                          item.productId,
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="h-8 w-12 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                    >
                      +
                    </Button>
                  </div>

                  {/* Botão Remover */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.productId)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* === COLUNA LATERAL: RESUMO E CHECKOUT === */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span className="text-2xl text-green-600">
                  R$ {totalPrice.toFixed(2).replace(".", ",")}
                </span>
              </div>

              {/* Formulário de Checkout */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-t pt-4">
                  Finalizar Compra
                </h3>

                {/* Endereço */}
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço de Entrega</Label>
                  <Input
                    id="address"
                    placeholder="Rua, Número, Bairro"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Forma de Pagamento */}
                <div className="space-y-2">
                  <Label htmlFor="payment">Forma de Pagamento</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">Pix</SelectItem>
                      <SelectItem value="card">Cartão</SelectItem>
                      <SelectItem value="cash">Dinheiro (Troco)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Botão Finalizar */}
              <Button
                onClick={handleCheckout}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Finalizar Pedido"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Botão Voltar para o Cardápio */}
      <div className="max-w-4xl mx-auto mt-4 pb-12">
        <Button
          variant="link"
          onClick={() => router.push("/home")}
          className="text-primary hover:text-orange-600"
        >
          ← Continuar Comprando
        </Button>
      </div>
    </div>
  );
}
