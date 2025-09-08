// src/pages/CarList.js
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCars } from "../contexts/CarContext";
import "./CarManagement.css";

const CarList = () => {
  const { user, logout } = useAuth();
  const { cars, loading, initialized, refreshCars, removeCar } = useCars();
  const navigate = useNavigate();

  // Fetch from DynamoDB via backend when page mounts / user changes
  useEffect(() => {
    if (user) {
      refreshCars();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const hasCar = (cars || []).length > 0;
  const car = hasCar ? cars[0] : null; // Only 1 car allowed

  const handleDeleteCar = async (carPlateNo) => {
    if (window.confirm("Are you sure you want to delete this car?")) {
      try {
        await removeCar(carPlateNo);
        alert("Car deleted successfully!");
        // Refresh list after deletion
        await refreshCars();
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
    <div className="car-management-container">
      <header className="car-management-header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={handleBackToHome} className="back-button">
              ← Back to Home
            </button>
            <h1 className="page-title">My Car</h1>
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
        {/* Add button only if no car */}
        {/* {!hasCar && !showLoading && (
        <div className="car-list-actions">
          <Link to="/cars/add" className="add-car-button">
            <span className="add-icon">+</span>
            Add New Car
          </Link>
        </div>
         )} */}

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
            <div className="car-card car-card-single">
              <div className="car-card-header">
                <h3 className="car-title">
                  {car.make || "—"} {car.model || ""}
                </h3>
                {car.year ? <span className="car-year">{car.year}</span> : null}
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
                  {(car.parkingSection || car.parkingSlot) && (
                    <div className="info-item">
                      <span className="info-label">Assigned Slot:</span>
                      <span className="info-value">
                        {car.parkingSection
                          ? `${car.parkingSection}${car.parkingSlot ?? ""}`
                          : car.parkingSlot || "—"}
                      </span>
                    </div>
                  )}
                </div>

                {car.description ? (
                  <div className="car-notes">
                    <span className="info-label">Notes:</span>
                    <p className="info-value">{car.description}</p>
                  </div>
                ) : null}
              </div>

              <div className="car-actions">
                {/* Optional details route */}
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
  );
};

export default CarList;
