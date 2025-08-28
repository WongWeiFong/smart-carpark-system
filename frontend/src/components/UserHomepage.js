import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Homepage.css";

const UserHomepage = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="homepage-container">
      <header className="homepage-header">
        <div className="header-content">
          <h1 className="homepage-title">Smart Carpark System</h1>
          <div className="user-info">
            <span className="welcome-text">
              Welcome, {user?.firstName + " " + user?.lastName}!
            </span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="homepage-main">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-icon">🚗</div>
            <h3>My Car</h3>
            <p>Add your car plate number for auto deduction</p>
            <Link
              to="/cars"
              className="card-button"
              style={{
                textDecoration: "none",
                display: "block",
                textAlign: "center",
              }}
            >
              View Car
            </Link>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">🅿️</div>
            <h3>Find Parking</h3>
            <p>Search for available parking spots near your location</p>
            <Link
              to="/parking-slot"
              className="card-button"
              style={{
                textDecoration: "none",
                display: "block",
                textAlign: "center",
              }}
            >
              Search Now
            </Link>
          </div>

          <div className="dashboard-card demo-card">
            <div className="card-icon">📍</div>
            <h3>Current Parking</h3>
            <p>View your car with parking slots and manage it</p>
            <Link
              to="/parking"
              className="card-button demo-button"
              style={{
                textDecoration: "none",
                display: "block",
                textAlign: "center",
              }}
            >
              Manage Parking
            </Link>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">💳</div>
            <h3>Payment History</h3>
            <p>View your parking payment history and receipts</p>
            <Link
              to="/payment-history"
              className="card-button"
              style={{
                textDecoration: "none",
                display: "block",
                textAlign: "center",
              }}
            >
              View History
            </Link>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">🎫</div>
            <h3>My Bookings</h3>
            <p>View and manage your parking reservations</p>
            <button className="card-button">View Bookings</button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">⚙️</div>
            <h3>Settings</h3>
            <p>Manage your account settings and preferences</p>
            <Link
              to="/user-settings"
              className="card-button"
              style={{
                textDecoration: "none",
                display: "block",
                textAlign: "center",
              }}
            >
              Settings
            </Link>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">🆘</div>
            <h3>Help & Support</h3>
            <p>Get help with parking issues or contact support</p>
            <button className="card-button">Get Help</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserHomepage;
