// server/routes/auth.routes.js
// ─────────────────────────────────────────────────────────────
// Rotas públicas de autenticação (não precisam de JWT).
// Mantemos as rotas simples: apenas mapeiam URL → Controller.
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');

// POST /auth/register — Cadastro de novo usuário
router.post('/register', register);

// POST /auth/login — Login com email e senha
router.post('/login', login);

module.exports = router;
