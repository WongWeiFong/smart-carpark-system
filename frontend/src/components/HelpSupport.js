import React from "react";
import { Link } from "react-router-dom";
import { FaPhoneAlt, FaEnvelope, FaUserTie } from "react-icons/fa";
import "./HelpSupport.css";

const HelpSupport = () => {
  return (
    <div className="help-container">
      <div className="help-wrapper">
        <header className="help-header">
          <div className="help-title">
            <h1>Help & Support</h1>
            <p className="help-subtitle">
              If you're stuck or have questions, we're here to help.
            </p>
          </div>
          <Link to="/home" className="help-back-btn">
            ← Back to Home
          </Link>
        </header>

        <main className="help-content">
          <div className="support-card">
            <div className="support-icon">
              <FaUserTie />
            </div>
            <div className="support-details">
              <h2>Customer Support</h2>
              <p>If you need assistance with your account, contact us:</p>
              <div className="contact-item">
                <FaEnvelope className="contact-icon" />
                <a href="mailto:support@example.com">support@example.com</a>
              </div>
              <div className="contact-item">
                <FaPhoneAlt className="contact-icon" />
                <a href="tel:+1234567890">+1 (234) 567-890</a>
              </div>
            </div>
          </div>

          <div className="support-card">
            <div className="support-icon">
              <FaUserTie />
            </div>
            <div className="support-details">
              <h2>Technical Support</h2>
              <p>For technical issues, please reach out to:</p>
              <div className="contact-item">
                <FaEnvelope className="contact-icon" />
                <a href="mailto:tech@example.com">tech@example.com</a>
              </div>
              <div className="contact-item">
                <FaPhoneAlt className="contact-icon" />
                <a href="tel:+1987654321">+1 (987) 654-3210</a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HelpSupport;
