// src/pages/CarList.js
import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCars } from "../contexts/CarContext";
import "./CarManagement.css";

const CarList = () => {
  const { user, logout, token: ctxToken } = useAuth();
  const { cars, loading, initialized, refreshCars, removeCar } = useCars();

  const [walletBalance, setWalletBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(false);

  const API = useMemo(
    () => (process.env.REACT_APP_API_URL || "http://localhost:3001/api").trim(),
    []
  );

  const navigate = useNavigate();

  const token = ctxToken || localStorage.getItem("authToken");

  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  // Fetch from DynamoDB via backend when page mounts / user changes
  useEffect(() => {
    if (user) {
      refreshCars();
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchProfile = async () => {
    try {
      setWalletLoading(true);
      const res = await fetch(`${API}/auth/profile`, { headers: authHeaders });
      if (!res.ok) throw new Error("Failed to load profile");
      const data = await res.json();
      setWalletBalance(Number(data.walletBalance || 0));
    } catch (e) {
      console.error(e);
      setWalletBalance(0);
    } finally {
      setWalletLoading(false);
    }
  };

  const handleReload = async () => {
    const input = window.prompt("Enter reload amount (RM):", "20");
    if (input == null) return;
    const amount = Number(input);
    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }
    try {
      setWalletLoading(true);
      const res = await fetch(`${API}/auth/wallet/reload`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to reload wallet");
      }
      const data = await res.json();
      setWalletBalance(Number(data.walletBalance || 0));
      alert(`Reloaded RM ${amount.toFixed(2)} successfully!`);
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to reload. Please try again.");
    } finally {
      setWalletLoading(false);
    }
  };

  const hasCar = (cars || []).length > 0;
  const car = hasCar ? cars[0] : null;

  const handleDeleteCar = async (carPlateNo) => {
    if (window.confirm("Are you sure you want to delete this car?")) {
      try {
        await removeCar(carPlateNo);
        alert("Car deleted successfully!");
        // Refresh list after deletion
        await refreshCars();
        await fetchProfile();
      } catch (error) {
        console.error(error);
        alert("Failed to delete car. Please try again.");
      }
    }
  };

  const handleLogout = () => logout();
  const handleBackToHome = () => navigate("/home");

  const showLoading = loading || !initialized;

  return (
    <div className="page-wrapper">
      <div className="car-management-container">
        <header className="car-management-header">
          <div className="header-content">
            <div className="header-left">
              <button onClick={handleBackToHome} className="back-button">
                ← Back to Home
              </button>
              <h1 className="page-title">My Car & Wallet</h1>
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

        <main
          className={`car-management-main ${hasCar ? "single-car-mode" : ""}`}
        >
          {/* {!hasCar && !showLoading && (
          <div className="car-list-actions">
            <Link to="/cars/add" className="add-car-button">
              <span className="add-icon">+</span>
              Add New Car
            </Link>
          </div>
        )} */}

          <div className="wallet-container">
            <div className="wallet-card-enhanced">
              {/* <div className="wallet-background">
                <div className="wallet-pattern"></div>
              </div> */}
              <div className="wallet-content">
                <div className="wallet-info">
                  <div className="wallet-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                    </svg>
                  </div>
                  <div className="wallet-details">
                    <h2 className="wallet-title">Wallet Balance</h2>
                    <div className="wallet-balance">
                      RM {Number(walletBalance || 0).toFixed(2)}
                    </div>
                    <p className="wallet-subtitle">
                      Available for parking payments
                    </p>
                  </div>
                </div>
                <div className="wallet-actions">
                  <button
                    className="reload-wallet-btn"
                    onClick={handleReload}
                    disabled={walletLoading}
                  >
                    {walletLoading ? (
                      <span className="loading-spinner-small"></span>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="reload-icon"
                      >
                        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                      </svg>
                    )}
                    Reload Wallet
                  </button>
                </div>
              </div>
            </div>
          </div>

          {showLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading your car...</p>
            </div>
          ) : !hasCar ? (
            <div className="empty-state">
              <div className="empty-icon">🚗</div>
              <h3>No car registered yet</h3>
              <p>Add your car to manage your parking experience</p>
              <Link to="/cars/add" className="add-car-button-primary">
                Add Your Car
              </Link>
            </div>
          ) : (
            <div className="single-car-wrapper">
              {/* Wallet card sourced from /auth/profile */}
              {/* <div className="wallet-card">
                <div className="wallet-left">
                  <div className="wallet-title">Wallet Balance</div>
                  <div className="wallet-amount">
                    RM {Number(walletBalance || 0).toFixed(2)}
                  </div>
                </div>
                <div className="wallet-actions">
                  <button
                    className="reload-button"
                    onClick={handleReload}
                    disabled={walletLoading}
                    title="Reload wallet (database-backed)"
                  >
                    {walletLoading ? "Reloading..." : "Reload"}
                  </button>
                </div>
              </div> */}

              {/* Car card */}
              <div className="car-card car-card-single">
                <div className="car-card-header">
                  <h3 className="car-title">
                    {car.make || "—"} {car.model || ""}
                  </h3>
                  {car.year ? (
                    <span className="car-year">{car.year}</span>
                  ) : null}
                </div>

                <div className="car-details">
                  <div className="car-plate large-plate">
                    <span className="plate-label">Car Plate:</span>
                    <span className="plate-number">{car.carPlateNo}</span>
                  </div>

                  <div className="car-info">
                    <div className="info-item">
                      <span className="info-label">Color:</span>
                      <span className="info-value">{car.color || "—"}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Type:</span>
                      <span className="info-value">{car.type || "—"}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Registered:</span>
                      <span className="info-value">
                        {car.registeredAt
                          ? new Date(car.registeredAt).toLocaleString()
                          : "—"}
                      </span>
                    </div>
                  </div>

                  {car.description ? (
                    <div className="car-notes">
                      <span className="info-label">Notes:</span>
                      <p className="info-value">{car.description}</p>
                    </div>
                  ) : null}
                </div>

                <div className="car-actions">
                  <Link
                    to={`/cars/${encodeURIComponent(car.carPlateNo)}`}
                    className="view-details-button"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleDeleteCar(car.carPlateNo)}
                    className="delete-button"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CarList;
