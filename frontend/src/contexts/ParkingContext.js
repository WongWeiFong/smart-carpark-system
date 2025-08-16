import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ParkingContext = createContext();

export const useParking = () => {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new Error('useParking must be used within a ParkingProvider');
  }
  return context;
};

export const ParkingProvider = ({ children }) => {
  const [parkingData, setParkingData] = useState({});
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load parking data from localStorage when user changes
  useEffect(() => {
    if (user) {
      const savedData = localStorage.getItem(`parking_${user.email}`);
      if (savedData) {
        setParkingData(JSON.parse(savedData));
      } else {
        // Initialize with mock data
        const mockData = generateMockParkingData();
        setParkingData(mockData);
        localStorage.setItem(`parking_${user.email}`, JSON.stringify(mockData));
      }
    } else {
      setParkingData({});
    }
  }, [user]);

  // Save parking data to localStorage whenever it changes
  useEffect(() => {
    if (user && Object.keys(parkingData).length > 0) {
      localStorage.setItem(`parking_${user.email}`, JSON.stringify(parkingData));
    }
  }, [parkingData, user]);

  // Generate mock parking data for demonstration
  const generateMockParkingData = () => {
    const mockHistory = [];
    const mockPaymentHistory = [];
    const currentDate = new Date();
    
    // Generate payment transactions first (topups and deductions)
    for (let i = 0; i < 15; i++) {
      const transactionDate = new Date(currentDate.getTime() - Math.random() * 45 * 24 * 60 * 60 * 1000);
      
      if (i % 3 === 0) {
        // Add top-up transactions
        const topupAmount = (Math.random() * 80 + 20); // $20-$100
        mockPaymentHistory.push({
          id: `payment_${i}`,
          type: 'topup',
          amount: topupAmount,
          description: 'Account Top-up',
          date: transactionDate.toISOString(),
          status: 'completed',
          reference: `TXN${Date.now()}${i}`,
          paymentMethod: ['Credit Card', 'PayPal', 'Bank Transfer'][Math.floor(Math.random() * 3)]
        });
      }
    }
    
    // Generate 10 random parking sessions
    for (let i = 0; i < 10; i++) {
      const entryTime = new Date(currentDate.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const exitTime = new Date(entryTime.getTime() + (Math.random() * 8 + 1) * 60 * 60 * 1000);
      const duration = Math.floor((exitTime - entryTime) / (1000 * 60 * 60));
      const cost = duration * 2.5; // $2.5 per hour
      
      mockHistory.push({
        id: `session_${i}`,
        entryTime: entryTime.toISOString(),
        exitTime: exitTime.toISOString(),
        duration: duration,
        cost: cost,
        entryGate: `Gate ${Math.floor(Math.random() * 3) + 1}`,
        exitGate: `Gate ${Math.floor(Math.random() * 3) + 1}`,
        parkingSlot: `A${Math.floor(Math.random() * 50) + 1}`,
        status: 'completed'
      });

      // Add corresponding payment deduction for each parking session
      mockPaymentHistory.push({
        id: `deduction_${i}`,
        type: 'deduction',
        amount: -cost,
        description: `Parking Fee - Slot ${mockHistory[i].parkingSlot}`,
        date: exitTime.toISOString(),
        status: 'completed',
        reference: `PKG${Date.now()}${i}`,
        paymentMethod: 'Account Balance',
        relatedSession: `session_${i}`
      });
    }

    // Calculate balance from transactions
    const totalTopups = mockPaymentHistory
      .filter(t => t.type === 'topup')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalDeductions = mockPaymentHistory
      .filter(t => t.type === 'deduction')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const balance = totalTopups - totalDeductions;

    return {
      balance: Math.max(balance, 45.75), // Ensure minimum balance
      totalSpent: totalDeductions,
      history: mockHistory.sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime)),
      paymentHistory: mockPaymentHistory.sort((a, b) => new Date(b.date) - new Date(a.date))
    };
  };

  const getParkingHistory = (plateNumber) => {
    return parkingData.history || [];
  };

  const getPaymentHistory = () => {
    return parkingData.paymentHistory || [];
  };

  const getBalance = () => {
    return parkingData.balance || 0;
  };

  const addBalance = async (amount) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create new payment transaction
      const newTransaction = {
        id: `payment_${Date.now()}`,
        type: 'topup',
        amount: amount,
        description: 'Account Top-up',
        date: new Date().toISOString(),
        status: 'completed',
        reference: `TXN${Date.now()}`,
        paymentMethod: 'Credit Card'
      };

      setParkingData(prev => ({
        ...prev,
        balance: (prev.balance || 0) + amount,
        paymentHistory: [newTransaction, ...(prev.paymentHistory || [])]
      }));
    } catch (error) {
      console.error('Error adding balance:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addPaymentDeduction = async (amount, description, relatedSession = null) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Create new deduction transaction
      const newTransaction = {
        id: `deduction_${Date.now()}`,
        type: 'deduction',
        amount: -amount,
        description: description,
        date: new Date().toISOString(),
        status: 'completed',
        reference: `PKG${Date.now()}`,
        paymentMethod: 'Account Balance',
        relatedSession: relatedSession
      };

      setParkingData(prev => ({
        ...prev,
        balance: Math.max((prev.balance || 0) - amount, 0), // Prevent negative balance
        totalSpent: (prev.totalSpent || 0) + amount,
        paymentHistory: [newTransaction, ...(prev.paymentHistory || [])]
      }));
    } catch (error) {
      console.error('Error adding payment deduction:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateParkingSlot = async (carId, slotNumber) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setParkingData(prev => ({
        ...prev,
        parkingSlots: {
          ...prev.parkingSlots,
          [carId]: {
            slotNumber: slotNumber,
            updatedAt: new Date().toISOString()
          }
        }
      }));
    } catch (error) {
      console.error('Error updating parking slot:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getParkingSlot = (carId) => {
    return parkingData.parkingSlots?.[carId] || null;
  };

  const getCurrentParking = () => {
    // Check if user is currently parked
    const currentSession = parkingData.history?.find(session => session.status === 'active');
    return currentSession || null;
  };

  // Generate mock staff revenue data for demonstration
  const generateStaffRevenueData = () => {
    const allTransactions = [];
    const users = [
      { email: 'john.doe@email.com', name: 'John Doe' },
      { email: 'jane.smith@email.com', name: 'Jane Smith' },
      { email: 'mike.johnson@email.com', name: 'Mike Johnson' },
      { email: 'sarah.wilson@email.com', name: 'Sarah Wilson' },
      { email: 'david.brown@email.com', name: 'David Brown' },
      { email: 'lisa.davis@email.com', name: 'Lisa Davis' },
      { email: 'tom.miller@email.com', name: 'Tom Miller' },
      { email: 'emma.taylor@email.com', name: 'Emma Taylor' }
    ];

    const currentDate = new Date();
    
    // Generate transactions for each user
    users.forEach((userData, userIndex) => {
      // Generate 8-15 transactions per user
      const transactionCount = Math.floor(Math.random() * 8) + 8;
      
      for (let i = 0; i < transactionCount; i++) {
        const transactionDate = new Date(currentDate.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000);
        
        if (i % 4 === 0 || i % 4 === 1) {
          // Add top-up transactions (more frequent)
          const topupAmount = Math.floor((Math.random() * 80 + 20) * 100) / 100; // $20-$100
          allTransactions.push({
            id: `staff_payment_${userIndex}_${i}`,
            userId: userData.email,
            userName: userData.name,
            userEmail: userData.email,
            type: 'topup',
            amount: topupAmount,
            description: 'Account Top-up',
            date: transactionDate.toISOString(),
            status: 'completed',
            reference: `TXN${Date.now()}${userIndex}${i}`,
            paymentMethod: ['Credit Card', 'PayPal', 'Bank Transfer', 'Cash'][Math.floor(Math.random() * 4)],
            staffNotes: ''
          });
        } else {
          // Add parking fee deductions
          const duration = Math.floor(Math.random() * 8) + 1;
          const cost = Math.floor(duration * 2.5 * 100) / 100;
          const parkingSlot = `${['A', 'B', 'C'][Math.floor(Math.random() * 3)]}${Math.floor(Math.random() * 50) + 1}`;
          
          allTransactions.push({
            id: `staff_deduction_${userIndex}_${i}`,
            userId: userData.email,
            userName: userData.name,
            userEmail: userData.email,
            type: 'deduction',
            amount: -cost,
            description: `Parking Fee - Slot ${parkingSlot}`,
            date: transactionDate.toISOString(),
            status: 'completed',
            reference: `PKG${Date.now()}${userIndex}${i}`,
            paymentMethod: 'Account Balance',
            relatedSession: `session_${userIndex}_${i}`,
            parkingSlot: parkingSlot,
            duration: duration,
            staffNotes: ''
          });
        }
      }
    });

    return allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getAllTransactions = () => {
    if (!user) return [];
    
    // For staff, generate and return all transactions from all users
    if (user.role === 'staff') {
      const staffData = localStorage.getItem('staff_revenue_data');
      if (staffData) {
        return JSON.parse(staffData);
      } else {
        const allTransactions = generateStaffRevenueData();
        localStorage.setItem('staff_revenue_data', JSON.stringify(allTransactions));
        return allTransactions;
      }
    }
    
    // For regular users, return only their own transactions
    return parkingData.paymentHistory || [];
  };

  const updateTransaction = async (transactionId, updates) => {
    if (!user || user.role !== 'staff') {
      throw new Error('Unauthorized: Only staff can update transactions');
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const allTransactions = getAllTransactions();
      const updatedTransactions = allTransactions.map(transaction => 
        transaction.id === transactionId 
          ? { ...transaction, ...updates, lastModified: new Date().toISOString() }
          : transaction
      );
      
      localStorage.setItem('staff_revenue_data', JSON.stringify(updatedTransactions));
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (transactionId) => {
    if (!user || user.role !== 'staff') {
      throw new Error('Unauthorized: Only staff can delete transactions');
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const allTransactions = getAllTransactions();
      const filteredTransactions = allTransactions.filter(transaction => 
        transaction.id !== transactionId
      );
      
      localStorage.setItem('staff_revenue_data', JSON.stringify(filteredTransactions));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getRevenueStats = () => {
    if (!user || user.role !== 'staff') {
      return {
        totalRevenue: 0,
        totalTransactions: 0,
        topupAmount: 0,
        parkingRevenue: 0,
        uniqueUsers: 0
      };
    }

    const allTransactions = getAllTransactions();
    const totalRevenue = allTransactions
      .filter(t => t.type === 'topup')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const parkingRevenue = allTransactions
      .filter(t => t.type === 'deduction')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const uniqueUsers = new Set(allTransactions.map(t => t.userId)).size;

    return {
      totalRevenue: totalRevenue,
      totalTransactions: allTransactions.length,
      topupAmount: totalRevenue,
      parkingRevenue: parkingRevenue,
      uniqueUsers: uniqueUsers
    };
  };

  // Staff-only functions for sensor-based parking slot management
  const getAllParkingSlots = async () => {
    if (!user) return [];
    
    try {
      const slotsData = localStorage.getItem('sensor_parking_slots_data');
      if (slotsData) {
        // Simulate sensor readings updates
        const slots = JSON.parse(slotsData);
        return updateSensorReadings(slots);
      } else {
        // Generate initial sensor-based parking slots data
        const slots = generateInitialSensorData();
        localStorage.setItem('sensor_parking_slots_data', JSON.stringify(slots));
        return slots;
      }
    } catch (error) {
      console.error('Error getting parking slots:', error);
      return [];
    }
  };

  // Generate initial sensor data for parking slots
  const generateInitialSensorData = () => {
    const slots = [];
    for (let i = 1; i <= 160; i++) {
      const random = Math.random();
      const sensorWorking = Math.random() > 0.05; // 95% sensors working
      
      // Sensor-detected status
      let sensorStatus = 'available';
      if (sensorWorking) {
        if (random > 0.7) sensorStatus = 'occupied';
      } else {
        sensorStatus = 'sensor_error';
      }
      
      slots.push({
        number: i,
        section: i <= 40 ? 'A' : i <= 80 ? 'B' : i <= 120 ? 'C' : 'D',
        
        // Sensor data
        sensorStatus: sensorStatus, // 'available', 'occupied', 'sensor_error'
        sensorId: `SENSOR_${String(i).padStart(3, '0')}`,
        sensorHealth: sensorWorking ? 'healthy' : 'malfunction',
        lastSensorReading: new Date().toISOString(),
        sensorType: 'ultrasonic', // ultrasonic, magnetic, camera
        
        // Staff override data
        manualOverride: false,
        manualStatus: null, // only set when manually overridden
        overrideReason: null, // maintenance, sensor_malfunction, special_event
        
        // Status resolution (what actually shows to users)
        effectiveStatus: sensorWorking ? sensorStatus : 'maintenance',
        
        // Metadata
        lastUpdated: new Date().toISOString(),
        updatedBy: 'System',
        
        // Physical slot info
        coordinates: {
          x: (i <= 40 ? 50 : i <= 80 ? 450 : i <= 120 ? 50 : 450) + ((i - 1) % 40 % 10) * 34,
          y: (i <= 40 ? 100 : i <= 80 ? 100 : i <= 120 ? 350 : 350) + Math.floor(((i - 1) % 40) / 10) * 24 + 30
        }
      });
    }
    return slots;
  };

  // Simulate sensor readings updates (for demo purposes)
  const updateSensorReadings = (slots) => {
    return slots.map(slot => {
      // Only update if sensor is healthy and not manually overridden
      if (slot.sensorHealth === 'healthy' && !slot.manualOverride) {
        // Small chance of status change (simulating cars entering/leaving)
        if (Math.random() < 0.02) {
          const newSensorStatus = slot.sensorStatus === 'occupied' ? 'available' : 'occupied';
          return {
            ...slot,
            sensorStatus: newSensorStatus,
            effectiveStatus: newSensorStatus,
            lastSensorReading: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            updatedBy: 'Sensor'
          };
        }
        
        // Small chance of sensor malfunction
        if (Math.random() < 0.001) {
          return {
            ...slot,
            sensorStatus: 'sensor_error',
            sensorHealth: 'malfunction',
            effectiveStatus: 'maintenance',
            lastSensorReading: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            updatedBy: 'System'
          };
        }
      }
      
      return slot;
    });
  };

  const updateSlotStatus = async (slotNumber, newStatus, overrideReason = null) => {
    if (!user || user.role !== 'staff') {
      throw new Error('Unauthorized: Only staff can update slot status');
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const slotsData = localStorage.getItem('sensor_parking_slots_data');
      const slots = slotsData ? JSON.parse(slotsData) : [];
      
      const updatedSlots = slots.map(slot => {
        if (slot.number === slotNumber) {
          // Staff is manually overriding the sensor
          return {
            ...slot,
            manualOverride: true,
            manualStatus: newStatus,
            effectiveStatus: newStatus,
            overrideReason: overrideReason || 'manual_adjustment',
            lastUpdated: new Date().toISOString(),
            updatedBy: user?.name || user?.email || 'Staff'
          };
        }
        return slot;
      });
      
      localStorage.setItem('sensor_parking_slots_data', JSON.stringify(updatedSlots));
      
      return { 
        success: true, 
        message: `Slot ${slotNumber} status changed to ${newStatus} by staff moderator` 
      };
    } catch (error) {
      console.error('Error updating slot status:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset slot to sensor control (remove manual override)
  const resetSlotToSensor = async (slotNumber) => {
    if (!user || user.role !== 'staff') {
      throw new Error('Unauthorized: Only staff can reset slot status');
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const slotsData = localStorage.getItem('sensor_parking_slots_data');
      const slots = slotsData ? JSON.parse(slotsData) : [];
      
      const updatedSlots = slots.map(slot => {
        if (slot.number === slotNumber) {
          return {
            ...slot,
            manualOverride: false,
            manualStatus: null,
            effectiveStatus: slot.sensorHealth === 'healthy' ? slot.sensorStatus : 'maintenance',
            overrideReason: null,
            lastUpdated: new Date().toISOString(),
            updatedBy: user?.name || user?.email || 'Staff'
          };
        }
        return slot;
      });
      
      localStorage.setItem('sensor_parking_slots_data', JSON.stringify(updatedSlots));
      
      return { 
        success: true, 
        message: `Slot ${slotNumber} reset to sensor control` 
      };
    } catch (error) {
      console.error('Error resetting slot to sensor:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Simulate sensor repair (for demo purposes)
  const repairSensor = async (slotNumber) => {
    if (!user || user.role !== 'staff') {
      throw new Error('Unauthorized: Only staff can repair sensors');
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate repair time
      
      const slotsData = localStorage.getItem('sensor_parking_slots_data');
      const slots = slotsData ? JSON.parse(slotsData) : [];
      
      const updatedSlots = slots.map(slot => {
        if (slot.number === slotNumber) {
          const newSensorStatus = Math.random() > 0.5 ? 'available' : 'occupied';
          return {
            ...slot,
            sensorHealth: 'healthy',
            sensorStatus: newSensorStatus,
            effectiveStatus: slot.manualOverride ? slot.manualStatus : newSensorStatus,
            lastSensorReading: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            updatedBy: 'Maintenance System'
          };
        }
        return slot;
      });
      
      localStorage.setItem('sensor_parking_slots_data', JSON.stringify(updatedSlots));
      
      return { 
        success: true, 
        message: `Sensor ${slotNumber} repaired successfully` 
      };
    } catch (error) {
      console.error('Error repairing sensor:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    parkingData,
    loading,
    getParkingHistory,
    getPaymentHistory,
    getBalance,
    addBalance,
    addPaymentDeduction,
    updateParkingSlot,
    getParkingSlot,
    getCurrentParking,
    getAllTransactions,
    updateTransaction,
    deleteTransaction,
    getRevenueStats,
    getAllParkingSlots,
    updateSlotStatus,
    resetSlotToSensor,
    repairSensor
  };

  return (
    <ParkingContext.Provider value={value}>
      {children}
    </ParkingContext.Provider>
  );
}; 