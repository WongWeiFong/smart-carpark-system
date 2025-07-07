import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserHomepage from './UserHomepage';
import StaffHomepage from './StaffHomepage';

const Homepage = () => {
  const { user, isStaff, isUser } = useAuth();

  // Show loading state if user data is not yet available
  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Render appropriate homepage based on user role
  if (isStaff()) {
    return <StaffHomepage />;
  } else if (isUser()) {
    return <UserHomepage />;
  } else {
    // Fallback for unknown user role
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Unknown user role. Please contact support.</div>
      </div>
    );
  }
};

export default Homepage; 