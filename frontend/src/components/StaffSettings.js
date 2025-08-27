import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Auth.css";

const StaffSettings = () => {
  const navigate = useNavigate();
  const { user, logout, isStaff } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    staffID: "",
    staffName: "",
    role: "",
    status: "",
    walletBalance: 0,
  });
  const [editableFields, setEditableFields] = useState({
    staffName: "",
    password: "",
    confirmPassword: "",
    walletBalance: 0,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const API = (
    process.env.REACT_APP_API_URL || "http://localhost:3001/api"
  ).trim();

  useEffect(() => {
    // Redirect non-staff users
    if (!isStaff()) {
      navigate("/home");
      return;
    }
    loadProfile();
  }, [isStaff, navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const response = await fetch(`${API}/auth/staff-profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load staff profile");
      }

      const data = await response.json();
      setProfile(data);
      setEditableFields({
        staffName: data.staffName || "",
        password: "",
        confirmPassword: "",
        walletBalance: data.walletBalance || 0,
      });
    } catch (error) {
      console.error("Failed to load staff profile:", error);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableFields((prev) => ({
      ...prev,
      [name]: name === "walletBalance" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    // Validate passwords if provided
    if (
      editableFields.password &&
      editableFields.password !== editableFields.confirmPassword
    ) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("authToken");
      const updateData = {
        staffName: editableFields.staffName,
        walletBalance: editableFields.walletBalance,
      };

      // Only include password if it's provided
      if (editableFields.password && editableFields.password.trim() !== "") {
        updateData.password = editableFields.password;
      }

      const response = await fetch(`${API}/auth/staff-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const data = await response.json();
      setMessage("Staff profile updated successfully!");

      // Reload profile data
      await loadProfile();

      // Clear password fields
      setEditableFields((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
    } catch (error) {
      console.error("Failed to update profile:", error);
      setError(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  //   const handleLogout = () => {
  //     logout();
  //     navigate("/staff-login");
  //   };

  const handleBack = () => {
    navigate("/homepage");
  };

  if (loading && !profile.staffID) {
    return (
      <div className="auth-staff-container">
        <div className="auth-card">
          <h2>Loading Staff Profile...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-staff-container">
      <div className="auth-card" style={{ maxWidth: "600px" }}>
        <h2 className="auth-title">Staff Profile Settings</h2>

        {/* Read-only information */}
        <div
          style={{
            marginBottom: "30px",
            padding: "20px",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ marginBottom: "15px", color: "#333" }}>
            Account Information (View Only)
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
            }}
          >
            <div>
              <strong>Staff ID:</strong>
              <p style={{ margin: "5px 0", color: "#666" }}>
                {profile.staffID}
              </p>
            </div>
            <div>
              <strong>Role:</strong>
              <p style={{ margin: "5px 0", color: "#666" }}>{profile.role}</p>
            </div>
            <div>
              <strong>Status:</strong>
              <p style={{ margin: "5px 0", color: "#666" }}>
                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    backgroundColor:
                      profile.status === "active" ? "#d4edda" : "#f8d7da",
                    color: profile.status === "active" ? "#155724" : "#721c24",
                  }}
                >
                  {profile.status}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Editable form */}
        <form onSubmit={handleUpdateProfile} className="auth-form">
          <h3 style={{ marginBottom: "20px", color: "#333" }}>
            Editable Information
          </h3>

          <div className="form-group">
            <label htmlFor="staffName">Staff Name</label>
            <input
              type="text"
              id="staffName"
              name="staffName"
              value={editableFields.staffName}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your staff name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="walletBalance">Wallet Balance ($)</label>
            <input
              type="number"
              step="0.01"
              id="walletBalance"
              name="walletBalance"
              value={editableFields.walletBalance}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter wallet balance"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              New Password (leave blank to keep current)
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={editableFields.password}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter new password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={editableFields.confirmPassword}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Confirm new password"
            />
          </div>

          {error && (
            <div
              style={{
                color: "red",
                marginBottom: "15px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          {message && (
            <div
              style={{
                color: "green",
                marginBottom: "15px",
                textAlign: "center",
              }}
            >
              {message}
            </div>
          )}

          <div style={{ display: "flex", gap: "15px" }}>
            <button
              type="submit"
              className="auth-staff-button"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>

            <button
              type="button"
              onClick={handleBack}
              className="auth-staff-button"
              style={{ backgroundColor: "#6c757d" }}
            >
              Back
            </button>
          </div>
        </form>

        {/* <div style={{ marginTop: "30px", textAlign: "center" }}>
          <button
            onClick={handleLogout}
            className="auth-staff-button"
            style={{ backgroundColor: "#dc3545" }}
          >
            Logout
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default StaffSettings;
