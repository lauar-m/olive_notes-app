// server/models/User.js
// ─────────────────────────────────────────────────────────────
// Schema do usuário. Armazenamos apenas email e senha (hash).
// O Mongoose garante que o email seja único no banco.
// ─────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // Nome de exibição do usuário (opcional mas útil para a UI)
    name: {
      type: String,
      required: [true, 'O nome é obrigatório'],
      trim: true, // remove espaços extras nas pontas
      maxlength: [60, 'Nome deve ter no máximo 60 caracteres'],
    },

    // Email: identificador único do usuário
    email: {
      type: String,
      required: [true, 'O email é obrigatório'],
      unique: true,          // índice único no MongoDB
      lowercase: true,       // salva sempre em minúsculo
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Formato de email inválido',
      ],
    },

    // Senha: armazenada como hash bcrypt — NUNCA texto puro
    password: {
      type: String,
      required: [true, 'A senha é obrigatória'],
      minlength: [6, 'A senha deve ter no mínimo 6 caracteres'],
    },
  },
  {
    // timestamps: true cria automaticamente createdAt e updatedAt
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
