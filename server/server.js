const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const bcrypt = require("bcryptjs");

app.use(cors());
app.use(express.json());

//SIGNING UP
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All field are required! " });
  }

  try {
    const useremailCheck = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    if (useremailCheck.rows.length > 0) {
      return res.status(400).json({ error: "Email is already in use!" });
    }

    const usernameCheck = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username],
    );
    if (usernameCheck.rows.length > 0) {
      return res.status(400).json({ error: "Username is already taken!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
      [username, email, hashedPassword],
    );

    res.json({
      message: "User created successfully!",
      user: {
        user_id: newUser.rows[0].user_id,
        username: newUser.rows[0].username,
        email: newUser.rows[0].email,
      },
    });
  } catch (error) {
    console.error("Error creating user: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//LOGIN VERIFICATION
app.post("/login", async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR username = $1",
      [usernameOrEmail],
    );

    if (!usernameOrEmail) {
      return res.status(400).json({ error: "Username or email is required!" });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      user: { username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ err: "Internal server error" });
  }
});

//FORGOT PASSWORD
app.post("/forgotpassword", async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];

    res.json({
      message: "Email found!",
      user: { email: user.email },
    });
  } catch (err) {
    res.status(500).json({ err: "Internal server error" });
  }
});

//CHANGING PASSWORD
app.post("/changepassword", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query("UPDATE users SET password = $1 WHERE email = $2", [
      hashedPassword,
      email,
    ]);

    res.json({ message: "Password updated successfully!" });
  } catch (err) {
    res.status(500).json({ err: "Internal server error" });
  }
});

app.listen(3000, "192.168.155.109", () => {
  console.log("Listening...");
});
