import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ExpenseForm.css';

const CATEGORIES = [
  'Food & Dining', 'Transport', 'Housing', 'Essentials', 'Shopping',
  'Leisure', 'Studies', 'Healthcare', 'Entertainment', 'Other'
];

const ExpenseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing) {
      fetch(`/api/expenses/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch expense');
          return res.json();
        })
        .then(data => {
          setFormData({
            title: data.title,
            amount: data.amount,
            category: data.category,
            date: data.date,
            note: data.note || ''
          });
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    
    // Basic frontend validation
    if (!formData.title.trim()) return setError('Title is required');
    if (!formData.amount || Number(formData.amount) <= 0) return setError('Please enter a valid amount');
    if (!formData.category) return setError('Category is required');
    if (!formData.date) return setError('Date is required');

    const payload = {
      ...formData,
      amount: Number(formData.amount)
    };

    const url = isEditing ? `/api/expenses/${id}` : '/api/expenses';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        navigate('/expenses');
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="expense-form-page">
      <header className="header" style={{ marginBottom: "1rem" }}>
        <div>
          <h1 className="header-title">{isEditing ? 'Edit Expense' : 'Add New Expense'}</h1>
          <p className="subtitle">Record your spending to keep your mindful ledger balanced</p>
        </div>
      </header>

      <div className="card form-card">
        <form onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="title">Expense Title</label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              placeholder="e.g. Weekly Groceries" 
              value={formData.title}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="amount">Amount</label>
              <div className="input-group">
                <span className="input-prefix">Rs.</span>
                <input 
                  type="number" 
                  id="amount" 
                  name="amount" 
                  placeholder="0.00" 
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={handleChange}
                  className="form-control pl-8"
                />
              </div>
            </div>

            <div className="form-group flex-1">
              <label htmlFor="category">Category</label>
              <select 
                id="category" 
                name="category" 
                value={formData.category}
                onChange={handleChange}
                className="form-control"
              >
                <option value="" disabled>Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input 
              type="date" 
              id="date" 
              name="date" 
              value={formData.date}
              onChange={handleChange}
              className="form-control"
              style={{ width: "50%" }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="note">Note (Optional)</label>
            <textarea 
              id="note" 
              name="note" 
              placeholder="Add extra details about this purchase..." 
              value={formData.note}
              onChange={handleChange}
              className="form-control"
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-cancel" 
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
