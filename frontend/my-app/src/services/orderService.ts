// frontend/my-app/src/services/orderService.ts

import { apiClient } from "./apiClient"; // Cliente HTTP que gerencia o token

// --- FUNÇÃO 1: ADMIN - LISTAR TODOS OS PEDIDOS ---
async function fetchAllOrders(token: string) {
  // Rota GET /orders é a rota de listagem (Admin)
  const data = await apiClient.get("/orders", token);

  // Mapeie os dados complexos do Back-end (orderitem, user)
  return data.map((order: any) => ({
    id: String(order.id),
    createdAt: order.createdAt,
    status: order.status,
    paymentMethod: order.paymentMethod,
    clientName: order.user?.name || "N/A",
    total: (order.orderitem || []).reduce(
      (sum: number, oi: any) => sum + oi.quantity * oi.item.unitPrice,
      0
    ),
  }));
}

// --- FUNÇÃO 2: ADMIN - ATUALIZAR STATUS ---
async function updateOrderStatus(token: string, orderId: string, status: string) {
    return apiClient.put(`/orders/${orderId}/status`, token, { status });
}


// --- FUNÇÃO 3: CLIENTE - LISTAR PEDIDOS POR ID DE USUÁRIO ---
async function fetchOrdersByUserId(token: string, userId: string) {
    // Esta rota bate em GET /users/:userId/orders
    const response = await apiClient.get(`/users/${userId}/orders`, token);

    // Mapeamento dos dados
    return response.map((order: any) => ({
        id: String(order.id),
        status: order.status,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
        total: (order.orderitem || []).reduce(
            (sum: number, oi: any) => sum + oi.quantity * oi.item.unitPrice, 
            0
        ),
    }));
}


// --- EXPORTAÇÃO FINAL CORRETA (APENAS UMA VEZ) ---
export { fetchAllOrders, updateOrderStatus, fetchOrdersByUserId };