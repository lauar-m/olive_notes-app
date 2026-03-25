// server/routes/task.routes.js
// ─────────────────────────────────────────────────────────────
// Rotas de tarefas — todas protegidas pelo middleware JWT.
// O middleware "protect" é aplicado antes de cada controller.
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/task.controller');

// Todas as rotas abaixo exigem token JWT válido
router.get('/', protect, getTasks);       // GET    /tasks
router.post('/', protect, createTask);    // POST   /tasks
router.put('/:id', protect, updateTask); // PUT    /tasks/:id
router.delete('/:id', protect, deleteTask); // DELETE /tasks/:id

module.exports = router;
