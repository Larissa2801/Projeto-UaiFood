// frontend/src/services/orderItemService.ts

import { apiClient } from "./apiClient";

/** Busca os itens de um pedido específico */
export async function fetchOrderItems(token: string, orderId: string) {
  // Rota: GET /orders/{orderId}/items (Rota que ainda precisamos definir no Back-end)
  // Usaremos a rota que retorna o pedido inteiro, que já contém os itens: GET /orders/{id}
  const orderData = await apiClient.get(`/orders/${orderId}`, token);

  // O Back-end retorna a lista de itens sob a chave 'orderitem'
  return orderData.orderitem || [];
}
