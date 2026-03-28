import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, TrendingDown, ArrowDownRight, ArrowUpRight, Utensils } from 'lucide-react';
import { getHeaders } from '../services/api';
import './Reports.css';

const Reports = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [view, setView] = useState('Monthly');
  const [topCategory, setTopCategory] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
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
      fetch('/api/expenses?limit=100000', { headers: getHeaders() }).then(handleResponse),
      fetch('/api/expenses/summary/dashboard', { headers: getHeaders() }).then(handleResponse)
    ])
      .then(([expRes, dash]) => {
        const allExpenses = expRes.data || [];
        
        // 1. Generate last 12 months array
        const last12Months = [];
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          last12Months.push({
            year: d.getFullYear(),
            month: d.getMonth(),
            name: d.toLocaleString('default', { month: 'short' }),
            fullLabel: d.toLocaleString('default', { month: 'long', year: 'numeric' }),
            calBadge: d.toLocaleString('default', { month: 'short' }).substring(0, 3),
            total: 0,
            count: 0
          });
        }

        // 2. Generate current week array (7 days, Mon-Sun)
        const currentWeekDays = [];
        const today = new Date();
        today.setHours(0,0,0,0);
        const day = today.getDay() === 0 ? 7 : today.getDay();
        const currentWeekStart = new Date(today);
        currentWeekStart.setDate(today.getDate() - day + 1); // Monday
        
        for (let i = 0; i < 7; i++) {
          const d = new Date(currentWeekStart);
          d.setDate(currentWeekStart.getDate() + i);
          
          const dayNameShort = d.toLocaleString('default', { weekday: 'short' });
          const monthNameShort = d.toLocaleString('default', { month: 'short' });
          const dom = d.getDate();
          
          currentWeekDays.push({
            start: d,
            isToday: d.getTime() === today.getTime(),
            name: `${dayNameShort} ${monthNameShort} ${dom}`,
            fullLabel: d.toLocaleString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
            calBadge: dom.toString(),
            total: 0,
            count: 0
          });
        }

        // 3. Populate data
        allExpenses.forEach(exp => {
          if (!exp.date) return;
          const expDate = new Date(exp.date);
          expDate.setHours(0,0,0,0);
          const time = expDate.getTime();
          
          // Match month
          const mMatch = last12Months.find(m => m.year === expDate.getFullYear() && m.month === expDate.getMonth());
          if (mMatch) { mMatch.total += exp.amount; mMatch.count++; }
          
          // Match week
          const wMatch = currentWeekDays.find(w => time === w.start.getTime());
          if (wMatch) { wMatch.total += exp.amount; wMatch.count++; }
        });

        setMonthlyData(last12Months);
        setWeeklyData(currentWeekDays);
        setTopCategory(dash.highestCategory);
        setStats(dash);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load reports data", err);
        setLoading(false);
      });
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch('/api/expenses?limit=100000', { headers: getHeaders() });
      if (res.status === 401) {
        navigate('/login');
        return;
      }
      const result = await res.json();
      const allExpenses = result.data || [];
      
      const headers = ['Title', 'Amount', 'Category', 'Date', 'Note'];
      const csvRows = [headers.join(',')];
      
      allExpenses.forEach(exp => {
        const title = `"${(exp.title || '').replace(/"/g, '""')}"`;
        const amount = exp.amount;
        const category = `"${(exp.category || '').replace(/"/g, '""')}"`;
        const date = `"${exp.date}"`;
        const note = exp.note ? `"${exp.note.replace(/"/g, '""')}"` : '""';
        csvRows.push([title, amount, category, date, note].join(','));
      });
      
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "expense-summary.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download CSV", err);
      alert("Failed to download the expenses summary");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="p-8">Loading reports...</div>;

  const CustomChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="text-muted text-sm">{label}</p>
          <p className="label font-semibold">Rs. {payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  const CustomXAxisTick = ({ x, y, payload }) => {
    const tOfDay = new Date();
    const isToday = payload.value === `${tOfDay.toLocaleString('default', { weekday: 'short' })} ${tOfDay.toLocaleString('default', { month: 'short' })} ${tOfDay.getDate()}`;
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={0} 
          y={0} 
          dy={16} 
          textAnchor="middle" 
          fill={isToday ? '#111111' : '#666666'} 
          fontWeight={isToday ? 'bold' : 'normal'} 
          fontSize={12}
        >
          {payload.value}
        </text>
      </g>
    );
  };

  const currentChartData = view === 'Monthly' ? monthlyData : weeklyData;
  const listData = [...currentChartData].reverse().filter(item => item.total > 0 || item.count > 0);
  const activeStyle = { backgroundColor: '#111', color: '#fff' };

  return (
    <div className="reports-page">
      <header className="header" style={{ marginBottom: "2rem" }}>
        <div>
          <h1 className="header-title">Spending Insights</h1>
          <p className="subtitle">Understand your habits and grow your savings.</p>
        </div>
        <button className="btn btn-primary" onClick={handleDownload} disabled={downloading}>
          <Download size={16} />
          <span>{downloading ? 'Downloading...' : 'Download Summary'}</span>
        </button>
      </header>

      <div className="card chart-card mb-6">
        <div className="chart-header flex justify-between items-center mb-4">
          <div>
            <h3>Spending Trend</h3>
            <p className="text-muted text-sm">{view === 'Monthly' ? 'Last 12 months of activity' : "Current week's activity"}</p>
          </div>
          <div className="chart-toggles">
            <button 
              className={`toggle-btn ${view === 'Monthly' ? 'active' : ''}`}
              style={view === 'Monthly' ? activeStyle : {}}
              onClick={() => setView('Monthly')}
            >Monthly</button>
            <button 
              className={`toggle-btn ${view === 'Weekly' ? 'active' : ''}`}
              style={view === 'Weekly' ? activeStyle : {}}
              onClick={() => setView('Weekly')}
            >Weekly</button>
          </div>
        </div>
        
        <div className="chart-container" style={{ height: 280, backgroundColor: '#dcdcdc', borderRadius: '12px', padding: '1rem' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentChartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cccccc" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={view === 'Weekly' ? <CustomXAxisTick /> : {fill: '#666', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12}} />
              <Tooltip cursor={{stroke: '#aaa', strokeWidth: 1}} content={<CustomChartTooltip />} />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#111111" 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: '#111' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="insights-grid mb-8">
        <div className="card insight-card dark-card">
          <div className="insight-icon"><TrendingDown size={24} /></div>
          <div className="insight-content">
            <h3>Efficiency Boost</h3>
            <p className="text-sm text-gray">
              Your spending is {stats?.weeklyChangePercent > 0 ? 'up' : 'down'} {Math.abs(stats?.weeklyChangePercent || 0)}% from last week!
            </p>
          </div>
        </div>

        <div className="card insight-card dark-card">
          <div className="insight-icon"><Utensils size={24} /></div>
          <div className="insight-content">
            <h3>Top Category</h3>
            <p className="text-sm text-gray">
              {topCategory?.name || 'N/A'} is your top expense category ({topCategory?.percentage || 0}%).
            </p>
          </div>
        </div>
      </div>

      <div className="month-details">
        <div className="flex justify-between items-center mb-4">
          <h3>{view === 'Monthly' ? 'Month-over-Month' : 'Current Week'} Details</h3>
          <span className="text-sm font-semibold cursor-pointer">View All</span>
        </div>
        
        <div className="months-list">
          {listData.map((item, index) => {
            const prevItem = listData[index + 1];
            const percentChange = prevItem && prevItem.total > 0
              ? (((item.total - prevItem.total) / prevItem.total) * 100).toFixed(1)
              : 0;
            const isUp = percentChange > 0;
              
            return (
              <div key={item.name} className="month-row card">
                <div className="month-info">
                  <div className="calendar-icon">
                    <div className="cal-top"></div>
                    <div className="cal-body">{item.calBadge}</div>
                  </div>
                  <div>
                    <h4 className="font-semibold">{item.fullLabel}</h4>
                    <p className="text-sm text-muted">{item.count} Transactions</p>
                  </div>
                </div>
                
                <div className="month-stats text-right">
                  <h4 className="font-semibold text-lg">Rs. {item.total.toLocaleString('en-IN', {minimumFractionDigits: 2})}</h4>
                  {index < listData.length - 1 && (
                    <p className={`text-sm flex items-center justify-end gap-1 ${isUp ? 'text-red' : 'text-green'}`}>
                      {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {Math.abs(percentChange)}%
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          {listData.length === 0 && (
            <div className="text-center p-8 text-muted">No details available for this period.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
