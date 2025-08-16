import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useParking } from '../contexts/ParkingContext';
import ParkingLayoutCanvas from './ParkingLayoutCanvas';
import KonvaErrorBoundary from './KonvaErrorBoundary';
import './ParkingComponents.css';
import './StaffParkingManagement.css';

const StaffParkingSlotManagement = () => {
  const { user, logout } = useAuth();
  const { getAllParkingSlots, updateSlotStatus, resetSlotToSensor, repairSensor, loading } = useParking();
  
  const [allSlots, setAllSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [editingSlot, setEditingSlot] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState(new Set());

  useEffect(() => {
    loadAllSlots();
  }, []);

  const loadAllSlots = async () => {
    try {
      const slots = await getAllParkingSlots();
      setAllSlots(slots || []);
    } catch (error) {
      console.error('Failed to load parking slots:', error);
    }
  };

  const handleSlotClick = (slotNumber) => {
    setSelectedSlot(slotNumber);
    const slot = allSlots.find(s => s.number === slotNumber);
    if (slot) {
      setEditingSlot(slotNumber);
      setNewStatus(slot.effectiveStatus);
    }
  };

  const handleSlotHover = (slotNumber, isHovering) => {
    if (isHovering) {
      setHoveredSlot(slotNumber);
    } else {
      setHoveredSlot(null);
    }
  };

  const handleStatusUpdate = async (slotNumber, status, overrideReason) => {
    try {
      // Update slot status via context (staff moderator control)
      await updateSlotStatus(slotNumber, status, overrideReason);
      
      // Reload slots to get updated data
      await loadAllSlots();
      
      setEditingSlot(null);
      setSelectedSlot(null);
      setNewStatus('');
      
      alert(`✅ Slot ${slotNumber} status changed to ${status} by staff moderator`);
    } catch (error) {
      console.error('Failed to update slot status:', error);
      alert('❌ Failed to update slot status. Please try again.');
    }
  };

  const handleResetToSensor = async (slotNumber) => {
    try {
      await resetSlotToSensor(slotNumber);
      await loadAllSlots();
      
      setEditingSlot(null);
      setSelectedSlot(null);
      setNewStatus('');
      
      alert(`Slot ${slotNumber} reset to sensor control`);
    } catch (error) {
      console.error('Failed to reset slot to sensor:', error);
      alert('Failed to reset slot to sensor. Please try again.');
    }
  };

  const handleRepairSensor = async (slotNumber) => {
    try {
      await repairSensor(slotNumber);
      await loadAllSlots();
      
      setEditingSlot(null);
      setSelectedSlot(null);
      setNewStatus('');
      
      alert(`Sensor ${slotNumber} repaired successfully`);
    } catch (error) {
      console.error('Failed to repair sensor:', error);
      alert('Failed to repair sensor. Please try again.');
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    if (selectedSlots.size === 0) {
      alert('Please select slots to update');
      return;
    }

    try {
      // Update all selected slots with bulk action reason
      const promises = Array.from(selectedSlots).map(slotNumber => 
        updateSlotStatus(slotNumber, status, 'bulk_action')
      );
      
      await Promise.all(promises);
      
      // Reload all slots from context to get updated data
      await loadAllSlots();
      
      // Clear selections and exit bulk mode
      setSelectedSlots(new Set());
      setShowBulkActions(false);
      
      alert(`✅ Bulk update: ${selectedSlots.size} slots changed to ${status}`);
    } catch (error) {
      console.error('Failed to bulk update slot status:', error);
      alert('❌ Failed to update slot statuses. Please try again.');
    }
  };

  const handleLogout = () => {
    logout();
  };

  const getSlotInfo = (slotNumber) => {
    return allSlots.find(s => s.number === slotNumber);
  };

  const getFilteredSlots = () => {
    return allSlots.filter(slot => {
      const matchesFilter = statusFilter === 'all' || slot.effectiveStatus === statusFilter;
      const matchesSearch = searchTerm === '' || 
        slot.number.toString().includes(searchTerm) ||
        (slot.section && slot.section.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  };

  const getStatusCounts = () => {
    return allSlots.reduce((counts, slot) => {
      const status = slot.effectiveStatus;
      counts[status] = (counts[status] || 0) + 1;
      counts.sensorErrors = (counts.sensorErrors || 0) + (slot.sensorHealth === 'malfunction' ? 1 : 0);
      counts.manualOverrides = (counts.manualOverrides || 0) + (slot.manualOverride ? 1 : 0);
      return counts;
    }, {});
  };

  const statusCounts = getStatusCounts();
  const filteredSlots = getFilteredSlots();

  return (
    <div className="parking-container">
      {/* Header */}
      <header className="parking-header staff-header">
        <div className="header-content">
          <div className="header-left">
            <Link to="/home" className="back-button">
              ← Back to Dashboard
            </Link>
            <h1 className="page-title">Staff Parking Slot Management</h1>
          </div>
          <div className="user-info">
            <span className="welcome-text">Staff: {user?.name || user?.email}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="parking-main">
        {/* Statistics Section */}
        <div className="staff-stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🅿️</div>
              <div className="stat-content">
                <div className="stat-number">{allSlots.length}</div>
                <div className="stat-label">Total Slots</div>
              </div>
            </div>
            <div className="stat-card available">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-number">{statusCounts.available || 0}</div>
                <div className="stat-label">Available Slots</div>
              </div>
            </div>
            <div className="stat-card occupied">
              <div className="stat-icon">🚗</div>
              <div className="stat-content">
                <div className="stat-number">{statusCounts.occupied || 0}</div>
                <div className="stat-label">Occupied Slots</div>
              </div>
            </div>
            <div className="stat-card maintenance">
              <div className="stat-icon">🔧</div>
              <div className="stat-content">
                <div className="stat-number">{statusCounts.maintenance || 0}</div>
                <div className="stat-label">Maintenance</div>
              </div>
            </div>
            <div className="stat-card sensor-error">
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <div className="stat-number">{statusCounts.sensorErrors || 0}</div>
                <div className="stat-label">Sensor Errors</div>
              </div>
            </div>
            <div className="stat-card manual-override">
              <div className="stat-icon">👤</div>
              <div className="stat-content">
                <div className="stat-number">{statusCounts.manualOverrides || 0}</div>
                <div className="stat-label">Staff Controlled</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="staff-controls-section">
          <div className="controls-card">
            <div className="controls-header">
              <h3>Slot Management Controls</h3>
              <div className="controls-actions">
                <button 
                  className={`bulk-toggle-btn ${showBulkActions ? 'active' : ''}`}
                  onClick={() => setShowBulkActions(!showBulkActions)}
                >
                  {showBulkActions ? 'Exit Bulk Mode' : 'Bulk Actions'}
                </button>
              </div>
            </div>
            
            <div className="controls-filters">
              <div className="filter-group">
                <label>Filter by Status:</label>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Statuses</option>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                  {/* <option value="reserved">Reserved</option> */}
                </select>
              </div>
              
              <div className="filter-group">
                <label>Search Slots:</label>
                <input
                  type="text"
                  placeholder="Search by slot number or section..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="filter-results">
                Showing {filteredSlots.length} of {allSlots.length} slots
              </div>
            </div>

            {showBulkActions && (
              <div className="bulk-actions">
                <div className="bulk-info">
                  {selectedSlots.size} slot(s) selected
                </div>
                <div className="bulk-buttons">
                  <button 
                    className="bulk-btn available"
                    onClick={() => handleBulkStatusUpdate('available')}
                    disabled={selectedSlots.size === 0}
                  >
                    Set Available
                  </button>
                  <button 
                    className="bulk-btn maintenance"
                    onClick={() => handleBulkStatusUpdate('maintenance')}
                    disabled={selectedSlots.size === 0}
                  >
                    Set Maintenance
                  </button>
                  <button 
                    className="bulk-btn occupied"
                    onClick={() => handleBulkStatusUpdate('occupied')}
                    disabled={selectedSlots.size === 0}
                  >
                    Set Occupied
                  </button>
                  <button 
                    className="bulk-clear-btn"
                    onClick={() => setSelectedSlots(new Set())}
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Parking Layout */}
        <div className="enhanced-layout-section">
          <h3>🎯 Interactive Parking Layout - Staff Mode</h3>
          <KonvaErrorBoundary>
            <ParkingLayoutCanvas
              slots={allSlots}
              currentSlot={null}
              selectedSlot={selectedSlot}
              onSlotClick={handleSlotClick}
              onSlotHover={handleSlotHover}
              editable={true}
              staffMode={true}
              showBulkActions={showBulkActions}
              selectedSlots={selectedSlots}
              onBulkSlotToggle={(slotNumber) => {
                setSelectedSlots(prev => {
                  const newSet = new Set(prev);
                  if (newSet.has(slotNumber)) {
                    newSet.delete(slotNumber);
                  } else {
                    newSet.add(slotNumber);
                  }
                  return newSet;
                });
              }}
            />
            
            {/* Slot Info Display */}
            {(hoveredSlot || selectedSlot) && (
              <div className="slot-info-display">
                {hoveredSlot && (
                  <div className="hovered-slot-info">
                    <strong>Slot {hoveredSlot} - Section {getSlotInfo(hoveredSlot)?.section}</strong>
                    <span className="slot-status">
                      Status: {getSlotInfo(hoveredSlot)?.effectiveStatus || 'Available'}
                    </span>
                    <span className="sensor-health">
                      Sensor: {getSlotInfo(hoveredSlot)?.sensorHealth}
                    </span>
                  </div>
                )}
                {selectedSlot && (
                  <div className="selected-slot-info">
                    <strong>Slot {selectedSlot} - Section {getSlotInfo(selectedSlot)?.section}</strong>
                    <span className="slot-status">
                      Current Status: {getSlotInfo(selectedSlot)?.effectiveStatus || 'Available'}
                    </span>
                    {getSlotInfo(selectedSlot)?.manualOverride && (
                      <span className="override-info">
                        👤 Staff Controlled
                      </span>
                    )}
                    <span className="last-updated">
                      Last Changed: {new Date(getSlotInfo(selectedSlot)?.lastUpdated || new Date()).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </KonvaErrorBoundary>
        </div>

        {/* Status Update Modal */}
        {editingSlot && (
          <div className="status-edit-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Change Status - Slot {editingSlot} (Section {getSlotInfo(editingSlot)?.section})</h3>
                <button 
                  className="modal-close"
                  onClick={() => {
                    setEditingSlot(null);
                    setSelectedSlot(null);
                    setNewStatus('');
                  }}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="current-info">
                  <div className="status-display">
                    <span className="current-status-label">Current Status:</span>
                    <span className={`current-status-value ${getSlotInfo(editingSlot)?.effectiveStatus}`}>
                      {getSlotInfo(editingSlot)?.effectiveStatus?.toUpperCase() || 'AVAILABLE'}
                    </span>
                  </div>
                  {getSlotInfo(editingSlot)?.manualOverride && (
                    <p className="override-warning"><strong>👤 Staff Controlled Slot</strong></p>
                  )}
                  <p className="last-update-info">
                    Last changed: {new Date(getSlotInfo(editingSlot)?.lastUpdated || new Date()).toLocaleString()}
                  </p>
                </div>
                
                <div className="status-options">
                  <label>🛠️ Staff Moderator Controls - Change Status To:</label>
                  <div className="status-buttons">
                    <button 
                      className={`status-btn available ${newStatus === 'available' ? 'selected' : ''}`}
                      onClick={() => setNewStatus('available')}
                      disabled={getSlotInfo(editingSlot)?.effectiveStatus === 'available'}
                    >
                      ✅ Available
                    </button>
                    <button 
                      className={`status-btn occupied ${newStatus === 'occupied' ? 'selected' : ''}`}
                      onClick={() => setNewStatus('occupied')}
                      disabled={getSlotInfo(editingSlot)?.effectiveStatus === 'occupied'}
                    >
                      🚗 Occupied
                    </button>
                    <button 
                      className={`status-btn maintenance ${newStatus === 'maintenance' ? 'selected' : ''}`}
                      onClick={() => setNewStatus('maintenance')}
                      disabled={getSlotInfo(editingSlot)?.effectiveStatus === 'maintenance'}
                    >
                      🔧 Maintenance
                    </button>
                  </div>
                  <p className="moderator-note">
                    ℹ️ As a staff moderator, you can change any slot to any status regardless of sensor readings.
                  </p>
                </div>

                {getSlotInfo(editingSlot)?.manualOverride && (
                  <div className="reset-option">
                    <button 
                      className="reset-sensor-btn"
                      onClick={() => handleResetToSensor(editingSlot)}
                    >
                      🔄 Reset to Automatic Control
                    </button>
                    <p className="reset-note">
                      Reset this slot to automatic sensor control (remove staff override)
                    </p>
                  </div>
                )}
              </div>
              
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setEditingSlot(null);
                    setSelectedSlot(null);
                    setNewStatus('');
                  }}
                >
                  Cancel
                </button>
                {newStatus && (
                  <button 
                    className="confirm-btn"
                    onClick={() => handleStatusUpdate(editingSlot, newStatus, 'staff_moderator')}
                    disabled={!newStatus || newStatus === getSlotInfo(editingSlot)?.effectiveStatus}
                  >
                    Change Status to {newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="instructions-section">
          <div className="instructions-card staff-instructions">
            <h4>👤 Staff Status Management</h4>
            <ul>
              <li>🎯 <strong>Status Only:</strong> Manage parking slot availability (available/occupied/maintenance)</li>
              <li>🖱️ <strong>Simple Control:</strong> Click any slot to change its status</li>
              <li>🔄 <strong>Any Transition:</strong> Change any status to any other status</li>
              <li>✅ <strong>Available:</strong> Slot is open for parking</li>
              <li>🚗 <strong>Occupied:</strong> Slot is currently in use</li>
              <li>🔧 <strong>Maintenance:</strong> Slot is temporarily out of service</li>
              <li>🟠 <strong>Staff Controlled:</strong> Orange borders show your manual changes</li>
              <li>📍 <strong>Location Focus:</strong> No vehicle details - just slot status</li>
            </ul>
            <div className="moderator-highlight">
              🎯 <strong>Focus on slot status management only - no vehicle or user information needed!</strong>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffParkingSlotManagement;
