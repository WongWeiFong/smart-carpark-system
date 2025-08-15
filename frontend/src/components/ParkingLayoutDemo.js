import React, { useState, useEffect } from 'react';
import ParkingLayoutCanvas from './ParkingLayoutCanvas';
import KonvaErrorBoundary from './KonvaErrorBoundary';
import './ParkingLayoutCanvas.css';
import './ParkingComponents.css';

const ParkingLayoutDemo = () => {
  const [currentSlot, setCurrentSlot] = useState(15);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [allSlots, setAllSlots] = useState([]);

  useEffect(() => {
    // Generate demo parking data
    const mockSlots = [];
    for (let i = 1; i <= 160; i++) {
      const random = Math.random();
      let status = 'available';
      
      if (random > 0.8) status = 'occupied';
      else if (random > 0.75) status = 'reserved';
      else if (random > 0.73) status = 'maintenance';
      
      mockSlots.push({
        number: i,
        status: status
      });
    }
    setAllSlots(mockSlots);
  }, []);

  const handleSlotClick = (slotNumber) => {
    if (isEditing) {
      setSelectedSlot(slotNumber);
    }
  };

  const handleSlotHover = (slotNumber, isHovering) => {
    // Could add hover effects here
  };

  const handleStartEditing = () => {
    setIsEditing(true);
    setSelectedSlot(null);
  };

  const handleConfirmSlot = () => {
    if (selectedSlot) {
      setCurrentSlot(selectedSlot);
      setIsEditing(false);
      alert(`Parking slot ${selectedSlot} assigned successfully!`);
    }
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setSelectedSlot(null);
  };

  const getSlotStatusText = (slotNumber) => {
    const slot = allSlots.find(s => s.number === slotNumber);
    return slot ? slot.status : 'available';
  };

  return (
    <div className="parking-container">
      {/* Header */}
      <header className="parking-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="page-title">Konva.js Parking Layout Demo</h1>
          </div>
          <div className="user-info">
            <span className="welcome-text">Interactive Parking Management</span>
          </div>
        </div>
      </header>

      <main className="parking-main">
        {/* Demo Info */}
        <div className="car-info-section">
          <div className="car-info-card">
            <div className="car-info-details">
              <h3>Demo Vehicle: Toyota Camry (2023)</h3>
              <p className="plate-number">ABC-123</p>
              <p>Silver Sedan</p>
            </div>
          </div>
        </div>

        {/* Current Slot Section */}
        <div className="current-slot-section">
          <div className="current-slot-card">
            <h3>Current Parking Slot</h3>
            <div className="slot-info">
              <div className="slot-number-display">
                {currentSlot || 'None'}
              </div>
              <div className="slot-details">
                <p>Status: {currentSlot ? getSlotStatusText(currentSlot) : 'Unassigned'}</p>
                <button onClick={handleStartEditing} className="edit-slot-btn">
                  {currentSlot ? 'Change Slot' : 'Assign Slot'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Parking Layout */}
        <div className="enhanced-layout-section">
          <h3>🚗 Interactive Parking Layout with Konva.js</h3>
          <KonvaErrorBoundary>
            <ParkingLayoutCanvas
              slots={allSlots}
              currentSlot={currentSlot}
              selectedSlot={isEditing ? selectedSlot : null}
              onSlotClick={handleSlotClick}
              onSlotHover={handleSlotHover}
              editable={isEditing}
              width={900}
              height={650}
            />
            
            {/* Slot Status Display */}
            {selectedSlot && (
              <div className="slot-info-display">
                <div className="selected-slot-info">
                  <strong>Selected Slot:</strong> {selectedSlot}
                  <span className="slot-status" style={{
                    backgroundColor: getSlotStatusText(selectedSlot) === 'available' ? '#d4edda' : '#f8d7da',
                    color: getSlotStatusText(selectedSlot) === 'available' ? '#155724' : '#721c24'
                  }}>
                    {getSlotStatusText(selectedSlot)}
                  </span>
                </div>
              </div>
            )}
          </KonvaErrorBoundary>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="slot-actions">
            <div className="slot-actions-card">
              <div className="selected-slot-info">
                <h4>
                  {selectedSlot ? `Selected Slot: ${selectedSlot}` : 'Click on an available slot to select it'}
                </h4>
              </div>
              <div className="action-buttons">
                <button 
                  onClick={handleConfirmSlot}
                  disabled={!selectedSlot || getSlotStatusText(selectedSlot) !== 'available'}
                  className="confirm-slot-btn"
                >
                  Confirm Slot
                </button>
                <button 
                  onClick={handleCancelEditing}
                  className="cancel-slot-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Features Showcase */}
        <div className="instructions-section">
          <div className="instructions-card">
            <h4>🎯 Konva.js Features Demonstrated</h4>
            <ul>
              <li>🖱️ Interactive canvas with clickable parking slots</li>
              <li>🔍 Zoom in/out with mouse wheel or control buttons</li>
              <li>🖐️ Pan mode for dragging the layout around</li>
              <li>🎨 Real-time visual feedback with hover effects</li>
              <li>🏷️ Color-coded slot statuses (Available, Occupied, Reserved, etc.)</li>
              <li>📱 Responsive design that works on all screen sizes</li>
              <li>⚡ Smooth animations and transitions</li>
              <li>🎯 Reset view button to return to default position</li>
            </ul>
          </div>
        </div>

        {/* Technical Info */}
        <div className="instructions-section">
          <div className="instructions-card" style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', borderLeftColor: '#2196f3' }}>
            <h4>⚙️ Technical Implementation</h4>
            <ul>
              <li>🛠️ Built with React + Konva.js for 2D canvas rendering</li>
              <li>🎯 Uses react-konva for React integration</li>
              <li>🔧 Supports touch events for mobile devices</li>
              <li>💾 State management for slot selection and editing</li>
              <li>🎨 CSS-in-JS styling with responsive breakpoints</li>
              <li>🔄 Real-time updates and smooth user interactions</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ParkingLayoutDemo; 