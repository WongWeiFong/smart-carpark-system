import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useParking } from "../contexts/ParkingContext";
import "./Homepage.css";

const StaffHomepage = () => {
  const { user, logout } = useAuth();
  const { getAllParkingSlots } = useParking();
  const [parkingStats, setParkingStats] = useState({
    total: 0,
    occupied: 0,
    available: 0,
    maintenance: 0,
    loading: true,
  });

  useEffect(() => {
    loadParkingStats();
  }, []);

  const loadParkingStats = async () => {
    try {
      setParkingStats((prev) => ({ ...prev, loading: true }));
      const slots = await getAllParkingSlots();

      // Use effectiveStatus first, then status, then sensorStatus
      const getStatus = (slot) =>
        (
          slot.effectiveStatus ||
          slot.status ||
          slot.sensorStatus ||
          ""
        ).toLowerCase();

      const stats = {
        total: slots.length,
        occupied: slots.filter((s) => getStatus(s) === "occupied").length,
        available: slots.filter((s) => getStatus(s) === "available").length,
        maintenance: slots.filter((s) => getStatus(s) === "maintenance").length,
        loading: false,
      };

      setParkingStats(stats);
    } catch (err) {
      console.error("Error loading parking stats:", err);
      setParkingStats((prev) => ({ ...prev, loading: false }));
    }
  };

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
              안녕하세요 {user?.role + " " + user?.staffName || "staff"}
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
            <div className="stat-number">
              {parkingStats.loading ? "..." : parkingStats.total}
            </div>
            <div className="stat-label">Total Parking Slots</div>
          </div>
          <div className="stat-card available">
            <div className="stat-number">
              {parkingStats.loading ? "..." : parkingStats.available}
            </div>
            <div className="stat-label">Available Spots</div>
          </div>
          <div className="stat-card occupied">
            <div className="stat-number">
              {parkingStats.loading ? "..." : parkingStats.occupied}
            </div>
            <div className="stat-label">Occupied Spots</div>
          </div>
          <div className="stat-card maintenance">
            <div className="stat-number">
              {parkingStats.loading ? "..." : parkingStats.maintenance}
            </div>
            <div className="stat-label">Maintenance</div>
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

          <div className="dashboard-card staff-card demo-card">
            <div className="card-icon">📍</div>
            <h3>Manage user's parking</h3>
            <p>View and manage customer's vehicle current parking slot</p>
            <Link
              to="/staff/vehicle-slots"
              className="card-button staff-button"
              style={{
                textDecoration: "none",
                display: "block",
                textAlign: "center",
              }}
            >
              Manage Parking
            </Link>
          </div>

          <div className="dashboard-card staff-card">
            <div className="card-icon">🎯</div>
            <h3>Staff Settings</h3>
            <p>Manage staff accounts and permissions</p>
            <Link
              to="/staff-settings"
              className="card-button staff-button"
              style={{
                textDecoration: "none",
                display: "block",
                textAlign: "center",
              }}
            >
              Manage Settings
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

          {/* <div className="dashboard-card staff-card cs-card">
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
          </div> */}

          {/* <div className="dashboard-card staff-card cs-card">
            <div className="card-icon">📊</div>
            <h3>Analytics & Reports</h3>
            <p>View parking statistics and generate reports</p>
            <button
              className="card-button staff-button"
              style={{
                textDecoration: "none",
                display: "block",
                textAlign: "center",
                cursor: "not-allowed",
                opacity: 0.5,
              }}
              disabled
            >
              View Reports
            </button>
          </div> */}

          {/* <div className="dashboard-card staff-card cs-card">
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
          </div> */}

          {/* <div className="dashboard-card staff-card cs-card">
            <div className="card-icon">📊</div>
            <h3>Revenue Management</h3>
            <p>Track payments and revenue statistics</p>
            <button
              className="card-button staff-button"
              style={{
                textDecoration: "none",
                display: "block",
                textAlign: "center",
                cursor: "not-allowed",
                opacity: 0.5,
              }}
              disabled
            >
              View Revenue
            </button>
          </div> */}

          {/* <div className="dashboard-card staff-card cs-card">
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
          </div> */}

          {/* <div className="dashboard-card staff-card cs-card">
            <div className="card-icon">📊</div>
            <h3>System Settings</h3>
            <p>Configure parking rates and system settings</p>
            <button
              className="card-button staff-button"
              style={{
                textDecoration: "none",
                display: "block",
                textAlign: "center",
                cursor: "not-allowed",
                opacity: 0.5,
              }}
              disabled
            >
              Settings
            </button>
          </div> */}

          {/* <div className="dashboard-card staff-card cs-card">
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
          </div> */}

          {/* <div className="dashboard-card staff-card cs-card">
            <div className="card-icon">📊</div>
            <h3>Emergency Management</h3>
            <p>Handle emergency situations and incidents</p>
            <button
              className="card-button staff-button"
              style={{
                textDecoration: "none",
                display: "block",
                textAlign: "center",
                cursor: "not-allowed",
                opacity: 0.5,
              }}
              disabled
            >
              Emergency
            </button>
          </div> */}
        </div>
      </main>
    </div>
  );
};

export default StaffHomepage;
