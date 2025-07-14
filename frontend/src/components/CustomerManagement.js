import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCustomer } from '../contexts/CustomerContext';
import './CustomerManagement.css';

const CustomerManagement = () => {
  const { user, logout } = useAuth();
  const { getAllCustomers, searchCustomers, loading } = useCustomer();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    try {
      const allCustomers = getAllCustomers();
      setCustomers(allCustomers);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  }, [getAllCustomers]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    try {
      const filteredCustomers = searchCustomers(term);
      setCustomers(filteredCustomers);
    } catch (error) {
      console.error('Error searching customers:', error);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }

    const sorted = [...customers].sort((a, b) => {
      let aValue = a[column];
      let bValue = b[column];

      // Handle different data types
      if (column === 'registeredDate' || column === 'lastActivity') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (column === 'accountBalance' || column === 'totalSpent') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      } else {
        aValue = aValue.toString().toLowerCase();
        bValue = bValue.toString().toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setCustomers(sorted);
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCustomer(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusClass = status === 'active' ? 'status-active' : 
                       status === 'suspended' ? 'status-suspended' : 
                       'status-inactive';
    return <span className={`status-badge ${statusClass}`}>{status.toUpperCase()}</span>;
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return '⇅';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="customer-management loading-container">
        <div className="loading-spinner">Loading customers...</div>
      </div>
    );
  }

  return (
    <div className="customer-management">
      <header className="customer-header">
        <div className="header-content">
          <h1 className="page-title">Customer Management</h1>
          <div className="user-info">
            <span className="welcome-text">Staff: {user?.staffId || user?.email}</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <div className="customer-content">
        <div className="search-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search customers by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          <div className="customer-stats">
            <span className="stat">Total Customers: {customers.length}</span>
            <span className="stat">Active: {customers.filter(c => c.status === 'active').length}</span>
            <span className="stat">Suspended: {customers.filter(c => c.status === 'suspended').length}</span>
          </div>
        </div>

        <div className="table-container">
          <table className="customers-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('id')} className="sortable">
                  Customer ID {getSortIcon('id')}
                </th>
                <th onClick={() => handleSort('name')} className="sortable">
                  Name {getSortIcon('name')}
                </th>
                <th onClick={() => handleSort('email')} className="sortable">
                  Email {getSortIcon('email')}
                </th>
                <th onClick={() => handleSort('registeredDate')} className="sortable">
                  Registered Date {getSortIcon('registeredDate')}
                </th>
                <th onClick={() => handleSort('status')} className="sortable">
                  Status {getSortIcon('status')}
                </th>
                <th onClick={() => handleSort('accountBalance')} className="sortable">
                  Balance {getSortIcon('accountBalance')}
                </th>
                <th onClick={() => handleSort('lastActivity')} className="sortable">
                  Last Activity {getSortIcon('lastActivity')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="customer-row">
                  <td className="customer-id">{customer.id}</td>
                  <td className="customer-name">{customer.name}</td>
                  <td className="customer-email">{customer.email}</td>
                  <td className="registered-date">{formatDate(customer.registeredDate)}</td>
                  <td className="customer-status">{getStatusBadge(customer.status)}</td>
                  <td className={`account-balance ${customer.accountBalance < 0 ? 'negative' : 'positive'}`}>
                    {formatCurrency(customer.accountBalance)}
                  </td>
                  <td className="last-activity">{formatDate(customer.lastActivity)}</td>
                  <td className="actions">
                    <button
                      onClick={() => handleViewCustomer(customer)}
                      className="view-btn"
                      title="View customer details"
                    >
                      👁️ View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {customers.length === 0 && (
            <div className="no-customers">
              <p>No customers found matching your search criteria.</p>
            </div>
          )}
        </div>
      </div>

      {showModal && selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={handleCloseModal}
          onUpdate={(updatedCustomer) => {
            setCustomers(customers.map(c => 
              c.id === updatedCustomer.id ? updatedCustomer : c
            ));
          }}
        />
      )}
    </div>
  );
};

// Customer Detail Modal Component
const CustomerDetailModal = ({ customer, onClose, onUpdate }) => {
  const { updateCustomer, loading } = useCustomer();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(customer);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showVehicles, setShowVehicles] = useState(false);
  const [showBalanceStatement, setShowBalanceStatement] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setUpdateLoading(true);
    try {
      await updateCustomer(customer.id, formData);
      onUpdate(formData);
      setEditMode(false);
      alert('Customer updated successfully!');
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Error updating customer. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(customer);
    setEditMode(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Customer Details</h2>
          <div className="modal-actions">
            {!editMode ? (
              <button onClick={() => setEditMode(true)} className="edit-btn">
                ✏️ Edit
              </button>
            ) : (
              <div className="edit-actions">
                <button onClick={handleSave} className="save-btn" disabled={updateLoading}>
                  {updateLoading ? 'Saving...' : '💾 Save'}
                </button>
                <button onClick={handleCancel} className="cancel-btn">
                  ❌ Cancel
                </button>
              </div>
            )}
            <button onClick={onClose} className="close-btn">✖️</button>
          </div>
        </div>

        <div className="modal-body">
          <div className="customer-details-grid">
            <div className="detail-group">
              <label>Customer ID</label>
              <input type="text" value={formData.id} disabled className="detail-input" />
            </div>

            <div className="detail-group">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={!editMode}
                className="detail-input"
              />
            </div>

            <div className="detail-group">
              <label>Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!editMode}
                className="detail-input"
              />
            </div>

            <div className="detail-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!editMode}
                className="detail-input"
              />
            </div>

            <div className="detail-group full-width">
              <label>Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={!editMode}
                className="detail-input"
              />
            </div>

            <div className="detail-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                disabled={!editMode}
                className="detail-select"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="detail-group">
              <label>Membership Type</label>
              <select
                value={formData.membershipType}
                onChange={(e) => handleInputChange('membershipType', e.target.value)}
                disabled={!editMode}
                className="detail-select"
              >
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>

            {/* <div className="detail-group">
              <label>Account Balance</label>
              <input
                type="number"
                step="0.01"
                value={formData.accountBalance}
                onChange={(e) => handleInputChange('accountBalance', parseFloat(e.target.value) || 0)}
                disabled={!editMode}
                className="detail-input"
              />
            </div> */}
            <div className="detail-group">
              <label>Account Balance</label>
              <input type="text" value={formatCurrency(formData.accountBalance)} disabled className="detail-input" />
            </div>

            <div className="detail-group">
              <label>Total Spent</label>
              <input type="text" value={formatCurrency(formData.totalSpent)} disabled className="detail-input" />
            </div>

            <div className="detail-group">
              <label>Total Parking Sessions</label>
              <input type="text" value={formData.totalParkingSessions} disabled className="detail-input" />
            </div>

            <div className="detail-group">
              <label>Registered Date</label>
              <input type="text" value={new Date(formData.registeredDate).toLocaleDateString()} disabled className="detail-input" />
            </div>

            <div className="detail-group">
              <label>Last Activity</label>
              <input type="text" value={new Date(formData.lastActivity).toLocaleDateString()} disabled className="detail-input" />
            </div>

            <div className="detail-group full-width">
              <label>Emergency Contact</label>
              <input
                type="text"
                value={formData.emergencyContact}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                disabled={!editMode}
                className="detail-input"
              />
            </div>

            <div className="detail-group full-width">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                disabled={!editMode}
                className="detail-textarea"
                rows="3"
              />
            </div>
          </div>

          <div className="customer-actions">
            <button 
              onClick={() => setShowVehicles(true)} 
              className="action-btn vehicles-btn"
            >
              🚗 View Vehicles ({customer.vehicles?.length || 0})
            </button>
            <button 
              onClick={() => setShowBalanceStatement(true)} 
              className="action-btn balance-btn"
            >
              💰 View Balance Statement
            </button>
          </div>
        </div>
      </div>

      {showVehicles && (
        <CustomerVehicles
          customer={customer}
          onClose={() => setShowVehicles(false)}
        />
      )}

      {showBalanceStatement && (
        <CustomerBalanceStatement
          customer={customer}
          onClose={() => setShowBalanceStatement(false)}
          onBalanceUpdate={(newBalance) => {
            const updatedCustomer = { ...formData, accountBalance: newBalance };
            setFormData(updatedCustomer);
            onUpdate(updatedCustomer);
          }}
        />
      )}
    </div>
  );
};

