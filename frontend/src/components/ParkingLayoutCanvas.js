import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Group, Circle, Line } from 'react-konva';
import './ParkingLayoutCanvas.css';

const ParkingLayoutCanvas = ({ 
  slots = [], 
  currentSlot = null, 
  selectedSlot = null,
  onSlotClick = () => {},
  onSlotHover = () => {},
  editable = false,
  width = 800,
  height = 600
}) => {
  const [stageScale, setStageScale] = useState(1);
  const [stageX, setStageX] = useState(0);
  const [stageY, setStageY] = useState(0);
  const [dragEnabled, setDragEnabled] = useState(false);
  const stageRef = useRef();

  // Parking sections configuration
  const sections = [
    { id: 'A', name: 'Section A', x: 50, y: 100, rows: 4, cols: 10, startNumber: 1 },
    { id: 'B', name: 'Section B', x: 450, y: 100, rows: 4, cols: 10, startNumber: 41 },
    { id: 'C', name: 'Section C', x: 50, y: 350, rows: 4, cols: 10, startNumber: 81 },
    { id: 'D', name: 'Section D', x: 450, y: 350, rows: 4, cols: 10, startNumber: 121 }
  ];

  // Slot dimensions
  const slotWidth = 30;
  const slotHeight = 20;
  const slotSpacing = 4;

  // Get slot status
  const getSlotStatus = (slotNumber) => {
    if (currentSlot === slotNumber) return 'current';
    if (selectedSlot === slotNumber) return 'selected';
    const slot = slots.find(s => s.number === slotNumber);
    return slot ? slot.status || 'available' : 'available';
  };

  // Get slot color based on status
  const getSlotColor = (status) => {
    switch (status) {
      case 'current': return '#28a745';
      case 'selected': return '#667eea';
      case 'occupied': return '#dc3545';
      case 'reserved': return '#ffc107';
      case 'maintenance': return '#6c757d';
      default: return '#f8f9fa';
    }
  };

  // Get slot border color
  const getSlotBorderColor = (status) => {
    switch (status) {
      case 'current': return '#1e7e34';
      case 'selected': return '#5a67d8';
      case 'occupied': return '#c82333';
      case 'reserved': return '#e0a800';
      case 'maintenance': return '#5a6268';
      default: return '#dee2e6';
    }
  };

  // Handle slot click
  const handleSlotClick = (slotNumber) => {
    if (onSlotClick) {
      onSlotClick(slotNumber);
    }
  };

  // Handle slot hover
  const handleSlotHover = (slotNumber, isHovering) => {
    if (onSlotHover) {
      onSlotHover(slotNumber, isHovering);
    }
  };

  // Handle wheel zoom
  const handleWheel = (e) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.02;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    // Limit zoom levels
    if (newScale < 0.5 || newScale > 3) return;

    setStageScale(newScale);
    setStageX(-(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale);
    setStageY(-(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale);
  };

  // Reset zoom and position
  const resetView = () => {
    setStageScale(1);
    setStageX(0);
    setStageY(0);
  };

  // Render parking slot
  const renderSlot = (slotNumber, x, y) => {
    const status = getSlotStatus(slotNumber);
    const color = getSlotColor(status);
    const borderColor = getSlotBorderColor(status);

    return (
      <Group key={slotNumber} x={x} y={y}>
        <Rect
          width={slotWidth}
          height={slotHeight}
          fill={color}
          stroke={borderColor}
          strokeWidth={2}
          cornerRadius={2}
          onClick={() => handleSlotClick(slotNumber)}
          onMouseEnter={() => handleSlotHover(slotNumber, true)}
          onMouseLeave={() => handleSlotHover(slotNumber, false)}
          onTap={() => handleSlotClick(slotNumber)}
          listening={true}
        />
        <Text
          x={slotWidth / 2}
          y={slotHeight / 2}
          text={slotNumber.toString()}
          fontSize={10}
          fontFamily="Arial"
          fill={status === 'available' ? '#333' : '#fff'}
          width={slotWidth}
          height={slotHeight}
          align="center"
          verticalAlign="middle"
          listening={false}
        />
      </Group>
    );
  };

  // Render section
  const renderSection = (section) => {
    const slots = [];
    let slotNumber = section.startNumber;

    for (let row = 0; row < section.rows; row++) {
      for (let col = 0; col < section.cols; col++) {
        const x = section.x + col * (slotWidth + slotSpacing);
        const y = section.y + row * (slotHeight + slotSpacing) + 30;
        slots.push(renderSlot(slotNumber, x, y));
        slotNumber++;
      }
    }

    return (
      <Group key={section.id}>
        {/* Section background */}
        <Rect
          x={section.x - 10}
          y={section.y}
          width={section.cols * (slotWidth + slotSpacing) + 10}
          height={section.rows * (slotHeight + slotSpacing) + 40}
          fill="rgba(255, 255, 255, 0.8)"
          stroke="#dee2e6"
          strokeWidth={2}
          cornerRadius={8}
          listening={false}
        />
        
        {/* Section title */}
        <Text
          x={section.x}
          y={section.y + 10}
          text={section.name}
          fontSize={16}
          fontFamily="Arial"
          fontStyle="bold"
          fill="#333"
          listening={false}
        />
        
        {/* Slots */}
        {slots}
      </Group>
    );
  };

  // Render entrance/exit
  const renderEntranceExit = () => {
    return (
      <Group>
        {/* Entrance */}
        <Group x={width / 2 - 100} y={20}>
          <Rect
            width={80}
            height={30}
            fill="#667eea"
            cornerRadius={15}
            listening={false}
          />
          <Text
            x={40}
            y={15}
            text="ENTRANCE"
            fontSize={12}
            fontFamily="Arial"
            fontStyle="bold"
            fill="white"
            width={80}
            align="center"
            verticalAlign="middle"
            listening={false}
          />
        </Group>

        {/* Exit */}
        <Group x={width / 2 + 20} y={20}>
          <Rect
            width={80}
            height={30}
            fill="#ff6b6b"
            cornerRadius={15}
            listening={false}
          />
          <Text
            x={40}
            y={15}
            text="EXIT"
            fontSize={12}
            fontFamily="Arial"
            fontStyle="bold"
            fill="white"
            width={80}
            align="center"
            verticalAlign="middle"
            listening={false}
          />
        </Group>

        {/* Road/Path indicators */}
        <Line
          points={[width / 2 - 50, 60, width / 2 - 50, height - 20]}
          stroke="#999"
          strokeWidth={3}
          dash={[10, 5]}
          listening={false}
        />
        
        <Line
          points={[width / 2 + 50, 60, width / 2 + 50, height - 20]}
          stroke="#999"
          strokeWidth={3}
          dash={[10, 5]}
          listening={false}
        />
      </Group>
    );
  };

  return (
    <div className="parking-layout-canvas">
      {/* Controls */}
      <div className="canvas-controls">
        <div className="zoom-controls">
          <button 
            className="control-btn"
            onClick={() => setStageScale(prev => Math.min(prev * 1.2, 3))}
          >
            🔍+
          </button>
          <span className="zoom-level">{Math.round(stageScale * 100)}%</span>
          <button 
            className="control-btn"
            onClick={() => setStageScale(prev => Math.max(prev / 1.2, 0.5))}
          >
            🔍-
          </button>
          <button className="control-btn" onClick={resetView}>
            🎯
          </button>
        </div>
        
        <div className="view-controls">
          <label className="drag-toggle">
            <input 
              type="checkbox" 
              checked={dragEnabled}
              onChange={(e) => setDragEnabled(e.target.checked)}
            />
            Pan Mode
          </label>
        </div>
      </div>

      {/* Legend */}
      <div className="canvas-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#f8f9fa', border: '2px solid #dee2e6' }}></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#dc3545' }}></div>
          <span>Occupied</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#28a745' }}></div>
          <span>Current</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#667eea' }}></div>
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#ffc107' }}></div>
          <span>Reserved</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#6c757d' }}></div>
          <span>Maintenance</span>
        </div>
      </div>

      {/* Konva Stage */}
      <div className="canvas-container">
        <Stage
          width={width}
          height={height}
          onWheel={handleWheel}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stageX}
          y={stageY}
          draggable={dragEnabled}
          onDragEnd={(e) => {
            setStageX(e.target.x());
            setStageY(e.target.y());
          }}
          ref={stageRef}
        >
          <Layer>
            {/* Background */}
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill="#f8f9fa"
              listening={false}
            />
            
            {/* Entrance/Exit */}
            {renderEntranceExit()}
            
            {/* Parking Sections */}
            {sections.map(section => renderSection(section))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default ParkingLayoutCanvas; 