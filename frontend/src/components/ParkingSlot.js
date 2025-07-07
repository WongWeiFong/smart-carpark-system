import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCars } from '../contexts/CarContext';
import { useParking } from '../contexts/ParkingContext';
import './ParkingComponents.css';

const ParkingSlot = () => {
  const { carId } = useParams();
  const { user, logout } = useAuth();
  const { getCarById } = useCars();
  const { getParkingSlot, updateParkingSlot, loading } = useParking();
  
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedSection, setSelectedSection] = useState('A');

  const car = getCarById(carId);
  const parkingSlot = getParkingSlot(carId);

  useEffect(() => {
    if (parkingSlot) {
      const section = parkingSlot.slotNumber.charAt(0);
      const number = parkingSlot.slotNumber.slice(1);
      setSelectedSection(section);
      setSelectedSlot(number);
    }
  }, [parkingSlot]);

  if (!car) {
    return (
      <div className="parking-container">
        <div className="error-container">
          <h2>Car not found</h2>
          <Link to="/cars" className="back-button">Back to Car List</Link>
        </div>
      </div>
    );
  }

  const handleSubmitSlot = async () => {
    if (!selectedSlot || !selectedSection) {
      alert('Please select a parking slot');
      return;
    }
    
    const fullSlotNumber = `${selectedSection}${selectedSlot}`;
    
    try {
      await updateParkingSlot(carId, fullSlotNumber);
      setIsEditing(false);
      alert('Parking slot updated successfully!');
    } catch (error) {
      alert('Failed to update parking slot. Please try again.');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (parkingSlot) {
      const section = parkingSlot.slotNumber.charAt(0);
      const number = parkingSlot.slotNumber.slice(1);
      setSelectedSection(section);
      setSelectedSlot(number);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Generate parking slots for each section
  const generateSlots = (section) => {
    const slots = [];
    for (let i = 1; i <= 50; i++) {
      const slotNumber = `${section}${i}`;
      const isSelected = selectedSection === section && selectedSlot === i.toString();
      const isCurrent = parkingSlot?.slotNumber === slotNumber;
      
      slots.push(
        <div
          key={slotNumber}
          className={`parking-slot ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''}`}
          onClick={() => {
            if (isEditing) {
              setSelectedSection(section);
              setSelectedSlot(i.toString());
            }
          }}
        >
          {i}
        </div>
      );
    }
    return slots;
  };

  const sections = ['A', 'B', 'C', 'D'];

  return (
    <div className="parking-container">
      <header className="parking-header">
        <div className="header-content">
          <div className="header-left">
            <Link to={`/cars/${carId}`} className="back-button">
              ← Back to Car Details
            </Link>
            <h1 className="page-title">Parking Slot</h1>
          </div>
          <div className="user-info">
            <span className="welcome-text">Welcome, {user?.name || user?.email}!</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <main className="parking-main">
        <div className="parking-slot-container">
          {/* Car Info Section */}
          <div className="car-info-section">
            <div className="car-info-card">
              <div className="car-icon">🚗</div>
              <div className="car-info-details">
                <h3>{car.make} {car.model}</h3>
                <p className="plate-number">{car.plateNumber}</p>
              </div>
            </div>
          </div>

          {/* Current Slot Info */}
          <div className="current-slot-section">
            <div className="current-slot-card">
              <h3>Current Parking Slot</h3>
              {parkingSlot ? (
                <div className="slot-info">
                  <div className="slot-number-display">
                    {parkingSlot.slotNumber}
                  </div>
                  <div className="slot-details">
                    <p>Last updated: {new Date(parkingSlot.updatedAt).toLocaleString()}</p>
                    <button onClick={handleEdit} className="edit-slot-btn">
                      Edit Slot
                    </button>
                  </div>
                </div>
              ) : (
                <div className="no-slot">
                  <p>No parking slot assigned yet</p>
                  <button onClick={handleEdit} className="add-slot-btn">
                    Set Parking Slot
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Minimap Section */}
          <div className="minimap-section">
            <h3>Carpark Layout</h3>
            <div className="minimap-container">
              <div className="minimap-legend">
                <div className="legend-item">
                  <div className="legend-color available"></div>
                  <span>Available</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color current"></div>
                  <span>Your Car</span>
                </div>
                {isEditing && (
                  <div className="legend-item">
                    <div className="legend-color selected"></div>
                    <span>Selected</span>
                  </div>
                )}
              </div>

              <div className="minimap">
                {/* Entrance */}
                <div className="entrance-section">
                  <div className="entrance-label">🚪 Entrance</div>
                </div>

                {/* Parking Sections */}
                <div className="parking-sections">
                  {sections.map((section) => (
                    <div key={section} className="section">
                      <div className="section-header">
                        <h4>Section {section}</h4>
                      </div>
                      <div className="section-slots">
                        {generateSlots(section)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Exit */}
                <div className="exit-section">
                  <div className="exit-label">🚪 Exit</div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {isEditing && (
            <div className="slot-actions">
              <div className="slot-actions-card">
                <div className="selected-slot-info">
                  <h4>Selected Slot: {selectedSection}{selectedSlot}</h4>
                </div>
                <div className="action-buttons">
                  <button 
                    onClick={handleSubmitSlot}
                    disabled={loading || !selectedSlot}
                    className="confirm-slot-btn"
                  >
                    {loading ? 'Updating...' : 'Confirm Slot'}
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="cancel-slot-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ParkingSlot; 