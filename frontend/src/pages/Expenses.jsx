import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Edit2, Trash2, Filter, ChevronRight, ChevronLeft, Bell, HelpCircle, Utensils, Bus, Home, ShoppingCart, ShoppingBag, Coffee, BookOpen, HeartPulse, Film, MoreHorizontal } from 'lucide-react';
import './Expenses.css';

const CATEGORIES = [
  'Food & Dining', 'Transport', 'Housing', 'Essentials', 'Shopping',
  'Leisure', 'Studies', 'Healthcare', 'Entertainment', 'Other'
];

const getCategoryIcon = (category) => {
  switch(category) {
    case 'Food & Dining': return <Utensils size={18} />;
    case 'Transport': return <Bus size={18} />;
    case 'Housing': return <Home size={18} />;
    case 'Essentials': return <ShoppingCart size={18} />;
    case 'Shopping': return <ShoppingBag size={18} />;
    case 'Leisure': return <Coffee size={18} />;
    case 'Studies': return <BookOpen size={18} />;
    case 'Healthcare': return <HeartPulse size={18} />;
    case 'Entertainment': return <Film size={18} />;
    default: return <MoreHorizontal size={18} />;
  }
};

const Expenses = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters and Pagination
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [month, setMonth] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchExpenses = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (month) params.append('month', month);
    params.append('page', page);
    params.append('limit', 10);

    fetch(`/api/expenses?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setExpenses(data.data);
        setTotalPages(data.totalPages);
        setTotalRecords(data.total);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch expenses", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchExpenses();
  }, [category, month, page]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      fetchExpenses();
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchExpenses();
      } else {
        alert("Failed to delete expense");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="expenses-page">
      <header className="header" style={{ marginBottom: "1.5rem" }}>
        <h1 className="header-title">All Expenses</h1>
        <div className="header-actions">
          <button className="icon-btn"><Bell size={20} /></button>
          <button className="icon-btn"><HelpCircle size={20} /></button>
          <button className="btn btn-primary add-expense-btn" onClick={() => navigate('/expenses/new')}>Add Expense</button>
        </div>
      </header>

      <div className="card filters-card">
        <div className="search-box">
          <Search size={18} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="filters-group">
          <div className="filter-select">
            <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
              <option value="">Category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          
          <div className="filter-select">
            <input 
              type="month" 
              value={month} 
              onChange={(e) => { setMonth(e.target.value); setPage(1); }} 
              placeholder="Month"
            />
          </div>

          <button className="btn btn-clear" onClick={() => { setSearch(''); setCategory(''); setMonth(''); setPage(1); }}>
            <Filter size={16} /> Clear
          </button>
        </div>
      </div>

      <div className="card list-card">
        {loading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="expenses-table">
                <thead>
                  <tr>
                    <th>TRANSACTION</th>
                    <th className="hide-mobile">CATEGORY</th>
                    <th>AMOUNT</th>
                    <th className="hide-mobile">DATE</th>
                    <th className="text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(exp => (
                    <tr key={exp.id}>
                      <td className="font-medium">
                        <div className="transaction-cell">
                          <div className="transaction-icon text-muted">{getCategoryIcon(exp.category)}</div>
                          {exp.title}
                        </div>
                      </td>
                      <td className="hide-mobile">
                        <div className="category-badge">{exp.category}</div>
                      </td>
                      <td className="font-medium">
                        Rs. {exp.amount.toFixed(2)}
                      </td>
                      <td className="text-muted hide-mobile">
                        {new Date(exp.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
                      </td>
                      <td className="text-right">
                        <div className="action-buttons">
                          <button className="icon-btn" onClick={() => navigate(`/expenses/edit/${exp.id}`)}>
                            <Edit2 size={16} />
                          </button>
                          <button className="icon-btn text-red" onClick={() => handleDelete(exp.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center p-8 text-muted">No expenses found matching the criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <div className="pagination-info">
                Showing {expenses.length} of {totalRecords} expenses
              </div>
              <div className="pagination-controls">
                <button 
                  className="icon-btn" 
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  className="icon-btn" 
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Expenses;
