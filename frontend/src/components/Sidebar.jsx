import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Receipt, LineChart, Plus, Menu, X } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const closeSidebar = () => setIsMobileOpen(false);

  return (
    <>
      <button 
        className="mobile-menu-btn"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open Menu"
      >
        <Menu size={24} />
      </button>

      <div 
        className={`sidebar-overlay ${isMobileOpen ? 'active' : ''}`}
        onClick={closeSidebar}
      />

      <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="header-title-row">
            <div>
              <h2>Expense Tracker</h2>
              <span className="subtitle">Track your daily spending easily</span>
            </div>
            <button className="close-sidebar-btn" onClick={closeSidebar}>
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink 
            to="/dashboard" 
            className={({isActive}) => isActive ? "nav-link active" : "nav-link"}
            onClick={closeSidebar}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink 
            to="/expenses" 
            className={({isActive}) => isActive ? "nav-link active" : "nav-link"}
            onClick={closeSidebar}
          >
            <Receipt size={20} />
            <span>Expenses</span>
          </NavLink>
          
          <NavLink 
            to="/reports" 
            className={({isActive}) => isActive ? "nav-link active" : "nav-link"}
            onClick={closeSidebar}
          >
            <LineChart size={20} />
            <span>Reports</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="btn btn-primary w-full" 
            onClick={() => {
              navigate('/expenses/new');
              closeSidebar();
            }}
          >
            <Plus size={18} />
            <span>Quick Add</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
