// backend/src/routes/orderRoutes.js

const express = require("express");
const router = express.Router();
const orderController = require("../controllers/OrderController");
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");

// --- CORREÇÕES AQUI: UNIFICANDO IMPORTS E ADICIONANDO VALIDAÇÃO ---
const validation = require("../middlewares/validationMiddleware");
const {
  orderCreateSchema,
  orderUpdateStatusSchema,
} = require("../schemas/validationSchemas");
// --- FIM CORREÇÕES ---

// [POST] Criação de Pedido - APLICA VALIDAÇÃO
router.post(
  "/",
  verifyToken,
  validation(orderCreateSchema), // <--- VALIDAÇÃO APLICADA AQUI
  orderController.create
);

// [GET] Busca por ID
//router.get("/:id", verifyToken, orderController.findById);
// ROTA DE CLIENTE/ADMIN BUSCANDO DETALHES POR ID (GET /orders/:id)
router.get(
  "/:id", // Rota com ID
  verifyToken,
  orderController.findById // <--- ESTA ROTA É CRÍTICA PARA A CONFIRMAÇÃO!
);
router.get(
  "/", // Corresponde ao GET /orders
  verifyToken,
  checkRole("ADMIN"),
  orderController.findAllOrders // 👈 Usa o novo método do Controller
);

// Rota de Status (Requer ADMIN) - VALIDAÇÃO APLICADA
router.put(
  "/:id/status",
  verifyToken,
  checkRole("ADMIN"),
  validation(orderUpdateStatusSchema),
  orderController.updateStatus
);

module.exports = router;
