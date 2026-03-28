Expense Tracker
A full-stack web application to help users record, manage, and monitor their daily expenses — built as a portfolio project by an undergraduate IT student.
Live Demo: expense-tracker-rosy.vercel.app

Previews:
**Dashboard**
<img width="1417" height="707" alt="Screenshot 2026-03-28 at 3 45 10 PM" src="https://github.com/user-attachments/assets/c3ce1f34-1476-4134-b84f-b224ff794ae2" />

**Expense section**
<img width="1417" height="707" alt="Screenshot 2026-03-28 at 3 46 09 PM" src="https://github.com/user-attachments/assets/3c380179-b04c-425e-bd92-6eecef5dbe65" />

**Report Section**
<img width="1416" height="708" alt="Screenshot 2026-03-28 at 3 47 20 PM" src="https://github.com/user-attachments/assets/5f0d4cf2-d83d-4222-87f0-769908a63314" />


**Features**

Dashboard — Visual overview with stat cards, bar chart, and donut chart
Add / Edit / Delete Expenses — Full CRUD functionality
Search & Filter — Filter by category, month, or keyword
Reports & Insights — Daily, Weekly, and Monthly spending trends
Download Summary — Export expenses as CSV
Responsive Design — Works on desktop and mobile browsers

**Tech Stack**
Frontend
TechnologyPurposeReact 18UI FrameworkViteBuild ToolReact Router v6Client-side RoutingRechartsCharts & GraphsPlain CSSStyling
Backend
TechnologyPurposeNode.js v22 LTSRuntimeExpress.jsREST API FrameworkSQLite (better-sqlite3)DatabaseCORSCross-Origin Requests
Deployment
ServicePurposeVercelFrontend HostingRailwayBackend HostingGitHubVersion Control

Getting Started
Prerequisites

Node.js v22 or newer
npm

Installation
1. Clone the repository
bashgit clone https://github.com/mohamednafrisnrs-source/Expense-Tracker.git
cd Expense-Tracker
2. Start the Backend
bashcd backend
npm install
npm run dev
Server runs at http://localhost:3000
3. Start the Frontend
bashcd frontend
npm install
npm run dev
App opens at http://localhost:5173

Project Structure
Expense-Tracker/
├── backend/
│   ├── controllers/
│   │   └── expensesController.js
│   ├── routes/
│   │   └── expenses.js
│   ├── data/
│   │   └── expenses.db
│   ├── database.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   └── Layout.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Expenses.jsx
│   │   │   ├── ExpenseForm.jsx
│   │   │   └── Reports.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vite.config.js
└── README.md

API Endpoints
MethodEndpointDescriptionGET/api/expensesGet all expenses (with filters)GET/api/expenses/:idGet single expensePOST/api/expensesCreate new expensePUT/api/expenses/:idUpdate expenseDELETE/api/expenses/:idDelete expenseGET/api/expenses/summary/dashboardDashboard statsGET/api/expenses/summary/monthlyMonthly totalsGET/api/expenses/summary/categoryCategory breakdown

Expense Categories

Food & Dining
Transport
Housing
Essentials
Shopping
Leisure
Studies
Healthcare
Entertainment
Other


Future Enhancements

 User authentication & login system
 Budget limit alerts
 Monthly PDF report generation
 Cloud database (PostgreSQL)
 Dark mode
 Mobile app (React Native)


Author
**Mohamed Nafris**

GitHub: **@mohamednafrisnrs-source**
LinkedIn: **Mohamed Nafris**


License
This project is licensed under the MIT License.

If you found this project helpful, please give it a star!
