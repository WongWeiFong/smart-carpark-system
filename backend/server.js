require("dotenv").config();
const express = require("express");
const AWS = require("aws-sdk");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "Users";

// Health check route
app.get("/api/test", (req, res) => {
  res.send({ message: "Backend connected successfully" });
});

// Route to get data from DynamoDB
app.get("/api/data", async (req, res) => {
  try {
    const data = await dynamoDB.scan({ TableName: TABLE_NAME }).promise();
    res.json(data.Items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

const PORT = 3001;
app.listen(PORT, () =>
  console.log(`Backend running at http://localhost:${PORT}`)
);
