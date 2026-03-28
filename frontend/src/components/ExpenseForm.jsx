import { useState, useEffect } from 'react';
import { api, CATEGORIES } from '../services/api';
import { useExpense } from '../contexts/ExpenseContext';
import { X } from 'lucide-react';

export default function ExpenseForm({ isOpen, onClose, expenseToEdit, onSuccess }) {
  const { refreshDashboard } = useExpense();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: CATEGORIES[0],
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  useEffect(() => {
    if (expenseToEdit) {
      setFormData({
        title: expenseToEdit.title,
        amount: expenseToEdit.amount,
        category: expenseToEdit.category,
        date: expenseToEdit.date,
        note: expenseToEdit.note || ''
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        category: CATEGORIES[0],
        date: new Date().toISOString().split('T')[0],
        note: ''
      });
    }
    setError(null);
  }, [expenseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = { ...formData, amount: parseFloat(formData.amount) };
      
      if (expenseToEdit) {
        await api.updateExpense(expenseToEdit.id, payload);
      } else {
        await api.createExpense(payload);
      }
      
      refreshDashboard();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{expenseToEdit ? 'Edit Expense' : 'Add Expense'}</h2>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="text-danger mb-4 text-sm">{error}</div>}
            
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                name="title"
                required
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                placeholder="What did you spend on?"
              />
            </div>

            <div className="flex gap-4">
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Amount (Rs.)</label>
                <input
                  type="number"
                  name="amount"
                  required
                  min="0.01"
                  step="0.01"
                  className="form-control"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Date</label>
                <input
                  type="date"
                  name="date"
                  required
                  className="form-control"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                name="category"
                required
                className="form-control"
                value={formData.category}
                onChange={handleChange}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group mb-0">
              <label className="form-label">Note (Optional)</label>
              <textarea
                name="note"
                className="form-control"
                rows="2"
                value={formData.note}
                onChange={handleChange}
                placeholder="Additional details..."
              ></textarea>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
