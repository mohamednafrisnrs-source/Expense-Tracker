import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const ExpenseContext = createContext(null);

export function ExpenseProvider({ children }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const data = await api.getDashboardSummary();
      setDashboardData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const value = {
    dashboardData,
    loading,
    refreshDashboard: fetchDashboard,
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
}

export const useExpense = () => useContext(ExpenseContext);
