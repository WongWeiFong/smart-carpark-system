import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCars } from '../contexts/CarContext';
import { useParking } from '../contexts/ParkingContext';
import './CarManagement.css';

const CarDetails = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getCarById, updateCar, deleteCar, loading } = useCars();
  const { getBalance, getParkingSlot } = useParking();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const car = getCarById(carId);
  const balance = getBalance();
  const parkingSlot = getParkingSlot(carId);

  if (!car) {
    return (
      <div className="car-management-container">
        <div className="error-container">
          <h2>Car not found</h2>
          <p>The car you're looking for doesn't exist or has been deleted.</p>
          <Link to="/cars" className="back-button">Back to Car List</Link>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      make: car.make,
      model: car.model,
      year: car.year,
      color: car.color,
      plateNumber: car.plateNumber,
      type: car.type,
      description: car.description || ''
    });
  };

  const handleSave = async () => {
    try {
      await updateCar(carId, editData);
      setIsEditing(false);
      alert('Car updated successfully!');
    } catch (error) {
      alert('Failed to update car. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this car? This action cannot be undone.')) {
      try {
        await deleteCar(carId);
        alert('Car deleted successfully!');
        navigate('/cars');
      } catch (error) {
        alert('Failed to delete car. Please try again.');
      }
    }
  };

  const handleInputChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="car-management-container">
      <header className="car-management-header">
        <div className="header-content">
          <div className="header-left">
            <Link to="/cars" className="back-button">
              ← Back to Car List
            </Link>
            <h1 className="page-title">Car Details</h1>
          </div>
          <div className="user-info">
            <span className="welcome-text">Welcome, {user?.name || user?.email}!</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <main className="car-management-main">
        <div className="car-details-container">
          <div className="car-details-card">
            <div className="car-details-header">
              <div className="car-icon">🚗</div>
              <div className="car-title-section">
                {isEditing ? (
                  <div className="edit-title">
                    <input
                      type="text"
                      name="make"
                      value={editData.make}
                      onChange={handleInputChange}
                      placeholder="Make"
                      className="edit-input"
                    />
                    <input
                      type="text"
                      name="model"
                      value={editData.model}
                      onChange={handleInputChange}
                      placeholder="Model"
                      className="edit-input"
                    />
                    <input
                      type="number"
                      name="year"
                      value={editData.year}
                      onChange={handleInputChange}
                      placeholder="Year"
                      className="edit-input year-input"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="car-main-title">{car.make} {car.model}</h2>
                    <span className="car-year-badge">{car.year}</span>
                  </>
                )}
              </div>
            </div>

            <div className="car-details-body">
              <div className="detail-section">
                <h3>Vehicle Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Plate Number:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        name="plateNumber"
                        value={editData.plateNumber}
                        onChange={handleInputChange}
                        className="edit-input"
                      />
                    ) : (
                      <span className="detail-value plate-display">{car.plateNumber}</span>
                    )}
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Color:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        name="color"
                        value={editData.color}
                        onChange={handleInputChange}
                        className="edit-input"
                      />
                    ) : (
                      <span className="detail-value">{car.color}</span>
                    )}
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Type:</span>
                    {isEditing ? (
                      <select
                        name="type"
                        value={editData.type}
                        onChange={handleInputChange}
                        className="edit-input"
                      >
                        <option value="sedan">Sedan</option>
                        <option value="suv">SUV</option>
                        <option value="hatchback">Hatchback</option>
                        <option value="coupe">Coupe</option>
                        <option value="truck">Truck</option>
                        <option value="van">Van</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <span className="detail-value">{car.type}</span>
                    )}
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Registered:</span>
                    <span className="detail-value">
                      {new Date(car.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {(car.description || isEditing) && (
                <div className="detail-section">
                  <h3>Description</h3>
                  {isEditing ? (
                    <textarea
                      name="description"
                      value={editData.description}
                      onChange={handleInputChange}
                      placeholder="Add any additional notes about this car..."
                      className="edit-textarea"
                      rows="3"
                    />
                  ) : (
                    <p className="car-description">{car.description || 'No description available'}</p>
                  )}
                </div>
              )}

            {/* Balance and Parking Info Section */}
            <div className="detail-section">
              <h3>Account & Parking Info</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Balance Spent:</span>
                  <span className="detail-value balance-display">${balance.toFixed(2)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Current Parking Slot:</span>
                  <span className="detail-value">
                    {parkingSlot ? parkingSlot.slotNumber : 'Not assigned'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Section */}
            <div className="detail-section">
              <h3>Quick Actions</h3>
              <div className="quick-actions-grid">
                <Link 
                  to={`/cars/${carId}/history`} 
                  className="quick-action-button history-button"
                >
                  <span className="action-icon">📊</span>
                  <div className="action-content">
                    <span className="action-title">View History</span>
                    <span className="action-description">Entry/exit logs & balance</span>
                  </div>
                </Link>
                
                <Link 
                  to={`/cars/${carId}/parking-slot`} 
                  className="quick-action-button slot-button"
                >
                  <span className="action-icon">🅿️</span>
                  <div className="action-content">
                    <span className="action-title">Parking Slot</span>
                    <span className="action-description">Set location on minimap</span>
                  </div>
                </Link>
              </div>
            </div>
            
            </div>

            <div className="car-details-actions">
              {isEditing ? (
                <div className="edit-actions">
                  <button 
                    onClick={handleSave} 
                    className="save-button"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    onClick={handleCancel} 
                    className="cancel-button"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="view-actions">
                  <button onClick={handleEdit} className="edit-button">
                    Edit Details
                  </button>
                  <button 
                    onClick={handleDelete} 
                    className="delete-button"
                    disabled={loading}
                  >
                    Delete Car
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CarDetails; 