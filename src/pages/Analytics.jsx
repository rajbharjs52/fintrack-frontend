import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/axios";
import { TrendingUp, TrendingDown, Wallet, Target, ChevronLeft, ChevronRight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer
} from "recharts";

const COLORS = ["#6366f1", "#f43f5e", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const Analytics = () => {
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [monthSummary, setMonthSummary] = useState(null);
  const [monthCategories, setMonthCategories] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, m] = await Promise.all([
          API.get("/analytics/summary"),
          API.get("/analytics/monthly"),
        ]);
        setSummary(s.data);
        setMonthly(m.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (monthly.length === 0) return;
    const monthKey = `${MONTHS[selectedMonth].slice(0, 3)} ${selectedYear}`;
    const found = monthly.find((m) => m.month === monthKey);
    if (found) {
      setMonthSummary({
        income: found.income || 0,
        expense: found.expense || 0,
        balance: (found.income || 0) - (found.expense || 0),
        savingsRate: found.income ? Math.round(((found.income - (found.expense || 0)) / found.income) * 100) : 0,
      });
    } else {
      setMonthSummary({ income: 0, expense: 0, balance: 0, savingsRate: 0 });
    }
  }, [selectedMonth, selectedYear, monthly]);

  useEffect(() => {
    const fetchMonthCategories = async () => {
      try {
        const startDate = new Date(selectedYear, selectedMonth, 1).toISOString();
        const endDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString();
        const res = await API.get(`/analytics/categories?startDate=${startDate}&endDate=${endDate}`);
        setMonthCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMonthCategories();
  }, [selectedMonth, selectedYear]);

  const yearOptions = [];
  for (let y = 2023; y <= now.getFullYear(); y++) yearOptions.push(y);

  const overallSavingsRate = summary?.totalIncome
    ? Math.round(((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100)
    : 0;

  const monthCards = [
    { label: "Income", value: `₹${(monthSummary?.income ?? 0).toLocaleString("en-IN")}`, color: "text-green-600", bg: "bg-green-50", icon: TrendingUp, iconColor: "text-green-600", sub: monthSummary?.income > 0 ? "Received this month" : "No income recorded" },
    { label: "Expenses", value: `₹${(monthSummary?.expense ?? 0).toLocaleString("en-IN")}`, color: "text-red-500", bg: "bg-red-50", icon: TrendingDown, iconColor: "text-red-500", sub: monthSummary?.expense > 0 ? "Spent this month" : "No expenses" },
    { label: "Balance", value: `₹${(monthSummary?.balance ?? 0).toLocaleString("en-IN")}`, color: monthSummary?.balance >= 0 ? "text-indigo-600" : "text-red-600", bg: "bg-indigo-50", icon: Wallet, iconColor: "text-indigo-600", sub: monthSummary?.balance >= 0 ? "You're in the green!" : "Overspent!" },
    { label: "Savings Rate", value: `${monthSummary?.savingsRate ?? 0}%`, color: "text-amber-600", bg: "bg-amber-50", icon: Target, iconColor: "text-amber-600", sub: (monthSummary?.savingsRate ?? 0) >= 20 ? "Great savings!" : "Try to save more" },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}
          </div>
          <div className="h-72 bg-gray-200 rounded-xl" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-1">Analytics</p>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 leading-none">{MONTHS[selectedMonth]}</h1>
          <p className="text-xl sm:text-2xl font-bold text-gray-400 mt-1">{selectedYear}</p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1); }
              else setSelectedMonth(m => m - 1);
            }}
            className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
          >
            <ChevronLeft size={18} />
          </button>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 outline-none focus:border-indigo-400"
          >
            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 outline-none focus:border-indigo-400"
          >
            {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>

          <button
            onClick={() => {
              if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1); }
              else setSelectedMonth(m => m + 1);
            }}
            disabled={selectedMonth === now.getMonth() && selectedYear === now.getFullYear()}
            className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Month Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {monthCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
              <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center mb-3`}>
                <Icon size={17} className={card.iconColor} />
              </div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{card.label}</p>
              <p className={`text-lg sm:text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
              <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm sm:text-base font-semibold text-gray-900">Income vs Expenses — All Months</h2>
          <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Overall: {overallSavingsRate}% saved</span>
        </div>
        {monthly.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-12">No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthly} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Pie + Line */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm sm:text-base font-semibold text-gray-900">Expenses by Category</h2>
            <span className="text-xs text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full font-medium">
              {MONTHS[selectedMonth].slice(0, 3)} {selectedYear}
            </span>
          </div>
          {monthCategories.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-2xl mb-2">📭</p>
              <p className="text-sm">No expenses in {MONTHS[selectedMonth]}</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={monthCategories} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {monthCategories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {monthCategories.map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-600">{c.name}</span>
                    </div>
                    <span className="font-semibold text-gray-800">₹{c.value.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-4">Monthly Trend</h2>
          {monthly.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-sm">No trend data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthly} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Income" />
                <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} name="Expense" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;