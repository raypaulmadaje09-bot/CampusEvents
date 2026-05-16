import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

/* ======================
   FIX __dirname (ESM)
====================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ======================
   MIDDLEWARE
====================== */
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "50mb" }));

/* ======================
   OPTIONAL FRONTEND
====================== */
app.use(express.static(path.join(__dirname, "dist")));

/* ======================
   MYSQL POOL (AIVEN READY)
====================== */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  ssl: {
    rejectUnauthorized: false,
  },
  waitForConnections: true,
  connectionLimit: 10,
});

/* ======================
   TEST DB CONNECTION (STARTUP)
====================== */
const testDB = async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ MySQL Connected Successfully");
    conn.release();
  } catch (err) {
    console.log("❌ MySQL Connection Error:");
    console.log(err.message);
  }
};

testDB();

/* ======================
   ROOT
====================== */
app.get("/", (req, res) => {
  res.send("CampusEve Backend Server Running");
});

/* ======================
   HEALTH CHECK
====================== */
app.get("/api/health", (req, res) => {
  res.json({ status: "UP", message: "CampusEve Active" });
});

/* ======================
   TEST DB ROUTE (IMPORTANT)
====================== */
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS result");
    res.json(rows);
  } catch (err) {
    console.log("❌ TEST DB ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   EVENTS
====================== */
app.get("/api/events", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM events ORDER BY date DESC");
    res.json(rows);
  } catch (err) {
    console.log("GET EVENTS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/events", async (req, res) => {
  try {
    const e = req.body;
    const id = Math.random().toString(36).substring(2, 10);

    await pool.query(
      `INSERT INTO events 
      (id, title, description, date, startTime, endTime, location, category, organizer, attendees, image, isPopular, isLive, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        e.title,
        e.description,
        e.date,
        e.startTime,
        e.endTime,
        e.location,
        e.category,
        e.organizer,
        e.attendees || 0,
        e.image,
        e.isPopular || 0,
        e.isLive || 0,
        e.status || "Pending",
      ]
    );

    res.status(201).json({ success: true, id });
  } catch (err) {
    console.log("POST EVENTS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.query("UPDATE events SET status = ? WHERE id = ?", [
      status,
      id,
    ]);

    res.json({ success: true });
  } catch (err) {
    console.log("UPDATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/events/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM events WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.log("DELETE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   USERS
====================== */
app.get("/api/users", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const u = req.body;
    const id = Math.random().toString(36).substring(2, 10);

    await pool.query(
      "INSERT INTO users (id, name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?, ?)",
      [id, u.name, u.email, u.password, u.role, u.avatar]
    );

    res.status(201).json({ success: true, id });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   FEEDBACK
====================== */
app.get("/api/feedback", async (req, res) => {
  try {
    const [messages] = await pool.query(
      "SELECT * FROM feedback ORDER BY timestamp DESC"
    );

    for (let msg of messages) {
      const [replies] = await pool.query(
        "SELECT * FROM replies WHERE feedback_id = ? ORDER BY timestamp ASC",
        [msg.id]
      );
      msg.replies = replies;
    }

    res.json(messages);
  } catch (err) {
    console.log("FEEDBACK ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/feedback", async (req, res) => {
  try {
    const m = req.body;
    const id = Math.random().toString(36).substring(2, 10);

    await pool.query(
      `INSERT INTO feedback 
      (id, senderName, senderEmail, subject, message, timestamp, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        m.senderName,
        m.senderEmail,
        m.subject,
        m.message,
        m.timestamp,
        m.status || "new",
      ]
    );

    res.status(201).json({ success: true, id });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   API FALLBACK
====================== */
app.all("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "API endpoint not found",
  });
});

/* ======================
   START SERVER
====================== */
app.listen(PORT, () => {
  console.log("=================================");
  console.log("🚀 CampusEve Backend Running");
  console.log("📡 Port:", PORT);
  console.log("=================================");
});
