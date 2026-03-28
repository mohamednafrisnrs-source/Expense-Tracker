const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/expensesController');
const auth    = require('../middleware/auth');

// Apply auth middleware to all routes in this router
router.use(auth);

// Summary routes MUST be declared before /:id to avoid "summary" being treated as an ID
router.get('/summary/monthly',   ctrl.getMonthlySummary);
router.get('/summary/category',  ctrl.getCategorySummary);
router.get('/summary/dashboard', ctrl.getDashboardSummary);

// CRUD routes
router.get('/',     ctrl.getAllExpenses);
router.get('/:id',  ctrl.getExpenseById);
router.post('/',    ctrl.createExpense);
router.put('/:id',  ctrl.updateExpense);
router.delete('/:id', ctrl.deleteExpense);

module.exports = router;
