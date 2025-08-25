import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CarProvider } from "./contexts/CarContext";
import { ParkingProvider } from "./contexts/ParkingContext";
import { CustomerProvider } from "./contexts/CustomerContext";
import Login from "./components/Login";
import Register from "./components/Register";
import StaffLogin from "./components/StaffLogin";
import Homepage from "./components/Homepage";
import CarList from "./components/CarList";
import CarDetails from "./components/CarDetails";
import AddCar from "./components/AddCar";
import ParkingHistory from "./components/ParkingHistory";
import ParkingSlot from "./components/ParkingSlot";
import EnhancedParkingSlot from "./components/EnhancedParkingSlot";
import ParkingLayoutDemo from "./components/ParkingLayoutDemo";
import StaffParkingSlotManagement from "./components/StaffParkingSlotManagement";
import ParkingManagement from "./components/ParkingManagement";
import PaymentHistory from "./components/PaymentHistory";
import RevenueManagement from "./components/RevenueManagement";
import CustomerManagement from "./components/CustomerManagement";
import AnalyticsReports from "./components/AnalyticsReports";
import SystemSettings from "./components/SystemSettings";
import EmergencyManagement from "./components/EmergencyManagement";
import "./App.css";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
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
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/staff-login"
          element={
            <PublicRoute>
              <StaffLogin />
            </PublicRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Homepage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cars"
          element={
            <ProtectedRoute>
              <CarList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cars/add"
          element={
            <ProtectedRoute>
              <AddCar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cars/:carId"
          element={
            <ProtectedRoute>
              <CarDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cars/:carId/history"
          element={
            <ProtectedRoute>
              <ParkingHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cars/:carId/parking-slot"
          element={
            <ProtectedRoute>
              <EnhancedParkingSlot />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cars/:carId/parking-slot-old"
          element={
            <ProtectedRoute>
              <ParkingSlot />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parking-demo"
          element={
            <ProtectedRoute>
              <ParkingLayoutDemo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/parking-slots"
          element={
            <ProtectedRoute>
              <StaffParkingSlotManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parking"
          element={
            <ProtectedRoute>
              <ParkingManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment-history"
          element={
            <ProtectedRoute>
              <PaymentHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/revenue-management"
          element={
            <ProtectedRoute>
              <RevenueManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer-management"
          element={
            <ProtectedRoute>
              <CustomerManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics-reports"
          element={
            <ProtectedRoute>
              <AnalyticsReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/system-settings"
          element={
            <ProtectedRoute>
              <SystemSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/emergency-management"
          element={
            <ProtectedRoute>
              <EmergencyManagement />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CarProvider>
        <ParkingProvider>
          <CustomerProvider>
            <Router>
              <AppContent />
            </Router>
          </CustomerProvider>
        </ParkingProvider>
      </CarProvider>
    </AuthProvider>
  );
}

export default App;
