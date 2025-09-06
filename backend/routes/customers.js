const express = require("express");
const router = express.Router();
const { docClient } = require("../lib/dynamoClient"); // CHANGED: same as routes/parking.js
const {
  ScanCommand,
  GetCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const { auth } = require("../middleware/auth");

const USERS_TABLE = process.env.USERS_TABLE || "Users";

// GET /api/customers - Fetch all users from DynamoDB Users table
router.get("/", async (req, res) => {
  try {
    // CHANGED: identical pattern to routes/parking.js -> docClient.send(new ScanCommand(...))
    const command = new ScanCommand({
      TableName: USERS_TABLE,
      ProjectionExpression:
        "userID, carPlateNo, createdAt, email, firstName, lastName, #role, #status, walletBalance",
      ExpressionAttributeNames: {
        "#role": "role", // reserved words must be aliased
        "#status": "status", // reserved words must be aliased
      },
    });

    const result = await docClient.send(command);
    res.json(result.Items || []);
  } catch (error) {
    console.error("Error fetching customers:", error);
    // CHANGED: surface details during dev to pinpoint root cause
    res
      .status(500)
      .json({ error: "Failed to fetch customers", details: error.message });
  }
});

// GET /api/customers/:userID - single user by PK
router.get("/:userID", async (req, res) => {
  try {
    const { userID } = req.params;

    const command = new GetCommand({
      TableName: USERS_TABLE,
      Key: { userID },
      ProjectionExpression:
        "userID, carPlateNo, createdAt, email, firstName, lastName, #role, #status, walletBalance",
      ExpressionAttributeNames: { "#role": "role", "#status": "status" },
    });

    const result = await docClient.send(command);
    if (!result.Item)
      return res.status(404).json({ error: "Customer not found" });
    res.json(result.Item);
  } catch (error) {
    console.error("Error fetching customer:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch customer", details: error.message });
  }
});

// PATCH /api/customers/:userID - staff-only updates
router.patch("/:userID", auth(), async (req, res) => {
  try {
    const { userID } = req.params;

    if (
      req.user.role.toLowerCase() !== "staff" &&
      req.user.role.toLowerCase() !== "admin"
    ) {
      return res
        .status(403)
        .json({ error: "Access denied. Staff privileges required." });
    }

    const updates = req.body || {};
    const allowed = [
      "firstName",
      "lastName",
      "email",
      "carPlateNo",
      "status",
      "walletBalance",
      "role",
    ];

    // Build UpdateExpression
    const sets = [];
    const names = {};
    const values = {};
    for (const [k, v] of Object.entries(updates)) {
      if (!allowed.includes(k)) continue;
      if (k === "status" || k === "role") {
        names[`#${k}`] = k; // alias reserved
        values[`:${k}`] = v;
        sets.push(`#${k} = :${k}`);
      } else {
        values[`:${k}`] = v;
        sets.push(`${k} = :${k}`);
      }
    }

    if (!sets.length)
      return res.status(400).json({ error: "No valid fields to update" });

    const command = new UpdateCommand({
      TableName: USERS_TABLE,
      Key: { userID },
      UpdateExpression: `SET ${sets.join(", ")}`,
      ExpressionAttributeNames: Object.keys(names).length ? names : undefined,
      ExpressionAttributeValues: values,
      ReturnValues: "ALL_NEW",
    });

    const result = await docClient.send(command);
    res.json(result.Attributes || {});
  } catch (error) {
    console.error("Error updating customer:", error);
    res
      .status(500)
      .json({ error: "Failed to update customer", details: error.message });
  }
});

module.exports = router;
