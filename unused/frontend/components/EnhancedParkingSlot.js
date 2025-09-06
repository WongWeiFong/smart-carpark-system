import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../frontend/src/contexts/AuthContext";
import { useCars } from "../../../frontend/src/contexts/CarContext";
import { useParking } from "../../../frontend/src/contexts/ParkingContext";
import ParkingLayoutCanvas from "../../../frontend/src/components/ParkingLayoutCanvas";
import KonvaErrorBoundary from "../../../frontend/src/components/KonvaErrorBoundary";
import "./ParkingComponents.css";

const EnhancedParkingSlot = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getCarById } = useCars();
  const { getParkingSlot, updateParkingSlot, loading, getAllParkingSlots } =
    useParking();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [allSlots, setAllSlots] = useState([]);

  const car = getCarById(carId);
  const parkingSlot = getParkingSlot(carId);

  useEffect(() => {
    // Load all parking slots for the canvas
    const loadAllSlots = async () => {
      try {
        const slots = await getAllParkingSlots();
        setAllSlots(slots || []);
      } catch (error) {
        console.error("Failed to load parking slots:", error);
        // Generate mock data for demo
        const mockSlots = [];
        for (let i = 1; i <= 160; i++) {
          mockSlots.push({
            number: i,
            status: Math.random() > 0.7 ? "occupied" : "available",
          });
        }
        setAllSlots(mockSlots);
      }
    };
    loadAllSlots();
  }, [getAllParkingSlots]);

  useEffect(() => {
    if (parkingSlot) {
      // Extract slot number from the parking slot
      const slotNumber = parseInt(parkingSlot.slotNumber.replace(/[A-Z]/g, ""));
      setSelectedSlot(slotNumber);
    }
  }, [parkingSlot]);

  if (!car) {
    return (
      <div className="parking-container">
        <div className="parking-header">
          <div className="header-content">
            <div className="header-left">
              <Link to="/cars" className="back-button">
                ← Back to Cars
              </Link>
              <h1 className="page-title">Car Not Found</h1>
            </div>
          </div>
        </div>
        <div className="parking-main">
          <div className="error-container">
            <h2>Car not found</h2>
            <Link to="/cars" className="back-button">
              Back to Car List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSlotClick = (slotNumber) => {
    if (isEditing) {
      setSelectedSlot(slotNumber);
    }
  };

  const handleSlotHover = (slotNumber, isHovering) => {
    if (isHovering) {
      setHoveredSlot(slotNumber);
    } else {
      setHoveredSlot(null);
    }
  };

  const handleSubmitSlot = async () => {
    if (!selectedSlot) {
      alert("Please select a parking slot");
      return;
    }

    // Convert slot number back to section format (for compatibility)
    const section =
      selectedSlot <= 40
        ? "A"
        : selectedSlot <= 80
        ? "B"
        : selectedSlot <= 120
        ? "C"
        : "D";
    const number =
      selectedSlot <= 40
        ? selectedSlot
        : selectedSlot <= 80
        ? selectedSlot - 40
        : selectedSlot <= 120
        ? selectedSlot - 80
        : selectedSlot - 120;
    const fullSlotNumber = `${section}${number}`;

    try {
      await updateParkingSlot(carId, fullSlotNumber);
      setIsEditing(false);
      alert("Parking slot updated successfully!");
    } catch (error) {
      alert("Failed to update parking slot. Please try again.");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (parkingSlot) {
      const slotNumber = parseInt(parkingSlot.slotNumber.replace(/[A-Z]/g, ""));
      setSelectedSlot(slotNumber);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const getCurrentSlotNumber = () => {
    if (parkingSlot) {
      return parseInt(parkingSlot.slotNumber.replace(/[A-Z]/g, ""));
    }
    return null;
  };

  const handleFallbackToOldVersion = () => {
    navigate(`/cars/${carId}/parking-slot-old`);
  };

  return (
    <div className="parking-container">
      {/* Header */}
      <header className="parking-header">
        <div className="header-content">
          <div className="header-left">
            <Link to="/cars" className="back-button">
              ← Back to Cars
            </Link>
            <h1 className="page-title">Parking Slot Management</h1>
          </div>
          <div className="user-info">
            <span className="welcome-text">
              Welcome, {user?.name || user?.email}
            </span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="parking-main">
        {/* Car Info Section */}
        <div className="car-info-section">
          <div className="car-info-card">
            <div className="car-info-details">
              <h3>
                {car.make} {car.model} ({car.year})
              </h3>
              <p className="plate-number">{car.plateNumber}</p>
              <p>
                {car.color} {car.type}
              </p>
            </div>
          </div>
        </div>

        {/* Current Slot Section */}
        <div className="current-slot-section">
          <div className="current-slot-card">
            <h3>Current Parking Slot</h3>
            {parkingSlot ? (
              <div className="slot-info">
                <div className="slot-number-display">
                  {parkingSlot.slotNumber}
                </div>
                <div className="slot-details">
                  <p>Assigned to: {car.plateNumber}</p>
                  <button onClick={handleEdit} className="edit-slot-btn">
                    Change Slot
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

        {/* Enhanced Parking Layout with Konva.js */}
        <div className="enhanced-layout-section">
          <h3>Interactive Parking Layout</h3>
          <KonvaErrorBoundary
            showOldVersion={true}
            onFallbackClick={handleFallbackToOldVersion}
          >
            <ParkingLayoutCanvas
              slots={allSlots}
              currentSlot={getCurrentSlotNumber()}
              selectedSlot={isEditing ? selectedSlot : null}
              onSlotClick={handleSlotClick}
              onSlotHover={handleSlotHover}
              editable={isEditing}
              width={900}
              height={650}
            />

            {/* Slot Info Display */}
            {(hoveredSlot || selectedSlot) && (
              <div className="slot-info-display">
                {hoveredSlot && (
                  <div className="hovered-slot-info">
                    <strong>Hovered Slot:</strong> {hoveredSlot}
                    <span className="slot-status">
                      {allSlots.find((s) => s.number === hoveredSlot)?.status ||
                        "Available"}
                    </span>
                  </div>
                )}
                {isEditing && selectedSlot && (
                  <div className="selected-slot-info">
                    <strong>Selected Slot:</strong> {selectedSlot}
                    <span className="slot-status">
                      {allSlots.find((s) => s.number === selectedSlot)
                        ?.status || "Available"}
                    </span>
                  </div>
                )}
              </div>
            )}
          </KonvaErrorBoundary>
        </div>

        {/* Actions */}
        {isEditing && (
          <div className="slot-actions">
            <div className="slot-actions-card">
              <div className="selected-slot-info">
                <h4>
                  {selectedSlot
                    ? `Selected Slot: ${selectedSlot}`
                    : "Please select a parking slot"}
                </h4>
              </div>
              <div className="action-buttons">
                <button
                  onClick={handleSubmitSlot}
                  disabled={loading || !selectedSlot}
                  className="confirm-slot-btn"
                >
                  {loading ? "Updating..." : "Confirm Slot"}
                </button>
                <button onClick={handleCancel} className="cancel-slot-btn">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {isEditing && (
          <div className="instructions-section">
            <div className="instructions-card">
              <h4>📋 Instructions</h4>
              <ul>
                <li>
                  🖱️ Click on any available (white) parking slot to select it
                </li>
                <li>🔍 Use zoom controls to get a better view of the layout</li>
                <li>✅ Click "Confirm Slot" to assign the selected slot</li>
                <li>
                  🖱️ Enable "Pan Mode" to drag the layout for easier navigation
                </li>
                <li>🎯 Use the reset button to return to default view</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EnhancedParkingSlot;
