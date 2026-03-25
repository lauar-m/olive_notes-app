// server/controllers/task.controller.js
// ─────────────────────────────────────────────────────────────
// CRUD completo de tarefas (Tarefas).
// IMPORTANTE: req.user.id vem do middleware JWT — garante que
// cada usuário só manipula suas próprias tarefas.
// ─────────────────────────────────────────────────────────────

const Task = require("../models/Task");

// ─────────────────────────────────────────────────────────────
// GET /tasks
// ─────────────────────────────────────────────────────────────
/**
 * Retorna todas as tarefas do usuário logado.
 * Suporta filtro opcional por status: ?status=pending ou ?status=done
 */
const getTasks = async (req, res) => {
  try {
    // Monta o filtro base — sempre filtra pelo usuário logado
    const filter = { userId: req.user.id };

    // Filtro opcional por status via query string (?status=pending)
    if (req.query.status && ["pending", "done"].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    // Busca e ordena por data de criação (mais recentes primeiro)
    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error("Erro no getTasks:", error);
    return res
      .status(500)
      .json({ success: false, message: "Erro ao buscar tarefas." });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /tasks
// ─────────────────────────────────────────────────────────────
/**
 * Cria uma nova tarefa para o usuário logado.
 */
const createTask = async (req, res) => {
  try {
    const { title, description, category, color } = req.body;

    // Validação do campo obrigatório
    if (!title || title.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "O título da tarefa é obrigatório.",
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || "",
      category: category || "day",
      color: color || "#E8C07D",
      userId: req.user.id, // vem do token JWT
    });

    return res.status(201).json({
      success: true,
      message: "Tarefa criada com sucesso!",
      data: task,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ success: false, message: messages.join(". ") });
    }

    console.error("Erro no createTask:", error);
    return res
      .status(500)
      .json({ success: false, message: "Erro ao criar tarefa." });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /tasks/:id
// ─────────────────────────────────────────────────────────────
/**
 * Atualiza uma tarefa existente.
 * Verifica se a tarefa pertence ao usuário antes de atualizar.
 */
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Busca a tarefa garantindo que pertence ao usuário logado
    const task = await Task.findOne({ _id: id, userId: req.user.id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Tarefa não encontrada.",
      });
    }

    // Campos que podem ser atualizados (whitelist — evita mass assignment)
    const allowedUpdates = [
      "title",
      "description",
      "category",
      "color",
      "status",
    ];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    // Salva as alterações (dispara as validações do schema)
    await task.save();

    return res.status(200).json({
      success: true,
      message: "Tarefa atualizada!",
      data: task,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ success: false, message: messages.join(". ") });
    }

    console.error("Erro no updateTask:", error);
    return res
      .status(500)
      .json({ success: false, message: "Erro ao atualizar tarefa." });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /tasks/:id
// ─────────────────────────────────────────────────────────────
/**
 * Remove uma tarefa do banco.
 * Verifica a propriedade antes de deletar (segurança).
 */
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // findOneAndDelete: busca pelo id E pelo userId em uma só operação
    const task = await Task.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Tarefa não encontrada.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tarefa removida com sucesso!",
    });
  } catch (error) {
    console.error("Erro no deleteTask:", error);
    return res
      .status(500)
      .json({ success: false, message: "Erro ao remover tarefa." });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
