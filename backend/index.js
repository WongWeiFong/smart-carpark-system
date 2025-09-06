require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
} = require("@aws-sdk/lib-dynamodb");
const { auth } = require("./middleware/auth");

console.log("=== BOOT DIAG ===");
console.log("AWS_REGION:", process.env.AWS_REGION);
console.log("Creds present:", {
  ID: !!process.env.AWS_ACCESS_KEY_ID,
  SECRET: !!process.env.AWS_SECRET_ACCESS_KEY,
  SESSION: !!process.env.AWS_SESSION_TOKEN, // should be true on Educate
});
console.log("JWT secret present:", !!process.env.JWT_SECRET);
console.log("=================");

const app = express();

// CORS – allow your React dev server
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// ---- DynamoDB client ----
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN, // required on Educate
  },
});
const ddb = DynamoDBDocumentClient.from(client);

const USERS_TABLE = "Users";

// Health check
app.get("/api/test", (_req, res) => {
  res.json({ ok: true, message: "Backend connected successfully" });
});

// Mount auth router at a RELATIVE path (not a full URL)
app.use("/api/auth", require("./routes/auth"));

const customerRoutes = require("./routes/customers");
app.use("/api/customers", customerRoutes);

// Mount parking router
app.use("/api/parking", require("./routes/parking"));

app.use("/api/vehicles", require("./routes/vehicles"));

// Example protected endpoint: token echo
app.get("/api/me", auth(), async (req, res) => {
  res.json({ me: req.user });
});

// Protected: get wallet by plate
app.get("/api/wallet/:plate", auth(), async (req, res) => {
  try {
    const plateNumber = req.params.plate;
    const out = await ddb.send(
      new GetCommand({ TableName: USERS_TABLE, Key: { plateNumber } })
    );
    if (!out.Item) return res.status(404).json({ error: "Not found" });
    res.json({
      plateNumber,
      walletBalance: out.Item.walletBalance,
      status: out.Item.status,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch wallet" });
  }
});

// Public: list all users (for quick admin/testing)
app.get("/api/users", async (_req, res) => {
  try {
    const data = await ddb.send(new ScanCommand({ TableName: USERS_TABLE }));
    res.json(data.Items || []);
  } catch (err) {
    console.error("Error fetching data:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch data", details: err.message });
  }
});

// SAFE 404 (no '*' wildcard)
app.use((req, res) => {
  res.status(404).json({ error: "Not Found", path: req.originalUrl });
});

const PORT = 3001;
app.listen(PORT, () =>
  console.log(`Backend running at http://localhost:${PORT}`)
);
