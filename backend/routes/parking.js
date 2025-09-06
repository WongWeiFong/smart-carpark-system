const express = require("express");
const router = express.Router();
const { docClient } = require("../lib/dynamoClient");
const {
  DynamoDBDocumentClient,
  UpdateCommand,
  GetCommand,
  ScanCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");

const PARKING_LOT_TABLE = "ParkingLot";

// Get all slots
router.get("/slots", async (req, res) => {
  try {
    // If you use slotId as the only key, a Scan is simplest:
    const data = await docClient.send(
      new ScanCommand({ TableName: PARKING_LOT_TABLE })
    );
    res.json({ items: data.Items || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch slots" });
  }
});

router.put("/slots/:slotId", async (req, res) => {
  const { slotId } = req.params;
  const { status, updatedBy } = req.body;

  if (!status) {
    return res.status(400).json({ error: "status is required" });
  }

  try {
    await docClient.send(
      new UpdateCommand({
        TableName: PARKING_LOT_TABLE,
        Key: { slotID: slotId },
        UpdateExpression: "SET #st = :s, #ub = :u",
        ExpressionAttributeNames: {
          "#st": "status",
          "#ub": "updatedBy",
        },
        ExpressionAttributeValues: {
          ":s": status,
          ":u": updatedBy || "Staff",
        },
      })
    );
    res.json({ slotId, status });
  } catch (err) {
    console.error("Error updating slot:", err);
    res
      .status(500)
      .json({ error: "Failed to update slot status from parking.js" });
  }
});

router.put("/slots/:slotId/reset", async (req, res) => {
  const { slotId } = req.params;
  const { status, updatedBy } = req.body;
  try {
    // In a real app you might recompute status from sensor readings; here we just clear overrides.
    await docClient.send(
      new UpdateCommand({
        TableName: PARKING_LOT_TABLE,
        Key: { slotID: slotId },
        UpdateExpression: "SET #st = :s, #ub = :u",
        ExpressionAttributeNames: {
          "#st": "status",
          "#ub": "updatedBy",
        },
        ExpressionAttributeValues: {
          ":s": status || "available",
          ":u": updatedBy || "System",
        },
      })
    );
    res.json({ slotId, status });
  } catch (err) {
    console.error("Error resetting slot:", err);
    res.status(500).json({ error: "Failed to reset slot from parking.js" });
  }
});

// Query by sectionId and slotNo if using a composite key
router.get("/slots/:sectionId/:slotNo", async (req, res) => {
  const { sectionId, slotNo } = req.params;
  try {
    const data = await docClient.send(
      new QueryCommand({
        TableName: PARKING_LOT_TABLE,
        KeyConditionExpression: "#section = :sectionId AND #slot = :slotNo",
        ExpressionAttributeNames: {
          "#section": "sectionId",
          "#slot": "slotNo",
        },
        ExpressionAttributeValues: {
          ":sectionId": sectionId,
          ":slotNo": Number(slotNo),
        },
      })
    );
    res.json({ items: data.Items || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to query slot" });
  }
});

module.exports = router;
