import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const StaffLogin = () => {
  const [formData, setFormData] = useState({
    staffId: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call - replace with actual authentication logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful staff login
      const userData = {
        staffId: formData.staffId,
        email: `staff${formData.staffId}@carpark.com`
      };
      
      login(userData, 'staff');
      navigate('/home');
    } catch (error) {
      console.error('Staff login failed:', error);
      alert('Staff login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card staff-card">
        <h2 className="auth-title">Staff Login</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="staffId">Staff ID</label>
            <input
              type="text"
              id="staffId"
              name="staffId"
              value={formData.staffId}
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
          <button type="submit" className="auth-button staff-button" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Staff Login'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>Not a staff member? <Link to="/login" className="auth-link">User Login</Link></p>
          <p>Need an account? <Link to="/register" className="auth-link">Register here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin; 