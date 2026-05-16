import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* =========================
   MIDDLEWARE
========================= */
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: '50mb' }));

/* =========================
   ROOT ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("CampusEve Backend Server Running");
});

/* =========================
   DATABASE CONNECTION (FIXED)
========================= */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/* TEST DB CONNECTION ON START */
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ MySQL Connected Successfully");
    conn.release();
  } catch (err) {
    console.error("❌ MySQL Connection Failed:");
    console.error(err); // IMPORTANT: show real error
  }
})();

/* =========================
   HEALTH CHECK
========================= */
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', message: 'Backend Active' });
});

/* =========================
   EVENTS
========================= */
app.get('/api/events', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM events ORDER BY date DESC');
    res.json(rows);
  } catch (err) {
    console.error("EVENTS GET ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const e = req.body;

    await pool.query(
      `INSERT INTO events
      (id, title, description, date, startTime, endTime,
      location, category, organizer, attendees, image,
      isPopular, isLive, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        e.id, e.title, e.description, e.date,
        e.startTime, e.endTime, e.location,
        e.category, e.organizer, e.attendees || 0,
        e.image, e.isPopular || 0, e.isLive || 0,
        e.status || 'Pending'
      ]
    );

    res.status(201).json(e);
  } catch (err) {
    console.error("EVENTS POST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.query(
      'UPDATE events SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("EVENT UPDATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM events WHERE id = ?', [id]);

    res.json({ success: true });
  } catch (err) {
    console.error("EVENT DELETE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   USERS
========================= */
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const u = req.body;

    await pool.query(
      `INSERT INTO users (id, name, email, password, role, avatar)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [u.id, u.name, u.email, u.password, u.role, u.avatar]
    );

    res.status(201).json(u);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM users WHERE id = ?', [id]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   FEEDBACK
========================= */
app.get('/api/feedback', async (req, res) => {
  try {
    const [messages] = await pool.query(
      'SELECT * FROM feedback ORDER BY timestamp DESC'
    );

    for (let msg of messages) {
      const [replies] = await pool.query(
        'SELECT * FROM replies WHERE feedback_id = ? ORDER BY timestamp ASC',
        [msg.id]
      );
      msg.replies = replies;
    }

    res.json(messages);
  } catch (err) {
    console.error("FEEDBACK GET ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const m = req.body;

    await pool.query(
      `INSERT INTO feedback
      (id, senderName, senderEmail, subject, message, timestamp, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        m.id, m.senderName, m.senderEmail,
        m.subject, m.message, m.timestamp,
        m.status || 'new'
      ]
    );

    res.status(201).json(m);
  } catch (err) {
    console.error("FEEDBACK POST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   AUDIT LOGS
========================= */
app.get('/api/audit', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM audit_logs ORDER BY timestamp DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
  console.log("=================================");
  console.log("🚀 CampusEve Backend Running");
  console.log("📡 Port:", PORT);
  console.log("=================================");
});
