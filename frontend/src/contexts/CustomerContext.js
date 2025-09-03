// src/contexts/CustomerContext.js
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

const API = (
  process.env.REACT_APP_API_URL || "http://localhost:3001/api"
).trim();

const CustomerContext = createContext(null);
export const useCustomer = () => useContext(CustomerContext);

export const CustomerProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();

  const getAllCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/customers`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Normalize to the exact shape the table expects
      const normalized = (data || []).map((u) => {
        const fullName = [u.firstName, u.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();
        return {
          id: u.userID,
          userID: u.userID,
          name: fullName || "—",
          email: u.email || "—",
          createdAt: u.createdAt,
          status: (u.status || "inactive").toLowerCase(),
          walletBalance: Number(u.walletBalance ?? 0),
          carPlate: u.carPlateNo || "—",
          role: u.role || "user",
          firstName: u.firstName || "",
          lastName: u.lastName || "",

          // extra fields used in the modal (safe defaults)
          // phone: u.phone || "",
          // address: u.address || "",
          // membershipType: u.membershipType || "standard",
          // accountBalance: Number(u.walletBalance ?? 0),
          // totalSpent: Number(u.totalSpent ?? 0),
          // totalParkingSessions: Number(u.totalParkingSessions ?? 0),
          // emergencyContact: u.emergencyContact || "",
          // notes: u.notes || "",
          // vehicles: Array.isArray(u.vehicles) ? u.vehicles : [],
        };
      });

      return normalized;
    } catch (e) {
      console.error("Failed to load customers from DynamoDB:", e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Search across current list
  const searchCustomers = (customers, term) => {
    const t = (term || "").toLowerCase();
    if (!t) return customers;
    return customers.filter(
      (c) =>
        c.id?.toLowerCase().includes(t) ||
        c.userID?.toLowerCase().includes(t) ||
        c.name?.toLowerCase().includes(t) ||
        c.email?.toLowerCase().includes(t) ||
        c.carPlate?.toLowerCase().includes(t) ||
        c.role?.toLowerCase().includes(t) ||
        c.status?.toLowerCase().includes(t)
    );
  };

  // PATCH a customer (staff-only)
  const updateCustomer = async (userId, partial) => {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Authentication required for customer updates");

    if (!user || (user.role !== "Staff" && user.role !== "Admin")) {
      throw new Error("Unauthorized: Only staff can update customer data");
    }

    const res = await fetch(`${API}/customers/${encodeURIComponent(userId)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(partial),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Update failed: ${res.status}`);
    }
    return res.json();
  };

  // Stubs used by modal (keep for now)
  const getCustomerVehicles = () => [];
  const addCustomerVehicle = async () => ({ success: true, vehicle: {} });
  const updateCustomerVehicle = async () => ({ success: true });
  const deleteCustomerVehicle = async () => ({ success: true });

  const getCustomerBalanceStatement = () => [];
  const addBalanceTransaction = async () => ({
    success: true,
    transaction: {},
  });
  const updateBalanceTransaction = async () => ({ success: true });
  const deleteBalanceTransaction = async () => ({ success: true });

  const value = useMemo(
    () => ({
      loading,
      getAllCustomers,
      searchCustomers,
      updateCustomer,
      getCustomerVehicles,
      addCustomerVehicle,
      updateCustomerVehicle,
      deleteCustomerVehicle,
      getCustomerBalanceStatement,
      addBalanceTransaction,
      updateBalanceTransaction,
      deleteBalanceTransaction,
    }),
    [loading, token, user]
  );

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
};
