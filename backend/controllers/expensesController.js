const db = require('../database');

const VALID_CATEGORIES = [
  'Food & Dining', 'Transport', 'Housing', 'Essentials', 'Shopping',
  'Leisure', 'Studies', 'Healthcare', 'Entertainment', 'Other'
];

// ─── Validation Helper ─────────────────────────────────────────────────────────
function validateExpenseBody(body) {
  const { title, amount, category, date } = body;
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return 'Title is required and must be a non-empty string.';
  }
  if (amount === undefined || amount === null || typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    return 'Amount is required and must be a positive number.';
  }
  if (!category || !VALID_CATEGORIES.includes(category)) {
    return `Category must be one of: ${VALID_CATEGORIES.join(', ')}.`;
  }
  if (!date || isNaN(Date.parse(date))) {
    return 'Date is required and must be a valid date string (YYYY-MM-DD).';
  }
  return null; // no error
}

// ─── GET /api/expenses ─────────────────────────────────────────────────────────
function getAllExpenses(req, res, next) {
  try {
    const { search, category, month } = req.query;
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    let conditions = [];
    let params     = [];

    if (search) {
      conditions.push("title LIKE ?");
      params.push(`%${search}%`);
    }
    if (category) {
      conditions.push("category = ?");
      params.push(category);
    }
    if (month) {
      // month format: YYYY-MM
      conditions.push("strftime('%Y-%m', date) = ?");
      params.push(month);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const totalRow = db.prepare(`SELECT COUNT(*) as count FROM expenses ${whereClause}`).get(...params);
    const total    = totalRow.count;
    const totalPages = Math.ceil(total / limit);

    const data = db.prepare(`
      SELECT * FROM expenses ${whereClause}
      ORDER BY date DESC, id DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    res.json({ data, total, page, totalPages });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/expenses/:id ─────────────────────────────────────────────────────
function getExpenseById(req, res, next) {
  try {
    const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(expense);
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/expenses ────────────────────────────────────────────────────────
function createExpense(req, res, next) {
  try {
    const validationError = validateExpenseBody(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { title, amount, category, date, note = null } = req.body;

    const result = db.prepare(`
      INSERT INTO expenses (title, amount, category, date, note)
      VALUES (?, ?, ?, ?, ?)
    `).run(title.trim(), amount, category, date, note);

    const created = db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

// ─── PUT /api/expenses/:id ─────────────────────────────────────────────────────
function updateExpense(req, res, next) {
  try {
    const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const validationError = validateExpenseBody(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { title, amount, category, date, note = null } = req.body;

    db.prepare(`
      UPDATE expenses
      SET title = ?, amount = ?, category = ?, date = ?, note = ?
      WHERE id = ?
    `).run(title.trim(), amount, category, date, note, req.params.id);

    const updated = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /api/expenses/:id ──────────────────────────────────────────────────
function deleteExpense(req, res, next) {
  try {
    const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/expenses/summary/monthly ────────────────────────────────────────
function getMonthlySummary(req, res, next) {
  try {
    // Build a list of the last 12 months (including current)
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yyyy = d.getFullYear();
      const mm   = String(d.getMonth() + 1).padStart(2, '0');
      months.push(`${yyyy}-${mm}`);
    }

    const rows = db.prepare(`
      SELECT strftime('%Y-%m', date) AS month,
             SUM(amount)            AS total,
             COUNT(*)               AS count
      FROM expenses
      WHERE strftime('%Y-%m', date) >= ?
      GROUP BY month
      ORDER BY month ASC
    `).all(months[0]);

    // Merge with the full 12-month skeleton so months with no data appear as 0
    const rowMap = {};
    for (const r of rows) rowMap[r.month] = r;

    const data = months.map((m) => ({
      month: m,
      total: rowMap[m] ? parseFloat(rowMap[m].total.toFixed(2)) : 0,
      count: rowMap[m] ? rowMap[m].count : 0,
    }));

    res.json({ data });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/expenses/summary/category ───────────────────────────────────────
function getCategorySummary(req, res, next) {
  try {
    const rows = db.prepare(`
      SELECT category,
             SUM(amount) AS total,
             COUNT(*)    AS count
      FROM expenses
      GROUP BY category
      ORDER BY total DESC
    `).all();

    const grandTotal = rows.reduce((sum, r) => sum + r.total, 0);

    const data = rows.map((r) => ({
      category:   r.category,
      total:      parseFloat(r.total.toFixed(2)),
      count:      r.count,
      percentage: grandTotal > 0
        ? parseFloat(((r.total / grandTotal) * 100).toFixed(1))
        : 0,
    }));

    res.json({ data, grandTotal: parseFloat(grandTotal.toFixed(2)) });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/expenses/summary/dashboard ──────────────────────────────────────
function getDashboardSummary(req, res, next) {
  try {
    const now       = new Date();
    const yyyy      = now.getFullYear();
    const mm        = String(now.getMonth() + 1).padStart(2, '0');
    const thisMonth = `${yyyy}-${mm}`;

    // Today at midnight => start of current week (Monday-based)
    const dayOfWeek  = now.getDay() === 0 ? 7 : now.getDay(); // 1=Mon … 7=Sun
    const monday     = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    const lastMonday = new Date(monday);
    lastMonday.setDate(monday.getDate() - 7);

    const toISO = (d) => d.toISOString().split('T')[0];

    // Total of ALL expenses
    const totalRow = db.prepare('SELECT SUM(amount) AS total FROM expenses').get();
    const totalExpenses = parseFloat((totalRow.total || 0).toFixed(2));

    // Total for current calendar month
    const thisMonthRow = db.prepare(`
      SELECT SUM(amount) AS total FROM expenses
      WHERE strftime('%Y-%m', date) = ?
    `).get(thisMonth);
    const thisMonthTotal = parseFloat((thisMonthRow.total || 0).toFixed(2));

    // This week total (Mon–today)
    const thisWeekRow = db.prepare(`
      SELECT SUM(amount) AS total FROM expenses
      WHERE date >= ? AND date <= ?
    `).get(toISO(monday), toISO(now));
    const thisWeekTotal = parseFloat((thisWeekRow.total || 0).toFixed(2));

    // Last week total
    const lastWeekEnd  = new Date(monday);
    lastWeekEnd.setDate(monday.getDate() - 1);
    const lastWeekRow = db.prepare(`
      SELECT SUM(amount) AS total FROM expenses
      WHERE date >= ? AND date <= ?
    `).get(toISO(lastMonday), toISO(lastWeekEnd));
    const lastWeekTotal = parseFloat((lastWeekRow.total || 0).toFixed(2));

    // Weekly change percent
    let weeklyChangePercent = 0;
    if (lastWeekTotal > 0) {
      weeklyChangePercent = parseFloat(
        (((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100).toFixed(1)
      );
    }

    // Highest spending category
    const catRow = db.prepare(`
      SELECT category, SUM(amount) AS total FROM expenses
      GROUP BY category ORDER BY total DESC LIMIT 1
    `).get();

    const grandTotalRow = db.prepare('SELECT SUM(amount) AS total FROM expenses').get();
    const grandTotal    = grandTotalRow.total || 0;

    const highestCategory = catRow
      ? {
          name: catRow.category,
          percentage: parseFloat(((catRow.total / grandTotal) * 100).toFixed(1)),
        }
      : null;

    // Total records
    const totalRecords = db.prepare('SELECT COUNT(*) AS count FROM expenses').get().count;

    // 5 most recent expenses
    const recentExpenses = db.prepare(`
      SELECT * FROM expenses ORDER BY date DESC, id DESC LIMIT 5
    `).all();

    res.json({
      totalExpenses,
      thisMonthTotal,
      lastWeekTotal,
      weeklyChangePercent,
      highestCategory,
      totalRecords,
      recentExpenses,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getMonthlySummary,
  getCategorySummary,
  getDashboardSummary,
};
