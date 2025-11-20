/**
 * @swagger
 * components:
 *   schemas:
 *     CategoryCreate:
 *       type: object
 *       required:
 *         - description
 *       properties:
 *         description:
 *           type: string
 *           example: Lanches Artesanais
 *
 *     CategoryResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         description:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   - name: Catálogo - Categorias
 *     description: Gerenciamento de categorias (ADMIN)
 */

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Cria uma nova categoria (ADMIN)
 *     tags:
 *       - Catálogo - Categorias
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryCreate'
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryResponse'
 *       403:
 *         description: Acesso proibido.
 *
 *   get:
 *     summary: Lista todas as categorias
 *     tags:
 *       - Catálogo - Categorias
 *     responses:
 *       200:
 *         description: Lista de categorias.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CategoryResponse'
 */

/**
 * @swagger
 * /categories/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       schema:
 *         type: string
 *       required: true
 *       description: ID da categoria
 *
 *   put:
 *     summary: Atualiza uma categoria pelo ID (ADMIN)
 *     tags:
 *       - Catálogo - Categorias
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryCreate'
 *     responses:
 *       200:
 *         description: Categoria atualizada.
 *
 *   delete:
 *     summary: Deleta uma categoria pelo ID (ADMIN)
 *     tags:
 *       - Catálogo - Categorias
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Categoria deletada.
 */

const categoryService = require("../services/CategoryService");

class CategoryController {
  // [CREATE] - POST /categories
  async create(req, res) {
    try {
      const newCategory = await categoryService.create(req.body);
      return res.status(201).json(newCategory);
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      // TRATAMENTO DE ERRO: Por exemplo, falha de validação de FOREIGN KEY (P2003)
      return res
        .status(500)
        .json({ error: "Falha interna ao criar categoria." });
    }
  }

  // [READ ALL] - GET /categories
  async findAll(req, res) {
    try {
      const categories = await categoryService.findAll();
      return res.status(200).json(categories);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      return res
        .status(500)
        .json({ error: "Falha interna ao buscar categorias." });
    }
  }

  // [READ ONE] - GET /categories/:id
  async findById(req, res) {
    const { id } = req.params;
    try {
      const category = await categoryService.findById(id);
      if (!category) {
        return res.status(404).json({ error: "Categoria não encontrada." });
      }
      return res.status(200).json(category);
    } catch (error) {
      console.error("Erro ao buscar categoria:", error);
      return res
        .status(500)
        .json({ error: "Falha interna ao buscar categoria." });
    }
  }

  // [UPDATE] - PUT /categories/:id
  async update(req, res) {
    const { id } = req.params;
    const userData = req.body;
    try {
      const updatedCategory = await categoryService.update(id, userData);
      return res.status(200).json(updatedCategory);
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      return res
        .status(500)
        .json({ error: "Falha interna ao atualizar categoria. O ID existe?" });
    }
  }

  // [DELETE] - DELETE /categories/:id
  async delete(req, res) {
    const { id } = req.params;
    try {
      const deletedCategory = await categoryService.delete(id);
      return res.status(200).json(deletedCategory);
    } catch (error) {
      console.error("Erro ao deletar categoria:", error);
      return res
        .status(500)
        .json({ error: "Falha interna ao deletar categoria. O ID existe?" });
    }
  }
}

module.exports = new CategoryController();
