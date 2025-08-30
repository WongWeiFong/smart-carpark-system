const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} = require("@aws-sdk/lib-dynamodb");

const router = express.Router();

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.aws_access_key_id,
    secretAccessKey: process.env.aws_secret_access_key,
    sessionToken: process.env.aws_session_token,
  },
});

const ddb = DynamoDBDocumentClient.from(client);
const USERS_TABLE = "Users";

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

//SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { email, password, plateNumber } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    //check if exists
    const existing = await ddb.send(
      new GetCommand({ TableName: USERS_TABLE, Key: { email } })
    );
    if (existing.Item)
      return res.status(409).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = uuidv4();
    const now = Date.now();

    await ddb.send(
      new PutCommand({
        TableName: USERS_TABLE,
        Item: {
          email,
          userId,
          passwordHash: hashedPassword,
          role: "user",
          plateNumber: plateNumber || null,
          createdAt: now,
        },
        ConditionExpression: "attribute_not_exists(email)",
      })
    );

    // optional: create default Users row if plate provided
    // (only if your app needs a starting wallet row)
    if (plateNumber) {
      await ddb.send(
        new PutCommand({
          TableName: USERS_TABLE,
          Item: { plateNumber, walletBalance: 0, status: "active" },
          ConditionExpression: "attribute_not_exists(plateNumber)",
        })
      );
    }

    const token = signToken({ sub: userId, email, role: "user" });
    res.status(201).json({
      token,
      user: { userId, email, plateNumber: plateNumber || null, role: "user" },
    });
  } catch (error) {
    console.error("Error signing up:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

//LOGIN
//POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: "email and password required" });

    const out = await ddb.send(
      new GetCommand({ TableName: USERS_TABLE, Key: { email } })
    );
    const user = out.Item;
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken({
      sub: user.userId,
      email: user.email,
      role: user.role || "user",
    });
    res.json({
      token,
      user: {
        userId: user.userId,
        email: user.email,
        plateNumber: user.plateNumber || null,
        role: user.role || "user",
      },
    });
  } catch (err) {
    console.log("login error:", err);
    res.status(500).json({ error: "Login failed liao" });
  }
});

module.exports = router;
