import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCars } from "../contexts/CarContext";
import { useParking } from "../contexts/ParkingContext";
import "./ParkingComponents.css";

const ParkingManagement = () => {
  const { user, logout } = useAuth();
  const { cars, loading: carsLoading, deleteCar } = useCars();
  const {
    getParkingSlot,
    updateParkingSlot,
    loading: parkingLoading,
  } = useParking();
  const navigate = useNavigate();
  const [editingSlot, setEditingSlot] = useState(null);
  const [newSlotNumber, setNewSlotNumber] = useState("");

  const handleLogout = () => {
    logout();
  };

  const handleBackToHome = () => {
    navigate("/home");
  };

  const handleDeleteCar = async (carId) => {
    if (window.confirm("Are you sure you want to delete this car?")) {
      try {
        await deleteCar(carId);
        alert("Car deleted successfully!");
      } catch (error) {
        alert("Failed to delete car. Please try again.");
      }
    }
  };

  const handleEditSlot = (carId, currentSlot) => {
    setEditingSlot(carId);
    setNewSlotNumber(currentSlot || "");
  };

  const handleSaveSlot = async (carId) => {
    try {
      await updateParkingSlot(carId, newSlotNumber);
      setEditingSlot(null);
      setNewSlotNumber("");
      alert("Parking slot updated successfully!");
    } catch (error) {
      alert("Failed to update parking slot. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingSlot(null);
    setNewSlotNumber("");
  };

  const loading = carsLoading || parkingLoading;

  return (
    <div className="parking-management-container">
      <header className="parking-management-header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={handleBackToHome} className="back-button">
              ← Back to Home
            </button>
            <h1 className="page-title">Parking Management</h1>
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

      <main className="parking-management-main">
        <div className="parking-actions">
          <Link to="/cars/add" className="add-car-button">
            <span className="add-icon">+</span>
            Add New Car
          </Link>
          <div className="summary-info">
            <span className="car-count">Total Cars: {cars.length}</span>
            <span className="parked-count">
              Parked:{" "}
              {
                cars.filter((car) => car.parkingSlot || getParkingSlot(car.id))
                  .length
              }
            </span>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading parking information...</p>
          </div>
        ) : cars.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚗</div>
            <h3>No cars registered yet</h3>
            <p>Add your first car to start managing your parking</p>
            <Link to="/cars/add" className="add-car-button-primary">
              Add Your First Car
            </Link>
          </div>
        ) : (
          <div className="parking-grid">
            {cars.map((car) => {
              const parkingSlot =
                car.parkingSlot || getParkingSlot(car.id)?.slotNumber;
              const isEditing = editingSlot === car.id;

              return (
                <div key={car.id} className="parking-card">
                  <div className="parking-card-header">
                    <div className="car-info">
                      <h3 className="car-title">
                        {car.make} {car.model}
                      </h3>
                      <span className="car-plate">{car.plateNumber}</span>
                    </div>
                    <div className="parking-status">
                      {parkingSlot ? (
                        <span className="status-parked">🅿️ Parked</span>
                      ) : (
                        <span className="status-available">⭕ Available</span>
                      )}
                    </div>
                  </div>

                  <div className="parking-details">
                    <div className="detail-row">
                      <span className="detail-label">Car Details:</span>
                      <span className="detail-value">
                        {car.year} {car.color} {car.type}
                      </span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Parking Slot:</span>
                      {isEditing ? (
                        <div className="slot-edit-container">
                          <input
                            type="text"
                            value={newSlotNumber}
                            onChange={(e) => setNewSlotNumber(e.target.value)}
                            placeholder="Enter slot number (e.g., A12)"
                            className="slot-input"
                          />
                          <div className="slot-edit-actions">
                            <button
                              onClick={() => handleSaveSlot(car.id)}
                              className="save-btn"
                              disabled={!newSlotNumber.trim()}
                            >
                              ✓
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="cancel-btn"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="slot-display-container">
                          <span className="detail-value">
                            {parkingSlot || "Not assigned"}
                          </span>
                          <button
                            onClick={() => handleEditSlot(car.id, parkingSlot)}
                            className="edit-slot-btn"
                            title="Edit parking slot"
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="parking-actions-row">
                    <Link
                      to={`/cars/${car.id}`}
                      className="view-details-button"
                    >
                      View Details
                    </Link>
                    <Link to={`/cars/${car.id}`} className="edit-button">
                      Edit Car
                    </Link>
                    <button
                      onClick={() => handleDeleteCar(car.id)}
                      className="delete-button"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ParkingManagement;
