import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useVehicle } from "../contexts/VehicleContext";
import ParkingLayoutCanvas from "./ParkingLayoutCanvas";
import KonvaErrorBoundary from "./KonvaErrorBoundary";
import "./ParkingComponents.css";

const VehicleSlotManagement = () => {
  const { user } = useAuth();
  const { vehicles, loading, getVehiclesByUser, updateParkingLocation } =
    useVehicle();

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [savedSection, setSavedSection] = useState(null);
  const [savedSlot, setSavedSlot] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fetch once when userID changes
  useEffect(() => {
    const load = async () => {
      if (!user?.userID) return;
      const list = await getVehiclesByUser(user.userID);
      if (list.length > 0) {
        const v = list[0];
        setSelectedVehicle(v);
        setSavedSection(v.parkingSection ?? null);
        setSavedSlot(v.parkingSlot ?? null);
      }
    };
    load();
  }, [user?.userID, getVehiclesByUser]);

  const handleVehicleChange = (plate) => {
    const v = vehicles.find((x) => x.carPlateNo === plate);
    setSelectedVehicle(v || null);
    setSavedSection(v?.parkingSection || null);
    setSavedSlot(v?.parkingSlot || null);
    setSelectedSection(null);
    setSelectedSlot(null);
  };

  const handleSlotClick = (id) => {
    const [sec, num] = String(id).split("-");
    const slotNum = parseInt(num, 10);
    setSelectedSection(sec);
    setSelectedSlot(Number.isNaN(slotNum) ? null : slotNum);
  };

  const handleSave = async () => {
    if (!selectedVehicle || !selectedSection || selectedSlot == null) return;
    setSaving(true);
    try {
      await updateParkingLocation(
        user.userID,
        selectedVehicle.carPlateNo,
        selectedSection,
        selectedSlot
      );
      // Refetch the vehicles to get the updated parking location
      await getVehiclesByUser(user.userID);
      // Update saved slot state so highlight moves
      setSavedSection(selectedSection);
      setSavedSlot(selectedSlot);
      // Clear current selection (so it stops highlighting blue)
      setSelectedSection(null);
      setSelectedSlot(null);
      alert(
        `Saved: ${selectedVehicle.carPlateNo} → ${selectedSection}-${selectedSlot}`
      );
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to save location");
    } finally {
      setSaving(false);
    }
  };

  const savedId =
    savedSection && savedSlot != null ? `${savedSection}-${savedSlot}` : null;
  const selectedId =
    selectedSection && selectedSlot != null
      ? `${selectedSection}-${selectedSlot}`
      : null;

  return (
    <div className="parking-container">
      <header className="parking-header">
        <div className="header-content">
          <h1 className="page-title">Where I park ahh</h1>
          <div className="user-info">
            <span className="welcome-text">
              {user?.email || user?.userID || ""}
            </span>
          </div>
        </div>
      </header>

      <main className="parking-main">
        {/* Vehicle selector */}
        <div className="controls-card" style={{ marginBottom: 16 }}>
          <div className="controls-header">
            <h3>Vehicle's Details</h3>
          </div>
          {loading && <p>Loading…</p>}
          {!loading && vehicles.length === 0 && <p>No vehicles found.</p>}
          {!loading && vehicles.length > 0 && (
            <div className="vehicle-selector" style={{ marginTop: 8 }}>
              {/* if allow user has more than one vehicle */}
              {/* <label>
                Car Plate:&nbsp;
                <select
                  className="filter-select"
                  value={selectedVehicle?.carPlateNo || ""}
                  onChange={(e) => handleVehicleChange(e.target.value)}
                >
                  {vehicles.map((v) => (
                    <option key={v.carPlateNo} value={v.carPlateNo}>
                      {v.carPlateNo}
                    </option>
                  ))}
                </select>
              </label> */}
              <div style={{ marginTop: 8 }}>
                <strong>Car Plate:</strong> {selectedVehicle?.carPlateNo || ""}
              </div>
              <div style={{ marginTop: 8 }}>
                <strong>Saved location:</strong> {savedId || "None"}
              </div>
            </div>
          )}
        </div>

        {/* Konva layout */}
        <div className="enhanced-layout-section">
          <h3>Tap a slot to select</h3>
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
                  style={{ backgroundColor: "#cfc61f" }}
                ></div>
                <span>Current</span>
              </div>
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: "#667eea" }}
                ></div>
                <span>Selected</span>
              </div>
            </div>
          </div>
          <KonvaErrorBoundary>
            <ParkingLayoutCanvas
              slots={[]}
              currentSlot={savedId} // yellow highlight for saved slot
              selectedSlot={selectedId} // blue highlight for current selection
              onSlotClick={handleSlotClick}
              onSlotHover={() => {}}
              editable={true}
              width={900}
              height={650}
              staffMode={false}
              showBulkActions={false}
            />
            {selectedId && (
              <div className="slot-info-display" style={{ marginTop: 8 }}>
                <div className="selected-slot-info">
                  <strong>Selected:</strong> {selectedId}
                </div>
              </div>
            )}
          </KonvaErrorBoundary>
        </div>

        <div className="slot-actions" style={{ marginTop: 16 }}>
          <div className="slot-actions-card">
            <button
              className="confirm-slot-btn"
              disabled={
                !selectedVehicle ||
                !selectedSection ||
                selectedSlot == null ||
                (selectedSlot === savedSlot &&
                  selectedSection === savedSection) ||
                saving
              }
              onClick={handleSave}
            >
              {saving ? "Saving…" : "Save Location"}
            </button>
          </div>
        </div>

        <div className="instructions-section">
          <div
            className="instructions-card"
            style={{
              background: "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)",
              borderLeftColor: "#28a745",
            }}
          >
            <h4>ℹ️ Notes</h4>
            <ul>
              <li>
                This page records your parking spot for personal reference.
              </li>
              <li>
                Saved location shows in yellow; your current selection shows in
                blue.
              </li>
              <li>
                After saving, the data is refetched so the new saved slot
                appears immediately.
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VehicleSlotManagement;
