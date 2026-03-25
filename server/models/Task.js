// server/models/Task.js
// ─────────────────────────────────────────────────────────────
// Schema de tarefas (Tarefas). Cada tarefa pertence a um
// usuário via userId (referência ao model User).
// ─────────────────────────────────────────────────────────────

const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    // Título principal do post-it
    title: {
      type: String,
      required: [true, "O título é obrigatório"],
      trim: true,
      maxlength: [120, "Título deve ter no máximo 120 caracteres"],
    },

    // Descrição opcional — corpo do post-it
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Descrição deve ter no máximo 500 caracteres"],
      default: "",
    },

    // Categoria define em qual coluna o post-it aparece
    category: {
      type: String,
      enum: {
        values: ["day", "week", "month"],
        message: "Categoria deve ser: day, week ou month",
      },
      default: "day",
    },

    // Cor do post-it em hexadecimal (ex: "#E8C07D")
    color: {
      type: String,
      default: "#E8C07D", // mostarda — cor padrão do tema
    },

    // Status da tarefa
    status: {
      type: String,
      enum: {
        values: ["pending", "done"],
        message: "Status deve ser: pending ou done",
      },
      default: "pending",
    },

    // Referência ao usuário dono desta tarefa
    // Isso garante que um usuário só veja suas próprias tarefas
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // referência ao model User
      required: true,
    },
  },
  {
    timestamps: true, // cria createdAt e updatedAt automaticamente
  },
);

// Índice composto: otimiza buscas por userId + category (muito comuns)
taskSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model("Task", taskSchema);
