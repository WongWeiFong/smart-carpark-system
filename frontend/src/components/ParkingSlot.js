import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useParking } from "../contexts/ParkingContext";
import ParkingLayoutCanvas from "./ParkingLayoutCanvas";
import KonvaErrorBoundary from "./KonvaErrorBoundary";
import "./ParkingComponents.css";
import "./StaffParkingManagement.css";

const ParkingSlot = () => {
  const { user, logout } = useAuth();
  const { getAllParkingSlots } = useParking();

  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [hoveredSlot, setHoveredSlot] = useState(null);

  // Helper to build a unique ID like "E-2" from a slot object
  const toSlotId = (slot) => {
    if (!slot) return "";
    return `${slot.section}-${slot.number}`;
  };

  // Convert raw slots into the shape expected by ParkingLayoutCanvas
  const toCanvasSlots = (rawSlots) =>
    (rawSlots || []).map((s) => ({
      number: toSlotId(s),
      // Normalize status strings to lower case for consistent colouring
      status: (s.effectiveStatus || s.status || "available").toLowerCase(),
      effectiveStatus: (s.effectiveStatus || "").toLowerCase(),
      manualOverride: !!s.manualOverride,
    }));

  // Load parking slots on mount and poll every 10 seconds for updates
  useEffect(() => {
    const loadSlots = async () => {
      const data = await getAllParkingSlots();
      setSlots(data || []);
    };
    loadSlots();
    const intervalId = setInterval(loadSlots, 10000);
    return () => clearInterval(intervalId);
  }, [getAllParkingSlots]);

  // Compute status counts for display
  const statusCounts = slots.reduce((counts, slot) => {
    const key = (
      slot.effectiveStatus ||
      slot.status ||
      "available"
    ).toLowerCase();
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});

  return (
    <div className="parking-container">
      {/* Header */}
      <header className="parking-header">
        <div className="header-content">
          <div className="header-left">
            <Link to="/home" className="back-button">
              ← Back to Dashboard
            </Link>
            <h1 className="page-title">Parking Slot Overview</h1>
          </div>
          <div className="user-info">
            <span className="welcome-text">
              Welcome {user?.role ? `${user.role} ` : ""}
              {user?.staffName || user?.email || "User"}
            </span>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="parking-main">
        <div className="staff-stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🅿️</div>
              <div className="stat-content">
                <div className="stat-number">{slots.length}</div>
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
                <div className="stat-number">
                  {statusCounts.maintenance || 0}
                </div>
                <div className="stat-label">Maintenance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Parking Layout Canvas */}
        <div className="parking-layout-wrapper">
          {/* Legend */}
          <div className="parking-layout-canvas">
            <div className="canvas-legend">
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: "#28a745" }}
                ></div>
                <span>Available</span>
              </div>
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: "#dc3545" }}
                ></div>
                <span>Occupied</span>
              </div>
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: "#6c757d" }}
                ></div>
                <span>Maintenance</span>
              </div>
            </div>
          </div>
          <KonvaErrorBoundary>
            <ParkingLayoutCanvas
              slots={toCanvasSlots(slots)}
              currentSlot={null}
              selectedSlot={selectedSlot}
              onSlotClick={(id) => setSelectedSlot(id)}
              onSlotHover={(id, isHovering) =>
                setHoveredSlot(isHovering ? id : null)
              }
              editable={false}
              width={900}
              height={650}
              staffMode={false}
              showBulkActions={false}
              selectedSlots={new Set()}
              onBulkSlotToggle={() => {}}
            />

            {/* Slot Info Display */}
            {(hoveredSlot || selectedSlot) && (
              <div className="slot-info-display">
                {hoveredSlot && (
                  <div className="hovered-slot-info">
                    <strong>
                      Slot {hoveredSlot} – Section {hoveredSlot.split("-")[0]}
                    </strong>
                  </div>
                )}
                {selectedSlot && (
                  <div className="selected-slot-info">
                    <strong>
                      Slot {selectedSlot} – Section {selectedSlot.split("-")[0]}
                    </strong>
                  </div>
                )}
              </div>
            )}
          </KonvaErrorBoundary>
        </div>
      </main>
    </div>
  );
};

export default ParkingSlot;
