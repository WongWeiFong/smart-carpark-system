import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useVehicle } from "../contexts/VehicleContext";
import ParkingLayoutCanvas from "./ParkingLayoutCanvas";
import KonvaErrorBoundary from "./KonvaErrorBoundary";
import "./ParkingComponents.css";
import "./StaffParkingManagement.css";

const StaffVehicleSlotManagement = () => {
  const { user, logout } = useAuth();
  const { vehicles, loading, getVehiclesByUser, updateParkingLocation } =
    useVehicle();

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const [savedSection, setSavedSection] = useState(null);
  const [savedSlot, setSavedSlot] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fetch all users once on mount
  const API = (
    process.env.REACT_APP_API_URL || "http://localhost:3001/api"
  ).trim();

  // inside useEffect that loads users
  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch(`${API}/users`);
        const data = await res.json();
        setUsers(data || []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    }
    loadUsers();
  }, []);

  // When staff selects a user from dropdown
  const handleUserSelect = async (userObj) => {
    setSelectedUser(userObj);
    setSelectedVehicle(null);
    setSavedSection(null);
    setSavedSlot(null);
    setSelectedSection(null);
    setSelectedSlot(null);
    if (userObj?.userID) {
      // Fetch vehicles once for the selected user
      await getVehiclesByUser(userObj.userID);
    }
  };

  // When staff selects a vehicle (plate) for the current user
  const handleVehicleSelect = (plate) => {
    const v = vehicles.find((x) => x.carPlateNo === plate);
    setSelectedVehicle(v || null);
    setSavedSection(v?.parkingSection || null);
    setSavedSlot(v?.parkingSlot || null);
    setSelectedSection(null);
    setSelectedSlot(null);
  };

  // Canvas click: pick slot and parse "E-12" into section and number
  const handleSlotClick = (id) => {
    const [sec, num] = String(id).split("-");
    const slotNum = parseInt(num, 10);
    setSelectedSection(sec);
    setSelectedSlot(Number.isNaN(slotNum) ? null : slotNum);
  };

  // Save update, re-fetch vehicles, update saved slot state
  const handleSave = async () => {
    if (
      !selectedUser?.userID ||
      !selectedVehicle ||
      !selectedSection ||
      selectedSlot == null
    ) {
      return;
    }
    setSaving(true);
    try {
      await updateParkingLocation(
        selectedUser.userID,
        selectedVehicle.carPlateNo,
        selectedSection,
        selectedSlot
      );
      // refresh vehicles
      await getVehiclesByUser(selectedUser.userID);
      // update saved state
      setSavedSection(selectedSection);
      setSavedSlot(selectedSlot);
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

  // Filtered users for search
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.firstName?.toLowerCase().includes(term) ||
      u.lastName?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.userID?.toLowerCase().includes(term)
    );
  });

  const savedId =
    savedSection && savedSlot != null ? `${savedSection}-${savedSlot}` : null;
  const selectedId =
    selectedSection && selectedSlot != null
      ? `${selectedSection}-${selectedSlot}`
      : null;

  return (
    <div className="parking-container">
      <header className="parking-header staff-header">
        <div className="header-content">
          <div className="header-left">
            <Link to="/home" className="back-button">
              ← Back to Dashboard
            </Link>
            <h1 className="page-title">Staff Vehicle Slot Management</h1>
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
        {/* User search / select */}
        <div className="controls-card" style={{ marginBottom: 16 }}>
          <div className="controls-header">
            <h3>Select User</h3>
          </div>
          <input
            type="text"
            className="search-input"
            placeholder="Search user by name, email, or ID…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="filter-select"
            style={{ marginTop: 8 }}
            value={selectedUser?.userID || ""}
            onChange={(e) => {
              const u = users.find((x) => x.userID === e.target.value);
              handleUserSelect(u);
            }}
          >
            <option value="">— Choose User —</option>
            {filteredUsers.map((u) => (
              <option key={u.userID} value={u.userID}>
                {u.firstName || u.lastName || u.email || u.userID}
              </option>
            ))}
          </select>
          <div style={{ marginTop: 8 }}>
            <strong>Selected User's Details:</strong>{" "}
            {selectedUser?.firstName +
              " " +
              selectedUser?.lastName +
              ", " +
              selectedUser?.email +
              ", " +
              selectedUser?.userID}
          </div>
        </div>

        {/* Vehicle select */}
        {selectedUser && (
          <div className="controls-card" style={{ marginBottom: 16 }}>
            <div className="controls-header">
              <h3>Select Vehicle</h3>
            </div>
            {loading && <p>Loading vehicles…</p>}
            {!loading && vehicles.length === 0 && <p>No vehicles found.</p>}
            {!loading && vehicles.length > 0 && (
              <select
                className="filter-select"
                value={selectedVehicle?.carPlateNo || ""}
                onChange={(e) => handleVehicleSelect(e.target.value)}
              >
                <option value="">— Choose Vehicle —</option>
                {vehicles.map((v) => (
                  <option key={v.carPlateNo} value={v.carPlateNo}>
                    {v.carPlateNo}
                  </option>
                ))}
              </select>
            )}
            {selectedVehicle && (
              <div style={{ marginTop: 8 }}>
                <strong>Saved:</strong>{" "}
                {selectedVehicle.parkingSection
                  ? `${selectedVehicle.parkingSection}-${selectedVehicle.parkingSlot}`
                  : "None"}
              </div>
            )}
          </div>
        )}

        {/* Konva layout */}
        <div className="enhanced-layout-section">
          <h3>Tap a slot to select</h3>
          <KonvaErrorBoundary>
            <ParkingLayoutCanvas
              slots={[]} // empty => all green
              currentSlot={savedId} // yellow highlight (saved location)
              selectedSlot={selectedId} // blue highlight (in-progress)
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
                <strong>Selected:</strong> {selectedId}
              </div>
            )}
          </KonvaErrorBoundary>
        </div>

        {/* Action buttons */}
        <div className="slot-actions" style={{ marginTop: 16 }}>
          <div className="slot-actions-card">
            <button
              className="confirm-slot-btn"
              onClick={handleSave}
              disabled={
                !selectedUser ||
                !selectedVehicle ||
                !selectedSection ||
                selectedSlot == null ||
                saving
              }
            >
              {saving ? "Saving…" : "Save Location"}
            </button>
          </div>
        </div>

        {/* Explanation */}
        <div className="instructions-section">
          <div
            className="instructions-card"
            style={{
              background: "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)",
              borderLeftColor: "#28a745",
            }}
          >
            <h4>ℹ️ Instructions</h4>
            <ul>
              <li>Search or select a user from the dropdown.</li>
              <li>Select one of the user’s vehicles.</li>
              <li>
                Tap any slot on the layout to pick their parking location.
              </li>
              <li>Saved slots show in yellow; your selection shows in blue.</li>
              <li>After saving, data refreshes automatically.</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffVehicleSlotManagement;
