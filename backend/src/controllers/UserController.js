/**
 * @swagger
 * components:
 *   schemas:
 *     UserCreate:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           example: João Silva
 *         email:
 *           type: string
 *           example: joao.silva@ifood.com
 *         password:
 *           type: string
 *           example: senhaSegura123
 *         userType:
 *           type: string
 *           enum: [user, admin]
 *           example: user
 *
 *     UserResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         userType:
 *           type: string
 *           enum: [user, admin]
 */

/**
 * @swagger
 * tags:
 *   - name: Usuários
 *     description: Gerenciamento de usuários
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Cria um novo usuário (Cadastro)
 *     tags:
 *       - Usuários
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso.
 *       500:
 *         description: Falha interna ao criar usuário.
 *
 *   get:
 *     summary: Lista todos os usuários
 *     tags:
 *       - Usuários
 *     responses:
 *       200:
 *         description: Lista de usuários.
 *       500:
 *         description: Falha interna ao buscar usuários.
 *
 * /users/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       schema:
 *         type: string
 *       required: true
 *       description: ID do usuário
 *
 *   get:
 *     summary: Busca um usuário pelo ID
 *     tags:
 *       - Usuários
 *     responses:
 *       200:
 *         description: Dados do usuário encontrado.
 *       404:
 *         description: Usuário não encontrado.
 *       500:
 *         description: Falha interna ao buscar usuário.
 *
 *   put:
 *     summary: Atualiza um usuário pelo ID
 *     tags:
 *       - Usuários
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso.
 *       403:
 *         description: Acesso negado.
 *       500:
 *         description: Falha interna ao atualizar usuário.
 *
 *   delete:
 *     summary: Deleta um usuário pelo ID
 *     tags:
 *       - Usuários
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso.
 *       403:
 *         description: Usuário não autorizado a deletar.
 *       500:
 *         description: Falha interna ao deletar usuário.
 */

const userService = require("../services/UserService");

class UserController {
  // [CREATE] - POST /users (Cadastro)
  async create(req, res) {
    try {
      const newUser = await userService.create(req.body);
      return res.status(201).json(newUser);
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      // Você pode adicionar tratamento para erro P2002 (e-mail duplicado) aqui
      return res.status(500).json({ error: "Falha interna ao criar usuário." });
    }
  }

  // [READ ALL] - GET /users
  async findAll(req, res) {
    try {
      const users = await userService.findAll();
      return res.status(200).json(users);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      return res
        .status(500)
        .json({ error: "Falha interna ao buscar usuários." });
    }
  }

  // [READ ONE] - GET /users/:id
  async findById(req, res) {
    const { id } = req.params;
    try {
      const user = await userService.findById(id);

      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado." });
      }
      return res.status(200).json(user);
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      return res
        .status(500)
        .json({ error: "Falha interna ao buscar usuário." });
    }
  }
  async update(req, res) {
    console.log("REQ.USER =>", req.user);

    const { id } = req.params;
    const userData = req.body;

    // Correto: vem do middleware verifyToken
    const currentUserId = req.user.id;
    const currentUserType = req.user.userType;

    try {
      const updatedUser = await userService.update(
        id,
        currentUserId,
        currentUserType,
        userData
      );

      return res.status(200).json(updatedUser);
    } catch (error) {
      if (
        error.message === "ADMIN_REQUIRED_TO_CHANGE_TYPE" ||
        error.message === "ACCESS_DENIED_SELF_UPDATE_ONLY"
      ) {
        return res.status(403).json({
          error:
            "Acesso negado: Você não tem permissão para realizar esta alteração.",
        });
      }

      console.error("Erro ao atualizar usuário:", error);
      return res
        .status(500)
        .json({ error: "Falha interna ao atualizar usuário." });
    }
  }

  // [DELETE] - DELETE /users/:id
  async delete(req, res) {
    const { id } = req.params;
    const currentUserType = req.userType;

    try {
      const deletedUser = await userService.delete(id, currentUserType);

      return res.status(200).json(deletedUser);
    } catch (error) {
      if (error.message === "Usuário não autorizado a deletar.") {
        return res.status(403).json({ error: error.message });
      }
      console.error("Erro ao deletar usuário:", error);
      return res
        .status(500)
        .json({ error: "Falha interna ao deletar usuário." });
    }
  }
}

// **A EXPORTAÇÃO CORRETA:** Exporta a instância da classe Controller
module.exports = new UserController();
