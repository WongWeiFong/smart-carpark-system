import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Homepage.css";

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
            <span className="welcome-text">
              안녕하세요 {user?.role + " " + user?.staffName || "staff"}!
            </span>
            <button onClick={handleLogout} className="logout-btn staff-logout">
              Logout
            </button>
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
            <h3>Parking Slot Management</h3>
            <p>Monitor and manually manage parking slot statuses</p>
            <Link
              to="/staff/parking-slots"
              className="card-button staff-button"
              style={{
                textDecoration: "none",
                display: "block",
                textAlign: "center",
              }}
            >
              Manage Slots
            </Link>
          </div>

          <div className="dashboard-card staff-card">
            <div className="card-icon">👥</div>
            <h3>Customer Management</h3>
            <p>View and manage customer accounts and bookings</p>
            <Link
              to="/customer-management"
              className="card-button staff-button"
              style={{
                textDecoration: "none",
                display: "block",
                textAlign: "center",
              }}
            >
              View Customers
            </Link>
          </div>

          <div className="dashboard-card staff-card">
            <div className="card-icon">📊</div>
            <h3>Analytics & Reports</h3>
            <p>View parking statistics and generate reports</p>
            <Link
              to="/analytics-reports"
              className="card-button staff-button"
              style={{
                textDecoration: "none",
                display: "block",
                textAlign: "center",
              }}
            >
              View Reports
            </Link>
          </div>

          <div className="dashboard-card staff-card">
            <div className="card-icon">💰</div>
            <h3>Revenue Management</h3>
            <p>Track payments and revenue statistics</p>
            <Link
              to="/revenue-management"
              className="card-button staff-button"
              style={{
                textDecoration: "none",
                display: "block",
                textAlign: "center",
              }}
            >
              View Revenue
            </Link>
          </div>

          <div className="dashboard-card staff-card">
            <div className="card-icon">🔧</div>
            <h3>System Settings</h3>
            <p>Configure parking rates and system settings</p>
            <Link
              to="/system-settings"
              className="card-button staff-button"
              style={{
                textDecoration: "none",
                display: "block",
                textAlign: "center",
              }}
            >
              Settings
            </Link>
          </div>

          <div className="dashboard-card staff-card">
            <div className="card-icon">🚨</div>
            <h3>Emergency Management</h3>
            <p>Handle emergency situations and incidents</p>
            <Link
              to="/emergency-management"
              className="card-button staff-button"
              style={{
                textDecoration: "none",
                display: "block",
                textAlign: "center",
              }}
            >
              Emergency
            </Link>
          </div>

          <div className="dashboard-card staff-card demo-card">
            <div className="card-icon">🎯</div>
            <h3>Interactive Layout Demo</h3>
            <p>Experience the new Konva.js interactive parking layout</p>
            <Link
              to="/parking-demo"
              className="card-button demo-button"
              style={{
                textDecoration: "none",
                display: "block",
                textAlign: "center",
              }}
            >
              Try Demo
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffHomepage;