// Customer Vehicles Component
const CustomerVehicles = ({ customer, onClose }) => {
  const { 
    getCustomerVehicles, 
    addCustomerVehicle, 
    updateCustomerVehicle, 
    deleteCustomerVehicle, 
    loading 
  } = useCustomer();
  
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleForm, setVehicleForm] = useState({
    plateNumber: '',
    make: '',
    model: '',
    year: '',
    color: '',
    status: 'active'
  });

  useEffect(() => {
    try {
      const customerVehicles = getCustomerVehicles(customer.id);
      setVehicles(customerVehicles);
      setFilteredVehicles(customerVehicles);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  }, [customer.id, getCustomerVehicles]);

  useEffect(() => {
    const filtered = vehicles.filter(vehicle =>
      vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.color.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVehicles(filtered);
  }, [searchTerm, vehicles]);

  const handleAddVehicle = async () => {
    try {
      const result = await addCustomerVehicle(customer.id, vehicleForm);
      if (result.success) {
        setVehicles([...vehicles, result.vehicle]);
        setVehicleForm({ plateNumber: '', make: '', model: '', year: '', color: '', status: 'active' });
        setShowAddForm(false);
        alert('Vehicle added successfully!');
      }
    } catch (error) {
      console.error('Error adding vehicle:', error);
      alert('Error adding vehicle. Please try again.');
    }
  };

  const handleUpdateVehicle = async () => {
    try {
      const result = await updateCustomerVehicle(customer.id, editingVehicle.id, vehicleForm);
      if (result.success) {
        setVehicles(vehicles.map(v => v.id === editingVehicle.id ? { ...v, ...vehicleForm } : v));
        setEditingVehicle(null);
        setVehicleForm({ plateNumber: '', make: '', model: '', year: '', color: '', status: 'active' });
        alert('Vehicle updated successfully!');
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);
      alert('Error updating vehicle. Please try again.');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        const result = await deleteCustomerVehicle(customer.id, vehicleId);
        if (result.success) {
          setVehicles(vehicles.filter(v => v.id !== vehicleId));
          alert('Vehicle deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        alert('Error deleting vehicle. Please try again.');
      }
    }
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleForm({
      plateNumber: vehicle.plateNumber,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      status: vehicle.status
    });
    setShowAddForm(true);
  };

  const handleCancelEdit = () => {
    setEditingVehicle(null);
    setVehicleForm({ plateNumber: '', make: '', model: '', year: '', color: '', status: 'active' });
    setShowAddForm(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content vehicles-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🚗 {customer.name}'s Vehicles</h2>
          <div className="modal-actions">
            <button onClick={() => setShowAddForm(!showAddForm)} className="add-btn">
              ➕ Add Vehicle
            </button>
            <button onClick={onClose} className="close-btn">✖️</button>
          </div>
        </div>

        <div className="modal-body">
          <div className="vehicles-controls">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search vehicles by plate, make, model, or color..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
            <div className="vehicles-stats">
              <span className="stat">Total: {vehicles.length}</span>
              <span className="stat">Active: {vehicles.filter(v => v.status === 'active').length}</span>
              <span className="stat">Suspended: {vehicles.filter(v => v.status === 'suspended').length}</span>
            </div>
          </div>

          {showAddForm && (
            <div className="add-vehicle-form">
              <h3>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Plate Number"
                  value={vehicleForm.plateNumber}
                  onChange={(e) => setVehicleForm({...vehicleForm, plateNumber: e.target.value})}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Make"
                  value={vehicleForm.make}
                  onChange={(e) => setVehicleForm({...vehicleForm, make: e.target.value})}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Model"
                  value={vehicleForm.model}
                  onChange={(e) => setVehicleForm({...vehicleForm, model: e.target.value})}
                  className="form-input"
                />
                <input
                  type="number"
                  placeholder="Year"
                  value={vehicleForm.year}
                  onChange={(e) => setVehicleForm({...vehicleForm, year: e.target.value})}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Color"
                  value={vehicleForm.color}
                  onChange={(e) => setVehicleForm({...vehicleForm, color: e.target.value})}
                  className="form-input"
                />
                <select
                  value={vehicleForm.status}
                  onChange={(e) => setVehicleForm({...vehicleForm, status: e.target.value})}
                  className="form-select"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="form-actions">
                <button 
                  onClick={editingVehicle ? handleUpdateVehicle : handleAddVehicle} 
                  className="save-btn"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (editingVehicle ? 'Update' : 'Add')} Vehicle
                </button>
                <button onClick={handleCancelEdit} className="cancel-btn">Cancel</button>
              </div>
            </div>
          )}

          <div className="vehicles-table-container">
            <table className="vehicles-table">
              <thead>
                <tr>
                  <th>Plate Number</th>
                  <th>Make & Model</th>
                  <th>Year</th>
                  <th>Color</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="vehicle-row">
                    <td className="plate-number">{vehicle.plateNumber}</td>
                    <td className="make-model">{vehicle.make} {vehicle.model}</td>
                    <td className="year">{vehicle.year}</td>
                    <td className="color">{vehicle.color}</td>
                    <td className="status">
                      <span className={`status-badge status-${vehicle.status}`}>
                        {vehicle.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="registered-date">{formatDate(vehicle.registeredDate)}</td>
                    <td className="actions">
                      <button
                        onClick={() => handleEditVehicle(vehicle)}
                        className="edit-btn-small"
                        title="Edit vehicle"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                        className="delete-btn"
                        title="Delete vehicle"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredVehicles.length === 0 && (
              <div className="no-vehicles">
                <p>No vehicles found matching your search criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Customer Balance Statement Component
const CustomerBalanceStatement = ({ customer, onClose, onBalanceUpdate }) => {
  const { 
    getCustomerBalanceStatement, 
    addBalanceTransaction, 
    updateBalanceTransaction, 
    deleteBalanceTransaction, 
    loading 
  } = useCustomer();
  
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactionForm, setTransactionForm] = useState({
    type: 'credit',
    amount: '',
    description: '',
    paymentMethod: 'Cash'
  });

  useEffect(() => {
    try {
      const customerTransactions = getCustomerBalanceStatement(customer.id);
      setTransactions(customerTransactions);
      setFilteredTransactions(customerTransactions);
    } catch (error) {
      console.error('Error loading balance statement:', error);
    }
  }, [customer.id, getCustomerBalanceStatement]);

  useEffect(() => {
    const filtered = transactions.filter(transaction =>
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTransactions(filtered);
  }, [searchTerm, transactions]);

  const handleAddTransaction = async () => {
    try {
      const amount = transactionForm.type === 'debit' ? -Math.abs(parseFloat(transactionForm.amount)) : Math.abs(parseFloat(transactionForm.amount));
      const result = await addBalanceTransaction(customer.id, {
        ...transactionForm,
        amount: amount
      });
      if (result.success) {
        setTransactions([result.transaction, ...transactions]);
        const newBalance = customer.accountBalance + amount;
        onBalanceUpdate(newBalance);
        setTransactionForm({ type: 'credit', amount: '', description: '', paymentMethod: 'Cash' });
        setShowAddForm(false);
        alert('Transaction added successfully!');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Error adding transaction. Please try again.');
    }
  };

  const handleUpdateTransaction = async () => {
    try {
      const result = await updateBalanceTransaction(customer.id, editingTransaction.id, transactionForm);
      if (result.success) {
        setTransactions(transactions.map(t => t.id === editingTransaction.id ? { ...t, ...transactionForm } : t));
        setEditingTransaction(null);
        setTransactionForm({ type: 'credit', amount: '', description: '', paymentMethod: 'Cash' });
        alert('Transaction updated successfully!');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Error updating transaction. Please try again.');
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        const transactionToDelete = transactions.find(t => t.id === transactionId);
        const result = await deleteBalanceTransaction(customer.id, transactionId);
        if (result.success) {
          setTransactions(transactions.filter(t => t.id !== transactionId));
          const newBalance = customer.accountBalance - parseFloat(transactionToDelete.amount);
          onBalanceUpdate(newBalance);
          alert('Transaction deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Error deleting transaction. Please try again.');
      }
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setTransactionForm({
      type: transaction.type,
      amount: Math.abs(transaction.amount).toString(),
      description: transaction.description,
      paymentMethod: transaction.paymentMethod
    });
    setShowAddForm(true);
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
    setTransactionForm({ type: 'credit', amount: '', description: '', paymentMethod: 'Cash' });
    setShowAddForm(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalBalance = () => {
    return transactions.reduce((total, transaction) => total + parseFloat(transaction.amount), 0);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content balance-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💰 {customer.name}'s Balance Statement</h2>
          <div className="modal-actions">
            <button onClick={() => setShowAddForm(!showAddForm)} className="add-btn">
              ➕ Add Transaction
            </button>
            <button onClick={onClose} className="close-btn">✖️</button>
          </div>
        </div>

        <div className="modal-body">
          <div className="balance-summary">
            <div className="balance-card">
              <h3>Current Balance</h3>
              <div className={`balance-amount ${customer.accountBalance >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(customer.accountBalance)}
              </div>
            </div>
            <div className="balance-stats">
              <div className="stat-item">
                <span className="stat-label">Total Transactions:</span>
                <span className="stat-value">{transactions.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Credits:</span>
                <span className="stat-value positive">
                  {formatCurrency(transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0))}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Debits:</span>
                <span className="stat-value negative">
                  {formatCurrency(Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)))}
                </span>
              </div>
            </div>
          </div>

          <div className="balance-controls">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search transactions by description, reference, or payment method..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>

          {showAddForm && (
            <div className="add-transaction-form">
              <h3>{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</h3>
              <div className="form-grid">
                <select
                  value={transactionForm.type}
                  onChange={(e) => setTransactionForm({...transactionForm, type: e.target.value})}
                  className="form-select"
                >
                  <option value="credit">Credit (+)</option>
                  <option value="debit">Debit (-)</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  value={transactionForm.amount}
                  onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={transactionForm.description}
                  onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                  className="form-input"
                />
                <select
                  value={transactionForm.paymentMethod}
                  onChange={(e) => setTransactionForm({...transactionForm, paymentMethod: e.target.value})}
                  className="form-select"
                >
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Account Balance">Account Balance</option>
                </select>
              </div>
              <div className="form-actions">
                <button 
                  onClick={editingTransaction ? handleUpdateTransaction : handleAddTransaction} 
                  className="save-btn"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (editingTransaction ? 'Update' : 'Add')} Transaction
                </button>
                <button onClick={handleCancelEdit} className="cancel-btn">Cancel</button>
              </div>
            </div>
          )}

          <div className="transactions-table-container">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Payment Method</th>
                  <th>Reference</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="transaction-row">
                    <td className="transaction-date">{formatDate(transaction.date)}</td>
                    <td className="transaction-type">
                      <span className={`type-badge type-${transaction.type}`}>
                        {transaction.type === 'credit' ? '➕' : '➖'} {transaction.type.toUpperCase()}
                      </span>
                    </td>
                    <td className={`transaction-amount ${transaction.amount >= 0 ? 'positive' : 'negative'}`}>
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="transaction-description">{transaction.description}</td>
                    <td className="payment-method">{transaction.paymentMethod}</td>
                    <td className="reference">{transaction.reference}</td>
                    <td className="actions">
                      <button
                        onClick={() => handleEditTransaction(transaction)}
                        className="edit-btn-small"
                        title="Edit transaction"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        className="delete-btn"
                        title="Delete transaction"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredTransactions.length === 0 && (
              <div className="no-transactions">
                <p>No transactions found matching your search criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerManagement; 