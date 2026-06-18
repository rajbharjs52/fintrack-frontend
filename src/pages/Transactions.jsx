import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { TrendingUp, TrendingDown, Pencil, Trash2, PackageOpen } from "lucide-react";

const CATEGORIES = {
  income: ["Salary", "Freelancing", "Investments", "Business", "Other"],
  expense: ["Food", "Travel", "Shopping", "Entertainment", "Bills", "Healthcare", "Education", "Other"],
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [filter, setFilter] = useState("all");
  const [editingTx, setEditingTx] = useState(null);

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { type: "expense", date: new Date().toISOString().split("T")[0] }
  });

  const selectedType = watch("type");

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = filter !== "all" ? `?type=${filter}` : "";
      const res = await API.get(`/transactions${params}`);
      setTransactions(res.data.transactions);
    } catch (err) {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, [filter]);

  const openAddModal = () => {
    setEditingTx(null);
    reset({ type: "expense", date: new Date().toISOString().split("T")[0] });
    setShowModal(true);
  };

  const openEditModal = (tx) => {
    setEditingTx(tx);
    reset({
      type: tx.type,
      amount: tx.amount,
      category: tx.category,
      description: tx.description || "",
      date: new Date(tx.date).toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTx(null);
    reset({ type: "expense", date: new Date().toISOString().split("T")[0] });
  };

  const onSubmit = async (data) => {
    try {
      if (editingTx) {
        await API.put(`/transactions/${editingTx._id}`, data);
        toast.success("Transaction updated!");
      } else {
        await API.post("/transactions", data);
        toast.success("Transaction added!");
      }
      closeModal();
      fetchTransactions();
    } catch (err) {
      toast.error(editingTx ? "Failed to update" : "Failed to add");
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeleting(id);
      await API.delete(`/transactions/${id}`);
      toast.success("Deleted!");
      fetchTransactions();
    } catch (err) {
      toast.error("Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your income and expenses</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg transition"
        >
          + Add
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5">
        {["all", "income", "expense"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium capitalize transition
              ${filter === f
                ? "bg-indigo-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <PackageOpen size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No transactions found.</p>
          </div>
        ) : (
          <div className="min-w-[600px]">
            {/* Table Header */}
            <div className="grid grid-cols-5 px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
              <span className="col-span-2">Description</span>
              <span>Category</span>
              <span>Date</span>
              <span className="text-right">Amount</span>
            </div>

            {transactions.map((tx) => (
              <div key={tx._id} className="grid grid-cols-5 px-5 py-3.5 items-center hover:bg-gray-50 group border-b border-gray-50 last:border-0">
                <div className="col-span-2 flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                    ${tx.type === "income" ? "bg-green-50" : "bg-red-50"}`}>
                    {tx.type === "income"
                      ? <TrendingUp size={15} className="text-green-600" />
                      : <TrendingDown size={15} className="text-red-500" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{tx.description || "-"}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium
                      ${tx.type === "income" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                      {tx.type}
                    </span>
                  </div>
                </div>
                <span className="text-sm text-gray-600 truncate">{tx.category}</span>
                <span className="text-sm text-gray-500">{new Date(tx.date).toLocaleDateString("en-IN")}</span>
                <div className="flex items-center justify-end gap-1.5">
                  <span className={`text-sm font-semibold ${tx.type === "income" ? "text-green-600" : "text-red-500"}`}>
                    {tx.type === "income" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                  </span>
                  <button
                    onClick={() => openEditModal(tx)}
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-md hover:bg-indigo-50 flex items-center justify-center transition"
                    title="Edit"
                  >
                    <Pencil size={13} className="text-indigo-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(tx._id)}
                    disabled={deleting === tx._id}
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-md hover:bg-red-50 flex items-center justify-center transition"
                    title="Delete"
                  >
                    <Trash2 size={13} className="text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingTx ? "Edit Transaction" : "Add Transaction"}
                </h2>
                {editingTx && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {editingTx.description || editingTx.category}
                  </p>
                )}
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition">
                <TrendingDown size={0} />
                <span className="text-xl">✕</span>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Type Toggle */}
              <div className="flex rounded-lg border border-gray-200 p-1 gap-1">
                {["expense", "income"].map((t) => (
                  <label key={t} className={`flex-1 text-center py-2 rounded-md text-sm font-medium cursor-pointer transition
                    ${selectedType === t
                      ? t === "income" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                      : "text-gray-500 hover:bg-gray-50"
                    }`}>
                    <input type="radio" value={t} {...register("type")} className="hidden" />
                    {t === "income" ? "↑ Income" : "↓ Expense"}
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input type="number" placeholder="0"
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition
                    ${errors.amount ? "border-red-400" : "border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"}`}
                  {...register("amount", { required: "Amount is required", min: { value: 1, message: "Must be > 0" } })}
                />
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  {...register("category", { required: "Category is required" })}
                >
                  <option value="">Select category</option>
                  {CATEGORIES[selectedType]?.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-gray-400">(optional)</span>
                </label>
                <input type="text" placeholder="e.g. Grocery shopping"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  {...register("description")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  {...register("date", { required: "Date is required" })}
                />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeModal}
                  className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition disabled:opacity-60">
                  {isSubmitting ? "Saving..." : editingTx ? "Save Changes" : "Add Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Transactions;