# Sensor-Based Parking Slot Management System

## 🎯 **Overview**

The parking slot management system is now **sensor-based**, meaning slot availability is determined by **physical sensors** (ultrasonic, magnetic, camera), not user bookings. Staff can manually override sensor readings when sensors malfunction, but this doesn't affect vehicle/user data.

## 📡 **How Sensors Work**

### **Sensor Types Supported:**
- **🔊 Ultrasonic sensors** - Detect vehicle presence via sound waves
- **🧲 Magnetic sensors** - Detect metal vehicle presence
- **📷 Camera sensors** - Computer vision vehicle detection

### **Sensor Data Structure:**
```javascript
{
  number: 15,
  section: "A",
  
  // Sensor Information
  sensorId: "SENSOR_015",
  sensorType: "ultrasonic",
  sensorHealth: "healthy", // or "malfunction"
  sensorStatus: "occupied", // or "available", "sensor_error"
  lastSensorReading: "2023-12-10T14:30:00Z",
  
  // Staff Override
  manualOverride: false,
  manualStatus: null, // only set when overridden
  overrideReason: null, // "sensor_malfunction", "maintenance", etc.
  
  // Effective Status (what users see)
  effectiveStatus: "occupied", // resolved from sensor + override
  
  // Metadata
  lastUpdated: "2023-12-10T14:30:00Z",
  updatedBy: "Sensor" // or "Staff Name"
}
```

## 🔧 **Staff Manual Override System**

### **When to Use Manual Override:**
1. **🚨 Sensor Malfunction** - Sensor reports wrong status
2. **🔧 Maintenance** - Slot needs physical maintenance
3. **🚨 Emergency** - Special situations requiring slot control
4. **🎪 Special Events** - Reserve areas for events

### **Override Process:**
1. **Click slot** on interactive layout
2. **View sensor data** (current reading, health status)
3. **Apply override** (Force Available/Occupied/Maintenance)
4. **Orange border** indicates manual override active
5. **Reset to sensor** when ready to return control

## 🎨 **Visual Status System**

### **Color Coding:**
- 🟢 **Green** - Available (sensor detected)
- 🔴 **Red** - Occupied (sensor detected)
- ⚫ **Gray** - Maintenance (staff set)
- 🟠 **Orange Border** - Manual override active

### **Status Priority:**
1. **Manual Override** (highest) - Staff control
2. **Sensor Reading** (normal) - Automatic detection
3. **Maintenance Mode** (fallback) - When sensor fails

## 🛠️ **Staff Interface Features**

### **📊 Dashboard Statistics:**
- **Total Slots** - All parking slots
- **Available (Sensor)** - Sensor-detected available
- **Occupied (Sensor)** - Sensor-detected occupied
- **Maintenance** - Slots under maintenance
- **Sensor Errors** - Malfunctioning sensors
- **Manual Overrides** - Staff-controlled slots

### **🔧 Sensor Management:**
- **View Sensor ID** - Unique sensor identifier
- **Check Health** - Healthy/Malfunction status
- **Repair Sensor** - Simulate sensor repair
- **Reset Override** - Return to sensor control

### **📋 Bulk Operations:**
- **Mass Override** - Override multiple slots
- **Filter by Status** - Find specific slot types
- **Search Sensors** - Find by sensor ID or slot number

## 🔄 **Automatic Sensor Updates**

### **Real-time Simulation:**
- **2% chance** - Status change (car enters/leaves)
- **0.1% chance** - Sensor malfunction
- **Continuous updates** - Every few seconds
- **No user impact** - Sensors work independently

### **Sensor Health Monitoring:**
- **Healthy sensors** - Regular status updates
- **Malfunctioning sensors** - Marked for maintenance
- **Error detection** - Automatic health monitoring
- **Repair simulation** - Staff can "fix" sensors

## 🚫 **What Doesn't Affect User Data**

### **Sensor-Only Changes:**
- ✅ **Sensor readings** - Don't affect user bookings
- ✅ **Manual overrides** - Don't change user accounts
- ✅ **Maintenance mode** - Doesn't cancel reservations
- ✅ **Sensor repairs** - Don't impact user data

### **Separate Systems:**
- **🚗 User parking** - Booking/payment system
- **📡 Sensor data** - Physical slot detection
- **👤 Staff overrides** - Manual control only
- **💰 Billing** - Independent of sensor status

## 🎯 **Use Case Examples**

### **Scenario 1: Sensor Malfunction**
1. **Sensor reports** slot occupied (false positive)
2. **Staff investigates** - slot actually empty
3. **Manual override** - Force available
4. **Orange border** shows override active
5. **Later repair** sensor and reset to sensor control

### **Scenario 2: Maintenance Mode**
1. **Physical problem** with parking slot
2. **Staff sets** slot to maintenance
3. **Blocks** new parker entries to that slot
4. **Doesn't affect** current user if parked there
5. **Reset** when maintenance complete

### **Scenario 3: Emergency Override**
1. **Emergency vehicle** needs access
2. **Staff force** multiple slots available
3. **Bulk override** for quick action
4. **Later reset** all slots to sensor control

## 🔐 **Security & Permissions**

### **Staff-Only Actions:**
- ✅ Manual override slot status
- ✅ Repair sensor functionality
- ✅ Reset slots to sensor control
- ✅ View detailed sensor information
- ❌ Users cannot override sensors
- ❌ Users cannot see sensor details

### **Audit Trail:**
- **Track who** made changes
- **Record when** changes occurred
- **Log reasons** for overrides
- **Monitor** sensor health history

## 📱 **Mobile & Touch Support**

- ✅ **Touch-friendly** slot selection
- ✅ **Responsive design** for tablets
- ✅ **Swipe gestures** supported
- ✅ **Mobile dashboard** optimized

## 🚀 **Benefits of Sensor-Based System**

1. **🤖 Automatic** - No manual slot updates needed
2. **🎯 Accurate** - Real-time physical detection
3. **🔧 Flexible** - Staff can override when needed
4. **🛡️ Reliable** - Separate from user systems
5. **📊 Insightful** - Real usage data from sensors
6. **⚡ Fast** - Instant status updates
7. **🔄 Resilient** - Works even with some sensor failures

The sensor-based approach provides accurate, real-time parking slot availability while giving staff the flexibility to handle special situations through manual overrides, without affecting the user experience or billing systems.
