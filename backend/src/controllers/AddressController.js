/**
 * @swagger
 * openapi: 3.0.0
 * info:
 *   title: API de Gerenciamento de Endereços
 *   description: Rotas para visualização, criação/atualização e exclusão de endereço de usuário.
 *   version: 1.0.0
 *
 * servers:
 *   - url: /api/v1
 *     description: Servidor Principal
 *
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Address:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID do endereço.
 *           readOnly: true
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID do usuário proprietário do endereço.
 *           readOnly: true
 *         street:
 *           type: string
 *           example: Rua das Flores
 *         number:
 *           type: string
 *           example: 123
 *         complement:
 *           type: string
 *           nullable: true
 *           example: Apt 101
 *         city:
 *           type: string
 *           example: São Paulo
 *         state:
 *           type: string
 *           example: SP
 *         zipCode:
 *           type: string
 *           example: 01000-000
 *       required:
 *         - street
 *         - number
 *         - city
 *         - state
 *         - zipCode
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Mensagem de erro
 *
 * tags:
 *   - name: Endereços
 *     description: Gerenciamento de endereços de usuários
 *
 * paths:
 *   /users/{userId}/address:
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário cujo endereço será acessado
 *
 *     get:
 *       summary: Buscar endereço de um usuário pelo seu ID
 *       tags:
 *         - Endereços
 *       security:
 *         - BearerAuth: []
 *       responses:
 *         '200':
 *           description: Endereço encontrado com sucesso.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Address'
 *         '401':
 *           description: Não autenticado
 *         '403':
 *           description: Acesso negado
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 *         '404':
 *           description: Endereço não encontrado
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 *         '500':
 *           description: Erro interno
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 *
 *     post:
 *       summary: Criar ou atualizar o endereço de um usuário (Upsert)
 *       tags:
 *         - Endereços
 *       security:
 *         - BearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Address'
 *       responses:
 *         '200':
 *           description: Endereço criado/atualizado com sucesso.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Address'
 *         '401':
 *           description: Não autenticado
 *         '403':
 *           description: Acesso negado
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 *         '500':
 *           description: Erro interno
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 *
 *     delete:
 *       summary: Excluir o endereço de um usuário
 *       tags:
 *         - Endereços
 *       security:
 *         - BearerAuth: []
 *       responses:
 *         '200':
 *           description: Endereço excluído com sucesso.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Address'
 *         '401':
 *           description: Não autenticado
 *         '403':
 *           description: Acesso negado
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 *         '404':
 *           description: Endereço não encontrado
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 *         '500':
 *           description: Erro interno
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 */
const addressService = require("../services/AddressService");
// Importar validation e schemas

class AddressController {
  // [READ ONE] - GET /users/:userId/address
  async findByUserId(req, res) {
    // O userId é o ID do usuário cujo endereço será buscado (pode ser diferente do logado)
    const { userId } = req.params;
    // currentUserId é o ID do usuário logado (req.userId do token)
    const currentUserId = req.userId;
    const currentUserType = req.userType;

    // REGRA DE SEGURANÇA: Usuário só busca o próprio endereço (a menos que seja ADMIN)
    if (currentUserType !== "ADMIN" && userId !== String(currentUserId)) {
      return res.status(403).json({
        error: "Acesso negado: Você só pode visualizar o seu próprio endereço.",
      });
    }

    try {
      const address = await addressService.findByUserId(userId);
      if (!address) {
        return res
          .status(404)
          .json({ error: "Endereço não encontrado para este usuário." });
      }
      return res.status(200).json(address);
    } catch (error) {
      console.error("Erro ao buscar endereço:", error);
      return res
        .status(500)
        .json({ error: "Falha interna ao buscar endereço." });
    }
  }

  // [CREATE/UPDATE - UPSERT] - POST/PUT /users/:userId/address
  async upsert(req, res) {
    const { userId } = req.params;
    const currentUserId = req.userId;
    const currentUserType = req.userType;
    const addressData = req.body;

    // REGRA DE SEGURANÇA: Usuário só altera o próprio endereço (a menos que seja ADMIN)
    if (currentUserType !== "ADMIN" && userId !== String(currentUserId)) {
      return res.status(403).json({
        error: "Acesso negado: Você só pode alterar o seu próprio endereço.",
      });
    }

    try {
      const result = await addressService.upsert(userId, addressData);
      // O upsert do Prisma retorna o resultado da operação (insert ou update)
      return res.status(200).json(result);
    } catch (error) {
      console.error("Erro ao salvar endereço:", error);
      return res
        .status(500)
        .json({ error: "Falha interna ao salvar endereço." });
    }
  }

  // [DELETE] - DELETE /users/:userId/address
  async delete(req, res) {
    const { userId } = req.params;
    const currentUserId = req.userId;
    const currentUserType = req.userType;

    // REGRA DE SEGURANÇA: Usuário só deleta o próprio endereço (a menos que seja ADMIN)
    if (currentUserType !== "ADMIN" && userId !== String(currentUserId)) {
      return res.status(403).json({
        error: "Acesso negado: Você só pode deletar o seu próprio endereço.",
      });
    }

    try {
      const result = await addressService.delete(userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Erro ao deletar endereço:", error);
      return res
        .status(500)
        .json({ error: "Falha interna ao deletar endereço." });
    }
  }
}
module.exports = new AddressController();
