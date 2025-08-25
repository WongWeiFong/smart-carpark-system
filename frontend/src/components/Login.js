import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Auth.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
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
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrMsg("");

    try {
      console.log("API base:", API);
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      // const data = await res.json();
      // if (!res.ok) {
      //   throw new Error(data?.error || "Login failed");
      // }
      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json")
        ? await res.json()
        : { raw: await res.text() };
      if (!res.ok) throw new Error(data?.error || data?.raw || "Login failed1");

      // Mock successful login
      const { token, user } = data;

      localStorage.setItem("authToken", token);
      login(user, user.role || "user");
      navigate("/home");
    } catch (err) {
      console.error("Login failed:", err);
      setErrMsg(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">User Login</h2>
        {errMsg && <div className="auth-error">{errMsg}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter your email"
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
          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">
              Register here
            </Link>
          </p>
          <p>
            Are you a staff member?{" "}
            <Link to="/staff-login" className="auth-link">
              Staff Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
