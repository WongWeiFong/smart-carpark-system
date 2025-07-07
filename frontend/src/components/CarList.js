import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCars } from '../contexts/CarContext';
import './CarManagement.css';

const CarList = () => {
  const { user, logout } = useAuth();
  const { cars, loading, deleteCar } = useCars();
  const navigate = useNavigate();

  const handleDeleteCar = async (carId) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        await deleteCar(carId);
        alert('Car deleted successfully!');
      } catch (error) {
        alert('Failed to delete car. Please try again.');
      }
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  return (
    <div className="car-management-container">
      <header className="car-management-header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={handleBackToHome} className="back-button">
              ← Back to Home
            </button>
            <h1 className="page-title">My Cars</h1>
          </div>
          <div className="user-info">
            <span className="welcome-text">Welcome, {user?.name || user?.email}!</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <main className="car-management-main">
        <div className="car-list-actions">
          <Link to="/cars/add" className="add-car-button">
            <span className="add-icon">+</span>
            Add New Car
          </Link>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading cars...</p>
          </div>
        ) : cars.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚗</div>
            <h3>No cars registered yet</h3>
            <p>Add your first car to start managing your parking experience</p>
            <Link to="/cars/add" className="add-car-button-primary">
              Add Your First Car
            </Link>
          </div>
        ) : (
          <div className="car-grid">
            {cars.map((car) => (
              <div key={car.id} className="car-card">
                <div className="car-card-header">
                  <h3 className="car-title">{car.make} {car.model}</h3>
                  <span className="car-year">{car.year}</span>
                </div>
                
                <div className="car-details">
                  <div className="car-plate">
                    <span className="plate-label">Plate Number:</span>
                    <span className="plate-number">{car.plateNumber}</span>
                  </div>
                  
                  <div className="car-info">
                    <div className="info-item">
                      <span className="info-label">Color:</span>
                      <span className="info-value">{car.color}</span>
                    </div>
                    
                    <div className="info-item">
                      <span className="info-label">Type:</span>
                      <span className="info-value">{car.type}</span>
                    </div>
                  </div>
                </div>

                <div className="car-actions">
                  <Link 
                    to={`/cars/${car.id}`} 
                    className="view-details-button"
                  >
                    View Details
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
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CarList; 