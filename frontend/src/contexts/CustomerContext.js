import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CustomerContext = createContext();

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};

export const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Generate mock customer data
  const generateMockCustomers = () => {
    const mockCustomers = [
      {
        id: 'CUST001',
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+1-555-0123',
        address: '123 Main St, City, State 12345',
        registeredDate: '2023-01-15',
        status: 'active',
        accountBalance: 45.50,
        totalSpent: 234.75,
        totalParkingSessions: 28,
        lastActivity: '2024-01-20',
        membershipType: 'premium',
        emergencyContact: 'Jane Doe - +1-555-0124',
        notes: 'VIP customer, prefers parking spots near elevator'
      },
      {
        id: 'CUST002',
        name: 'Jane Smith',
        email: 'jane.smith@email.com',
        phone: '+1-555-0456',
        address: '456 Oak Ave, City, State 12346',
        registeredDate: '2023-02-20',
        status: 'active',
        accountBalance: 22.30,
        totalSpent: 189.20,
        totalParkingSessions: 22,
        lastActivity: '2024-01-19',
        membershipType: 'standard',
        emergencyContact: 'Robert Smith - +1-555-0457',
        notes: 'Regular customer, no special requirements'
      },
      {
        id: 'CUST003',
        name: 'Mike Johnson',
        email: 'mike.johnson@email.com',
        phone: '+1-555-0789',
        address: '789 Pine St, City, State 12347',
        registeredDate: '2023-03-10',
        status: 'active',
        accountBalance: 67.80,
        totalSpent: 456.90,
        totalParkingSessions: 45,
        lastActivity: '2024-01-21',
        membershipType: 'premium',
        emergencyContact: 'Sarah Johnson - +1-555-0790',
        notes: 'Frequent parker, uses electric vehicle'
      },
      {
        id: 'CUST004',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@email.com',
        phone: '+1-555-1012',
        address: '321 Elm St, City, State 12348',
        registeredDate: '2023-04-05',
        status: 'active',
        accountBalance: 15.75,
        totalSpent: 298.40,
        totalParkingSessions: 35,
        lastActivity: '2024-01-18',
        membershipType: 'standard',
        emergencyContact: 'Mark Wilson - +1-555-1013',
        notes: 'Works night shifts, typically parks late evening'
      },
      {
        id: 'CUST005',
        name: 'David Brown',
        email: 'david.brown@email.com',
        phone: '+1-555-1314',
        address: '654 Maple Dr, City, State 12349',
        registeredDate: '2023-05-12',
        status: 'suspended',
        accountBalance: -12.50,
        totalSpent: 178.60,
        totalParkingSessions: 18,
        lastActivity: '2024-01-10',
        membershipType: 'standard',
        emergencyContact: 'Linda Brown - +1-555-1315',
        notes: 'Account suspended due to unpaid balance'
      },
      {
        id: 'CUST006',
        name: 'Lisa Davis',
        email: 'lisa.davis@email.com',
        phone: '+1-555-1516',
        address: '987 Cedar Ln, City, State 12350',
        registeredDate: '2023-06-18',
        status: 'active',
        accountBalance: 89.25,
        totalSpent: 567.30,
        totalParkingSessions: 52,
        lastActivity: '2024-01-22',
        membershipType: 'premium',
        emergencyContact: 'Tom Davis - +1-555-1517',
        notes: 'Corporate account holder, monthly billing'
      },
      {
        id: 'CUST007',
        name: 'Tom Miller',
        email: 'tom.miller@email.com',
        phone: '+1-555-1718',
        address: '147 Birch St, City, State 12351',
        registeredDate: '2023-07-22',
        status: 'active',
        accountBalance: 34.60,
        totalSpent: 123.80,
        totalParkingSessions: 15,
        lastActivity: '2024-01-17',
        membershipType: 'standard',
        emergencyContact: 'Alice Miller - +1-555-1719',
        notes: 'New customer, learning parking system'
      },
      {
        id: 'CUST008',
        name: 'Emma Taylor',
        email: 'emma.taylor@email.com',
        phone: '+1-555-1920',
        address: '258 Spruce Ave, City, State 12352',
        registeredDate: '2023-08-30',
        status: 'active',
        accountBalance: 156.90,
        totalSpent: 789.45,
        totalParkingSessions: 68,
        lastActivity: '2024-01-23',
        membershipType: 'premium',
        emergencyContact: 'James Taylor - +1-555-1921',
        notes: 'Long-term customer, multiple vehicles registered'
      }
    ];
    return mockCustomers;
  };

  // Load customers from localStorage or generate mock data
  useEffect(() => {
    if (user && user.role === 'staff') {
      const savedCustomers = localStorage.getItem('staff_customers_data');
      if (savedCustomers) {
        setCustomers(JSON.parse(savedCustomers));
      } else {
        const mockData = generateMockCustomers();
        setCustomers(mockData);
        localStorage.setItem('staff_customers_data', JSON.stringify(mockData));
      }
    }
  }, [user]);

  // Save customers to localStorage when customers data changes
  useEffect(() => {
    if (user && user.role === 'staff' && customers.length > 0) {
      localStorage.setItem('staff_customers_data', JSON.stringify(customers));
    }
  }, [customers, user]);

  const getAllCustomers = () => {
    if (!user || user.role !== 'staff') {
      throw new Error('Unauthorized: Only staff can access customer data');
    }
    return customers;
  };

  const getCustomerById = (customerId) => {
    if (!user || user.role !== 'staff') {
      throw new Error('Unauthorized: Only staff can access customer data');
    }
    return customers.find(customer => customer.id === customerId);
  };

  const updateCustomer = async (customerId, updates) => {
    if (!user || user.role !== 'staff') {
      throw new Error('Unauthorized: Only staff can update customer data');
    }

    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCustomers(prevCustomers => 
        prevCustomers.map(customer => 
          customer.id === customerId 
            ? { ...customer, ...updates, lastModified: new Date().toISOString() }
            : customer
        )
      );
      return { success: true };
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomer = async (customerId) => {
    if (!user || user.role !== 'staff') {
      throw new Error('Unauthorized: Only staff can delete customers');
    }

    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCustomers(prevCustomers => 
        prevCustomers.filter(customer => customer.id !== customerId)
      );
      return { success: true };
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const searchCustomers = (searchTerm) => {
    if (!user || user.role !== 'staff') {
      throw new Error('Unauthorized: Only staff can search customers');
    }

    if (!searchTerm) return customers;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(lowerSearchTerm) ||
      customer.email.toLowerCase().includes(lowerSearchTerm) ||
      customer.id.toLowerCase().includes(lowerSearchTerm) ||
      customer.phone.includes(searchTerm)
    );
  };

  // Vehicle Management Functions
  const getCustomerVehicles = (customerId) => {
    if (!user || user.role !== 'staff') {
      throw new Error('Unauthorized: Only staff can access vehicle data');
    }

    const vehicleKey = `customer_vehicles_${customerId}`;
    const savedVehicles = localStorage.getItem(vehicleKey);
    
    if (savedVehicles) {
      return JSON.parse(savedVehicles);
    } else {
      // Generate mock vehicle data for the customer
      const mockVehicles = generateMockVehicles(customerId);
      localStorage.setItem(vehicleKey, JSON.stringify(mockVehicles));
      return mockVehicles;
    }
  };

  const generateMockVehicles = (customerId) => {
    const vehicleData = {
      'CUST001': [
        { id: 'VEH001', plateNumber: 'ABC123', make: 'Toyota', model: 'Camry', year: 2020, color: 'Silver', status: 'active', registeredDate: '2023-01-15' },
        { id: 'VEH002', plateNumber: 'XYZ789', make: 'Honda', model: 'Civic', year: 2019, color: 'Blue', status: 'active', registeredDate: '2023-03-20' }
      ],
      'CUST002': [
        { id: 'VEH003', plateNumber: 'DEF456', make: 'BMW', model: 'X5', year: 2021, color: 'Black', status: 'active', registeredDate: '2023-02-20' }
      ],
      'CUST003': [
        { id: 'VEH004', plateNumber: 'GHI789', make: 'Tesla', model: 'Model 3', year: 2022, color: 'White', status: 'active', registeredDate: '2023-03-10' },
        { id: 'VEH005', plateNumber: 'JKL012', make: 'Mercedes', model: 'C-Class', year: 2020, color: 'Gray', status: 'suspended', registeredDate: '2023-04-15' }
      ],
      'CUST004': [
        { id: 'VEH006', plateNumber: 'MNO345', make: 'Ford', model: 'F-150', year: 2021, color: 'Red', status: 'active', registeredDate: '2023-04-05' }
      ],
      'CUST005': [
        { id: 'VEH007', plateNumber: 'PQR678', make: 'Chevrolet', model: 'Malibu', year: 2018, color: 'White', status: 'active', registeredDate: '2023-05-12' }
      ],
      'CUST006': [
        { id: 'VEH008', plateNumber: 'STU901', make: 'Audi', model: 'A4', year: 2022, color: 'Black', status: 'active', registeredDate: '2023-06-18' },
        { id: 'VEH009', plateNumber: 'VWX234', make: 'Lexus', model: 'RX350', year: 2021, color: 'Silver', status: 'active', registeredDate: '2023-07-10' }
      ],
      'CUST007': [
        { id: 'VEH010', plateNumber: 'YZA567', make: 'Nissan', model: 'Altima', year: 2019, color: 'Blue', status: 'active', registeredDate: '2023-07-22' }
      ],
      'CUST008': [
        { id: 'VEH011', plateNumber: 'BCD890', make: 'Porsche', model: '911', year: 2023, color: 'Yellow', status: 'active', registeredDate: '2023-08-30' },
        { id: 'VEH012', plateNumber: 'EFG123', make: 'Range Rover', model: 'Evoque', year: 2022, color: 'Green', status: 'active', registeredDate: '2023-09-15' }
      ]
    };
    return vehicleData[customerId] || [];
  };

  const addCustomerVehicle = async (customerId, vehicleData) => {
    if (!user || user.role !== 'staff') {
      throw new Error('Unauthorized: Only staff can add vehicles');
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const vehicles = getCustomerVehicles(customerId);
      const newVehicle = {
        ...vehicleData,
        id: `VEH${Date.now()}`,
        registeredDate: new Date().toISOString().split('T')[0],
        status: 'active'
      };
      
      const updatedVehicles = [...vehicles, newVehicle];
      localStorage.setItem(`customer_vehicles_${customerId}`, JSON.stringify(updatedVehicles));
      return { success: true, vehicle: newVehicle };
    } catch (error) {
      console.error('Error adding vehicle:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCustomerVehicle = async (customerId, vehicleId, updates) => {
    if (!user || user.role !== 'staff') {
      throw new Error('Unauthorized: Only staff can update vehicles');
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const vehicles = getCustomerVehicles(customerId);
      const updatedVehicles = vehicles.map(vehicle => 
        vehicle.id === vehicleId ? { ...vehicle, ...updates } : vehicle
      );
      
      localStorage.setItem(`customer_vehicles_${customerId}`, JSON.stringify(updatedVehicles));
      return { success: true };
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomerVehicle = async (customerId, vehicleId) => {
    if (!user || user.role !== 'staff') {
      throw new Error('Unauthorized: Only staff can delete vehicles');
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const vehicles = getCustomerVehicles(customerId);
      const updatedVehicles = vehicles.filter(vehicle => vehicle.id !== vehicleId);
      
      localStorage.setItem(`customer_vehicles_${customerId}`, JSON.stringify(updatedVehicles));
      return { success: true };
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Balance Statement Functions
  const getCustomerBalanceStatement = (customerId) => {
    if (!user || user.role !== 'staff') {
      throw new Error('Unauthorized: Only staff can access balance data');
    }

    const balanceKey = `customer_balance_${customerId}`;
    const savedBalance = localStorage.getItem(balanceKey);
    
    if (savedBalance) {
      return JSON.parse(savedBalance);
    } else {
      // Generate mock balance statement for the customer
      const mockBalance = generateMockBalanceStatement(customerId);
      localStorage.setItem(balanceKey, JSON.stringify(mockBalance));
      return mockBalance;
    }
  };

  const generateMockBalanceStatement = (customerId) => {
    const transactions = [];
    const startDate = new Date('2023-01-01');
    const endDate = new Date();
    
    // Generate 10-20 transactions for each customer
    const transactionCount = Math.floor(Math.random() * 11) + 10;
    
    for (let i = 0; i < transactionCount; i++) {
      const transactionDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
      const isTopup = Math.random() > 0.6; // 40% chance for topup, 60% for parking charges
      
      if (isTopup) {
        const amount = Math.floor((Math.random() * 80 + 20) * 100) / 100; // $20-$100
        transactions.push({
          id: `BAL${Date.now()}_${i}`,
          type: 'credit',
          amount: amount,
          description: 'Account Top-up',
          date: transactionDate.toISOString(),
          reference: `TOP${Date.now()}${i}`,
          paymentMethod: ['Credit Card', 'PayPal', 'Bank Transfer', 'Cash'][Math.floor(Math.random() * 4)],
          status: 'completed',
          createdBy: 'System'
        });
      } else {
        const duration = Math.floor(Math.random() * 8) + 1;
        const amount = Math.floor(duration * 2.5 * 100) / 100;
        const slot = `${['A', 'B', 'C'][Math.floor(Math.random() * 3)]}${Math.floor(Math.random() * 50) + 1}`;
        
        transactions.push({
          id: `BAL${Date.now()}_${i}`,
          type: 'debit',
          amount: -amount,
          description: `Parking Fee - Slot ${slot}`,
          date: transactionDate.toISOString(),
          reference: `PKG${Date.now()}${i}`,
          paymentMethod: 'Account Balance',
          status: 'completed',
          duration: duration,
          parkingSlot: slot,
          createdBy: 'System'
        });
      }
    }
    
    return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const addBalanceTransaction = async (customerId, transactionData) => {
    if (!user || user.role !== 'staff') {
      throw new Error('Unauthorized: Only staff can add balance transactions');
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const transactions = getCustomerBalanceStatement(customerId);
      const newTransaction = {
        ...transactionData,
        id: `BAL${Date.now()}`,
        date: new Date().toISOString(),
        status: 'completed',
        createdBy: user.staffId || user.email,
        reference: `MAN${Date.now()}`
      };
      
      const updatedTransactions = [newTransaction, ...transactions];
      localStorage.setItem(`customer_balance_${customerId}`, JSON.stringify(updatedTransactions));
      
      // Update customer's account balance
      const customer = getCustomerById(customerId);
      if (customer) {
        const newBalance = customer.accountBalance + parseFloat(transactionData.amount);
        await updateCustomer(customerId, { accountBalance: newBalance });
      }
      
      return { success: true, transaction: newTransaction };
    } catch (error) {
      console.error('Error adding balance transaction:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateBalanceTransaction = async (customerId, transactionId, updates) => {
    if (!user || user.role !== 'staff') {
      throw new Error('Unauthorized: Only staff can update balance transactions');
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const transactions = getCustomerBalanceStatement(customerId);
      const updatedTransactions = transactions.map(transaction => 
        transaction.id === transactionId 
          ? { ...transaction, ...updates, lastModified: new Date().toISOString() }
          : transaction
      );
      
      localStorage.setItem(`customer_balance_${customerId}`, JSON.stringify(updatedTransactions));
      return { success: true };
    } catch (error) {
      console.error('Error updating balance transaction:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteBalanceTransaction = async (customerId, transactionId) => {
    if (!user || user.role !== 'staff') {
      throw new Error('Unauthorized: Only staff can delete balance transactions');
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const transactions = getCustomerBalanceStatement(customerId);
      const transactionToDelete = transactions.find(t => t.id === transactionId);
      const updatedTransactions = transactions.filter(transaction => transaction.id !== transactionId);
      
      localStorage.setItem(`customer_balance_${customerId}`, JSON.stringify(updatedTransactions));
      
      // Update customer's account balance by reversing the deleted transaction
      if (transactionToDelete) {
        const customer = getCustomerById(customerId);
        if (customer) {
          const newBalance = customer.accountBalance - parseFloat(transactionToDelete.amount);
          await updateCustomer(customerId, { accountBalance: newBalance });
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting balance transaction:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    customers,
    loading,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
    // Vehicle management
    getCustomerVehicles,
    addCustomerVehicle,
    updateCustomerVehicle,
    deleteCustomerVehicle,
    // Balance statement management
    getCustomerBalanceStatement,
    addBalanceTransaction,
    updateBalanceTransaction,
    deleteBalanceTransaction
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
}; 