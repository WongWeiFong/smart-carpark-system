import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Auth.css";

const UserSettings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    userID: "",
    email: "",
    firstName: "",
    lastName: "",
    carPlateNo: "",
    role: "",
    walletBalance: 0,
  });
  const [editableFields, setEditableFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const API = (
    process.env.REACT_APP_API_URL || "http://localhost:3001/api"
  ).trim();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const response = await fetch(`${API}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load profile");
      }

      const data = await response.json();
      setProfile(data);
      setEditableFields({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Failed to load profile:", error);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableFields((prev) => ({
      ...prev,
      [name]: value,
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
        firstName: editableFields.firstName,
        lastName: editableFields.lastName,
        email: editableFields.email,
      };

      // Only include password if it's provided
      if (editableFields.password && editableFields.password.trim() !== "") {
        updateData.password = editableFields.password;
      }

      const response = await fetch(`${API}/auth/profile`, {
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
      setMessage("Profile updated successfully!");

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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleBack = () => {
    navigate("/home");
  };

  if (loading && !profile.userID) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Loading Profile...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: "600px" }}>
        <h2 className="auth-title">User Profile Settings</h2>

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
              <strong>User ID</strong>
              <p style={{ margin: "5px 0", color: "#666" }}>{profile.userID}</p>
            </div>
            <div>
              <strong>Role</strong>
              <p style={{ margin: "5px 0", color: "#666" }}>{profile.role}</p>
            </div>
            <div>
              <strong>Car Plate Number</strong>
              <p style={{ margin: "5px 0", color: "#666" }}>
                {profile.carPlateNo || "Not registered"}
              </p>
            </div>
            <div>
              <strong>Wallet Balance</strong>
              <p style={{ margin: "5px 0", color: "#666" }}>
                ${Number(profile.walletBalance || 0).toFixed(2)}
              </p>
            </div>
            <div>
              <strong>Email Address</strong>
              <p style={{ margin: "5px 0", color: "#666" }}>{profile.email}</p>
            </div>
          </div>
        </div>

        {/* Editable form */}
        <form onSubmit={handleUpdateProfile} className="auth-form">
          <h3 style={{ marginBottom: "20px", color: "#333" }}>
            Editable Information
          </h3>

          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={editableFields.firstName}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your first name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={editableFields.lastName}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your last name"
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
            <div style={{ textAlign: "center" }}>{message}</div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Updating..." : "Update Profile"}
            </button>

            <button
              type="button"
              onClick={handleBack}
              className="auth-button"
              style={{ backgroundColor: "#6c757d" }}
            >
              Back
            </button>
          </div>
        </form>

        {/* <div style={{ marginTop: "30px", textAlign: "center" }}>
          <button
            onClick={handleLogout}
            className="auth-button"
            style={{ backgroundColor: "#dc3545" }}
          >
            Logout
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default UserSettings;
