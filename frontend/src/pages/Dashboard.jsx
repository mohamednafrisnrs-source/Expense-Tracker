import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getHeaders } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, Calendar, Hash, PieChart as PieChartIcon } from 'lucide-react';
import './Dashboard.css';

const COLORS = ['#111111', '#555555', '#888888', '#bbbbbb', '#dddddd'];

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResponse = res => {
      if (res.status === 401) {
        navigate('/login');
        throw new Error('Unauthorized');
      }
      return res.json();
    };

    Promise.all([
      fetch('/api/expenses/summary/dashboard', { headers: getHeaders() }).then(handleResponse),
      fetch('/api/expenses/summary/monthly', { headers: getHeaders() }).then(handleResponse),
      fetch('/api/expenses/summary/category', { headers: getHeaders() }).then(handleResponse)
    ])
      .then(([dash, month, cat]) => {
        setDashboardData(dash);
        // Format month data for chart
        const formattedMonths = month.data.map(m => {
          const date = new Date(m.month + '-01');
          return {
            name: date.toLocaleString('default', { month: 'short' }),
            total: m.total
          };
        });
        setMonthlyData(formattedMonths);
        setCategoryData(cat.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load dashboard data", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8">Loading dashboard...</div>;
  if (!dashboardData) return <div className="p-8 text-red-500">Failed to load dashboard</div>;

  const {
    totalExpenses,
    thisMonthTotal,
    weeklyChangePercent,
    highestCategory,
    totalRecords,
    recentExpenses
  } = dashboardData;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="label">{`Rs. ${payload[0].value.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard">
      <header className="header">
        <div>
          <h1 className="header-title">Dashboard</h1>
          <p className="subtitle">Overview of your spending</p>
        </div>
      </header>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon"><span style={{ fontWeight: 700, fontSize: '0.85rem' }}>LKR</span></div>
          <div>
            <p className="stat-label">TOTAL EXPENSES</p>
            <h2 className="stat-value">Rs. {totalExpenses.toLocaleString('en-IN', {minimumFractionDigits: 2})}</h2>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon"><Calendar size={20} /></div>
          <div>
            <p className="stat-label">THIS MONTH'S SPENDING</p>
            <h2 className="stat-value">Rs. {thisMonthTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</h2>
            <p className={`stat-trend ${weeklyChangePercent > 0 ? 'text-red' : 'text-green'}`}>
              <TrendingUp size={14} /> 
              {Math.abs(weeklyChangePercent)}% from last week
            </p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon"><PieChartIcon size={20} /></div>
          <div>
            <p className="stat-label">HIGHEST CATEGORY</p>
            <h2 className="stat-value">{highestCategory ? highestCategory.name : 'N/A'}</h2>
            <p className="stat-trend text-muted">
              {highestCategory ? `${highestCategory.percentage}% of total expenses` : ''}
            </p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon"><Hash size={20} /></div>
          <div>
            <p className="stat-label">TOTAL RECORDS</p>
            <h2 className="stat-value">{totalRecords}</h2>
            <p className="stat-trend text-muted">Saved expense transactions</p>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="charts-grid">
        <div className="card chart-card">
          <div className="chart-header">
            <h3>Monthly Spending</h3>
            <p className="text-muted">Weekly comparisons analysis</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eeeeee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f0f0f0'}} content={<CustomTooltip />} />
                <Bar dataKey="total" fill="#111111" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-card">
          <div className="chart-header">
            <h3>Category Breakdown</h3>
          </div>
          <div className="chart-container donut-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="total"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-legend">
              {categoryData.slice(0, 4).map((entry, index) => (
                <div key={index} className="legend-item">
                  <div className="legend-color-box" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                  <span className="legend-name">{entry.category}</span>
                  <span className="legend-percent">{entry.percentage}%</span>
                </div>
              ))}
            </div>
            <div className="donut-center-text">
                <span className="donut-total-title">Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Expenses Table */}
      <div className="card table-card">
        <div className="table-header">
          <h3>Recent Expenses</h3>
          <Link to="/expenses" className="view-all-link">View All →</Link>
        </div>
        <div className="table-responsive">
          <table className="expenses-table">
            <thead>
              <tr>
                <th>CATEGORY</th>
                <th>ITEM</th>
                <th>DATE</th>
                <th className="text-right">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {recentExpenses.length > 0 ? (
                recentExpenses.map(expense => (
                  <tr key={expense.id}>
                    <td>
                      <div className="category-badge">
                        {expense.category}
                      </div>
                    </td>
                    <td className="font-medium">{expense.title}</td>
                    <td className="text-muted">{new Date(expense.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</td>
                    <td className="text-right font-semibold">
                      Rs. {expense.amount.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-muted p-4">No recent expenses found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
