import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CarProvider } from './contexts/CarContext';
import { ParkingProvider } from './contexts/ParkingContext';
import Login from './components/Login';
import Register from './components/Register';
import StaffLogin from './components/StaffLogin';
import Homepage from './components/Homepage';
import CarList from './components/CarList';
import CarDetails from './components/CarDetails';
import AddCar from './components/AddCar';
import ParkingHistory from './components/ParkingHistory';
import ParkingSlot from './components/ParkingSlot';
import ParkingManagement from './components/ParkingManagement';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
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
  
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

// Public Route component (redirect to home if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
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
  
  return !isAuthenticated() ? children : <Navigate to="/home" replace />;
};

function AppContent() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/staff-login" element={<PublicRoute><StaffLogin /></PublicRoute>} />
        <Route path="/home" element={<ProtectedRoute><Homepage /></ProtectedRoute>} />
        <Route path="/cars" element={<ProtectedRoute><CarList /></ProtectedRoute>} />
        <Route path="/cars/add" element={<ProtectedRoute><AddCar /></ProtectedRoute>} />
        <Route path="/cars/:carId" element={<ProtectedRoute><CarDetails /></ProtectedRoute>} />
        <Route path="/cars/:carId/history" element={<ProtectedRoute><ParkingHistory /></ProtectedRoute>} />
        <Route path="/cars/:carId/parking-slot" element={<ProtectedRoute><ParkingSlot /></ProtectedRoute>} />
        <Route path="/parking" element={<ProtectedRoute><ParkingManagement /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CarProvider>
        <ParkingProvider>
          <Router>
            <AppContent />
          </Router>
        </ParkingProvider>
      </CarProvider>
    </AuthProvider>
  );
}

export default App;
