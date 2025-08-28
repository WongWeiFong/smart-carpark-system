// routes/parking.js
const express = require("express");
const router = express.Router();
const { docClient } = require("../lib/dynamoClient");
const {
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

// Get one slot by slotId
router.get("/slots/:slotId", async (req, res) => {
  const { slotId } = req.params;
  try {
    const data = await docClient.send(
      new GetCommand({ TableName: PARKING_LOT_TABLE, Key: { slotId } })
    );
    res.json({ item: data.Item || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch slot" });
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
