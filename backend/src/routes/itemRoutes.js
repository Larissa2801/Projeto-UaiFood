// backend/src/routes/itemRoutes.js
const express = require("express");
const router = express.Router();
const itemController = require("../controllers/ItemController");
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");

// ⚠️ MOCK DE DADOS (PARA SER USADO TEMPORARIAMENTE)
const PRODUCTS_MOCK = [
  {
    id: "prod_1",
    name: "Mega Bacon Burger",
    description:
      "Hambúrguer de 200g, queijo cheddar, bacon crocante, alface e molho da casa.",
    price: 35.9,
  },
  {
    id: "prod_2",
    name: "Batata Frita Rustica",
    description: "Porção de batatas rústicas com tempero especial.",
    price: 15.5,
  },
  {
    id: "prod_3",
    name: "Coca-Cola Lata",
    description: "350ml, bem gelada.",
    price: 7.0,
  },
];

// Rotas de Modificação (Apenas ADMIN)
router.post("/", verifyToken, checkRole("ADMIN"), itemController.create);
router.put("/:id", verifyToken, checkRole("ADMIN"), itemController.update);
router.delete("/:id", verifyToken, checkRole("ADMIN"), itemController.delete);

// ROTA DE LEITURA DO CATÁLOGO (GET /)
router.get("/", itemController.findAll);

router.get("/:id", itemController.findById);

module.exports = router;
