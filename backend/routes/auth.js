const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");

const router = express.Router();

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});

const ddb = DynamoDBDocumentClient.from(client);
const USERS_TABLE = "Users";
const STAFF_TABLE = "Staff";
const VEHICLE_TABLE = "Vehicle";

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

//SIGNUP
router.post("/signup", async (req, res) => {
  try {
    console.log("1. Signup route hit");
    const { email, password, firstName, lastName, carPlateNo } = req.body || {};
    console.log("2. Extracted signup data:", {
      email: email ? "present" : "missing",
      password: password ? "present" : "missing",
      firstName: firstName ? "present" : "missing",
      lastName: lastName ? "present" : "missing",
      carPlateNo: carPlateNo ? "present" : "missing",
    });

    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    console.log("3. About to check if user already exists");
    //check if exists
    const existing = await ddb.send(
      new ScanCommand({
        TableName: USERS_TABLE,
        FilterExpression: "email = :email",
        ExpressionAttributeValues: {
          ":email": email,
        },
      })
    );
    console.log(
      "4. User existence check completed, existing users found:",
      existing.Items?.length || 0
    );

    if (existing.Items && existing.Items.length > 0)
      return res.status(409).json({ error: "Email already registered" });

    // Vehicle validation if carPlateNo is provided
    if (carPlateNo) {
      console.log("4a. Car plate provided, validating vehicle:", carPlateNo);

      try {
        const vehicleCheck = await ddb.send(
          new GetCommand({
            TableName: VEHICLE_TABLE,
            Key: { carPlateNo: carPlateNo },
          })
        );

        console.log(
          "4b. Vehicle check completed, vehicle exists:",
          !!vehicleCheck.Item
        );

        if (vehicleCheck.Item) {
          console.log("4c. Vehicle already exists in database");
          return res.status(409).json({
            error:
              "This vehicle plate number is already registered in the system",
          });
        }

        console.log("4d. Vehicle plate number is available for registration");
      } catch (vehicleError) {
        console.error("4e. Error checking vehicle:", vehicleError);
        return res.status(500).json({ error: "Vehicle validation failed" });
      }
    }

    console.log("5. About to hash password");
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("6. Password hashed successfully");

    const userID = uuidv4();
    console.log("7. Generated userID (partition key):", userID);

    console.log("8. About to create user in DynamoDB");
    const userItem = {
      userID, // Partition key
      email,
      firstName: firstName || null,
      lastName: lastName || null,
      carPlateNo: carPlateNo || null,
      password: hashedPassword, // Using 'password' as per your schema
      walletBalance: 0, // Initialize wallet balance
      role: "user", // Add role field to DynamoDB schema
    };
    console.log("8a. User item to create:", {
      ...userItem,
      password: "[HIDDEN]",
    });

    await ddb.send(
      new PutCommand({
        TableName: USERS_TABLE,
        Item: userItem,
        ConditionExpression: "attribute_not_exists(userID)", // Check userID doesn't exist
      })
    );
    console.log("9. User created successfully in DynamoDB");

    // Handle vehicle record if carPlateNo is provided
    if (carPlateNo) {
      console.log("9a. Creating vehicle record for new user");

      try {
        const vehicleItem = {
          carPlateNo: carPlateNo, // Partition key
          userID: userID,
          registeredAt: new Date().toISOString(),
        };

        await ddb.send(
          new PutCommand({
            TableName: VEHICLE_TABLE,
            Item: vehicleItem,
            ConditionExpression: "attribute_not_exists(carPlateNo)", // Ensure no duplicate carPlateNo
          })
        );

        console.log("9b. Vehicle record created successfully");
      } catch (vehicleError) {
        console.error("9c. Error creating vehicle record:", vehicleError);

        // If vehicle creation fails, we should clean up the user record
        // since we promised the vehicle would be registered
        try {
          await ddb.send(
            new DeleteCommand({
              TableName: USERS_TABLE,
              Key: { userID: userID },
            })
          );
          console.log(
            "9d. Cleaned up user record due to vehicle creation failure"
          );
        } catch (cleanupError) {
          console.error("9e. Failed to cleanup user record:", cleanupError);
        }

        return res.status(500).json({
          error: "Failed to register vehicle. Please try again.",
        });
      }
    }

    console.log("10. About to sign token");
    const token = signToken({ sub: userID, email, role: "user" });
    console.log("11. Token signed successfully");

    console.log("12. Sending signup response");
    res.status(201).json({
      token,
      user: {
        userID,
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        carPlateNo: carPlateNo || null,
        role: "user",
        walletBalance: 0,
      },
    });
    console.log("13. Signup response sent successfully");
  } catch (error) {
    console.error("Signup error occurred at step:", error);
    console.error("Full error details:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

//LOGIN
//POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    console.log("1. Login route hit");
    const { email, password } = req.body || {};
    console.log("2. Extracted email and password:", {
      email: email ? "present" : "missing",
      password: password ? "present" : "missing",
    });

    if (!email || !password)
      return res.status(400).json({ error: "email and password required" });

    console.log("3. About to query DynamoDB for user");
    console.log("3a. Table name:", USERS_TABLE);
    console.log("3b. Query email:", email);
    console.log("3c. AWS Region:", process.env.AWS_REGION);
    console.log(
      "3d. AWS Access Key ID:",
      process.env.AWS_ACCESS_KEY_ID ? "present" : "missing"
    );

    // Use Scan instead of Get since email might not be the primary key
    const out = await ddb.send(
      new ScanCommand({
        TableName: USERS_TABLE,
        FilterExpression: "email = :email",
        ExpressionAttributeValues: {
          ":email": email,
        },
      })
    );
    console.log(
      "4. DynamoDB scan completed, items found:",
      out.Items?.length || 0
    );

    const user = out.Items && out.Items.length > 0 ? out.Items[0] : null;
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    console.log("5. About to compare password");
    const ok = await bcrypt.compare(password, user.password); // Using 'password' field as per your schema
    console.log("6. Password comparison result:", ok);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    console.log("7. About to sign token");
    const token = signToken({
      sub: user.userID, // Using userID as per your schema
      email: user.email,
      role: user.role || "user", // Use actual role from database
    });
    console.log("8. Token signed successfully");

    console.log("9. Sending response");
    res.json({
      token,
      user: {
        userID: user.userID,
        email: user.email,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        carPlateNo: user.carPlateNo || null,
        walletBalance: user.walletBalance || 0,
        role: user.role,
      },
    });
    console.log("10. Response sent successfully");
  } catch (err) {
    console.log("login error:", err);
    res.status(500).json({ error: "Login failed liao" });
  }
});

//STAFF LOGIN
//POST /api/auth/stafflogin
router.post("/stafflogin", async (req, res) => {
  try {
    console.log("1. Staff login route hit");
    const { staffID, password } = req.body || {};
    console.log("2. Extracted staffID and password:", {
      staffID: staffID ? "present" : "missing",
      password: password ? "present" : "missing",
    });

    if (!staffID || !password)
      return res.status(400).json({ error: "staffID and password required" });

    console.log("3. About to query DynamoDB for staff user");
    console.log("3a. Table name:", STAFF_TABLE);
    console.log("3b. Query staffID:", staffID);

    // Use Scan to find user by email
    const out = await ddb.send(
      new ScanCommand({
        TableName: STAFF_TABLE,
        FilterExpression: "staffID = :staffID",
        ExpressionAttributeValues: {
          ":staffID": staffID,
        },
      })
    );
    console.log(
      "4. DynamoDB scan completed, items found:",
      out.Items?.length || 0
    );

    const user = out.Items && out.Items.length > 0 ? out.Items[0] : null;
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    console.log("4a. Full user object keys:", Object.keys(user));
    console.log("4b. User object (password hidden):", {
      ...user,
      password: "[HIDDEN]",
    });

    console.log("5. User found, checking role:", user.role);
    console.log("5a. Role type:", typeof user.role);
    console.log("5b. Role exact value:", JSON.stringify(user.role));

    // Check if user has staff role (case-insensitive)
    const userRole = (user.role || "").toLowerCase();
    console.log("5c. Normalized role:", userRole);

    if (userRole !== "staff" && userRole !== "admin") {
      console.log("6. Access denied - not staff/admin, found role:", userRole);
      return res
        .status(403)
        .json({ error: "Access denied. Staff credentials required." });
    }

    console.log("6. Role check passed for:", userRole);

    console.log("7. About to compare password");
    const ok = await bcrypt.compare(password, user.password);
    console.log("8. Password comparison result:", ok);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    console.log("9. About to sign token");
    const token = signToken({
      sub: user.staffID || user.userID, // Use staffID if available, fallback to userID
      email: user.email,
      role: user.role,
    });
    console.log("10. Token signed successfully");

    console.log("11. Sending staff login response");
    res.json({
      token,
      user: {
        staffID: user.staffID,
        staffName: user.staffName || "",
        password: user.password || "",
        walletBalance: user.walletBalance || 0,
        status: user.status || "active",
        role: user.role,
      },
    });
    console.log("12. Staff login response sent successfully");
  } catch (err) {
    console.log("Staff login error:", err);
    res.status(500).json({ error: "Staff login failed" });
  }
});

module.exports = router;
