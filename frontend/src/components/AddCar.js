// AddCar.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCars } from "../contexts/CarContext";
import "./CarManagement.css";

const AddCar = () => {
  const { user, logout } = useAuth();
  const { addCar, loading } = useCars();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    color: "",
    carPlateNo: "",
    type: "",
    description: "",
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Always keep plate uppercase for consistency
    const nextValue =
      name === "carPlateNo" ? value.toUpperCase().trimStart() : value;

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.make.trim()) newErrors.make = "Make is required";
    if (!formData.model.trim()) newErrors.model = "Model is required";
    if (!formData.year.toString().trim()) newErrors.year = "Year is required";
    if (!formData.color.trim()) newErrors.color = "Color is required";
    if (!formData.carPlateNo.trim())
      newErrors.carPlateNo = "Car plate number is required";

    const currentYear = new Date().getFullYear();
    const yearNum = Number(formData.year);
    if (yearNum && (yearNum < 1900 || yearNum > currentYear + 1)) {
      newErrors.year = `Year must be between 1900 and ${currentYear + 1}`;
    }

    if (formData.carPlateNo && formData.carPlateNo.length < 2) {
      newErrors.carPlateNo = "Car plate number must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Build the item exactly how the backend/DynamoDB expects it
    const payload = {
      carPlateNo: formData.carPlateNo.toUpperCase().trim(), // PK in DynamoDB
      userID: user?.userID || user?.id, // use whichever your AuthContext exposes
      registeredAt: new Date().toISOString(),
      make: formData.make.trim(),
      model: formData.model.trim(),
      year: Number(formData.year),
      color: formData.color.trim(),
      type: formData.type,
      description: formData.description?.trim() || "",
    };

    try {
      await addCar(payload);
      alert("Car added successfully!");
      navigate("/cars");
    } catch (error) {
      console.error(error);
      alert(
        error?.response?.data?.error ||
          "Failed to add car. Please try again or use a different car plate."
      );
    }
  };

  const handleLogout = () => logout();

  return (
    <div className="car-management-container">
      <header className="car-management-header">
        <div className="header-content">
          <div className="header-left">
            <Link to="/cars" className="back-button">
              ← Back to Car List
            </Link>
            <h1 className="page-title">Add New Car</h1>
          </div>
          <div className="user-info">
            <span className="welcome-text">
              Welcome, {user?.firstName + " " + user?.lastName}!
            </span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="car-management-main">
        <div className="add-car-container">
          <div className="add-car-card">
            <div className="add-car-header">
              <div className="car-icon">🚗</div>
              <h2>Register Your Car</h2>
              <p>Add your car details for easy parking management</p>
            </div>

            <form onSubmit={handleSubmit} className="add-car-form">
              {/* Make / Model */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="make">Make *</label>
                  <input
                    type="text"
                    id="make"
                    name="make"
                    value={formData.make}
                    onChange={handleInputChange}
                    className={`form-input ${errors.make ? "error" : ""}`}
                    placeholder="e.g., Toyota, Honda, BMW"
                  />
                  {errors.make && (
                    <span className="error-text">{errors.make}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="model">Model *</label>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    className={`form-input ${errors.model ? "error" : ""}`}
                    placeholder="e.g., Camry, Civic, X5"
                  />
                  {errors.model && (
                    <span className="error-text">{errors.model}</span>
                  )}
                </div>
              </div>

              {/* Year / Color */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="year">Year *</label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className={`form-input ${errors.year ? "error" : ""}`}
                    placeholder="e.g., 2020"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                  {errors.year && (
                    <span className="error-text">{errors.year}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="color">Color *</label>
                  <input
                    type="text"
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className={`form-input ${errors.color ? "error" : ""}`}
                    placeholder="e.g., Red, Blue, White"
                  />
                  {errors.color && (
                    <span className="error-text">{errors.color}</span>
                  )}
                </div>
              </div>

              {/* Plate / Type */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="carPlateNo">Car Plate Number *</label>
                  <input
                    type="text"
                    id="carPlateNo"
                    name="carPlateNo"
                    value={formData.carPlateNo}
                    onChange={handleInputChange}
                    className={`form-input ${errors.carPlateNo ? "error" : ""}`}
                    placeholder="e.g., ABC123"
                    style={{ textTransform: "uppercase" }}
                  />
                  {errors.carPlateNo && (
                    <span className="error-text">{errors.carPlateNo}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="type">Vehicle Type *</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="coupe">Coupe</option>
                    <option value="truck">Truck</option>
                    <option value="van">Van</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Any additional notes about your car..."
                  rows="3"
                />
              </div>

              {/* Actions */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? "Adding Car..." : "Add Car"}
                </button>
                <Link to="/cars" className="cancel-link">
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddCar;
