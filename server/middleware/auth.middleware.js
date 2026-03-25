// server/middleware/auth.middleware.js
// ─────────────────────────────────────────────────────────────
// Middleware de autenticação JWT.
// Intercepta requisições antes de chegarem aos controllers.
// Se o token for inválido ou ausente, retorna 401 imediatamente.
// ─────────────────────────────────────────────────────────────

const jwt = require('jsonwebtoken');

/**
 * Middleware que verifica se o usuário está autenticado.
 *
 * Fluxo:
 * 1. Extrai o token do header "Authorization: Bearer <token>"
 * 2. Verifica se o token é válido e não expirou
 * 3. Adiciona os dados do usuário em req.user para uso nos controllers
 * 4. Chama next() para continuar para o controller
 */
const protect = (req, res, next) => {
  try {
    // 1. Pega o header Authorization
    const authHeader = req.headers.authorization;

    // Verifica se o header existe e começa com "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Acesso negado. Token não fornecido.',
      });
    }

    // 2. Extrai apenas o token (remove o prefixo "Bearer ")
    const token = authHeader.split(' ')[1];

    // 3. Verifica e decodifica o token usando o segredo do .env
    // jwt.verify lança exceção se o token for inválido ou expirado
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Adiciona os dados do usuário na requisição
    // Os controllers podem usar req.user.id para filtrar dados do usuário
    req.user = decoded;

    // 5. Passa para o próximo middleware/controller
    next();

  } catch (error) {
    // Token inválido, malformado ou expirado
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado. Faça login novamente.',
    });
  }
};

module.exports = { protect };
