// backend/src/services/OrderService.js
const orderRepository = require("../repository/OrderRepository");
// Importar OrderItemRepository

class OrderService {
  async create(orderData) {
    // Lógica de negócio: Verificar se o usuário logado tem permissão para fazer o pedido
    // Lógica de Estoque: Decrementar estoque na transação (Futuro Pós-entrega)
    return orderRepository.create(orderData);
  }

  /**
   * [READ ONE] Acesso com Regra de Propriedade
   */
  async findById(orderId, currentUserId, currentUserType) {
    const order = await orderRepository.findById(orderId);

    if (!order) return null;

    // REGRA DE SEGURANÇA: Cliente só pode ver o próprio pedido. ADMIN vê todos.
    if (
      currentUserType !== "ADMIN" &&
      String(order.userClient) !== String(currentUserId)
    ) {
      throw new Error(
        "Acesso negado: Você só pode visualizar seus próprios pedidos."
      );
    }

    return order;
  }
  async findAllOrders(currentUserType) {
    // Não precisa de userId, mas pode checar o tipo.
    // REGRA: Apenas Administradores podem usar esta função (Embora a rota faria esta checagem)
    if (currentUserType !== "ADMIN") {
      throw new Error("Acesso negado.");
    }

    // Chama o Repository para buscar todos os pedidos.
    // Esta função no Repository deve garantir que as relações (itens, cliente) são carregadas!
    return orderRepository.findAllOrders();
  }

  /**
   * [UPDATE STATUS] Acesso com Regra de Autorização
   */
  async updateStatus(orderId, newStatus, currentUserType) {
    // REGRA: Somente ADMIN pode alterar o status
    if (currentUserType !== "ADMIN") {
      throw new Error(
        "Acesso negado: Somente administradores podem alterar o status do pedido."
      );
    }

    // Lógica de negócio: Validar se a transição de status é válida (Ex: não pode ir de DELIVERED para PENDING)
    return orderRepository.updateStatus(orderId, newStatus);
  }

  /**
   * [READ ALL] Busca por Histórico
   */
  async findByUserId(userId, currentUserId, currentUserType) {
    // REGRA DE SEGURANÇA: Usuário só busca o próprio histórico. ADMIN vê todos.
    if (currentUserType !== "ADMIN" && userId !== String(currentUserId)) {
      throw new Error(
        "Acesso negado: Você só pode visualizar seu próprio histórico de pedidos."
      );
    }

    return orderRepository.findByUserId(userId);
  }
}
module.exports = new OrderService();
