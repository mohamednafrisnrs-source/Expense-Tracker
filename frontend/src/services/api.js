const API_BASE = 'http://localhost:3000/api';

export const api = {
  // Expenses
  getExpenses: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/expenses${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch expenses');
    return res.json();
  },

  getExpenseById: async (id) => {
    const res = await fetch(`${API_BASE}/expenses/${id}`);
    if (!res.ok) throw new Error('Failed to fetch expense');
    return res.json();
  },

  createExpense: async (data) => {
    const res = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create expense');
    }
    return res.json();
  },

  updateExpense: async (id, data) => {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update expense');
    }
    return res.json();
  },

  deleteExpense: async (id) => {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete expense');
    return res.json();
  },

  // Summaries
  getMonthlySummary: async () => {
    const res = await fetch(`${API_BASE}/expenses/summary/monthly`);
    if (!res.ok) throw new Error('Failed to fetch monthly summary');
    return res.json();
  },

  getCategorySummary: async () => {
    const res = await fetch(`${API_BASE}/expenses/summary/category`);
    if (!res.ok) throw new Error('Failed to fetch category summary');
    return res.json();
  },

  getDashboardSummary: async () => {
    const res = await fetch(`${API_BASE}/expenses/summary/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch dashboard summary');
    return res.json();
  }
};

export const CATEGORIES = [
  'Food & Dining', 'Transport', 'Housing', 'Essentials', 'Shopping',
  'Leisure', 'Studies', 'Healthcare', 'Entertainment', 'Other'
];
