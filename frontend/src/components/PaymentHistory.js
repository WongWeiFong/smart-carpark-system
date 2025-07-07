import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useParking } from '../contexts/ParkingContext';
import './ParkingComponents.css';

const PaymentHistory = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getPaymentHistory, getBalance, addBalance, loading } = useParking();
  const [showAddBalance, setShowAddBalance] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'topup', 'deduction'

  const paymentHistory = getPaymentHistory();
  const balance = getBalance();

  const handleAddBalance = async () => {
    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    try {
      await addBalance(amount);
      setBalanceAmount('');
      setShowAddBalance(false);
      alert('Balance added successfully!');
    } catch (error) {
      alert('Failed to add balance. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatCurrency = (amount) => {
    return Math.abs(amount).toFixed(2);
  };

  const getTransactionIcon = (type) => {
    return type === 'topup' ? '💰' : '🅿️';
  };

  const getTransactionColor = (type) => {
    return type === 'topup' ? '#28a745' : '#dc3545';
  };

  const handleLogout = () => {
    logout();
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  // Filter transactions based on selected type
  const filteredTransactions = paymentHistory.filter(transaction => {
    if (filterType === 'all') return true;
    return transaction.type === filterType;
  });

  // Calculate summary statistics
  const totalTopups = paymentHistory
    .filter(t => t.type === 'topup')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalDeductions = paymentHistory
    .filter(t => t.type === 'deduction')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="parking-container">
      <header className="parking-header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={handleBackToHome} className="back-button">
              ← Back to Home
            </button>
            <h1 className="page-title">Payment History</h1>
          </div>
          <div className="user-info">
            <span className="welcome-text">Welcome, {user?.name || user?.email}!</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <main className="parking-main">
        <div className="payment-history-container">
          {/* Balance Section */}
          <div className="balance-section">
            <div className="balance-card">
              <div className="balance-info">
                <div className="balance-amount">
                  <span className="balance-label">Current Balance</span>
                  <span className="balance-value">${balance.toFixed(2)}</span>
                </div>
                <div className="balance-actions">
                  <button 
                    onClick={() => setShowAddBalance(!showAddBalance)}
                    className="add-balance-btn"
                  >
                    Add Balance
                  </button>
                </div>
              </div>
              
              {showAddBalance && (
                <div className="add-balance-form">
                  <div className="form-group">
                    <input
                      type="number"
                      value={balanceAmount}
                      onChange={(e) => setBalanceAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="balance-input"
                      min="0"
                      step="0.01"
                    />
                    <div className="balance-form-actions">
                      <button 
                        onClick={handleAddBalance}
                        disabled={loading}
                        className="confirm-balance-btn"
                      >
                        {loading ? 'Adding...' : 'Add'}
                      </button>
                      <button 
                        onClick={() => setShowAddBalance(false)}
                        className="cancel-balance-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="payment-summary-section">
            <div className="payment-summary-card">
              <h3 className="section-title">Transaction Summary</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <div className="summary-icon">💰</div>
                  <div className="summary-details">
                    <span className="summary-label">Total Top-ups</span>
                    <span className="summary-value topup-value">${totalTopups.toFixed(2)}</span>
                  </div>
                </div>
                <div className="summary-item">
                  <div className="summary-icon">🅿️</div>
                  <div className="summary-details">
                    <span className="summary-label">Total Spent</span>
                    <span className="summary-value deduction-value">${totalDeductions.toFixed(2)}</span>
                  </div>
                </div>
                <div className="summary-item">
                  <div className="summary-icon">📊</div>
                  <div className="summary-details">
                    <span className="summary-label">Net Balance</span>
                    <span className="summary-value">${(totalTopups - totalDeductions).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="filter-section">
            <div className="filter-card">
              <h4>Filter Transactions</h4>
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterType('all')}
                >
                  All Transactions
                </button>
                <button 
                  className={`filter-btn ${filterType === 'topup' ? 'active' : ''}`}
                  onClick={() => setFilterType('topup')}
                >
                  Top-ups Only
                </button>
                <button 
                  className={`filter-btn ${filterType === 'deduction' ? 'active' : ''}`}
                  onClick={() => setFilterType('deduction')}
                >
                  Parking Fees Only
                </button>
              </div>
            </div>
          </div>

          {/* Payment History Section */}
          <div className="history-section">
            <h3 className="section-title">
              Payment Transactions 
              <span className="transaction-count">({filteredTransactions.length})</span>
            </h3>
            
            {filteredTransactions.length === 0 ? (
              <div className="empty-history">
                <div className="empty-icon">💳</div>
                <h4>No transactions found</h4>
                <p>
                  {filterType === 'all' 
                    ? 'Your payment transactions will appear here once you add balance or use parking services.'
                    : filterType === 'topup'
                    ? 'No top-up transactions found. Add balance to see transaction history.'
                    : 'No parking fee transactions found. Your parking charges will appear here.'
                  }
                </p>
              </div>
            ) : (
              <div className="history-list">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="payment-history-item">
                    <div className="payment-header">
                      <div className="payment-icon">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div className="payment-main-info">
                        <div className="payment-description">
                          {transaction.description}
                        </div>
                        <div className="payment-date">
                          {formatDate(transaction.date)}
                        </div>
                      </div>
                      <div className="payment-amount-section">
                        <div 
                          className={`payment-amount ${transaction.type}`}
                          style={{ color: getTransactionColor(transaction.type) }}
                        >
                          {transaction.type === 'topup' ? '+' : '-'}${formatCurrency(transaction.amount)}
                        </div>
                        <div className="payment-status">
                          {transaction.status}
                        </div>
                      </div>
                    </div>
                    
                    <div className="payment-details">
                      <div className="payment-row">
                        <div className="payment-field">
                          <span className="field-label">Transaction ID</span>
                          <span className="field-value">{transaction.reference}</span>
                        </div>
                        <div className="payment-field">
                          <span className="field-label">Payment Method</span>
                          <span className="field-value">{transaction.paymentMethod}</span>
                        </div>
                      </div>
                      
                      {transaction.relatedSession && (
                        <div className="payment-row">
                          <div className="payment-field">
                            <span className="field-label">Related Session</span>
                            <span className="field-value">{transaction.relatedSession}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentHistory; 