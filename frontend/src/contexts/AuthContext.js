import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, role) => {
    const userWithRole = {
      ...userData,
      role: role,
    };
    setUser(userWithRole);
    localStorage.setItem("user", JSON.stringify(userWithRole));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
  };

  const getAuthToken = () => {
    return localStorage.getItem("authToken");
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  const isStaff = () => {
    const role = user?.role?.toLowerCase();
    return role === "staff" || role === "admin";
  };

  const isUser = () => {
    const role = user?.role?.toLowerCase();
    return role === "user";
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    isStaff,
    isUser,
    loading,
    getAuthToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
