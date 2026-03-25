// server/routes/goal.routes.js
// ─────────────────────────────────────────────────────────────
// Rotas de metas — todas protegidas pelo middleware JWT.
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} = require('../controllers/goal.controller');

router.get('/', protect, getGoals);           // GET    /goals
router.post('/', protect, createGoal);        // POST   /goals
router.put('/:id', protect, updateGoal);     // PUT    /goals/:id
router.delete('/:id', protect, deleteGoal);  // DELETE /goals/:id

module.exports = router;
