import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Homepage.css';

const StaffHomepage = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="homepage-container staff-homepage">
      <header className="homepage-header staff-header">
        <div className="header-content">
          <h1 className="homepage-title">Staff Dashboard</h1>
          <div className="user-info">
            <span className="welcome-text">Welcome, Staff ID: {user?.staffId || user?.email}!</span>
            <button onClick={handleLogout} className="logout-btn staff-logout">Logout</button>
          </div>
        </div>
      </header>

      <main className="homepage-main">
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-number">124</div>
            <div className="stat-label">Total Parking Spots</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">89</div>
            <div className="stat-label">Occupied Spots</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">35</div>
            <div className="stat-label">Available Spots</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">12</div>
            <div className="stat-label">Reservations Today</div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card staff-card">
            <div className="card-icon">🏢</div>
            <h3>Parking Management</h3>
            <p>Monitor and manage parking spots availability</p>
            <button className="card-button staff-button">Manage Spots</button>
          </div>

          <div className="dashboard-card staff-card">
            <div className="card-icon">👥</div>
            <h3>Customer Management</h3>
            <p>View and manage customer accounts and bookings</p>
            <button className="card-button staff-button">View Customers</button>
          </div>

          <div className="dashboard-card staff-card">
            <div className="card-icon">📊</div>
            <h3>Analytics & Reports</h3>
            <p>View parking statistics and generate reports</p>
            <button className="card-button staff-button">View Reports</button>
          </div>

          <div className="dashboard-card staff-card">
            <div className="card-icon">💰</div>
            <h3>Revenue Management</h3>
            <p>Track payments and revenue statistics</p>
            <button className="card-button staff-button">View Revenue</button>
          </div>

          <div className="dashboard-card staff-card">
            <div className="card-icon">🔧</div>
            <h3>System Settings</h3>
            <p>Configure parking rates and system settings</p>
            <button className="card-button staff-button">Settings</button>
          </div>

          <div className="dashboard-card staff-card">
            <div className="card-icon">🚨</div>
            <h3>Emergency Management</h3>
            <p>Handle emergency situations and incidents</p>
            <button className="card-button staff-button">Emergency</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffHomepage; 