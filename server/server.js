const express = require("express");
const cors = require("cors");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const pool = require("./db");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());

// CORS configuration
app.use(
	cors({
		origin: "http://localhost:5173",
		credentials: true,
	}),
);

// Session configuration
app.use(
	session({
		store: new pgSession({
			pool: pool,
			tableName: "session",
		}),
		secret: "your-secret-key",
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: false,
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24, // 1 day
		},
	}),
);

// SIGNUP
app.post("/signup", async (req, res) => {
	const { username, email, password } = req.body;

	try {
		const emailCheck = await pool.query(
			"SELECT * FROM users WHERE email = $1",
			[email],
		);
		if (emailCheck.rows.length > 0) {
			return res.status(400).json({ error: "Email is already in use." });
		}

		const usernameCheck = await pool.query(
			"SELECT * FROM users WHERE username = $1",
			[username],
		);
		if (usernameCheck.rows.length > 0) {
			return res.status(400).json({ error: "Username is already taken." });
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const result = await pool.query(
			"INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING user_id, username, email",
			[username, email, hashedPassword],
		);

		const newUser = result.rows[0];
		req.session.user_id = newUser.user_id;

		res.status(201).json({
			message: "User created successfully!",
			user: {
				id: newUser.user_id,
				username: newUser.username,
				email: newUser.email,
			},
		});
	} catch (err) {
		console.error("Error during signup:", err.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

// LOGIN
app.post("/login", async (req, res) => {
	const { usernameOrEmail, password } = req.body;

	try {
		const result = await pool.query(
			"SELECT * FROM users WHERE email = $1 OR username = $1",
			[usernameOrEmail],
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "User not found" });
		}

		const user = result.rows[0];
		const validPassword = await bcrypt.compare(password, user.password);

		if (!validPassword) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		req.session.user_id = user.user_id;

		res.json({
			message: "Login successful",
			user: { id: user.user_id, username: user.username, email: user.email },
		});
	} catch (err) {
		console.error("Error during login:", err.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

// LOGOUT
app.post("/logout", (req, res) => {
	try {
		req.session.destroy((err) => {
			if (err) {
				console.error("Error destroying session:", err);
				return res.status(500).json({ error: "Failed to log out." });
			}
			res.clearCookie("connect.sid");
			res.status(200).json({ message: "Logged out successfully." });
		});
	} catch (err) {
		console.error("Error during logout:", err.message);
		res.status(500).json({ error: "Internal server error." });
	}
});

// CURRENT USER
app.get("/currentuser", async (req, res) => {
	try {
		const user_id = req.session.user_id;
		if (!user_id) {
			return res.status(401).json({ error: "User not logged in" });
		}

		const result = await pool.query(
			"SELECT user_id AS id, username, email FROM users WHERE user_id = $1",
			[user_id],
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "User not found" });
		}

		res.json(result.rows[0]);
	} catch (err) {
		console.error("Error fetching current user:", err.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Start server
app.listen(3000, () => {
	console.log("Server is running on http://localhost:3000");
});
