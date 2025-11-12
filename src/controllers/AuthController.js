const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userRepository = require("../repository/UserRepository");
const JWT_SECRET = process.env.JWT_SECRET;

class AuthController {
  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios." });
    }

    try {
      // 1. Busca o usuário e seu hash
      const user = await userRepository.findByEmailWithPassword(email);

      if (!user) {
        return res.status(401).json({ error: "Credenciais inválidas." });
      }

      // 2. Compara a senha fornecida com o hash salvo
      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) {
        return res.status(401).json({ error: "Credenciais inválidas." });
      }

      // 3. Gera o Token (incluindo ID e userType/Role)
      const token = jwt.sign(
        { id: user.id, userType: user.userType },
        JWT_SECRET,
        { expiresIn: "1h" } // Token expira em 1 hora
      );

      // 4. Retorna o token para o cliente
      return res.json({
        token,
        user: { id: user.id, name: user.name, userType: user.userType },
      });
    } catch (error) {
      console.error("Erro no processo de login:", error);
      return res.status(500).json({ error: "Falha interna no servidor." });
    }
  }
}

module.exports = new AuthController();
