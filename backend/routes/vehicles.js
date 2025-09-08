// backend/routes/vehicles.js
const express = require("express");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
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
            color: it.color || "",
            make: it.make || "",
            model: it.model || "",
            year: it.year || null,
            type: it.type || "",
            parkingSection: it.parkingSection ?? null,
            parkingSlot: it.parkingSlot ?? null,
            description: it.description || "",
            registeredAt: it.registeredAt || "",
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
    // Look up the user to get their carPlateNo
    const userResult = await ddb.send(
      new GetCommand({ TableName: USERS_TABLE, Key: { userID } })
    );
    if (!userResult.Item)
      return res.status(404).json({ error: "User not found" });

    const carPlateNo = userResult.Item.carPlateNo;
    if (!carPlateNo) {
      return res.status(400).json({ error: "User has no carPlateNo" });
    }

    // Use UpdateCommand so you don't overwrite other attributes on the vehicle
    const updateParams = {
      TableName: VEHICLE_TABLE,
      Key: { carPlateNo }, // the PK of the vehicle item
      UpdateExpression:
        "SET #section = :section, #slot = :slot, updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#section": "parkingSection",
        "#slot": "parkingSlot",
      },
      ExpressionAttributeValues: {
        ":section": parkingSection,
        ":slot": parkingSlot,
        ":updatedAt": new Date().toISOString().slice(0, 19),
      },
      ConditionExpression: "attribute_exists(carPlateNo)", // ensure the record exists
      ReturnValues: "ALL_NEW",
    };
    const result = await ddb.send(new UpdateCommand(updateParams));

    res.json({
      ok: true,
      carPlateNo,
      parkingSection: result.Attributes.parkingSection,
      parkingSlot: result.Attributes.parkingSlot,
    });
  } catch (err) {
    console.error("[vehicles] update error:", err);
    res.status(500).json({ error: "Failed to update parking location" });
  }
});

// POST /api/vehicles
router.post("/", async (req, res) => {
  try {
    const {
      carPlateNo, // PK
      userID,
      registeredAt,
      make,
      model,
      year,
      color,
      type,
      description,
    } = req.body || {};

    if (!carPlateNo || !userID || !registeredAt) {
      return res
        .status(400)
        .json({ error: "carPlateNo, userID and registeredAt are required." });
    }

    const item = {
      carPlateNo: carPlateNo.toUpperCase().trim(), // PK
      userID,
      registeredAt,
      make: make || "",
      model: model || "",
      year: year ? Number(year) : undefined,
      color: color || "",
      type: type || "",
      description: description || "",
    };

    // Remove undefined attributes so Dynamo only stores present ones
    Object.keys(item).forEach((k) => item[k] === undefined && delete item[k]);

    // Prevent creating duplicate plate
    const command = new PutCommand({
      TableName: VEHICLE_TABLE,
      Item: item,
      ConditionExpression: "attribute_not_exists(carPlateNo)",
    });

    await ddb.send(command);
    res.status(201).json({ message: "Vehicle added.", item });

    await ddb.send(
      new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { userID },
        UpdateExpression: "SET carPlateNo = :carPlateNo",
        ExpressionAttributeValues: {
          ":carPlateNo": carPlateNo.toUpperCase().trim(),
        },
      })
    );
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      return res.status(409).json({
        error: "This car plate already exists. Use a different one.",
      });
    }
    console.error("Add vehicle error:", err);
    res.status(500).json({ error: "Failed to add vehicle." });
  }
});

// UPDATE car details
router.put("/:carPlateNo", async (req, res) => {
  const plate = req.params.carPlateNo.toUpperCase().trim();
  const updates = req.body || {};

  // Build a dynamic update expression for only provided fields
  const expressions = [];
  const names = {};
  const values = {};

  if (updates.make !== undefined) {
    expressions.push("#make = :make");
    names["#make"] = "make";
    values[":make"] = updates.make;
  }
  if (updates.model !== undefined) {
    expressions.push("#model = :model");
    names["#model"] = "model";
    values[":model"] = updates.model;
  }
  if (updates.year !== undefined) {
    expressions.push("#year = :year");
    names["#year"] = "year";
    values[":year"] = Number(updates.year);
  }
  if (updates.color !== undefined) {
    expressions.push("#color = :color");
    names["#color"] = "color";
    values[":color"] = updates.color;
  }
  if (updates.type !== undefined) {
    expressions.push("#tp = :tp");
    names["#tp"] = "type";
    values[":tp"] = updates.type;
  }
  if (updates.description !== undefined) {
    expressions.push("#description = :description");
    names["#description"] = "description";
    values[":description"] = updates.description;
  }

  if (expressions.length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  // Always update `updatedAt`, but do NOT touch parkingSection/parkingSlot
  expressions.push("updatedAt = :updatedAt");
  values[":updatedAt"] = new Date().toISOString().slice(0, 19);

  const updateParams = {
    TableName: VEHICLE_TABLE,
    Key: { carPlateNo: plate },
    UpdateExpression: "SET " + expressions.join(", "),
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
    ConditionExpression: "attribute_exists(carPlateNo)",
    ReturnValues: "ALL_NEW",
  };

  try {
    const result = await ddb.send(new UpdateCommand(updateParams));
    res.json({ message: "Car updated", item: result.Attributes });
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      return res.status(404).json({ error: "Car not found" });
    }
    console.error("Update error:", err);
    res.status(500).json({ error: "Failed to update car" });
  }
});

router.delete("/:carPlateNo", async (req, res) => {
  try {
    const plate = (req.params.carPlateNo || "").toUpperCase().trim();

    // 1. Look up the vehicle to find which user owns it
    const getCarCmd = new GetCommand({
      TableName: VEHICLE_TABLE,
      Key: { carPlateNo: plate },
    });
    const carResult = await ddb.send(getCarCmd);
    const car = carResult?.Item;
    if (!car) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    const { userID } = car;
    if (!userID) {
      // If for some reason userID isn’t on the car record, just delete the car
      await ddb.send(
        new DeleteCommand({
          TableName: VEHICLE_TABLE,
          Key: { carPlateNo: plate },
        })
      );
      return res.status(204).end();
    }

    // 2. Remove the carPlateNo attribute from the user
    await ddb.send(
      new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { userID },
        UpdateExpression: "REMOVE carPlateNo",
      })
    );

    // 3. Delete the vehicle record
    await ddb.send(
      new DeleteCommand({
        TableName: VEHICLE_TABLE,
        Key: { carPlateNo: plate },
      })
    );

    return res.status(204).end();
  } catch (err) {
    console.error("Delete vehicle error:", err);
    res.status(500).json({ error: "Failed to delete vehicle" });
  }
});

module.exports = router;
