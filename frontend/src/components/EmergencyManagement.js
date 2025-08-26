import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./ParkingComponents.css";

const EmergencyManagement = () => {
  const navigate = useNavigate();
  const { user, logout, isStaff } = useAuth();

  // Bollards state
  const [bollards, setBollards] = useState([]);

  // Doors state
  const [doors, setDoors] = useState([]);

  // Emergency state
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [emergencyLevel, setEmergencyLevel] = useState("normal"); // normal, warning, critical, lockdown

  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Redirect non-staff users
  useEffect(() => {
    if (!isStaff()) {
      navigate("/home");
    }
  }, [isStaff, navigate]);

  // Initialize emergency systems data
  useEffect(() => {
    loadEmergencySystemsData();
  }, []);

  const loadEmergencySystemsData = () => {
    // Load or initialize bollards data
    const savedBollards = localStorage.getItem("emergency_bollards");
    if (savedBollards) {
      setBollards(JSON.parse(savedBollards));
    } else {
      const defaultBollards = [
        {
          id: "A-1-MAIN",
          area: "A",
          level: 1,
          location: "Main Entry A-1",
          status: "lowered",
          type: "main_entry",
          active: true,
          emergencyOverride: false,
        },
        {
          id: "A-1-SEC",
          area: "A",
          level: 1,
          location: "Secondary Entry A-1",
          status: "lowered",
          type: "secondary",
          active: true,
          emergencyOverride: false,
        },
        {
          id: "B-1-MAIN",
          area: "B",
          level: 1,
          location: "Main Entry B-1",
          status: "lowered",
          type: "main_entry",
          active: true,
          emergencyOverride: false,
        },
        {
          id: "B-2-MAIN",
          area: "B",
          level: 2,
          location: "Main Entry B-2",
          status: "lowered",
          type: "main_entry",
          active: true,
          emergencyOverride: false,
        },
        {
          id: "B-2-SIDE",
          area: "B",
          level: 2,
          location: "Side Entry B-2",
          status: "lowered",
          type: "side_entry",
          active: true,
          emergencyOverride: false,
        },
        {
          id: "C-1-MAIN",
          area: "C",
          level: 1,
          location: "Main Entry C-1",
          status: "lowered",
          type: "main_entry",
          active: true,
          emergencyOverride: false,
        },
        {
          id: "C-1-EMRG",
          area: "C",
          level: 1,
          location: "Emergency Exit C-1",
          status: "lowered",
          type: "emergency_exit",
          active: true,
          emergencyOverride: false,
        },
        {
          id: "PERIMETER-N",
          area: "PERIMETER",
          level: 0,
          location: "North Perimeter",
          status: "lowered",
          type: "perimeter",
          active: true,
          emergencyOverride: false,
        },
        {
          id: "PERIMETER-S",
          area: "PERIMETER",
          level: 0,
          location: "South Perimeter",
          status: "lowered",
          type: "perimeter",
          active: true,
          emergencyOverride: false,
        },
      ];
      setBollards(defaultBollards);
      localStorage.setItem(
        "emergency_bollards",
        JSON.stringify(defaultBollards)
      );
    }

    // Load or initialize doors data
    const savedDoors = localStorage.getItem("emergency_doors");
    if (savedDoors) {
      setDoors(JSON.parse(savedDoors));
    } else {
      const defaultDoors = [
        {
          id: "MAIN-ENTRY",
          location: "Main Car Park Entry",
          status: "open",
          type: "main_entry",
          active: true,
          emergencyOverride: false,
        },
        {
          id: "MAIN-EXIT",
          location: "Main Car Park Exit",
          status: "open",
          type: "main_exit",
          active: true,
          emergencyOverride: false,
        },
        {
          id: "A-ENTRY",
          location: "Area A Entry Door",
          status: "open",
          type: "area_entry",
          area: "A",
          active: true,
          emergencyOverride: false,
        },
        {
          id: "A-EXIT",
          location: "Area A Exit Door",
          status: "open",
          type: "area_exit",
          area: "A",
          active: true,
          emergencyOverride: false,
        },
        {
          id: "B-ENTRY",
          location: "Area B Entry Door",
          status: "open",
          type: "area_entry",
          area: "B",
          active: true,
          emergencyOverride: false,
        },
        {
          id: "B-EXIT",
          location: "Area B Exit Door",
          status: "open",
          type: "area_exit",
          area: "B",
          active: true,
          emergencyOverride: false,
        },
        {
          id: "C-ENTRY",
          location: "Area C Entry Door",
          status: "open",
          type: "area_entry",
          area: "C",
          active: true,
          emergencyOverride: false,
        },
        {
          id: "C-EXIT",
          location: "Area C Exit Door",
          status: "open",
          type: "area_exit",
          area: "C",
          active: true,
          emergencyOverride: false,
        },
        {
          id: "EMERGENCY-EXIT-1",
          location: "Emergency Exit Door 1",
          status: "open",
          type: "emergency_exit",
          active: true,
          emergencyOverride: false,
        },
        {
          id: "EMERGENCY-EXIT-2",
          location: "Emergency Exit Door 2",
          status: "open",
          type: "emergency_exit",
          active: true,
          emergencyOverride: false,
        },
      ];
      setDoors(defaultDoors);
      localStorage.setItem("emergency_doors", JSON.stringify(defaultDoors));
    }

    // Load emergency mode status
    const savedEmergencyMode = localStorage.getItem("emergency_mode");
    if (savedEmergencyMode) {
      const emergencyData = JSON.parse(savedEmergencyMode);
      setEmergencyMode(emergencyData.active);
      setEmergencyLevel(emergencyData.level);
    }
  };

  const saveBollardsData = (newBollards) => {
    setBollards(newBollards);
    localStorage.setItem("emergency_bollards", JSON.stringify(newBollards));
    setLastUpdate(new Date());
  };

  const saveDoorsData = (newDoors) => {
    setDoors(newDoors);
    localStorage.setItem("emergency_doors", JSON.stringify(newDoors));
    setLastUpdate(new Date());
  };

  const saveEmergencyMode = (mode, level) => {
    setEmergencyMode(mode);
    setEmergencyLevel(level);
    localStorage.setItem(
      "emergency_mode",
      JSON.stringify({ active: mode, level: level })
    );
    setLastUpdate(new Date());
  };

  const handleBollardToggle = async (bollardId) => {
    if (emergencyMode && emergencyLevel === "lockdown") {
      alert(
        "Cannot modify bollards during emergency lockdown. Please disable lockdown first."
      );
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      const updatedBollards = bollards.map((bollard) =>
        bollard.id === bollardId
          ? {
              ...bollard,
              status: bollard.status === "raised" ? "lowered" : "raised",
            }
          : bollard
      );

      saveBollardsData(updatedBollards);
    } catch (error) {
      console.error("Error toggling bollard:", error);
      alert("Failed to toggle bollard. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDoorToggle = async (doorId) => {
    if (emergencyMode && emergencyLevel === "lockdown") {
      alert(
        "Cannot modify doors during emergency lockdown. Please disable lockdown first."
      );
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate API call

      const updatedDoors = doors.map((door) =>
        door.id === doorId
          ? { ...door, status: door.status === "open" ? "closed" : "open" }
          : door
      );

      saveDoorsData(updatedDoors);
    } catch (error) {
      console.error("Error toggling door:", error);
      alert("Failed to toggle door. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyLockdown = async () => {
    if (
      window.confirm(
        "Are you sure you want to activate EMERGENCY LOCKDOWN? This will raise all bollards and close all doors."
      )
    ) {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate emergency protocol

        // Raise all bollards
        const updatedBollards = bollards.map((bollard) => ({
          ...bollard,
          status: "raised",
          emergencyOverride: true,
        }));

        // Close all doors except emergency exits
        const updatedDoors = doors.map((door) => ({
          ...door,
          status: door.type === "emergency_exit" ? "open" : "closed",
          emergencyOverride: door.type !== "emergency_exit",
        }));

        saveBollardsData(updatedBollards);
        saveDoorsData(updatedDoors);
        saveEmergencyMode(true, "lockdown");

        alert("EMERGENCY LOCKDOWN ACTIVATED! All access points secured.");
      } catch (error) {
        console.error("Error activating emergency lockdown:", error);
        alert(
          "Failed to activate emergency lockdown. Please contact system administrator."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEmergencyEvacuation = async () => {
    if (
      window.confirm(
        "Are you sure you want to activate EMERGENCY EVACUATION? This will open all doors and lower critical bollards."
      )
    ) {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate emergency protocol

        // Lower emergency and main entry bollards only
        const updatedBollards = bollards.map((bollard) => ({
          ...bollard,
          status: ["emergency_exit", "main_entry"].includes(bollard.type)
            ? "lowered"
            : bollard.status,
          emergencyOverride: ["emergency_exit", "main_entry"].includes(
            bollard.type
          ),
        }));

        // Open all doors
        const updatedDoors = doors.map((door) => ({
          ...door,
          status: "open",
          emergencyOverride: true,
        }));

        saveBollardsData(updatedBollards);
        saveDoorsData(updatedDoors);
        saveEmergencyMode(true, "evacuation");

        alert(
          "EMERGENCY EVACUATION ACTIVATED! All exits opened for evacuation."
        );
      } catch (error) {
        console.error("Error activating emergency evacuation:", error);
        alert(
          "Failed to activate emergency evacuation. Please contact system administrator."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDisableEmergency = async () => {
    if (
      window.confirm(
        "Are you sure you want to disable emergency mode? This will restore normal operation."
      )
    ) {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate reset

        // Reset emergency overrides
        const updatedBollards = bollards.map((bollard) => ({
          ...bollard,
          emergencyOverride: false,
        }));

        const updatedDoors = doors.map((door) => ({
          ...door,
          emergencyOverride: false,
        }));

        saveBollardsData(updatedBollards);
        saveDoorsData(updatedDoors);
        saveEmergencyMode(false, "normal");

        alert("Emergency mode disabled. Normal operation restored.");
      } catch (error) {
        console.error("Error disabling emergency mode:", error);
        alert(
          "Failed to disable emergency mode. Please contact system administrator."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const getBollardIcon = (status) => {
    return status === "raised" ? "🔴" : "🟢";
  };

  const getDoorIcon = (status) => {
    return status === "open" ? "🚪" : "🚫";
  };

  const getBollardStatusColor = (bollard) => {
    if (bollard.emergencyOverride) return "#dc3545";
    return bollard.status === "raised" ? "#dc3545" : "#28a745";
  };

  const getDoorStatusColor = (door) => {
    if (door.emergencyOverride) return "#dc3545";
    return door.status === "open" ? "#28a745" : "#dc3545";
  };

  const getEmergencyLevelColor = (level) => {
    switch (level) {
      case "normal":
        return "#28a745";
      case "warning":
        return "#ffc107";
      case "critical":
        return "#fd7e14";
      case "lockdown":
        return "#dc3545";
      case "evacuation":
        return "#6f42c1";
      default:
        return "#6c757d";
    }
  };

  const groupBollardsByArea = () => {
    const grouped = {};
    bollards.forEach((bollard) => {
      if (!grouped[bollard.area]) {
        grouped[bollard.area] = [];
      }
      grouped[bollard.area].push(bollard);
    });
    return grouped;
  };

  const groupDoorsByType = () => {
    const grouped = {};
    doors.forEach((door) => {
      if (!grouped[door.type]) {
        grouped[door.type] = [];
      }
      grouped[door.type].push(door);
    });
    return grouped;
  };

  return (
    <div className="emergency-management-container">
      {/* Header */}
      <header className="emergency-header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={() => navigate("/home")} className="back-button">
              ← Back to Dashboard
            </button>
            <h1 className="page-title">🚨 Emergency Management</h1>
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

      <main className="emergency-main">
        {/* Emergency Status */}
        <div className="emergency-status-section">
          <div className="status-card">
            <div className="status-header">
              <h2>🛡️ Emergency Status</h2>
              <div
                className="status-indicator"
                style={{
                  backgroundColor: getEmergencyLevelColor(emergencyLevel),
                }}
              >
                {emergencyMode ? emergencyLevel.toUpperCase() : "NORMAL"}
              </div>
            </div>

            <div className="status-details">
              <div className="status-item">
                <span>Mode:</span>
                <span
                  className={`status-value ${
                    emergencyMode ? "emergency" : "normal"
                  }`}
                >
                  {emergencyMode ? "EMERGENCY ACTIVE" : "Normal Operation"}
                </span>
              </div>
              <div className="status-item">
                <span>Last Update:</span>
                <span className="status-value">
                  {lastUpdate.toLocaleString()}
                </span>
              </div>
              <div className="status-item">
                <span>Bollards Active:</span>
                <span className="status-value">
                  {bollards.filter((b) => b.status === "raised").length}/
                  {bollards.length}
                </span>
              </div>
              <div className="status-item">
                <span>Doors Closed:</span>
                <span className="status-value">
                  {doors.filter((d) => d.status === "closed").length}/
                  {doors.length}
                </span>
              </div>
            </div>
          </div>

          {/* Emergency Controls */}
          <div className="emergency-controls">
            <h3>🚨 Emergency Controls</h3>
            <div className="control-buttons">
              <button
                className="emergency-btn lockdown-btn"
                onClick={handleEmergencyLockdown}
                disabled={
                  loading || (emergencyMode && emergencyLevel === "lockdown")
                }
              >
                🔒 EMERGENCY LOCKDOWN
              </button>
              <button
                className="emergency-btn evacuation-btn"
                onClick={handleEmergencyEvacuation}
                disabled={
                  loading || (emergencyMode && emergencyLevel === "evacuation")
                }
              >
                🏃 EMERGENCY EVACUATION
              </button>
              {emergencyMode && (
                <button
                  className="emergency-btn disable-btn"
                  onClick={handleDisableEmergency}
                  disabled={loading}
                >
                  ✅ DISABLE EMERGENCY
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bollards Management */}
        <div className="bollards-section">
          <div className="section-header">
            <h2>⚫ Rising Bollards Control</h2>
            <p>Control vehicle access with rising bollards across all areas</p>
          </div>

          {Object.entries(groupBollardsByArea()).map(([area, areaBollards]) => (
            <div key={area} className="area-section">
              <h3>
                📍{" "}
                {area === "PERIMETER" ? "Perimeter Security" : `Area ${area}`}
              </h3>
              <div className="bollards-grid">
                {areaBollards.map((bollard) => (
                  <div key={bollard.id} className="bollard-card">
                    <div className="bollard-header">
                      <div className="bollard-info">
                        <h4>
                          {getBollardIcon(bollard.status)} {bollard.id}
                        </h4>
                        <p className="bollard-location">{bollard.location}</p>
                        <p className="bollard-type">
                          Type: {bollard.type.replace("_", " ").toUpperCase()}
                        </p>
                      </div>
                      <div
                        className="bollard-status-indicator"
                        style={{
                          backgroundColor: getBollardStatusColor(bollard),
                        }}
                      >
                        {bollard.status.toUpperCase()}
                      </div>
                    </div>

                    <div className="bollard-controls">
                      <button
                        className={`bollard-btn ${
                          bollard.status === "raised"
                            ? "lower-btn"
                            : "raise-btn"
                        }`}
                        onClick={() => handleBollardToggle(bollard.id)}
                        disabled={
                          loading ||
                          bollard.emergencyOverride ||
                          !bollard.active
                        }
                      >
                        {loading
                          ? "⏳"
                          : bollard.status === "raised"
                          ? "⬇️ LOWER"
                          : "⬆️ RAISE"}
                      </button>

                      {bollard.emergencyOverride && (
                        <span className="override-badge">
                          🚨 EMERGENCY OVERRIDE
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Doors Management */}
        <div className="doors-section">
          <div className="section-header">
            <h2>🚪 Car Park Doors Control</h2>
            <p>Control vehicle entry and exit doors to block or allow access</p>
          </div>

          {Object.entries(groupDoorsByType()).map(([type, typeDoors]) => (
            <div key={type} className="door-type-section">
              <h3>🏢 {type.replace("_", " ").toUpperCase()} DOORS</h3>
              <div className="doors-grid">
                {typeDoors.map((door) => (
                  <div key={door.id} className="door-card">
                    <div className="door-header">
                      <div className="door-info">
                        <h4>
                          {getDoorIcon(door.status)} {door.id}
                        </h4>
                        <p className="door-location">{door.location}</p>
                        <p className="door-type">
                          Type: {door.type.replace("_", " ").toUpperCase()}
                        </p>
                        {door.area && (
                          <p className="door-area">Area: {door.area}</p>
                        )}
                      </div>
                      <div
                        className="door-status-indicator"
                        style={{ backgroundColor: getDoorStatusColor(door) }}
                      >
                        {door.status.toUpperCase()}
                      </div>
                    </div>

                    <div className="door-controls">
                      <button
                        className={`door-btn ${
                          door.status === "open" ? "close-btn" : "open-btn"
                        }`}
                        onClick={() => handleDoorToggle(door.id)}
                        disabled={
                          loading || door.emergencyOverride || !door.active
                        }
                      >
                        {loading
                          ? "⏳"
                          : door.status === "open"
                          ? "🚫 CLOSE"
                          : "🚪 OPEN"}
                      </button>

                      {door.emergencyOverride && (
                        <span className="override-badge">
                          🚨 EMERGENCY OVERRIDE
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default EmergencyManagement;
