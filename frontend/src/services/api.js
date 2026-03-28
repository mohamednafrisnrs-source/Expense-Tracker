const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth
  registerUser: async (name, email, password) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to register');
    }
    return res.json();
  },

  loginUser: async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to login');
    }
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to authenticate');
    return res.json();
  },

  // Expenses
  getExpenses: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/expenses${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch expenses');
    return res.json();
  },

  getExpenseById: async (id) => {
    const res = await fetch(`${BASE_URL}/expenses/${id}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch expense');
    return res.json();
  },

  createExpense: async (data) => {
    const res = await fetch(`${BASE_URL}/expenses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create expense');
    }
    return res.json();
  },

  updateExpense: async (id, data) => {
    const res = await fetch(`${BASE_URL}/expenses/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update expense');
    }
    return res.json();
  },

  deleteExpense: async (id) => {
    const res = await fetch(`${BASE_URL}/expenses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete expense');
    return res.json();
  },

  // Summaries
  getMonthlySummary: async () => {
    const res = await fetch(`${BASE_URL}/expenses/summary/monthly`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch monthly summary');
    return res.json();
  },

  getCategorySummary: async () => {
    const res = await fetch(`${BASE_URL}/expenses/summary/category`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch category summary');
    return res.json();
  },

  getDashboardSummary: async () => {
    const res = await fetch(`${BASE_URL}/expenses/summary/dashboard`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard summary');
    return res.json();
  }
};

export const CATEGORIES = [
  'Food & Dining', 'Transport', 'Housing', 'Essentials', 'Shopping',
  'Leisure', 'Studies', 'Healthcare', 'Entertainment', 'Other'
];
