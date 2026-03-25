// server/models/Goal.js
// ─────────────────────────────────────────────────────────────
// Schema de metas de longo prazo. Suporta dois tipos:
// "annual" (metas do ano) e "life" (metas de vida).
// ─────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    // Título/descrição da meta
    title: {
      type: String,
      required: [true, 'O título da meta é obrigatório'],
      trim: true,
      maxlength: [200, 'Título deve ter no máximo 200 caracteres'],
    },

    // Tipo da meta: anual ou de vida
    type: {
      type: String,
      enum: {
        values: ['annual', 'life'],
        message: 'Tipo deve ser: annual ou life',
      },
      default: 'annual',
    },

    // Status da meta
    status: {
      type: String,
      enum: {
        values: ['pending', 'done'],
        message: 'Status deve ser: pending ou done',
      },
      default: 'pending',
    },

    // Referência ao usuário dono desta meta
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índice para buscar metas por usuário rapidamente
goalSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Goal', goalSchema);
