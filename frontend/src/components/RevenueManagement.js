import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useParking } from "../contexts/ParkingContext";
import "./ParkingComponents.css";

const RevenueManagement = () => {
  const navigate = useNavigate();
  const { user, logout, isStaff } = useAuth();
  const {
    getAllTransactions,
    updateTransaction,
    deleteTransaction,
    getRevenueStats,
    loading,
  } = useParking();

  // State for filters
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    user: "",
    type: "all",
    minAmount: "",
    maxAmount: "",
  });

  // State for modals and editing
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});

  // State for sorting
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });

  // Redirect non-staff users
  useEffect(() => {
    if (!isStaff()) {
      navigate("/home");
    }
  }, [isStaff, navigate]);

  const allTransactions = getAllTransactions();
  const revenueStats = getRevenueStats();

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = allTransactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

      if (fromDate && transactionDate < fromDate) return false;
      if (toDate && transactionDate > toDate) return false;

      if (
        filters.user &&
        !transaction.userName
          .toLowerCase()
          .includes(filters.user.toLowerCase()) &&
        !transaction.userEmail
          .toLowerCase()
          .includes(filters.user.toLowerCase())
      ) {
        return false;
      }

      if (filters.type !== "all" && transaction.type !== filters.type)
        return false;

      const absAmount = Math.abs(transaction.amount);
      if (filters.minAmount && absAmount < parseFloat(filters.minAmount))
        return false;
      if (filters.maxAmount && absAmount > parseFloat(filters.maxAmount))
        return false;

      return true;
    });

    // Sort
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === "date") {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        } else if (sortConfig.key === "amount") {
          aValue = Math.abs(aValue);
          bValue = Math.abs(bValue);
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [allTransactions, filters, sortConfig]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setDetailModalOpen(true);
  };

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setEditForm({
      amount: Math.abs(transaction.amount),
      description: transaction.description,
      status: transaction.status,
      paymentMethod: transaction.paymentMethod,
      staffNotes: transaction.staffNotes || "",
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const updates = {
        amount:
          selectedTransaction.type === "deduction"
            ? -parseFloat(editForm.amount)
            : parseFloat(editForm.amount),
        description: editForm.description,
        status: editForm.status,
        paymentMethod: editForm.paymentMethod,
        staffNotes: editForm.staffNotes,
      };

      await updateTransaction(selectedTransaction.id, updates);
      setEditModalOpen(false);
      setSelectedTransaction(null);
      alert("Transaction updated successfully!");
    } catch (error) {
      alert("Failed to update transaction: " + error.message);
    }
  };

  const handleDelete = async (transaction) => {
    if (window.confirm(`Delete transaction ${transaction.reference}?`)) {
      try {
        await deleteTransaction(transaction.id);
        alert("Transaction deleted successfully!");
      } catch (error) {
        alert("Failed to delete transaction: " + error.message);
      }
    }
  };

  const formatCurrency = (amount) => `$${Math.abs(amount).toFixed(2)}`;
  const getTypeColor = (type) => (type === "topup" ? "#28a745" : "#dc3545");

  return (
    <div className="revenue-management-container">
      {/* Header */}
      <header className="revenue-header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={() => navigate("/home")} className="back-button">
              ← Back to Dashboard
            </button>
            <h1 className="page-title">Revenue Management</h1>
          </div>
          <div className="user-info">
            <span className="welcome-text">
              안녕하세요 {user?.role + " " + user?.staffName || "staff"}
            </span>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="revenue-main">
        {/* Stats */}
        <div className="revenue-stats-section">
          <div className="stats-grid">
            <div className="stat-card revenue-stat">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <div className="stat-number">
                  ${revenueStats.totalRevenue.toFixed(2)}
                </div>
                <div className="stat-label">Total Top-ups</div>
              </div>
            </div>
            <div className="stat-card revenue-stat">
              <div className="stat-icon">🅿️</div>
              <div className="stat-content">
                <div className="stat-number">
                  ${revenueStats.parkingRevenue.toFixed(2)}
                </div>
                <div className="stat-label">Parking Revenue</div>
              </div>
            </div>
            <div className="stat-card revenue-stat">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-number">
                  {revenueStats.totalTransactions}
                </div>
                <div className="stat-label">Total Transactions</div>
              </div>
            </div>
            <div className="stat-card revenue-stat">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-number">{revenueStats.uniqueUsers}</div>
                <div className="stat-label">Active Users</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-card">
            <h3>Filter Transactions</h3>
            <div className="filters-grid">
              <div className="filter-group">
                <label>Date From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateFrom: e.target.value,
                    }))
                  }
                  className="filter-input"
                />
              </div>
              <div className="filter-group">
                <label>Date To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
                  }
                  className="filter-input"
                />
              </div>
              <div className="filter-group">
                <label>User</label>
                <input
                  type="text"
                  placeholder="Search by name or email"
                  value={filters.user}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, user: e.target.value }))
                  }
                  className="filter-input"
                />
              </div>
              <div className="filter-group">
                <label>Type</label>
                <select
                  value={filters.type}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className="filter-select"
                >
                  <option value="all">All Types</option>
                  <option value="topup">Top-ups</option>
                  <option value="deduction">Parking Fees</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Min Amount</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={filters.minAmount}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      minAmount: e.target.value,
                    }))
                  }
                  className="filter-input"
                />
              </div>
              <div className="filter-group">
                <label>Max Amount</label>
                <input
                  type="number"
                  placeholder="1000.00"
                  value={filters.maxAmount}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      maxAmount: e.target.value,
                    }))
                  }
                  className="filter-input"
                />
              </div>
            </div>
            <div className="filter-actions">
              <button
                onClick={() =>
                  setFilters({
                    dateFrom: "",
                    dateTo: "",
                    user: "",
                    type: "all",
                    minAmount: "",
                    maxAmount: "",
                  })
                }
                className="reset-filters-btn"
              >
                Reset Filters
              </button>
              <span className="results-count">
                Showing {filteredTransactions.length} of{" "}
                {allTransactions.length} transactions
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="transactions-section">
          <div className="transactions-card">
            <h3>Transaction History</h3>
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading transactions...</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th
                        onClick={() => handleSort("date")}
                        className="sortable"
                      >
                        Date{" "}
                        {sortConfig.key === "date"
                          ? sortConfig.direction === "asc"
                            ? "↑"
                            : "↓"
                          : "↕️"}
                      </th>
                      <th
                        onClick={() => handleSort("userName")}
                        className="sortable"
                      >
                        User{" "}
                        {sortConfig.key === "userName"
                          ? sortConfig.direction === "asc"
                            ? "↑"
                            : "↓"
                          : "↕️"}
                      </th>
                      <th>Type</th>
                      <th
                        onClick={() => handleSort("amount")}
                        className="sortable"
                      >
                        Amount{" "}
                        {sortConfig.key === "amount"
                          ? sortConfig.direction === "asc"
                            ? "↑"
                            : "↓"
                          : "↕️"}
                      </th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="transaction-row">
                        <td>
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="user-cell">
                            <div className="user-name">
                              {transaction.userName}
                            </div>
                            <div className="user-email">
                              {transaction.userEmail}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`type-badge ${transaction.type}`}>
                            {transaction.type === "topup"
                              ? "Top-up"
                              : "Parking Fee"}
                          </span>
                        </td>
                        <td style={{ color: getTypeColor(transaction.type) }}>
                          {transaction.type === "topup" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td>{transaction.description}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleViewDetails(transaction)}
                              className="action-btn view-btn"
                            >
                              👁️
                            </button>
                            <button
                              onClick={() => handleEdit(transaction)}
                              className="action-btn edit-btn"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(transaction)}
                              className="action-btn delete-btn"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {detailModalOpen && selectedTransaction && (
        <div
          className="modal-overlay"
          onClick={() => setDetailModalOpen(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Transaction Details</h2>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>ID:</label>{" "}
                  <span>{selectedTransaction.reference}</span>
                </div>
                <div className="detail-item">
                  <label>User:</label>{" "}
                  <span>{selectedTransaction.userName}</span>
                </div>
                <div className="detail-item">
                  <label>Amount:</label>
                  <span
                    style={{ color: getTypeColor(selectedTransaction.type) }}
                  >
                    {selectedTransaction.type === "topup" ? "+" : "-"}
                    {formatCurrency(selectedTransaction.amount)}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Date:</label>{" "}
                  <span>
                    {new Date(selectedTransaction.date).toLocaleString()}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Status:</label>{" "}
                  <span>{selectedTransaction.status}</span>
                </div>
                <div className="detail-item">
                  <label>Method:</label>{" "}
                  <span>{selectedTransaction.paymentMethod}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editModalOpen && selectedTransaction && (
        <div className="modal-overlay" onClick={() => setEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Transaction</h2>
              <button
                onClick={() => setEditModalOpen(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="edit-form">
                <div className="form-group">
                  <label>Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.amount}
                    onChange={(e) =>
                      setEditForm({ ...editForm, amount: e.target.value })
                    }
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                    className="form-select"
                  >
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Staff Notes</label>
                  <textarea
                    value={editForm.staffNotes}
                    onChange={(e) =>
                      setEditForm({ ...editForm, staffNotes: e.target.value })
                    }
                    className="form-textarea"
                    rows="3"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="save-btn"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueManagement;
