// backend/src/controllers/OrderController.js
const orderService = require("../services/OrderService");

class OrderController {
  constructor() {
    // Faz o 'bind' de todos os métodos que serão usados como middlewares/handlers
    this.create = this.create.bind(this);
    this.findById = this.findById.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
    this.findByUserId = this.findByUserId.bind(this); // O ajuste para a rota problemática
    this.findAllOrders = this.findAllOrders.bind(this);
  }

  // [CREATE] - POST /orders
  async create(req, res) {
    try {
      const newOrder = await orderService.create(req.body);
      return res.status(201).json(newOrder);
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      // Tratar erros P2003 (Foreign Key)
      return res.status(500).json({ error: "Falha interna ao criar pedido." });
    }
  }

  // [READ ONE] - GET /orders/:id
  async findById(req, res) {
    const { id } = req.params;
    const currentUserId = req.userId; // ID do usuário logado
    const currentUserType = req.userType;

    try {
      const order = await orderService.findById(
        id,
        currentUserId,
        currentUserType
      );
      if (!order) {
        return res.status(404).json({ error: "Pedido não encontrado." });
      }
      return res.status(200).json(order);
    } catch (error) {
      // Captura o erro de segurança lançado pelo Service
      if (error.message.includes("Acesso negado")) {
        return res.status(403).json({ error: error.message });
      }
      console.error("Erro ao buscar pedido:", error);
      return res.status(500).json({ error: "Falha interna ao buscar pedido." });
    }
  }

  // [UPDATE STATUS] - PUT /orders/:id/status
  async updateStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    const currentUserType = req.userType;

    try {
      const updatedOrder = await orderService.updateStatus(
        id,
        status,
        currentUserType
      );
      return res.status(200).json(updatedOrder);
    } catch (error) {
      if (error.message.includes("Acesso negado")) {
        return res.status(403).json({ error: error.message });
      }
      console.error("Erro ao atualizar status:", error);
      return res
        .status(500)
        .json({ error: "Falha interna ao atualizar status." });
    }
  }

  // [READ ALL by User] - GET /users/:userId/orders
  async findByUserId(req, res) {
    const { userId } = req.params;
    const currentUserId = req.userId;
    const currentUserType = req.userType;

    try {
      const orders = await orderService.findByUserId(
        userId,
        currentUserId,
        currentUserType
      );
      return res.status(200).json(orders);
    } catch (error) {
      if (error.message.includes("Acesso negado")) {
        return res.status(403).json({ error: error.message });
      }
      console.error("Erro ao buscar histórico:", error);
      return res
        .status(500)
        .json({ error: "Falha interna ao buscar histórico." });
    }
  }
  async findAllOrders(req, res) {
    const currentUserType = req.userType;

    try {
      const orders = await orderService.findAllOrders(currentUserType);
      return res.status(200).json(orders);
    } catch (error) {
      if (error.message.includes("Acesso negado")) {
        return res.status(403).json({ error: error.message });
      }
      console.error("Erro ao buscar todos os pedidos:", error);
      return res
        .status(500)
        .json({ error: "Falha interna ao buscar pedidos." });
    }
  }
}

module.exports = new OrderController();
