import React, { useState, useEffect, useRef, useMemo } from "react";
import { Stage, Layer, Rect, Text, Group, Line } from "react-konva";
import "./ParkingLayoutCanvas.css";

const ParkingLayoutCanvas = ({
  slots = [], // expects [{ number: "E-4", status: "occupied", manualOverride?: true }]
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

  // Normalize and index incoming slots for fast lookup
  const slotIndex = useMemo(() => {
    const map = new Map();
    (slots || []).forEach((s) => {
      // Allow both shapes:
      // 1) { number: "E-4", status: "occupied" }
      // 2) { section: "E", number: 4, status: "occupied" }  (will normalize)
      const id =
        typeof s.number === "string" ? s.number : `${s.section}-${s.number}`;
      map.set(id, {
        status: s.effectiveStatus || s.status || "available",
        manualOverride: !!s.manualOverride,
      });
    });
    return map;
  }, [slots]);

  // Responsive canvas
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const aspectRatio = height / width;
        const newHeight = containerWidth * aspectRatio;

        setCanvasSize({
          width: containerWidth,
          height: Math.min(newHeight, 650),
        });
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [width, height]);

  // Sections layout (your plan)
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
      id: "MW",
      name: "Mall West",
      x: 200,
      y: 380,
      rows: 2,
      cols: 5,
      startNumber: 1,
      slotWidth: 30,
      slotHeight: 40,
    },
    // {
    //   id: "Mall",
    //   name: "Mall",
    //   x: 380,
    //   y: 380,
    //   rows: 1,
    //   cols: 1,
    //   startNumber: 1,
    //   slotWidth: 375,
    //   slotHeight: 84,
    // },
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

  const slotSpacing = 4;

  // Status / color logic
  const getSlotStatus = (sectionId, slotNumber) => {
    const uniqueSlotId = `${sectionId}-${slotNumber}`;
    if (currentSlot === uniqueSlotId) return "current";
    if (selectedSlot === uniqueSlotId) return "selected";
    if (showBulkActions && selectedSlots.has(uniqueSlotId))
      return "bulk-selected";

    const slot = slotIndex.get(uniqueSlotId); // normalized lookup
    const status = slot ? slot.status || "available" : "available";

    if (staffMode && slot?.manualOverride) return status + "-override";
    return status;
  };

  const getSlotColor = (status) => {
    if (status.includes("-override")) {
      const base = status.replace("-override", "");
      switch (base) {
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
        return "#cfc61f";
      case "selected":
        return "#667eea";
      case "bulk-selected":
        return "#ff9500";
      case "occupied":
        return "#dc3545";
      case "maintenance":
        return "#6c757d";
      default:
        return "#28a745";
    }
  };

  const getSlotBorderColor = (status) => {
    if (status.includes("-override")) return "#ff6b00";
    switch (status) {
      case "current":
        return "#1e7e34";
      case "selected":
        return "#5a67d8";
      case "bulk-selected":
        return "#ff6b00";
      case "occupied":
        return "#c82333";
      case "maintenance":
        return "#5a6268";
      default:
        return "#dee2e6";
    }
  };

  // Interactions
  const handleSlotClick = (sectionId, slotNumber) => {
    const uniqueSlotId = `${sectionId}-${slotNumber}`;
    if (showBulkActions && staffMode) {
      onBulkSlotToggle(uniqueSlotId);
    } else {
      onSlotClick(uniqueSlotId);
    }
  };

  const handleSlotHover = (sectionId, slotNumber, isHovering) => {
    const uniqueSlotId = `${sectionId}-${slotNumber}`;
    onSlotHover(uniqueSlotId, isHovering);
  };

  // const handleWheel = (e) => {
  //   e.evt.preventDefault();
  //   const scaleBy = 1.02;
  //   const stage = e.target.getStage();
  //   const oldScale = stage.scaleX();
  //   const pointer = stage.getPointerPosition();

  //   const mousePointTo = {
  //     x: pointer.x / oldScale - stage.x() / oldScale,
  //     y: pointer.y / oldScale - stage.y() / oldScale,
  //   };

  //   const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
  //   if (newScale < 0.5 || newScale > 3) return;

  //   setStageScale(newScale);
  //   setStageX(-(mousePointTo.x - pointer.x / newScale) * newScale);
  //   setStageY(-(mousePointTo.y - pointer.y / newScale) * newScale);
  // };

  // const resetView = () => {
  //   setStageScale(1);
  //   setStageX(0);
  //   setStageY(0);
  // };

  // Rendering primitives
  const renderSlot = (sectionId, slotNumber, x, y, slotWidth, slotHeight) => {
    const status = getSlotStatus(sectionId, slotNumber);
    const color = getSlotColor(status);
    const borderColor = getSlotBorderColor(status);
    const uniqueSlotId = `${sectionId}-${slotNumber}`;

    return (
      <Group key={uniqueSlotId} x={x} y={y}>
        <Rect
          width={slotWidth}
          height={slotHeight}
          fill={color}
          stroke={borderColor}
          strokeWidth={2}
          cornerRadius={2}
          onClick={() => handleSlotClick(sectionId, slotNumber)}
          onMouseEnter={() => handleSlotHover(sectionId, slotNumber, true)}
          onMouseLeave={() => handleSlotHover(sectionId, slotNumber, false)}
          onTap={() => handleSlotClick(sectionId, slotNumber)}
          listening={true}
        />
        <Text
          x={0}
          y={0}
          text={String(slotNumber)}
          fontSize={10}
          fontFamily="Arial"
          fill={"#333"}
          width={slotWidth}
          height={slotHeight}
          align="center"
          verticalAlign="middle"
          listening={false}
        />
      </Group>
    );
  };

  const renderSection = (section) => {
    const nodes = [];
    let slotNumber = section.startNumber;

    for (let row = 0; row < section.rows; row++) {
      for (let col = 0; col < section.cols; col++) {
        const x = section.x + col * (section.slotWidth + slotSpacing);
        const y = section.y + row * (section.slotHeight + slotSpacing) + 30;
        nodes.push(
          renderSlot(
            section.id,
            slotNumber,
            x,
            y,
            section.slotWidth,
            section.slotHeight
          )
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
        {/* Title */}
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
        {nodes}
      </Group>
    );
  };

  const renderArrow = (points) => {
    const [startX, startY, endX, endY] = points;
    const arrowLength = 15;
    const arrowAngle = Math.PI / 6;
    const angle = Math.atan2(endY - startY, endX - startX);
    const ah1x = endX - arrowLength * Math.cos(angle - arrowAngle);
    const ah1y = endY - arrowLength * Math.sin(angle - arrowAngle);
    const ah2x = endX - arrowLength * Math.cos(angle + arrowAngle);
    const ah2y = endY - arrowLength * Math.sin(angle + arrowAngle);
    return (
      <Group>
        <Line points={points} stroke="#666" strokeWidth={4} listening={false} />
        <Line
          points={[endX, endY, ah1x, ah1y]}
          stroke="#666"
          strokeWidth={4}
          listening={false}
        />
        <Line
          points={[endX, endY, ah2x, ah2y]}
          stroke="#666"
          strokeWidth={4}
          listening={false}
        />
      </Group>
    );
  };

  const renderEntranceExit = () => (
    <Group>
      <Group x={372} y={382}>
        <Rect
          width={386}
          height={126}
          fill="white"
          stroke="grey"
          strokeWidth={2}
          cornerRadius={15}
          listening={false}
        />
        <Text
          x={0}
          y={0}
          text="MALL"
          fontSize={50}
          fontFamily="Arial"
          fontStyle="bold"
          fill="black"
          width={270}
          height={130}
          align="right"
          verticalAlign="middle"
          listening={false}
        />
      </Group>

      {/* Entry 1 */}
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

      {/* Entry 2 */}
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

      {/* Exit 1 */}
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

      {/* Exit 2 */}
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

      {/* Flow arrows */}
      {renderArrow([width / 6 - 20, 60, width / 6 - 20, 570])}
      {renderArrow([width / 6 - 10, 120, width + 80, 120])}
      {renderArrow([width + 80, 140, width / 6 - 10, 140])}
      {renderArrow([width / 6 - 10, 330, width + 80, 330])}
      {renderArrow([width + 80, 350, width / 6 - 10, 350])}
      {renderArrow([width / 6 - 10, 530, width + 80, 530])}
      {renderArrow([width + 100, 570, width + 100, 60])}
    </Group>
  );

  return (
    <div className="parking-layout-canvas">
      {/* Controls */}
      {/* <div className="canvas-controls">
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
        //<label className="drag-toggle"><input type="checkbox" checked={dragEnabled} onChange={(e) => setDragEnabled(e.target.checked)} /> Pan</label>
      </div> */}

      {/* Legend */}
      <div className="canvas-legend">
        <div className="legend-item">
          <div
            className="legend-color"
            style={{ backgroundColor: "#28a745" }}
            // style={{ backgroundColor: "#28a745", border: "2px solid #dee2e6" }}
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
            style={{ backgroundColor: "#cfc61f" }}
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
          // onWheel={handleWheel}
          // scaleX={stageScale}
          // scaleY={stageScale}
          // x={stageX}
          // y={stageY}
          // draggable={dragEnabled}
          // onDragEnd={(e) => {
          //   setStageX(e.target.x());
          //   setStageY(e.target.y());
          // }}
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
            {/* Sections */}
            {sections.map((section) => renderSection(section))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default ParkingLayoutCanvas;
