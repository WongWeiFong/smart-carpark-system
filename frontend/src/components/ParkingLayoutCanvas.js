import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Rect, Text, Group, Circle, Line } from "react-konva";
import "./ParkingLayoutCanvas.css";

const ParkingLayoutCanvas = ({
  slots = [],
  currentSlot = null,
  selectedSlot = null,
  onSlotClick = () => {},
  onSlotHover = () => {},
  editable = false,
  width = 800,
  height = 600,
  staffMode = false,
  showBulkActions = false,
  selectedSlots = new Set(),
  onBulkSlotToggle = () => {},
}) => {
  const [stageScale, setStageScale] = useState(1);
  const [stageX, setStageX] = useState(0);
  const [stageY, setStageY] = useState(0);
  const [dragEnabled, setDragEnabled] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width, height });
  const stageRef = useRef();
  const containerRef = useRef();

  // Make canvas responsive to container
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const aspectRatio = height / width;
        const newHeight = containerWidth * aspectRatio;

        setCanvasSize({
          width: containerWidth,
          height: Math.min(newHeight, 650), // Max height limit
        });
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [width, height]);

  // Parking sections configuration
  const sections = [
    {
      id: "C",
      name: "Center",
      x: 200,
      y: 170,
      rows: 2,
      cols: 22,
      startNumber: 1,
      slotWidth: 30,
      slotHeight: 40,
    },
    {
      id: "ML",
      name: "Mall West",
      x: 200,
      y: 380,
      rows: 2,
      cols: 5,
      startNumber: 1,
      slotWidth: 30,
      slotHeight: 40,
    },
    {
      id: "Mall",
      name: "Mall",
      x: 380,
      y: 380,
      rows: 1,
      cols: 1,
      startNumber: 0,
      slotWidth: 375,
      slotHeight: 84,
    },
    {
      id: "ME",
      name: "Mall East",
      x: 770,
      y: 380,
      rows: 2,
      cols: 5,
      startNumber: 1,
      slotWidth: 30,
      slotHeight: 40,
    },
    {
      id: "E",
      name: "East",
      x: 1050,
      y: 100,
      rows: 12,
      cols: 1,
      startNumber: 1,
      slotWidth: 40,
      slotHeight: 30,
    },
    {
      id: "S",
      name: "South",
      x: 200,
      y: 550,
      rows: 1,
      cols: 22,
      startNumber: 1,
      slotWidth: 30,
      slotHeight: 40,
    },
    {
      id: "W",
      name: "West",
      x: 30,
      y: 100,
      rows: 12,
      cols: 1,
      startNumber: 1,
      slotWidth: 40,
      slotHeight: 30,
    },
    {
      id: "N",
      name: "North",
      x: 200,
      y: 10,
      rows: 1,
      cols: 22,
      startNumber: 1,
      slotWidth: 30,
      slotHeight: 40,
    },
  ];

  // Slot dimensions
  // const slotWidth = 30;
  // const slotHeight = 40;
  const slotSpacing = 4;

  // Get slot status
  const getSlotStatus = (slotNumber) => {
    if (currentSlot === slotNumber) return "current";
    if (selectedSlot === slotNumber) return "selected";
    if (showBulkActions && selectedSlots.has(slotNumber))
      return "bulk-selected";
    const slot = slots.find((s) => s.number === slotNumber);

    // Use effectiveStatus for sensor-based system, fallback to status for compatibility
    const status = slot
      ? slot.effectiveStatus || slot.status || "available"
      : "available";

    // Add visual indicator for manual overrides in staff mode
    if (staffMode && slot?.manualOverride) {
      return status + "-override";
    }

    return status;
  };

  // Get slot color based on status
  const getSlotColor = (status) => {
    // Handle override statuses
    if (status.includes("-override")) {
      const baseStatus = status.replace("-override", "");
      switch (baseStatus) {
        case "available":
          return "#e8f5e8";
        case "occupied":
          return "#ffe6e6";
        case "maintenance":
          return "#f0f0f0";
        default:
          return "#fff8dc";
      }
    }

    switch (status) {
      case "current":
        return "#28a745";
      case "selected":
        return "#667eea";
      case "bulk-selected":
        return "#ff9500";
      case "occupied":
        return "#dc3545";
      // case 'reserved': return '#ffc107';
      case "maintenance":
        return "#6c757d";
      default:
        return "#f8f9fa";
    }
  };

  // Get slot border color
  const getSlotBorderColor = (status) => {
    // Handle override statuses with special orange border
    if (status.includes("-override")) {
      return "#ff6b00"; // Orange border for manual overrides
    }

    switch (status) {
      case "current":
        return "#1e7e34";
      case "selected":
        return "#5a67d8";
      case "bulk-selected":
        return "#ff6b00";
      case "occupied":
        return "#c82333";
      // case 'reserved': return '#e0a800';
      case "maintenance":
        return "#5a6268";
      default:
        return "#dee2e6";
    }
  };

  // Handle slot click
  const handleSlotClick = (slotNumber) => {
    if (showBulkActions && staffMode) {
      // In bulk mode, toggle slot selection
      onBulkSlotToggle(slotNumber);
    } else if (onSlotClick) {
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
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    // Limit zoom levels
    if (newScale < 0.5 || newScale > 3) return;

    setStageScale(newScale);
    setStageX(
      -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale
    );
    setStageY(
      -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
    );
  };

  // Reset zoom and position
  const resetView = () => {
    setStageScale(1);
    setStageX(0);
    setStageY(0);
  };

  // Render parking slot
  const renderSlot = (slotNumber, x, y, slotWidth, slotHeight) => {
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
          fill={"#333"}
          // fill={status === "available" ? "#333" : "#fff"}
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
        const x = section.x + col * (section.slotWidth + slotSpacing);
        const y = section.y + row * (section.slotHeight + slotSpacing) + 30;
        slots.push(
          renderSlot(slotNumber, x, y, section.slotWidth, section.slotHeight)
        );
        slotNumber++;
      }
    }

    return (
      <Group key={section.id}>
        {/* Section background */}
        <Rect
          x={section.x - 10}
          y={section.y}
          width={section.cols * (section.slotWidth + slotSpacing) + 10}
          height={section.rows * (section.slotHeight + slotSpacing) + 40}
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
    const renderArrow = (points, direction = "down") => {
      const [startX, startY, endX, endY] = points;
      const arrowLength = 15;
      const arrowAngle = Math.PI / 6; // 30 degrees

      // Calculate arrow direction
      const angle = Math.atan2(endY - startY, endX - startX);

      // Arrow head points
      const arrowHead1X = endX - arrowLength * Math.cos(angle - arrowAngle);
      const arrowHead1Y = endY - arrowLength * Math.sin(angle - arrowAngle);
      const arrowHead2X = endX - arrowLength * Math.cos(angle + arrowAngle);
      const arrowHead2Y = endY - arrowLength * Math.sin(angle + arrowAngle);
      return (
        <Group>
          {/* Main line */}
          <Line
            points={points}
            stroke="#666"
            strokeWidth={4}
            listening={false}
          />
          {/* Arrow head */}
          <Line
            points={[endX, endY, arrowHead1X, arrowHead1Y]}
            stroke="#666"
            strokeWidth={4}
            listening={false}
          />
          <Line
            points={[endX, endY, arrowHead2X, arrowHead2Y]}
            stroke="#666"
            strokeWidth={4}
            listening={false}
          />
        </Group>
      );
    };
    return (
      <Group>
        {/* Entry 1*/}
        <Group x={width / 6 - 60} y={20}>
          <Rect
            width={80}
            height={30}
            fill="#667eea"
            cornerRadius={15}
            listening={false}
          />
          <Text
            x={15}
            y={10}
            text="ENTRY 1"
            fontSize={12}
            fontFamily="Arial"
            fontStyle="bold"
            fill="white"
            width={80}
            align="left"
            verticalAlign="middle"
            listening={false}
          />
        </Group>

        {/* Entry 2*/}
        <Group x={width + 60} y={height / 2 + 250}>
          <Rect
            width={80}
            height={30}
            fill="#667eea"
            cornerRadius={15}
            listening={false}
          />
          <Text
            x={15}
            y={10}
            text="ENTRY 2"
            fontSize={12}
            fontFamily="Arial"
            fontStyle="bold"
            fill="white"
            width={80}
            align="left"
            verticalAlign="middle"
            listening={false}
          />
        </Group>

        {/* Exit 1*/}
        <Group x={width + 60} y={20}>
          <Rect
            width={80}
            height={30}
            fill="#ff6b6b"
            cornerRadius={15}
            listening={false}
          />
          <Text
            x={-15}
            y={10}
            text="EXIT 1"
            fontSize={12}
            fontFamily="Arial"
            fontStyle="bold"
            fill="white"
            width={80}
            align="right"
            verticalAlign="middle"
            listening={false}
          />
        </Group>

        {/* Exit 2*/}
        <Group x={width / 6 - 60} y={height / 2 + 250}>
          <Rect
            width={80}
            height={30}
            fill="#ff6b6b"
            cornerRadius={15}
            listening={false}
          />
          <Text
            x={-15}
            y={10}
            text="EXIT 2"
            fontSize={12}
            fontFamily="Arial"
            fontStyle="bold"
            fill="white"
            width={80}
            align="right"
            verticalAlign="middle"
            listening={false}
          />
        </Group>

        {/* Road/Path indicators
        <Line
          points={[width / 6 - 20, 60, width / 6 - 20, height - 80]}
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
        /> */}

        {/* Road/Path arrows - showing traffic flow direction */}
        {/* Entry 1 to Exit 2 */}
        {renderArrow([width / 6 - 20, 60, width / 6 - 20, 570])}
        {/* left to right 1*/}
        {renderArrow([width / 6 - 10, 120, width + 80, 120])}
        {/* right to left 1*/}
        {renderArrow([width + 80, 140, width / 6 - 10, 140])}
        {/* left to right 2*/}
        {renderArrow([width / 6 - 10, 330, width + 80, 330])}
        {/* right to left 2*/}
        {renderArrow([width + 80, 350, width / 6 - 10, 350])}
        {/* left to right 3 */}
        {renderArrow([width / 6 - 10, 540, width + 80, 540])}
        {/* Entry 2 to Exit 1 */}
        {renderArrow([width + 100, 570, width + 100, 60])}
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
            onClick={() => setStageScale((prev) => Math.min(prev * 1.2, 3))}
          >
            🔍+
          </button>
          <span className="zoom-level">{Math.round(stageScale * 100)}%</span>
          <button
            className="control-btn"
            onClick={() => setStageScale((prev) => Math.max(prev / 1.2, 0.5))}
          >
            🔍-
          </button>
          <button className="control-btn" onClick={resetView}>
            🎯
          </button>
        </div>

        {/* <div className="view-controls">
          <label className="drag-toggle">
            <input
              type="checkbox"
              checked={dragEnabled}
              onChange={(e) => setDragEnabled(e.target.checked)}
            />
            Pan Mode
          </label>
        </div> */}
      </div>

      {/* Legend */}
      <div className="canvas-legend">
        <div className="legend-item">
          <div
            className="legend-color"
            style={{ backgroundColor: "#f8f9fa", border: "2px solid #dee2e6" }}
          ></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div
            className="legend-color"
            style={{ backgroundColor: "#dc3545" }}
          ></div>
          <span>Occupied</span>
        </div>
        <div className="legend-item">
          <div
            className="legend-color"
            style={{ backgroundColor: "#28a745" }}
          ></div>
          <span>Current</span>
        </div>
        <div className="legend-item">
          <div
            className="legend-color"
            style={{ backgroundColor: "#667eea" }}
          ></div>
          <span>Selected</span>
        </div>
        {/* <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#ffc107' }}></div>
          <span>Reserved</span>
        </div> */}
        <div className="legend-item">
          <div
            className="legend-color"
            style={{ backgroundColor: "#6c757d" }}
          ></div>
          <span>Maintenance</span>
        </div>
        {staffMode && showBulkActions && (
          <div className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: "#ff9500" }}
            ></div>
            <span>Bulk Selected</span>
          </div>
        )}
      </div>

      {/* Konva Stage */}
      <div className="canvas-container" ref={containerRef}>
        <Stage
          width={canvasSize.width}
          height={canvasSize.height}
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
              width={canvasSize.width}
              height={canvasSize.height}
              fill="#f8f9fa"
              listening={false}
            />

            {/* Entrance/Exit */}
            {renderEntranceExit()}

            {/* Parking Sections */}
            {sections.map((section) => renderSection(section))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default ParkingLayoutCanvas;
