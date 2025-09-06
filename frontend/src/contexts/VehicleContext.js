import React, { createContext, useContext, useState, useCallback } from "react";

// Create the context and hook
const VehicleContext = createContext();
export const useVehicle = () => {
  const ctx = useContext(VehicleContext);
  if (!ctx) throw new Error("useVehicle must be used within a VehicleProvider");
  return ctx;
};

export const VehicleProvider = ({ children }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Base URL (use REACT_APP_API_URL or fallback)
  const API = (
    process.env.REACT_APP_API_URL || "http://localhost:3001/api"
  ).trim();

  /**
   * Fetch vehicles for a given userID.
   * Wrap in useCallback so its reference is stable (prevents endless useEffect loops).
   */
  const getVehiclesByUser = useCallback(
    async (userID) => {
      if (!userID) return [];
      setLoading(true);
      try {
        const res = await fetch(
          `${API}/vehicles/by-user/${encodeURIComponent(userID)}`
        );
        if (!res.ok) {
          throw new Error(`Failed to fetch vehicles (HTTP ${res.status})`);
        }
        const data = await res.json();
        // Data may return { items: [...] } or { vehicle: {...} }
        let list = [];
        if (Array.isArray(data.items)) list = data.items;
        else if (data.vehicle) list = [data.vehicle];
        setVehicles(list);
        return list;
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [API]
  );

  /**
   * Update parking location for a vehicle.
   * Wrap in useCallback to avoid re-declaring it on each render.
   */
  const updateParkingLocation = useCallback(
    async (userID, carPlateNo, parkingSection, parkingSlot) => {
      if (!userID || !carPlateNo) {
        throw new Error("userID and carPlateNo are required");
      }
      if (
        !parkingSection ||
        parkingSlot === undefined ||
        parkingSlot === null
      ) {
        throw new Error("parkingSection and parkingSlot must be provided");
      }
      try {
        const res = await fetch(
          `${API}/vehicles/by-user/${encodeURIComponent(userID)}/parking`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ parkingSection, parkingSlot }),
          }
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to update parking location");
        }
        // Update local state
        setVehicles((prev) =>
          prev.map((v) =>
            v.carPlateNo === carPlateNo
              ? { ...v, parkingSection, parkingSlot }
              : v
          )
        );
        return data;
      } catch (err) {
        console.error("Error updating parking location:", err);
        throw err;
      }
    },
    [API]
  );

  return (
    <VehicleContext.Provider
      value={{ vehicles, loading, getVehiclesByUser, updateParkingLocation }}
    >
      {children}
    </VehicleContext.Provider>
  );
};
