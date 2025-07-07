import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CarContext = createContext();

export const useCars = () => {
  const context = useContext(CarContext);
  if (!context) {
    throw new Error('useCars must be used within a CarProvider');
  }
  return context;
};

export const CarProvider = ({ children }) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load cars from localStorage when user changes
  useEffect(() => {
    if (user) {
      const savedCars = localStorage.getItem(`cars_${user.email}`);
      if (savedCars) {
        setCars(JSON.parse(savedCars));
      } else {
        setCars([]);
      }
    } else {
      setCars([]);
    }
  }, [user]);

  // Save cars to localStorage whenever cars change
  useEffect(() => {
    if (user && cars.length >= 0) {
      localStorage.setItem(`cars_${user.email}`, JSON.stringify(cars));
    }
  }, [cars, user]);

  const addCar = async (carData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newCar = {
        id: Date.now().toString(),
        ...carData,
        userId: user.email,
        createdAt: new Date().toISOString()
      };
      
      setCars(prevCars => [...prevCars, newCar]);
      return newCar;
    } catch (error) {
      console.error('Error adding car:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCar = async (carId, updateData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCars(prevCars => 
        prevCars.map(car => 
          car.id === carId 
            ? { ...car, ...updateData, updatedAt: new Date().toISOString() }
            : car
        )
      );
    } catch (error) {
      console.error('Error updating car:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCar = async (carId) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCars(prevCars => prevCars.filter(car => car.id !== carId));
    } catch (error) {
      console.error('Error deleting car:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getCarById = (carId) => {
    return cars.find(car => car.id === carId);
  };

  const getUserCars = () => {
    return cars.filter(car => car.userId === user?.email);
  };

  const updateCarParkingSlot = async (carId, slotNumber) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCars(prevCars => 
        prevCars.map(car => 
          car.id === carId 
            ? { ...car, parkingSlot: slotNumber, slotUpdatedAt: new Date().toISOString() }
            : car
        )
      );
    } catch (error) {
      console.error('Error updating car parking slot:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cars: getUserCars(),
    loading,
    addCar,
    updateCar,
    deleteCar,
    getCarById,
    updateCarParkingSlot
  };

  return (
    <CarContext.Provider value={value}>
      {children}
    </CarContext.Provider>
  );
}; 