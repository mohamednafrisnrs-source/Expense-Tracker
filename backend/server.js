const express        = require('express');
const cors           = require('cors');
const expenseRoutes  = require('./routes/expenses');

// Initialize the database (creates tables + seeds data on first run)
require('./database');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://expense-tracker-rosy.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/expenses', expenseRoutes);

// ─── 404 catch-all for unknown routes ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ─── Global error handler ──────────────────────────────────────────────────────
// Must have 4 parameters for Express to treat it as an error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ─── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Expense Tracker API running on http://localhost:${PORT}\n`);
});
