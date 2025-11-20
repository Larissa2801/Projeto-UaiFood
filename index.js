const express = require("express");
const swaggerUi = require("swagger-ui-express");
const cors = require("cors");
require("./backend/src/utils/jsonSerializer");
require("dotenv").config();
require("dotenv").config({ path: "./backend/.env" });


// Middlewares
const validation = require("./backend/src/middlewares/validationMiddleware");
const { verifyToken } = require("./backend/src/middlewares/authMiddleware");
const { loginSchema } = require("./backend/src/schemas/validationSchemas");
// Controllers
const authController = require("./backend/src/controllers/AuthController");
const orderController = require("./backend/src/controllers/OrderController");

// Swagger Config  <-- VOCÊ ESQUECEU ESTA AQUI
const swaggerDocs = require("./backend/src/config/swaggerConfig");

// Rotas
const userRoutes = require("./backend/src/routes/userRoutes");
const categoryRoutes = require("./backend/src/routes/categoryRoutes");
const itemRoutes = require("./backend/src/routes/itemRoutes");
const orderRoutes = require("./backend/src/routes/orderRoutes");
const addressRoutes = require("./backend/src/routes/addressRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(cors());
app.use(express.json());

// Rotas
app.use("/users/:userId/orders", orderRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get("/", (req, res) => {
  res.send("Bem-vindo ao Laboratório de Rotas de DAW-II");
});

app.post("/login", validation(loginSchema), authController.login);

app.use("/users", userRoutes);
app.use("/users/:userId/address", addressRoutes);

app.use("/categories", categoryRoutes);
app.use("/items", itemRoutes);

app.use("/orders", orderRoutes);

// Rota de histórico (IMPORTANTE!)
app.get("/users/:userId/orders", verifyToken, orderController.findByUserId);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Documentação Swagger: http://localhost:${PORT}/api-docs`);
});
