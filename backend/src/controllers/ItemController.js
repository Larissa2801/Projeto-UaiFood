/**
 * @swagger
 * components:
 *   schemas:
 *     ItemCreate:
 *       type: object
 *       required:
 *         - description
 *         - unitPrice
 *         - categoryId
 *       properties:
 *         description:
 *           type: string
 *           example: Mega Burger de Picanha
 *         unitPrice:
 *           type: number
 *           format: float
 *           example: 35.90
 *         categoryId:
 *           type: string
 *           example: "1"
 *
 *     ItemResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         description:
 *           type: string
 *         unitPrice:
 *           type: number
 *           format: float
 *         category:
 *           $ref: '#/components/schemas/CategoryResponse'
 */

/**
 * @swagger
 * tags:
 *   - name: Catálogo - Itens
 *     description: Gerenciamento de itens (Produtos)
 */

/**
 * @swagger
 * /items:
 *   post:
 *     summary: Cria um novo item/produto (ADMIN)
 *     tags:
 *       - Catálogo - Itens
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ItemCreate'
 *     responses:
 *       201:
 *         description: Item criado com sucesso.
 *
 *   get:
 *     summary: Lista todos os itens (Cardápio)
 *     tags:
 *       - Catálogo - Itens
 *     responses:
 *       200:
 *         description: Lista de itens.
 *
 * /items/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       schema:
 *         type: string
 *       required: true
 *       description: ID do item
 *
 *   put:
 *     summary: Atualiza um item pelo ID (ADMIN)
 *     tags:
 *       - Catálogo - Itens
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ItemCreate'
 *     responses:
 *       200:
 *         description: Item atualizado.
 *
 *   delete:
 *     summary: Deleta um item pelo ID (ADMIN)
 *     tags:
 *       - Catálogo - Itens
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Item deletado.
 */
const itemService = require("../services/ItemService");

class ItemController {
  // [CREATE] - POST /items
  async create(req, res) {
    try {
      const newItem = await itemService.create(req.body);
      return res.status(201).json(newItem);
    } catch (error) {
      console.error("Erro ao criar item:", error);
      // TRATAMENTO DE ERRO: P2003 (Foreign Key - categoryId não existe)
      return res.status(500).json({ error: "Falha interna ao criar item." });
    }
  }

  // [READ ALL] - GET /items
  async findAll(req, res) {
    try {
      const items = await itemService.findAll();
      return res.status(200).json(items);
    } catch (error) {
      console.error("Erro ao buscar itens:", error);
      return res.status(500).json({ error: "Falha interna ao buscar itens." });
    }
  }

  // [READ ONE] - GET /items/:id
  async findById(req, res) {
    const { id } = req.params;
    try {
      const item = await itemService.findById(id);
      if (!item) {
        return res.status(404).json({ error: "Item não encontrado." });
      }
      return res.status(200).json(item);
    } catch (error) {
      console.error("Erro ao buscar item:", error);
      return res.status(500).json({ error: "Falha interna ao buscar item." });
    }
  }

  // [UPDATE] - PUT /items/:id
  async update(req, res) {
    const { id } = req.params;
    const userData = req.body;
    try {
      const updatedItem = await itemService.update(id, userData);
      return res.status(200).json(updatedItem);
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      return res
        .status(500)
        .json({ error: "Falha interna ao atualizar item. O ID existe?" });
    }
  }

  // [DELETE] - DELETE /items/:id
  async delete(req, res) {
    const { id } = req.params;
    try {
      const deletedItem = await itemService.delete(id);
      return res.status(200).json(deletedItem);
    } catch (error) {
      console.error("Erro ao deletar item:", error);
      return res
        .status(500)
        .json({ error: "Falha interna ao deletar item. O ID existe?" });
    }
  }
}

module.exports = new ItemController();
