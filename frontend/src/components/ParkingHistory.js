import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCars } from "../contexts/CarContext";
import { useParking } from "../contexts/ParkingContext";
import "./ParkingComponents.css";

const ParkingHistory = () => {
  const { carId } = useParams();
  const { user, logout } = useAuth();
  const { getCarById } = useCars();
  const { getParkingHistory, getBalance, addBalance, loading } = useParking();
  const [showAddBalance, setShowAddBalance] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState("");

  const car = getCarById(carId);
  const parkingHistory = getParkingHistory(car?.plateNumber);
  const balance = getBalance();

  if (!car) {
    return (
      <div className="parking-container">
        <div className="error-container">
          <h2>Car not found</h2>
          <Link to="/cars" className="back-button">
            Back to Car List
          </Link>
        </div>
      </div>
    );
  }

  const handleAddBalance = async () => {
    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      await addBalance(amount);
      setBalanceAmount("");
      setShowAddBalance(false);
      alert("Balance added successfully!");
    } catch (error) {
      alert("Failed to add balance. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const formatDuration = (hours) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="parking-container">
      <header className="parking-header">
        <div className="header-content">
          <div className="header-left">
            <Link to={`/cars/${carId}`} className="back-button">
              ← Back to Car Details
            </Link>
            <h1 className="page-title">Parking History</h1>
          </div>
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

      <main className="parking-main">
        <div className="parking-history-container">
          {/* Car Info Section */}
          <div className="car-info-section">
            <div className="car-info-card">
              <div className="car-icon">🚗</div>
              <div className="car-info-details">
                <h3>
                  {car.make} {car.model}
                </h3>
                <p className="plate-number">{car.plateNumber}</p>
              </div>
            </div>
          </div>

          {/* Balance Section */}
          <div className="balance-section">
            <div className="balance-card">
              <div className="balance-info">
                <div className="balance-amount">
                  <span className="balance-label">
                    Balance Spent on this Car
                  </span>
                  <span className="balance-value">${balance.toFixed(2)}</span>
                </div>
                {/* <div className="balance-actions">
                  <button 
                    onClick={() => setShowAddBalance(!showAddBalance)}
                    className="add-balance-btn"
                  >
                    Add Balance
                  </button>
                </div> */}
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
                        {loading ? "Adding..." : "Add"}
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

          {/* History Section */}
          <div className="history-section">
            <h3 className="section-title">Parking Sessions</h3>

            {parkingHistory.length === 0 ? (
              <div className="empty-history">
                <div className="empty-icon">🅿️</div>
                <h4>No parking history yet</h4>
                <p>
                  Your parking sessions will appear here once you start using
                  the carpark.
                </p>
              </div>
            ) : (
              <div className="history-list">
                {parkingHistory.map((session) => (
                  <div key={session.id} className="history-item">
                    <div className="history-header">
                      <div className="session-date">
                        {new Date(session.entryTime).toLocaleDateString()}
                      </div>
                      <div className={`session-status ${session.status}`}>
                        {session.status === "completed"
                          ? "Completed"
                          : "Active"}
                      </div>
                    </div>

                    <div className="history-details">
                      <div className="history-row">
                        <div className="history-field">
                          <span className="field-label">Entry</span>
                          <span className="field-value">
                            {formatDate(session.entryTime)}
                          </span>
                        </div>
                        <div className="history-field">
                          <span className="field-label">Entry Gate</span>
                          <span className="field-value">
                            {session.entryGate}
                          </span>
                        </div>
                      </div>

                      <div className="history-row">
                        <div className="history-field">
                          <span className="field-label">Exit</span>
                          <span className="field-value">
                            {session.exitTime
                              ? formatDate(session.exitTime)
                              : "Still parked"}
                          </span>
                        </div>
                        <div className="history-field">
                          <span className="field-label">Exit Gate</span>
                          <span className="field-value">
                            {session.exitGate || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="history-row">
                        <div className="history-field">
                          <span className="field-label">Duration</span>
                          <span className="field-value">
                            {formatDuration(session.duration)}
                          </span>
                        </div>
                        <div className="history-field">
                          <span className="field-label">Parking Slot</span>
                          <span className="field-value">
                            {session.parkingSlot}
                          </span>
                        </div>
                      </div>

                      <div className="history-row">
                        <div className="history-field cost-field">
                          <span className="field-label">Cost</span>
                          <span className="field-value cost-value">
                            ${session.cost.toFixed(2)}
                          </span>
                        </div>
                      </div>
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

export default ParkingHistory;
