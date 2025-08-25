import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Auth.css";

const StaffLogin = () => {
  const [formData, setFormData] = useState({
    staffID: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const API = (
    process.env.REACT_APP_API_URL || "http://localhost:3001/api"
  ).trim();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrMsg("");

    try {
      const res = await fetch(`${API}/auth/stafflogin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json")
        ? await res.json()
        : { raw: await res.text() };
      if (!res.ok) throw new Error(data?.error || data?.raw || "Login failed");

      // Store token and login (backend already validated staff role)
      const { token, user } = data;
      localStorage.setItem("authToken", token);
      login(user, user.role);
      navigate("/staff");
    } catch (error) {
      console.error("Staff login failed:", error);
      setErrMsg(error.message || "Staff login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card staff-card">
        <h2 className="auth-title">Staff Login</h2>
        {errMsg && <div className="auth-error">{errMsg}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="staffID">ID</label>
            <input
              type="text"
              id="staffID"
              name="staffID"
              value={formData.staffID}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter your staff ID"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="auth-button staff-button"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Staff Login"}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Not a staff member?{" "}
            <Link to="/login" className="auth-link">
              User Login
            </Link>
          </p>
          <p>
            Need an account?{" "}
            <Link to="/register" className="auth-link">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;
