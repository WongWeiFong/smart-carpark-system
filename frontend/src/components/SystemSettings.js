import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./ParkingComponents.css";

const SystemSettings = () => {
  const navigate = useNavigate();
  const { user, logout, isStaff } = useAuth();

  // Machine management state
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);

  // Entry/Exit tracking state
  const [entryExitLogs, setEntryExitLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filters, setFilters] = useState({
    area: "all",
    level: "all",
    number: "",
    type: "all", // all, entry (I), exit (O)
    dateFrom: "",
    dateTo: "",
  });

  // Parking rates state
  const [parkingRates, setParkingRates] = useState({});
  const [selectedDay, setSelectedDay] = useState("monday");
  const [isEditingRates, setIsEditingRates] = useState(false);

  const [activeTab, setActiveTab] = useState("machines"); // machines, logs, rates
  const [loading, setLoading] = useState(false);

  // Redirect non-staff users
  useEffect(() => {
    if (!isStaff()) {
      navigate("/home");
    }
  }, [isStaff, navigate]);

  // Initialize data on component mount
  useEffect(() => {
    loadMachinesData();
    loadEntryExitLogs();
    loadParkingRates();
  }, []);

  // Filter logs when filters change
  useEffect(() => {
    filterLogs();
  }, [filters, entryExitLogs]);

  const loadMachinesData = () => {
    // Load or initialize machine data
    const savedMachines = localStorage.getItem("parking_machines");
    if (savedMachines) {
      const parsedMachines = JSON.parse(savedMachines);
      // Add barrierStatus to existing machines if it doesn't exist
      const updatedMachines = parsedMachines.map((machine) => ({
        ...machine,
        barrierStatus: machine.barrierStatus || "down",
      }));
      setMachines(updatedMachines);
      // Update localStorage with the new structure
      localStorage.setItem("parking_machines", JSON.stringify(updatedMachines));
    } else {
      const defaultMachines = [
        {
          id: "A-1-ENTRY",
          type: "entry",
          area: "A",
          level: 1,
          location: "Main Entrance A",
          status: "automatic",
          active: true,
          barrierStatus: "down",
        },
        {
          id: "A-1-EXIT",
          type: "exit",
          area: "A",
          level: 1,
          location: "Main Exit A",
          status: "automatic",
          active: true,
          barrierStatus: "down",
        },
        {
          id: "B-1-ENTRY",
          type: "entry",
          area: "B",
          level: 1,
          location: "Entrance B-1",
          status: "automatic",
          active: true,
          barrierStatus: "down",
        },
        {
          id: "B-1-EXIT",
          type: "exit",
          area: "B",
          level: 1,
          location: "Exit B-1",
          status: "automatic",
          active: true,
          barrierStatus: "down",
        },
        {
          id: "B-2-ENTRY",
          type: "entry",
          area: "B",
          level: 2,
          location: "Entrance B-2",
          status: "automatic",
          active: true,
          barrierStatus: "down",
        },
        {
          id: "B-2-EXIT",
          type: "exit",
          area: "B",
          level: 2,
          location: "Exit B-2",
          status: "automatic",
          active: true,
          barrierStatus: "down",
        },
        // { id: 'C-1-ENTRY', type: 'entry', area: 'C', level: 1, location: 'Entrance C-1', status: 'automatic', active: true, barrierStatus: 'down' },
        // { id: 'C-1-EXIT', type: 'exit', area: 'C', level: 1, location: 'Exit C-1', status: 'automatic', active: true, barrierStatus: 'down' },
      ];
      setMachines(defaultMachines);
      localStorage.setItem("parking_machines", JSON.stringify(defaultMachines));
    }
  };

  const loadEntryExitLogs = () => {
    // Load or generate entry/exit logs
    const savedLogs = localStorage.getItem("entry_exit_logs");
    if (savedLogs) {
      setEntryExitLogs(JSON.parse(savedLogs));
    } else {
      const mockLogs = generateMockEntryExitLogs();
      setEntryExitLogs(mockLogs);
      localStorage.setItem("entry_exit_logs", JSON.stringify(mockLogs));
    }
  };

  const loadParkingRates = () => {
    // Load or initialize parking rates
    const savedRates = localStorage.getItem("parking_rates");
    if (savedRates) {
      setParkingRates(JSON.parse(savedRates));
    } else {
      const defaultRates = {
        monday: { hourly: 5.0, daily: 30.0, weekly: 150.0 },
        tuesday: { hourly: 5.0, daily: 30.0, weekly: 150.0 },
        wednesday: { hourly: 5.0, daily: 30.0, weekly: 150.0 },
        thursday: { hourly: 5.0, daily: 30.0, weekly: 150.0 },
        friday: { hourly: 6.0, daily: 35.0, weekly: 175.0 },
        saturday: { hourly: 8.0, daily: 40.0, weekly: 200.0 },
        sunday: { hourly: 8.0, daily: 40.0, weekly: 200.0 },
      };
      setParkingRates(defaultRates);
      localStorage.setItem("parking_rates", JSON.stringify(defaultRates));
    }
  };

  const generateMockEntryExitLogs = () => {
    const logs = [];
    const areas = ["A", "B"];
    const levels = [1, 2];
    // const areas = ['A', 'B', 'C'];
    // const levels = [1, 2, 3];
    const vehicleNumbers = ["ABC123", "XYZ789", "DEF456", "GHI789", "JKL012"];

    for (let i = 0; i < 50; i++) {
      const area = areas[Math.floor(Math.random() * areas.length)];
      const level = levels[Math.floor(Math.random() * levels.length)];
      const number = Math.floor(Math.random() * 50) + 1;
      const type = Math.random() > 0.5 ? "I" : "O";
      const vehicleNumber =
        vehicleNumbers[Math.floor(Math.random() * vehicleNumbers.length)];

      logs.push({
        id: `${area}-${level}-${number}${type}-${Date.now()}-${i}`,
        area,
        level,
        number,
        type,
        vehicleNumber,
        timestamp: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        machineId: `${area}-${level}-${type === "I" ? "ENTRY" : "EXIT"}`,
        status: "completed",
      });
    }

    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const filterLogs = () => {
    let filtered = [...entryExitLogs];

    if (filters.area !== "all") {
      filtered = filtered.filter((log) => log.area === filters.area);
    }

    if (filters.level !== "all") {
      filtered = filtered.filter(
        (log) => log.level === parseInt(filters.level)
      );
    }

    if (filters.number) {
      filtered = filtered.filter((log) =>
        log.number.toString().includes(filters.number)
      );
    }

    if (filters.type !== "all") {
      filtered = filtered.filter((log) => log.type === filters.type);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(
        (log) => new Date(log.timestamp) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(
        (log) =>
          new Date(log.timestamp) <= new Date(filters.dateTo + "T23:59:59")
      );
    }

    setFilteredLogs(filtered);
  };

  const handleMachineStatusChange = (machineId, newStatus) => {
    const updatedMachines = machines.map((machine) =>
      machine.id === machineId ? { ...machine, status: newStatus } : machine
    );
    setMachines(updatedMachines);
    localStorage.setItem("parking_machines", JSON.stringify(updatedMachines));
  };

  const handleMachineActiveChange = (machineId, active) => {
    const updatedMachines = machines.map((machine) =>
      machine.id === machineId ? { ...machine, active } : machine
    );
    setMachines(updatedMachines);
    localStorage.setItem("parking_machines", JSON.stringify(updatedMachines));
  };

  const handleBarrierToggle = (machineId) => {
    const machine = machines.find((m) => m.id === machineId);

    // Only allow barrier control in manual mode
    if (machine.status !== "manual") {
      alert("Barrier can only be controlled when machine is in manual mode.");
      return;
    }

    if (!machine.active) {
      alert("Cannot control barrier - machine is inactive.");
      return;
    }

    const updatedMachines = machines.map((m) =>
      m.id === machineId
        ? { ...m, barrierStatus: m.barrierStatus === "up" ? "down" : "up" }
        : m
    );
    setMachines(updatedMachines);
    localStorage.setItem("parking_machines", JSON.stringify(updatedMachines));
  };

  const handleRateChange = (day, type, value) => {
    setParkingRates((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: parseFloat(value) || 0,
      },
    }));
  };

  const saveRates = () => {
    localStorage.setItem("parking_rates", JSON.stringify(parkingRates));
    setIsEditingRates(false);
    alert("Parking rates updated successfully!");
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const getStatusIcon = (status) => {
    return status === "automatic" ? "🤖" : "👤";
  };

  const getTypeIcon = (type) => {
    return type === "entry" ? "🔽" : "🔼";
  };

  const getMachineStatusColor = (machine) => {
    if (!machine.active) return "#dc3545";
    if (machine.status === "automatic") return "#28a745";
    // Manual mode - color depends on barrier status
    return machine.barrierStatus === "up" ? "#dc3545" : "#ffc107";
  };

  const getMachineStatusText = (machine) => {
    if (!machine.active) return "OFF";
    if (machine.status === "automatic") return "AUTO";
    // Manual mode - show barrier status
    return machine.barrierStatus === "up" ? "BARRIER UP" : "BARRIER DOWN";
  };

  const getBarrierIcon = (barrierStatus) => {
    return barrierStatus === "up" ? "🚧" : "🟢";
  };

  return (
    <div className="system-settings-container">
      {/* Header */}
      <header className="system-settings-header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={() => navigate("/home")} className="back-button">
              ← Back to Dashboard
            </button>
            <h1 className="page-title">System Settings</h1>
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

      <main className="system-settings-main">
        {/* Navigation Tabs */}
        <div className="settings-tabs">
          <button
            className={`tab-button ${activeTab === "machines" ? "active" : ""}`}
            onClick={() => setActiveTab("machines")}
          >
            🔧 Machine Management
          </button>
          <button
            className={`tab-button ${activeTab === "logs" ? "active" : ""}`}
            onClick={() => setActiveTab("logs")}
          >
            📊 Entry/Exit Logs
          </button>
          <button
            className={`tab-button ${activeTab === "rates" ? "active" : ""}`}
            onClick={() => setActiveTab("rates")}
          >
            💰 Parking Rates
          </button>
        </div>

        {/* Machine Management Tab */}
        {activeTab === "machines" && (
          <div className="machines-section">
            <div className="section-header">
              <h2>Entry & Exit Machine Management</h2>
              <p>
                Control which entry and exit machines operate manually or
                automatically
              </p>
            </div>

            <div className="machines-grid">
              {machines.map((machine) => (
                <div key={machine.id} className="machine-card">
                  <div className="machine-header">
                    <div className="machine-info">
                      <h3>
                        {getTypeIcon(machine.type)} {machine.id}
                      </h3>
                      <p className="machine-location">{machine.location}</p>
                      <p className="machine-details">
                        Area {machine.area} - Level {machine.level}
                      </p>
                    </div>
                    <div
                      className="machine-status-indicator"
                      style={{
                        backgroundColor: getMachineStatusColor(machine),
                      }}
                    >
                      {getMachineStatusText(machine)}
                    </div>
                  </div>

                  <div className="machine-controls">
                    <div className="control-group">
                      <label>Status:</label>
                      <div className="radio-group">
                        <label className="radio-label">
                          <input
                            type="radio"
                            name={`${machine.id}-status`}
                            value="automatic"
                            checked={machine.status === "automatic"}
                            onChange={() =>
                              handleMachineStatusChange(machine.id, "automatic")
                            }
                            disabled={!machine.active}
                          />
                          🤖 Automatic
                        </label>
                        <label className="radio-label">
                          <input
                            type="radio"
                            name={`${machine.id}-status`}
                            value="manual"
                            checked={machine.status === "manual"}
                            onChange={() =>
                              handleMachineStatusChange(machine.id, "manual")
                            }
                            disabled={!machine.active}
                          />
                          👤 Manual
                        </label>
                      </div>
                    </div>

                    <div className="control-group">
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          checked={machine.active}
                          onChange={(e) =>
                            handleMachineActiveChange(
                              machine.id,
                              e.target.checked
                            )
                          }
                        />
                        <span className="toggle-text">Machine Active</span>
                      </label>
                    </div>

                    {/* Barrier Controls - Only available in manual mode */}
                    <div className="control-group">
                      <label>Barrier Control:</label>
                      <div className="barrier-controls">
                        <div className="barrier-status">
                          <span className="barrier-icon">
                            {getBarrierIcon(machine.barrierStatus)}
                          </span>
                          <span className="barrier-text">
                            Barrier{" "}
                            {machine.barrierStatus === "up" ? "UP" : "DOWN"}
                          </span>
                        </div>
                        <button
                          className={`barrier-btn ${
                            machine.barrierStatus === "up"
                              ? "lower-barrier"
                              : "raise-barrier"
                          }`}
                          onClick={() => handleBarrierToggle(machine.id)}
                          disabled={
                            !machine.active || machine.status === "automatic"
                          }
                          title={
                            machine.status === "automatic"
                              ? "Barrier control only available in manual mode"
                              : ""
                          }
                        >
                          {machine.barrierStatus === "up"
                            ? "⬇️ Lower Barrier"
                            : "⬆️ Raise Barrier"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Entry/Exit Logs Tab */}
        {activeTab === "logs" && (
          <div className="logs-section">
            <div className="section-header">
              <h2>Vehicle Entry & Exit Statement</h2>
              <p>Track all vehicle movements with detailed filtering options</p>
            </div>

            {/* Filters */}
            <div className="logs-filters">
              <div className="filter-row">
                <div className="filter-group">
                  <label>Area:</label>
                  <select
                    value={filters.area}
                    onChange={(e) =>
                      setFilters({ ...filters, area: e.target.value })
                    }
                  >
                    <option value="all">All Areas</option>
                    <option value="A">Area A</option>
                    <option value="B">Area B</option>
                    {/* <option value="C">Area C</option> */}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Level:</label>
                  <select
                    value={filters.level}
                    onChange={(e) =>
                      setFilters({ ...filters, level: e.target.value })
                    }
                  >
                    <option value="all">All Levels</option>
                    <option value="1">Level 1</option>
                    <option value="2">Level 2</option>
                    {/* <option value="3">Level 3</option> */}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Slot Number:</label>
                  <input
                    type="text"
                    placeholder="Enter number"
                    value={filters.number}
                    onChange={(e) =>
                      setFilters({ ...filters, number: e.target.value })
                    }
                  />
                </div>

                <div className="filter-group">
                  <label>Type:</label>
                  <select
                    value={filters.type}
                    onChange={(e) =>
                      setFilters({ ...filters, type: e.target.value })
                    }
                  >
                    <option value="all">All</option>
                    <option value="I">Entry (I)</option>
                    <option value="O">Exit (O)</option>
                  </select>
                </div>
              </div>

              <div className="filter-row">
                <div className="filter-group">
                  <label>From Date:</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      setFilters({ ...filters, dateFrom: e.target.value })
                    }
                  />
                </div>

                <div className="filter-group">
                  <label>To Date:</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) =>
                      setFilters({ ...filters, dateTo: e.target.value })
                    }
                  />
                </div>

                <div className="filter-group">
                  <button
                    className="clear-filters-btn"
                    onClick={() =>
                      setFilters({
                        area: "all",
                        level: "all",
                        number: "",
                        type: "all",
                        dateFrom: "",
                        dateTo: "",
                      })
                    }
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Logs Summary */}
            <div className="logs-summary">
              <div className="summary-item">
                <span className="summary-number">{filteredLogs.length}</span>
                <span className="summary-label">Total Records</span>
              </div>
              <div className="summary-item">
                <span className="summary-number">
                  {filteredLogs.filter((log) => log.type === "I").length}
                </span>
                <span className="summary-label">Entries</span>
              </div>
              <div className="summary-item">
                <span className="summary-number">
                  {filteredLogs.filter((log) => log.type === "O").length}
                </span>
                <span className="summary-label">Exits</span>
              </div>
            </div>

            {/* Logs Table */}
            <div className="logs-table-container">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Log ID</th>
                    <th>Vehicle Number</th>
                    <th>Area-Level-Number</th>
                    <th>Type</th>
                    <th>Machine</th>
                    <th>Timestamp</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="log-id">{log.id}</td>
                      <td className="vehicle-number">{log.vehicleNumber}</td>
                      <td className="location-id">
                        <span className="location-badge">
                          {log.area}-{log.level}-{log.number}
                          {log.type}
                        </span>
                      </td>
                      <td className="log-type">
                        <span
                          className={`type-badge ${
                            log.type === "I" ? "entry" : "exit"
                          }`}
                        >
                          {log.type === "I" ? "🔽 Entry" : "🔼 Exit"}
                        </span>
                      </td>
                      <td className="machine-id">{log.machineId}</td>
                      <td className="timestamp">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="status">
                        <span className="status-badge completed">
                          ✓ Completed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Parking Rates Tab */}
        {activeTab === "rates" && (
          <div className="rates-section">
            <div className="section-header">
              <h2>Parking Rates Management</h2>
              <p>Configure parking rates for different days of the week</p>
            </div>

            <div className="rates-controls">
              <div className="day-selector">
                <label>Select Day:</label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                >
                  <option value="monday">Monday</option>
                  <option value="tuesday">Tuesday</option>
                  <option value="wednesday">Wednesday</option>
                  <option value="thursday">Thursday</option>
                  <option value="friday">Friday</option>
                  <option value="saturday">Saturday</option>
                  <option value="sunday">Sunday</option>
                </select>
              </div>

              <div className="rates-actions">
                {!isEditingRates ? (
                  <button
                    className="edit-rates-btn"
                    onClick={() => setIsEditingRates(true)}
                  >
                    ✏️ Edit Rates
                  </button>
                ) : (
                  <div className="edit-actions">
                    <button className="save-rates-btn" onClick={saveRates}>
                      ✓ Save Changes
                    </button>
                    <button
                      className="cancel-edit-btn"
                      onClick={() => setIsEditingRates(false)}
                    >
                      ✕ Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="rates-grid">
              {Object.keys(parkingRates).map((day) => (
                <div
                  key={day}
                  className={`rate-card ${
                    day === selectedDay ? "selected" : ""
                  }`}
                >
                  <div className="rate-card-header">
                    <h3>{day.charAt(0).toUpperCase() + day.slice(1)}</h3>
                  </div>

                  <div className="rate-details">
                    <div className="rate-item">
                      <label>Hourly Rate:</label>
                      {isEditingRates && day === selectedDay ? (
                        <div className="rate-input-group">
                          <span>$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={parkingRates[day]?.hourly || ""}
                            onChange={(e) =>
                              handleRateChange(day, "hourly", e.target.value)
                            }
                          />
                        </div>
                      ) : (
                        <span className="rate-value">
                          ${parkingRates[day]?.hourly?.toFixed(2) || "0.00"}
                        </span>
                      )}
                    </div>

                    <div className="rate-item">
                      <label>Daily Rate:</label>
                      {isEditingRates && day === selectedDay ? (
                        <div className="rate-input-group">
                          <span>$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={parkingRates[day]?.daily || ""}
                            onChange={(e) =>
                              handleRateChange(day, "daily", e.target.value)
                            }
                          />
                        </div>
                      ) : (
                        <span className="rate-value">
                          ${parkingRates[day]?.daily?.toFixed(2) || "0.00"}
                        </span>
                      )}
                    </div>

                    <div className="rate-item">
                      <label>Weekly Rate:</label>
                      {isEditingRates && day === selectedDay ? (
                        <div className="rate-input-group">
                          <span>$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={parkingRates[day]?.weekly || ""}
                            onChange={(e) =>
                              handleRateChange(day, "weekly", e.target.value)
                            }
                          />
                        </div>
                      ) : (
                        <span className="rate-value">
                          ${parkingRates[day]?.weekly?.toFixed(2) || "0.00"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SystemSettings;
