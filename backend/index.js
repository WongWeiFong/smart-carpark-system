require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");

const app = express();
app.use(cors());
app.use(express.json());

// Configure DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});

const dynamo = DynamoDBDocumentClient.from(client);
const TABLE_NAME = "Users";

// Health check
app.get("/api/test", (req, res) => {
  res.send({ message: "Backend connected successfully" });
});

// Get all users
app.get("/api/data", async (req, res) => {
  try {
    console.log("Scanning table:", TABLE_NAME); // Debug
    const command = new ScanCommand({ TableName: TABLE_NAME });
    const data = await dynamo.send(command);
    console.log("DynamoDB Response:", data); // Debug
    res.json(data.Items);
  } catch (err) {
    console.error("Error fetching data:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch data", details: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () =>
  console.log(`Backend running at http://localhost:${PORT}`)
);
