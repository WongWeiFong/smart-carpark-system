// src/contexts/CarContext.js
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

const CarContext = createContext();

export const useCars = () => {
  const ctx = useContext(CarContext);
  if (!ctx) throw new Error("useCars must be used within a CarProvider");
  return ctx;
};

export const CarProvider = ({ children }) => {
  const { user } = useAuth();
  const [cars, setCars] = useState([]); // Array of vehicle records
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Use same API pattern as ParkingContext
  const API = useMemo(
    () => (process.env.REACT_APP_API_URL || "http://localhost:3001/api").trim(),
    []
  );

  const storageKey = user ? `vehicles_${user.email}` : null;

  // Load from localStorage instantly when user changes
  useEffect(() => {
    if (!user) {
      setCars([]);
      setInitialized(false);
      return;
    }
    const cached = storageKey && localStorage.getItem(storageKey);
    if (cached) {
      try {
        setCars(JSON.parse(cached));
      } catch {
        setCars([]);
      }
    } else {
      setCars([]);
    }
    // Then refresh from backend
    refreshCars().finally(() => setInitialized(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Persist to localStorage when cars change
  useEffect(() => {
    if (user && storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(cars));
    }
  }, [cars, storageKey, user]);

  // ---- API helpers ----

  const refreshCars = async () => {
    if (!user) return [];
    setLoading(true);
    try {
      const res = await fetch(
        `${API}/vehicles/by-user/${encodeURIComponent(user.userID)}`
      );
      if (!res.ok) {
        const msg = await safeError(res);
        console.error("Failed to fetch vehicles:", msg);
        setCars([]);
        return cars; // keep current cache
      }
      const data = await res.json();
      if (
        !data.vehicle ||
        !data.vehicle.carPlateNo ||
        data.source === "UsersOnly"
      ) {
        setCars([]);
        return [];
      }
      const normalized = data?.vehicle
        ? [normalizeVehicle({ ...data.vehicle, userID: data.userID })]
        : [];
      setCars(normalized);
      return normalized;
    } catch (err) {
      console.error("refreshCars error:", err);
      setCars([]);
      return [];
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  const addCar = async (vehicle) => {
    if (!user) throw new Error("Not authenticated");
    setLoading(true);
    try {
      const payload = buildVehiclePayload(vehicle, user);
      const res = await fetch(`${API}/vehicles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const msg = await safeError(res);
        throw new Error(msg || "Failed to add vehicle");
      }
      // Server may return { item: {...} } or the created item. Normalize both.
      const data = await res.json();
      const created = normalizeVehicle(data.item || data);
      setCars((prev) => {
        // avoid duplicates by PK
        const pk = created.carPlateNo;
        const filtered = prev.filter((c) => c.carPlateNo !== pk);
        return [created, ...filtered];
      });
      return created;
    } finally {
      setLoading(false);
    }
  };

  const updateCar = async (carPlateNo, updates) => {
    if (!user) throw new Error("Not authenticated");
    setLoading(true);
    try {
      const sanitizedPlate = (carPlateNo || "").toUpperCase().trim();
      const res = await fetch(
        `${API}/vehicles/${encodeURIComponent(sanitizedPlate)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...updates }),
        }
      );
      if (!res.ok) {
        const msg = await safeError(res);
        throw new Error(msg || "Failed to update vehicle");
      }
      const data = await res.json();
      const updated = normalizeVehicle(data.item || data);
      setCars((prev) =>
        prev.map((c) =>
          c.carPlateNo === sanitizedPlate ? { ...c, ...updated } : c
        )
      );
      return updated;
    } finally {
      setLoading(false);
    }
  };

  const removeCar = async (carPlateNo) => {
    if (!user) throw new Error("Not authenticated");
    setLoading(true);
    try {
      const sanitizedPlate = (carPlateNo || "").toUpperCase().trim();
      const res = await fetch(
        `${API}/vehicles/${encodeURIComponent(sanitizedPlate)}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        const msg = await safeError(res);
        throw new Error(msg || "Failed to remove vehicle");
      }
      setCars((prev) => prev.filter((c) => c.carPlateNo !== sanitizedPlate));
      return true;
    } finally {
      setLoading(false);
    }
  };

  const getCar = (carPlateNo) => {
    const pk = (carPlateNo || "").toUpperCase().trim();
    return cars.find((c) => c.carPlateNo === pk) || null;
  };

  const getCarById = (carPlateNo) => getCar(carPlateNo);

  // ---- Utilities ----

  function normalizeVehicle(v = {}) {
    return {
      carPlateNo: (v.carPlateNo || "").toUpperCase().trim(),
      userID: v.userID || v.userId || "",
      registeredAt: v.registeredAt || v.createdAt || "",
      make: v.make || "",
      model: v.model || "",
      year: v.year ? Number(v.year) : undefined,
      color: v.color || "",
      type: v.type || "",
      description: v.description || "",
      parkingSection: v.parkingSection || "",
      parkingSlot:
        typeof v.parkingSlot === "number" ? v.parkingSlot : v.parkingSlot || "",
    };
  }

  function buildVehiclePayload(vehicle, userObj) {
    // Ensure PK + required fields
    const carPlateNo = (vehicle.carPlateNo || "").toUpperCase().trim();
    return {
      carPlateNo, // PK in DynamoDB
      userID: userObj?.userID || userObj?.id || userObj?.email,
      registeredAt: vehicle.registeredAt || new Date().toISOString(),
      make: (vehicle.make || "").trim(),
      model: (vehicle.model || "").trim(),
      year: vehicle.year ? Number(vehicle.year) : undefined,
      color: (vehicle.color || "").trim(),
      type: vehicle.type || "",
      description: (vehicle.description || "").trim(),
    };
  }

  async function safeError(res) {
    try {
      const data = await res.json();
      return data?.error || data?.message || `${res.status} ${res.statusText}`;
    } catch {
      return `${res.status} ${res.statusText}`;
    }
  }

  const value = {
    cars,
    loading,
    initialized,
    refreshCars,
    addCar,
    updateCar,
    removeCar,
    getCar,
    getCarById,
  };

  return <CarContext.Provider value={value}>{children}</CarContext.Provider>;
};
