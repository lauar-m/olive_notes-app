// server/controllers/auth.controller.js
// ─────────────────────────────────────────────────────────────
// Lógica de autenticação: cadastro e login.
// Aqui ficam as "regras de negócio" de auth, separadas das rotas.
// ─────────────────────────────────────────────────────────────

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Gera um JWT assinado com os dados do usuário.
 * @param {string} userId - ID do usuário no MongoDB
 * @returns {string} token JWT
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },                    // payload: dados que ficam dentro do token
    process.env.JWT_SECRET,            // segredo para assinar
    { expiresIn: process.env.JWT_EXPIRES_IN } // expiração (ex: "7d")
  );
};

// ─────────────────────────────────────────────────────────────
// POST /auth/register
// ─────────────────────────────────────────────────────────────
/**
 * Cadastra um novo usuário.
 * 1. Valida se email já existe
 * 2. Faz hash da senha com bcrypt
 * 3. Salva no banco
 * 4. Retorna token JWT
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validação básica de campos obrigatórios
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios.',
      });
    }

    // Verifica se já existe um usuário com esse email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Este email já está cadastrado.',
      });
    }

    // Hash da senha — bcrypt adiciona um "salt" automático (fator 12)
    // Fator 12 = boa segurança sem ser muito lento para o usuário
    const hashedPassword = await bcrypt.hash(password, 12);

    // Cria e salva o usuário no banco
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Gera o token JWT para o novo usuário
    const token = generateToken(user._id);

    // Retorna sucesso com token (sem expor a senha)
    return res.status(201).json({
      success: true,
      message: 'Cadastro realizado com sucesso!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    // Erro de validação do Mongoose (ex: email com formato inválido)
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }

    console.error('Erro no register:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor.',
    });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /auth/login
// ─────────────────────────────────────────────────────────────
/**
 * Autentica um usuário existente.
 * 1. Busca o usuário pelo email
 * 2. Compara a senha com o hash salvo (bcrypt.compare)
 * 3. Retorna token JWT
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validação básica
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios.',
      });
    }

    // Busca o usuário pelo email (case insensitive pelo lowercase no schema)
    const user = await User.findOne({ email: email.toLowerCase() });

    // Mensagem genérica — não revelamos se o email existe ou não (segurança)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos.',
      });
    }

    // Compara a senha digitada com o hash armazenado no banco
    // bcrypt.compare é assíncrono e timing-safe
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos.',
      });
    }

    // Gera o token JWT
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor.',
    });
  }
};

module.exports = { register, login };
