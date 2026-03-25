// server/controllers/goal.controller.js
// ─────────────────────────────────────────────────────────────
// CRUD de metas de longo prazo (annual e life).
// Mesma lógica de segurança do task.controller:
// sempre filtra por userId do token JWT.
// ─────────────────────────────────────────────────────────────

const Goal = require('../models/Goal');

// ─────────────────────────────────────────────────────────────
// GET /goals
// ─────────────────────────────────────────────────────────────
/**
 * Retorna todas as metas do usuário logado.
 * Suporta filtro por tipo: ?type=annual ou ?type=life
 */
const getGoals = async (req, res) => {
  try {
    const filter = { userId: req.user.id };

    // Filtro opcional por tipo via query string
    if (req.query.type && ['annual', 'life'].includes(req.query.type)) {
      filter.type = req.query.type;
    }

    const goals = await Goal.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: goals.length,
      data: goals,
    });

  } catch (error) {
    console.error('Erro no getGoals:', error);
    return res.status(500).json({ success: false, message: 'Erro ao buscar metas.' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /goals
// ─────────────────────────────────────────────────────────────
/**
 * Cria uma nova meta.
 */
const createGoal = async (req, res) => {
  try {
    const { title, type } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'O título da meta é obrigatório.',
      });
    }

    const goal = await Goal.create({
      title: title.trim(),
      type: type || 'annual',
      userId: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: 'Meta criada com sucesso!',
      data: goal,
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }

    console.error('Erro no createGoal:', error);
    return res.status(500).json({ success: false, message: 'Erro ao criar meta.' });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /goals/:id
// ─────────────────────────────────────────────────────────────
/**
 * Atualiza uma meta existente.
 */
const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;

    const goal = await Goal.findOne({ _id: id, userId: req.user.id });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Meta não encontrada.',
      });
    }

    const allowedUpdates = ['title', 'type', 'status'];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        goal[field] = req.body[field];
      }
    });

    await goal.save();

    return res.status(200).json({
      success: true,
      message: 'Meta atualizada!',
      data: goal,
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }

    console.error('Erro no updateGoal:', error);
    return res.status(500).json({ success: false, message: 'Erro ao atualizar meta.' });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /goals/:id
// ─────────────────────────────────────────────────────────────
/**
 * Remove uma meta do banco.
 */
const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;

    const goal = await Goal.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Meta não encontrada.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Meta removida com sucesso!',
    });

  } catch (error) {
    console.error('Erro no deleteGoal:', error);
    return res.status(500).json({ success: false, message: 'Erro ao remover meta.' });
  }
};

module.exports = { getGoals, createGoal, updateGoal, deleteGoal };
