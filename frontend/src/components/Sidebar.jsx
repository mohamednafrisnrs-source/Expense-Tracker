import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Receipt, LineChart, Plus } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Expense Tracker</h2>
        <span className="subtitle">Track your daily spending easily</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          className={({isActive}) => isActive ? "nav-link active" : "nav-link"}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink 
          to="/expenses" 
          className={({isActive}) => isActive ? "nav-link active" : "nav-link"}
        >
          <Receipt size={20} />
          <span>Expenses</span>
        </NavLink>
        
        <NavLink 
          to="/reports" 
          className={({isActive}) => isActive ? "nav-link active" : "nav-link"}
        >
          <LineChart size={20} />
          <span>Reports</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button 
          className="btn btn-primary w-full" 
          onClick={() => navigate('/expenses/new')}
        >
          <Plus size={18} />
          <span>Quick Add</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
