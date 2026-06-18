import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import API from "../api/axios";
import { TrendingUp, TrendingDown, Wallet, Receipt, ArrowRight } from "lucide-react";

const summaryCards = [
  { label: "Total Income", key: "totalIncome", color: "text-green-600", bg: "bg-green-50", icon: TrendingUp, iconColor: "text-green-600" },
  { label: "Total Expenses", key: "totalExpenses", color: "text-red-500", bg: "bg-red-50", icon: TrendingDown, iconColor: "text-red-500" },
  { label: "Current Balance", key: "balance", color: "text-indigo-600", bg: "bg-indigo-50", icon: Wallet, iconColor: "text-indigo-600" },
  { label: "Transactions", key: "totalTransactions", color: "text-amber-600", bg: "bg-amber-50", icon: Receipt, iconColor: "text-amber-600" },
];

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, txRes] = await Promise.all([
          API.get("/analytics/summary"),
          API.get("/transactions?limit=5"),
        ]);
        setSummary(summaryRes.data);
        setRecentTx(txRes.data.transactions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Your financial overview</p>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 animate-pulse h-24 sm:h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.key} className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
                <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon size={18} className={card.iconColor} />
                </div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{card.label}</p>
                <p className={`text-lg sm:text-2xl font-bold mt-1 ${card.color}`}>
                  {card.key === "totalTransactions"
                    ? summary?.[card.key] ?? 0
                    : `₹${(summary?.[card.key] ?? 0).toLocaleString("en-IN")}`
                  }
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Recent Transactions</h2>
          <Link
            to="/transactions"
            className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {recentTx.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Receipt size={36} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No transactions yet. Add your first one!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {recentTx.map((tx) => (
              <div key={tx._id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                    ${tx.type === "income" ? "bg-green-50" : "bg-red-50"}`}>
                    {tx.type === "income"
                      ? <TrendingUp size={16} className="text-green-600" />
                      : <TrendingDown size={16} className="text-red-500" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{tx.description || tx.category}</p>
                    <p className="text-xs text-gray-400">{tx.category} • {new Date(tx.date).toLocaleDateString("en-IN")}</p>
                  </div>
                </div>
                <p className={`text-sm font-semibold flex-shrink-0 ml-2 ${tx.type === "income" ? "text-green-600" : "text-red-500"}`}>
                  {tx.type === "income" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;