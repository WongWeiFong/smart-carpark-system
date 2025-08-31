// StaffParkingSlotManagement.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useParking } from "../contexts/ParkingContext";
import ParkingLayoutCanvas from "./ParkingLayoutCanvas";
import KonvaErrorBoundary from "./KonvaErrorBoundary";
import "./StaffParkingManagement.css";
import "./ParkingComponents.css";

const StaffParkingSlotManagement = () => {
  const { user, logout } = useAuth();
  const { getAllParkingSlots, updateSlotStatus, resetSlotToSensor } =
    useParking();

  const [allSlots, setAllSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [editingSlot, setEditingSlot] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState(new Set());

  const toLowerStatus = (s) => (s || "").toLowerCase();
  const title = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  // Build "E-2" from a slot object
  const toSlotId = (slot) => (slot ? `${slot.section}-${slot.number}` : "");

  // Map raw slots to what the canvas expects
  const toCanvasSlots = (slots) =>
    (slots || []).map((s) => {
      const eff = toLowerStatus(s.effectiveStatus || s.status || "available");
      // const staffControlled = (s.updatedBy || "System") === "Staff";
      return {
        number: toSlotId(s), // "E-2"
        status: eff, // used by canvas for colors
        effectiveStatus: eff,
        updatedBy: s.updatedBy || "System",
        staffControlled: s.updatedBy === "Staff", // drive orange border + reset visibility
      };
    });

  useEffect(() => {
    loadAllSlots();
    const id = setInterval(loadAllSlots, 10000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAllSlots = async () => {
    try {
      const slots = await getAllParkingSlots();
      setAllSlots(
        (slots || []).map((s) => ({
          ...s,
          effectiveStatus: toLowerStatus(
            s.effectiveStatus || s.status || "available"
          ),
          updatedBy: s.updatedBy || "System",
          staffControlled: (s.updatedBy || "System") === "Staff",
        }))
      );
    } catch (error) {
      console.error("Failed to load parking slots:", error);
    }
  };

  const getSlotInfo = (uniqueSlotId) =>
    allSlots.find(
      (s) =>
        `${s.section}-${s.number}` === uniqueSlotId || s.id === uniqueSlotId
    );

  const handleSlotClick = (uniqueSlotId) => {
    setSelectedSlot(uniqueSlotId);
    const slot = getSlotInfo(uniqueSlotId);
    if (slot) {
      setEditingSlot(uniqueSlotId);
      setNewStatus(toLowerStatus(slot.effectiveStatus));
    }
  };

  const handleSlotHover = (uniqueSlotId, isHovering) => {
    setHoveredSlot(isHovering ? uniqueSlotId : null);
  };

  const handleStatusUpdate = async (uniqueSlotId, status) => {
    try {
      await updateSlotStatus(uniqueSlotId, toLowerStatus(status));
      await loadAllSlots();
      setEditingSlot(null);
      setSelectedSlot(null);
      setNewStatus("");
      alert(
        `Status for ${uniqueSlotId} changed to ${title(toLowerStatus(status))}.`
      );
    } catch (error) {
      console.error("Failed to update slot status:", error);
      alert("Failed to update slot status. Please try again.");
    }
  };

  const handleResetToSensor = async (uniqueSlotId) => {
    try {
      await resetSlotToSensor(uniqueSlotId);
      await loadAllSlots();
      setEditingSlot(null);
      setSelectedSlot(null);
      setNewStatus("available");
      alert(`Slot ${uniqueSlotId} reset to automatic sensor control.`);
    } catch (error) {
      console.error("Failed to reset slot to sensor:", error);
      alert("Failed to reset slot to sensor. Please try again.");
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    if (selectedSlots.size === 0) {
      alert("Please select slots to update.");
      return;
    }
    try {
      const promises = Array.from(selectedSlots).map((uniqueSlotId) => {
        const slot = getSlotInfo(uniqueSlotId);
        return slot
          ? updateSlotStatus(uniqueSlotId, status, "bulk_action")
          : Promise.resolve();
      });
      await Promise.all(promises);
      await loadAllSlots();
      setSelectedSlots(new Set());
      setShowBulkActions(false);
      alert("Bulk update complete.");
    } catch (error) {
      console.error("Failed to bulk update slot status:", error);
      alert("Failed to update slot statuses. Please try again.");
    }
  };

  const getFilteredSlots = () => {
    return allSlots.filter((slot) => {
      const matchesFilter =
        statusFilter === "all" ||
        toLowerStatus(slot.effectiveStatus) === statusFilter;
      const matchesSearch =
        searchTerm === "" ||
        String(slot.number)?.toString().includes(searchTerm) ||
        (slot.section &&
          slot.section.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  };

  const getStatusCounts = () => {
    return allSlots.reduce(
      (counts, slot) => {
        const status = toLowerStatus(
          slot.effectiveStatus || slot.status || "available"
        );
        counts[status] = (counts[status] || 0) + 1;
        if ((slot.updatedBy || "System") === "Staff") {
          counts.staffControlled = (counts.staffControlled || 0) + 1;
        }
        return counts;
      },
      { staffControlled: 0 }
    );
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
            <span className="welcome-text">
              안녕하세요 {user?.role + " " + user?.staffName || "staff"}
            </span>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="parking-main">
        {/* Statistics section */}
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
                <div className="stat-label">Available</div>
              </div>
            </div>
            <div className="stat-card occupied">
              <div className="stat-icon">🚗</div>
              <div className="stat-content">
                <div className="stat-number">{statusCounts.occupied || 0}</div>
                <div className="stat-label">Occupied</div>
              </div>
            </div>
            <div className="stat-card maintenance">
              <div className="stat-icon">🔧</div>
              <div className="stat-content">
                <div className="stat-number">
                  {statusCounts.maintenance || 0}
                </div>
                <div className="stat-label">Maintenance</div>
              </div>
            </div>
            <div className="stat-card manual-override">
              <div className="stat-icon">👤</div>
              <div className="stat-content">
                <div className="stat-number">
                  {statusCounts.staffControlled || 0}
                </div>
                <div className="stat-label">Staff Controlled</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls section */}
        <div className="staff-controls-section">
          <div className="controls-card">
            <div className="controls-header">
              <h3>Slot Management Controls</h3>
              <div className="controls-actions">
                <button
                  className={`bulk-toggle-btn ${
                    showBulkActions ? "active" : ""
                  }`}
                  onClick={() => setShowBulkActions(!showBulkActions)}
                >
                  {showBulkActions ? "Exit Bulk Mode" : "Bulk Actions"}
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
                  <option value="all">All</option>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
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
                    onClick={() => handleBulkStatusUpdate("available")}
                    disabled={selectedSlots.size === 0}
                  >
                    Set Available
                  </button>
                  <button
                    className="bulk-btn maintenance"
                    onClick={() => handleBulkStatusUpdate("maintenance")}
                    disabled={selectedSlots.size === 0}
                  >
                    Set Maintenance
                  </button>
                  <button
                    className="bulk-btn occupied"
                    onClick={() => handleBulkStatusUpdate("occupied")}
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
              slots={toCanvasSlots(allSlots)}
              currentSlot={null}
              selectedSlot={selectedSlot}
              onSlotClick={handleSlotClick}
              onSlotHover={handleSlotHover}
              editable={true}
              width={900}
              height={650}
              staffMode={true}
              showBulkActions={showBulkActions}
              selectedSlots={selectedSlots}
              onBulkSlotToggle={(slotId) => {
                setSelectedSlots((prev) => {
                  const next = new Set(prev);
                  if (next.has(slotId)) next.delete(slotId);
                  else next.add(slotId);
                  return next;
                });
              }}
            />

            {(hoveredSlot || selectedSlot) && (
              <div className="slot-info-display">
                {hoveredSlot && (
                  <div className="hovered-slot-info">
                    <strong>
                      Slot {hoveredSlot} – Section{" "}
                      {getSlotInfo(hoveredSlot)?.section}
                    </strong>
                    <span className="slot-status">
                      Status:{" "}
                      {title(
                        getSlotInfo(hoveredSlot)?.effectiveStatus || "available"
                      )}
                    </span>
                    {getSlotInfo(hoveredSlot)?.staffControlled && (
                      <span className="override-info">👤 Staff Controlled</span>
                    )}
                  </div>
                )}
                {selectedSlot && (
                  <div className="selected-slot-info">
                    <strong>
                      Slot {selectedSlot} – Section{" "}
                      {getSlotInfo(selectedSlot)?.section}
                    </strong>
                    <span className="slot-status">
                      Current Status:{" "}
                      {title(
                        getSlotInfo(selectedSlot)?.effectiveStatus ||
                          "available"
                      )}
                    </span>
                    {getSlotInfo(selectedSlot)?.staffControlled && (
                      <span className="override-info">👤 Staff Controlled</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </KonvaErrorBoundary>
        </div>

        {/* Status update modal */}
        {editingSlot && (
          <div className="status-edit-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>
                  Change Status – Slot {editingSlot} (Section{" "}
                  {getSlotInfo(editingSlot)?.section})
                </h3>
                <button
                  className="modal-close"
                  onClick={() => {
                    setEditingSlot(null);
                    setSelectedSlot(null);
                    setNewStatus("");
                  }}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="current-info">
                  <div className="status-display">
                    <span className="current-status-label">
                      Current Status:
                    </span>
                    <span
                      className={`current-status-value ${
                        getSlotInfo(editingSlot)?.effectiveStatus || "available"
                      }`}
                    >
                      {title(
                        getSlotInfo(editingSlot)?.effectiveStatus || "available"
                      )}
                    </span>
                  </div>
                  {getSlotInfo(editingSlot)?.staffControlled && (
                    <p className="override-warning">
                      <strong>👤 Staff Controlled Slot</strong>
                    </p>
                  )}
                </div>

                <div className="status-options">
                  <label>🛠️ Staff Moderator Controls – Change Status To:</label>
                  <div className="status-buttons">
                    <button
                      className={`status-btn available ${
                        newStatus === "available" ? "selected" : ""
                      }`}
                      onClick={() => setNewStatus("available")}
                      disabled={
                        toLowerStatus(
                          getSlotInfo(editingSlot)?.effectiveStatus
                        ) === "available"
                      }
                    >
                      ✅ Available
                    </button>
                    <button
                      className={`status-btn occupied ${
                        newStatus === "occupied" ? "selected" : ""
                      }`}
                      onClick={() => setNewStatus("occupied")}
                      disabled={
                        toLowerStatus(
                          getSlotInfo(editingSlot)?.effectiveStatus
                        ) === "occupied"
                      }
                    >
                      🚗 Occupied
                    </button>
                    <button
                      className={`status-btn maintenance ${
                        newStatus === "maintenance" ? "selected" : ""
                      }`}
                      onClick={() => setNewStatus("maintenance")}
                      disabled={
                        toLowerStatus(
                          getSlotInfo(editingSlot)?.effectiveStatus
                        ) === "maintenance"
                      }
                    >
                      🔧 Maintenance
                    </button>
                  </div>
                  <p className="moderator-note">
                    ℹ️ You can change any slot status regardless of sensor
                    readings.
                  </p>
                </div>

                {getSlotInfo(editingSlot)?.staffControlled && (
                  <div className="reset-option">
                    <button
                      className="reset-sensor-btn"
                      onClick={() => {
                        setNewStatus("available");
                        handleResetToSensor(editingSlot, newStatus);
                      }}
                    >
                      🔄 Reset to Automatic Control
                    </button>
                    <p className="reset-note">This removes staff override.</p>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button
                  className="staff-cancel-btn"
                  onClick={() => {
                    setEditingSlot(null);
                    setSelectedSlot(null);
                    setNewStatus("");
                  }}
                >
                  Cancel
                </button>
                {newStatus && (
                  <button
                    className="confirm-btn"
                    onClick={() => handleStatusUpdate(editingSlot, newStatus)}
                    disabled={
                      !newStatus ||
                      toLowerStatus(newStatus) ===
                        toLowerStatus(getSlotInfo(editingSlot)?.effectiveStatus)
                    }
                  >
                    Change Status to {title(newStatus)}
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
              <li>
                🎯 <strong>Status Only:</strong> Manage slot status (available,
                occupied, maintenance).
              </li>
              <li>
                🖱️ <strong>Simple Control:</strong> Click any slot to change its
                status.
              </li>
              <li>
                🔄 <strong>Any Transition:</strong> Change any status to any
                other status.
              </li>
              <li>
                🟠 <strong>Staff Controlled:</strong> Orange borders show your
                manual changes.
              </li>
            </ul>
            <div className="moderator-highlight">
              🎯{" "}
              <strong>
                Focus on slot status management only – no vehicle or user info
                needed!
              </strong>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffParkingSlotManagement;
