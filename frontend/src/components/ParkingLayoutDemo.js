import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import ParkingLayoutCanvas from "./ParkingLayoutCanvas";
import KonvaErrorBoundary from "./KonvaErrorBoundary";
import "./ParkingComponents.css";
import "./ParkingLayoutCanvas.css";

const API = (
  process.env.REACT_APP_API_URL || "http://localhost:3001/api"
).trim();

const ParkingLayoutDemo = () => {
  const { user } = useAuth(); // must provide user.id (userID) and optionally role
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]); // [{ carPlateNo, parkingSection, parkingSlot }]
  const [selectedPlate, setSelectedPlate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null); // "E-12"
  const [isEditing, setIsEditing] = useState(false);

  // fetch vehicles for this user
  useEffect(() => {
    const run = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        // const res = await fetch(
        //   `${API}/vehicles?userID=${encodeURIComponent(user.id)}`
        // );
        const res = await fetch(`${API}/vehicles/user/${user.userID}`);
        if (!res.ok) throw new Error("Failed to fetch vehicles");
        const items = await res.json();
        setVehicles(items || []);
        // pick first plate by default
        if (items?.length && !selectedPlate)
          setSelectedPlate(items[0].carPlateNo);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    run();
    // re-run if user changes
  }, [user?.id]); // eslint-disable-line

  const currentVehicle = useMemo(
    () => vehicles.find((v) => v.carPlateNo === selectedPlate) || null,
    [vehicles, selectedPlate]
  );

  // Compose current slot id from vehicle (e.g. "E-12"), or null if not set
  const currentSlot = useMemo(() => {
    if (!currentVehicle?.parkingSection || !currentVehicle?.parkingSlot)
      return null;
    return `${currentVehicle.parkingSection}-${currentVehicle.parkingSlot}`;
  }, [currentVehicle]);

  // All slots green: just pass an empty array or no statuses.
  // (ParkingLayoutCanvas defaults to "available" when no status found)
  const slots = useMemo(() => [], []);

  const handleSlotClick = (uniqueSlotId) => {
    if (!isEditing) return;
    setSelectedSlot(uniqueSlotId); // e.g. "N-13"
  };

  const handleStartEditing = () => {
    setIsEditing(true);
    setSelectedSlot(null);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setSelectedSlot(null);
  };

  const handleSave = async () => {
    if (!selectedPlate || !selectedSlot) return;
    const [parkingSection, rawNumber] = selectedSlot.split("-");
    const parkingSlot = Number(rawNumber);

    setLoading(true);
    try {
      const res = await fetch(`${API}/vehicles/user/${user.userID}/parking`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parkingSection, parkingSlot }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to update vehicle parking");
      }
      // optimistic local update
      setVehicles((prev) =>
        prev.map((v) =>
          v.carPlateNo === selectedPlate
            ? { ...v, parkingSection, parkingSlot }
            : v
        )
      );
      setIsEditing(false);
      setSelectedSlot(null);
      alert(`Saved: ${selectedPlate} → ${parkingSection}-${parkingSlot}`);
    } catch (e) {
      console.error(e);
      alert("Failed to save parking location");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="parking-container">
      {/* Header */}
      <header className="parking-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="page-title">Record My Parking Location</h1>
          </div>
          <div className="user-info">
            <span className="welcome-text">
              All slots are selectable (green)
            </span>
          </div>
        </div>
      </header>

      <main className="parking-main">
        {/* Vehicle selector & current info */}
        <div className="car-info-section">
          <div className="car-info-card">
            <div className="car-info-details">
              <h3 style={{ marginBottom: 8 }}>My Vehicles</h3>
              {loading && <p>Loading…</p>}
              {!loading && vehicles.length === 0 && (
                <p>No vehicles found for your account.</p>
              )}
              {vehicles.length > 0 && (
                <>
                  <label style={{ fontWeight: 600 }}>Car Plate</label>
                  <select
                    className="filter-select"
                    value={selectedPlate}
                    onChange={(e) => {
                      setSelectedPlate(e.target.value);
                      setSelectedSlot(null);
                      setIsEditing(false);
                    }}
                    style={{ marginTop: 6, marginBottom: 12, maxWidth: 260 }}
                  >
                    {vehicles.map((v) => (
                      <option key={v.carPlateNo} value={v.carPlateNo}>
                        {v.carPlateNo}
                      </option>
                    ))}
                  </select>

                  <div className="slot-info" style={{ marginTop: 6 }}>
                    <div className="slot-number-display">
                      {currentSlot || "None"}
                    </div>
                    <div className="slot-details">
                      <p>
                        Saved location:{" "}
                        {currentSlot ? currentSlot : "Not set yet"}
                      </p>
                      <button
                        onClick={handleStartEditing}
                        className="edit-slot-btn"
                      >
                        {currentSlot ? "Change Slot" : "Set Slot"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Konva Layout (all green) */}
        <div className="enhanced-layout-section">
          <h3>🗺️ Tap any slot to select</h3>
          <KonvaErrorBoundary>
            <ParkingLayoutCanvas
              slots={slots} // none = all green
              currentSlot={currentSlot} // highlights current (yellow)
              selectedSlot={isEditing ? selectedSlot : null} // blue preview
              onSlotClick={handleSlotClick}
              onSlotHover={() => {}}
              editable={isEditing}
              width={900}
              height={650}
              staffMode={false}
              showBulkActions={false}
            />
            {isEditing && (
              <div className="slot-info-display" style={{ marginTop: 8 }}>
                <div className="selected-slot-info">
                  <strong>Selected: </strong>
                  {selectedSlot || "None"}
                </div>
              </div>
            )}
          </KonvaErrorBoundary>
        </div>

        {/* Action buttons */}
        {isEditing && (
          <div className="slot-actions">
            <div className="slot-actions-card">
              <div className="selected-slot-info">
                <h4>
                  {selectedSlot
                    ? `Selected Slot: ${selectedSlot}`
                    : "Click a slot in the layout to select it"}
                </h4>
              </div>
              <div className="action-buttons">
                <button
                  onClick={handleSave}
                  disabled={!selectedSlot || !selectedPlate || loading}
                  className="confirm-slot-btn"
                >
                  Save Location
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

        {/* Tiny legend note so users know colors differ from the status page */}
        <div className="instructions-section">
          <div
            className="instructions-card"
            style={{
              background: "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)",
              borderLeftColor: "#28a745",
            }}
          >
            <h4>ℹ️ About this page</h4>
            <ul>
              <li>
                This page is only for saving your own parking location. All
                slots appear green and are selectable.
              </li>
              <li>
                The status/occupancy colors you see on the staff management page
                are intentionally not shown here.
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ParkingLayoutDemo;
