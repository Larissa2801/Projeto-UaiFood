// backend/src/middlewares/authMiddleware.js

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET; // Importa a chave secreta do .env

// =======================================================
// 1. Middleware de Autenticação (Verifica o Token)
// =======================================================

const verifyToken = (req, res, next) => {
  // 1. Tenta obter o token do cabeçalho 'Authorization'
  const authHeader = req.headers["authorization"];
  // Espera o formato: Bearer <token>
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    // Se o token não for encontrado, nega o acesso
    return res
      .status(401)
      .json({ error: "Acesso negado. Token não fornecido." });
  }

  try {
    // 2. Verifica e decodifica o token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 3. Anexa os dados do usuário (id e userType) à requisição
    // Esses dados vêm do payload que criamos no AuthController
    req.userId = decoded.id;
    req.userType = decoded.userType;

    // Continua para o próximo middleware ou controller
    next();
  } catch (error) {
    // Falha na verificação (token inválido, expirado, etc.)
    return res.status(403).json({ error: "Token inválido ou expirado." });
  }
};

// =======================================================
// 2. Middleware de Autorização (Verifica o Perfil)
// =======================================================

/**
 * Cria um middleware que verifica se o usuário tem o perfil (userType) necessário.
 * @param {string} expectedRole - O perfil necessário (ex: 'ADMIN', 'CLIENT').
 */
const checkRole = (expectedRole) => {
  return (req, res, next) => {
    // O req.userType já foi anexado pelo verifyToken (Passo 1)
    if (!req.userType) {
      // Caso raro onde verifyToken falhou em anexar o tipo de usuário
      return res
        .status(401)
        .json({
          error: "Autenticação incompleta. Tipo de usuário não definido.",
        });
    }

    if (req.userType !== expectedRole) {
      // Se o perfil do usuário não for o esperado (ex: CLIENT tentando acessar rota ADMIN)
      return res
        .status(403)
        .json({ error: `Acesso proibido. Requer o perfil: ${expectedRole}.` });
    }

    // Usuário tem o perfil correto, continua
    next();
  };
};

module.exports = {
  verifyToken,
  checkRole,
};
