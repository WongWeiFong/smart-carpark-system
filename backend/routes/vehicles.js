// backend/routes/vehicles.js
const express = require("express");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");

const router = express.Router();

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    // support both styles of env var names (Educate vs standard)
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.aws_access_key_id,
    secretAccessKey:
      process.env.AWS_SECRET_ACCESS_KEY || process.env.aws_secret_access_key,
    sessionToken:
      process.env.AWS_SESSION_TOKEN || process.env.aws_session_token,
  },
});
const ddb = DynamoDBDocumentClient.from(client);

const USERS_TABLE = "Users"; // PK: userID, attr: carPlateNo
const VEHICLE_TABLE = "Vehicle"; // PK: carPlateNo, attrs: userID, parkingSection, parkingSlot
const VEHICLE_userID_INDEX = "userID-carPlateNo-index";

// GET /api/vehicles/by-user/:userID
// Returns { userID, vehicle: { carPlateNo, parkingSection, parkingSlot }, source }
router.get("/by-user/:userID", async (req, res) => {
  const { userID } = req.params;
  console.log("[vehicles] GET by-user", { userID });

  try {
    // Try GSI first (if present & populated)
    try {
      const q = await ddb.send(
        new QueryCommand({
          TableName: VEHICLE_TABLE,
          IndexName: VEHICLE_userID_INDEX, // comment out if no GSI
          KeyConditionExpression: "#u = :uid",
          ExpressionAttributeNames: { "#u": "userID" },
          ExpressionAttributeValues: { ":uid": userID },
          Limit: 1,
        })
      );
      if (q.Items && q.Items.length) {
        const it = q.Items[0];
        return res.json({
          userID,
          vehicle: {
            carPlateNo: it.carPlateNo ?? null,
            parkingSection: it.parkingSection ?? null,
            parkingSlot: it.parkingSlot ?? null,
          },
          source: "GSI",
        });
      }
      console.log("[vehicles] GSI miss; fallback to Users -> Vehicle");
    } catch (e) {
      console.warn("[vehicles] GSI query skipped/failed:", e?.message || e);
    }

    // Fallback: Users(userID) -> carPlateNo -> Vehicle(carPlateNo)
    const u = await ddb.send(
      new GetCommand({ TableName: USERS_TABLE, Key: { userID } })
    );
    if (!u.Item)
      return res.status(404).json({ error: "User not found", userID });

    const carPlateNo = u.Item.carPlateNo || null;
    if (!carPlateNo) {
      return res.json({
        userID,
        vehicle: { carPlateNo: null, parkingSection: null, parkingSlot: null },
        source: "UsersOnly",
      });
    }

    const v = await ddb.send(
      new GetCommand({ TableName: VEHICLE_TABLE, Key: { carPlateNo } })
    );
    return res.json({
      userID,
      vehicle: {
        carPlateNo,
        parkingSection: v.Item?.parkingSection ?? null,
        parkingSlot: v.Item?.parkingSlot ?? null,
      },
      source: v.Item ? "Vehicle" : "VehicleEmpty",
    });
  } catch (err) {
    console.error("[vehicles] by-user error:", err);
    res.status(500).json({ error: "Failed to fetch vehicle" });
  }
});

// PUT /api/vehicles/by-user/:userID/parking
router.put("/by-user/:userID/parking", async (req, res) => {
  const { userID } = req.params;
  const { parkingSection, parkingSlot } = req.body || {};
  console.log("[vehicles] PUT set parking", {
    userID,
    parkingSection,
    parkingSlot,
  });

  if (!parkingSection && parkingSection !== 0) {
    return res.status(400).json({ error: "parkingSection is required" });
  }
  if (parkingSlot === undefined || parkingSlot === null) {
    return res.status(400).json({ error: "parkingSlot is required" });
  }

  try {
    // Need plate unless you’ve decided to store by GSI only
    const u = await ddb.send(
      new GetCommand({ TableName: USERS_TABLE, Key: { userID } })
    );
    if (!u.Item) return res.status(404).json({ error: "User not found" });

    const carPlateNo = u.Item.carPlateNo || null;
    if (!carPlateNo)
      return res.status(400).json({ error: "User has no carPlateNo" });

    await ddb.send(
      new PutCommand({
        TableName: VEHICLE_TABLE,
        Item: {
          carPlateNo, // PK on Vehicle
          userID, // keep for GSI + traceability
          parkingSection, // e.g. "E"
          parkingSlot, // e.g. 12
          updatedAt: new Date().toISOString().slice(0, 19), // "YYYY-MM-DDTHH:MM:SS"
        },
      })
    );

    res.json({ ok: true, carPlateNo, parkingSection, parkingSlot });
  } catch (err) {
    console.error("[vehicles] update error:", err);
    res.status(500).json({ error: "Failed to update parking location" });
  }
});

module.exports = router;
