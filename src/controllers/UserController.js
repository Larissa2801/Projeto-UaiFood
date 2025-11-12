/**
 * @swagger
 * components:
 *   schemas:
 *     UserCreate:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *         - phone
 *       properties:
 *         email:
 *           type: string
 *           description: Endereço de e-mail único do usuário (usado para login).
 *           example: cliente_novo@email.com
 *         password:
 *           type: string
 *           description: Senha para login (será hasheada).
 *           example: senhaSegura123
 *         name:
 *           type: string
 *           description: Nome completo do usuário.
 *           example: João Silva
 *         phone:
 *           type: string
 *           description: Telefone de contato.
 *           example: 5534988887777
 *         userType:
 *           type: string
 *           description: Tipo de perfil (CLIENT ou ADMIN). Padrão é CLIENT.
 *           enum: [CLIENT, ADMIN]
 *           example: CLIENT
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
 *         phone:
 *           type: string
 *         userType:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Cria um novo usuário (Cadastro/Registro)
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Dados inválidos ou e-mail já cadastrado.
 *       500:
 *         description: Falha interna ao criar usuário.
 *
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Usuários]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Não autenticado.
 *       403:
 *         description: Acesso proibido (Requer ADMIN).
 *
 * /users/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       schema:
 *         type: string
 *       required: true
 *       description: ID do usuário (BigInt)
 *
 *   get:
 *     summary: Busca um usuário pelo ID
 *     tags: [Usuários]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Usuário encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Não autenticado.
 *       404:
 *         description: Usuário não encontrado.
 *
 *   put:
 *     summary: Atualiza dados de um usuário pelo ID
 *     tags: [Usuários]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               userType:
 *                 type: string
 *                 enum: [CLIENT, ADMIN]
 *             example:
 *               name: Novo Nome
 *               phone: 5534990000000
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       404:
 *         description: Usuário não encontrado.
 *
 *   delete:
 *     summary: Deleta um usuário pelo ID (Requer ADMIN)
 *     tags: [Usuários]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *       401:
 *         description: Não autenticado.
 *       403:
 *         description: Acesso proibido (Requer ADMIN).
 *       404:
 *         description: Usuário não encontrado.
 */

const userRepository = require("../repository/UserRepository");

class UserController {
  // [CREATE] - POST /users
  async create(req, res) {
    const userData = req.body;
    try {
      const newUser = await userRepository.create(userData);
      return res.status(201).json(newUser);
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      return res.status(500).json({ error: "Falha interna ao criar usuário." });
    }
  }

  // [READ ALL] - GET /users
  async findAll(req, res) {
    try {
      const users = await userRepository.findAll();
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
      const user = await userRepository.findById(id);
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

  // [UPDATE] - PUT /users/:id
  async update(req, res) {
    const { id } = req.params;
    const userData = req.body;
    try {
      const updatedUser = await userRepository.update(id, userData);
      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      return res
        .status(500)
        .json({ error: "Falha interna ao atualizar usuário. O ID existe?" });
    }
  }

  // [DELETE] - DELETE /users/:id
  async delete(req, res) {
    const { id } = req.params;
    try {
      const deletedUser = await userRepository.delete(id);
      return res.status(200).json(deletedUser);
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      return res
        .status(500)
        .json({ error: "Falha interna ao deletar usuário. O ID existe?" });
    }
  }
}

module.exports = new UserController();
