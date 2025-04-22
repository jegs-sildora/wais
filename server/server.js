const express = require("express");
const cors = require("cors");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session); // Use PostgreSQL for session storage
const pool = require("./db"); // Assuming you have a PostgreSQL pool setup
const bcrypt = require("bcrypt");

const app = express();

// Middleware
app.use(express.json());

// Configure CORS
app.use(
	cors({
		origin: "http://localhost:5173", // Replace with your frontend's URL
		credentials: true, // Allow cookies and credentials
	}),
);

// Configure session
app.use(
	session({
		store: new pgSession({
			pool: pool, // Use your existing PostgreSQL pool
			tableName: "session", // Table name for storing sessions
		}),
		secret: "your-secret-key", // Replace with a strong secret key
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: false, // Set to true if using HTTPS
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24, // 1 day
		},
	}),
);

//SIGNING UP
app.post("/signup", async (req, res) => {
	const { username, email, password } = req.body;

	try {
		// Check if the email or username already exists
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

		// Hash the password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Insert the new user into the database
		const result = await pool.query(
			"INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING user_id, username, email",
			[username, email, hashedPassword],
		);

		const newUser = result.rows[0];

		// Store user_id in the session
		req.session.user_id = newUser.user_id;
		console.log("Session updated with user_id:", req.session.user_id);

		// Respond with the new user details
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

//LOGIN VERIFICATION
app.post("/login", async (req, res) => {
	const { usernameOrEmail, password } = req.body;

	try {
		console.log("Login request received:", req.body);

		// Query the database for the user
		const result = await pool.query(
			"SELECT * FROM users WHERE email = $1 OR username = $1",
			[usernameOrEmail],
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "User not found" });
		}

		const user = result.rows[0];

		// Compare the provided password with the hashed password
		const validPassword = await bcrypt.compare(password, user.password);

		if (!validPassword) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		// Store user_id in the session
		req.session.user_id = user.user_id; // Correctly store user_id in the session
		console.log("Session updated with user_id:", req.session.user_id);

		res.json({
			message: "Login successful",
			user: { id: user.user_id, username: user.username, email: user.email },
		});
	} catch (err) {
		console.error("Error during login:", err.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

//CURRENT USER
app.get("/currentuser", async (req, res) => {
	try {
		const user_id = req.session.user_id; // Retrieve user_id from session
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

		res.json(result.rows[0]); // Return the user details
	} catch (err) {
		console.error("Error fetching current user:", err.message);
		res.status(500).json({ error: "Internal server error" });
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

//TRANSACTION: Add a new transaction (Create)
app.post("/transactions", async (req, res) => {
	try {
		const user_id = req.session.user_id; // Retrieve user_id from session
		if (!user_id) {
			return res.status(401).json({ error: "User not logged in" });
		}

		const { type, amount, category, description, date } = req.body;

		// Insert the transaction into the database
		const result = await pool.query(
			"INSERT INTO transactions (user_id, type, amount, category, description, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
			[user_id, type, amount, category, description, date],
		);

		res.json(result.rows[0]);
	} catch (err) {
		console.error("Error adding transaction:", err.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

//TRANSACTION: Get all transactions for a user (Read)
app.get("/transactions/:user_id", async (req, res) => {
	const { user_id } = req.params;
	try {
		const result = await pool.query(
			"SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC",
			[user_id],
		);
		res.json(result.rows);
	} catch (err) {
		console.error("Error fetching transactions:", err.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

//TRANSACTION: Get a single transaction by ID (Read)
app.get("/transactions/:user_id/:id", async (req, res) => {
	const { user_id, id } = req.params;
	try {
		const result = await pool.query(
			"SELECT * FROM transactions WHERE id = $1 AND user_id = $2",
			[id, user_id],
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Transaction not found" });
		}

		res.json(result.rows[0]);
	} catch (err) {
		console.error("Error fetching transaction:", err.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

//TRANSACTION: Update a transaction (Update)
app.put("/transactions/:id", async (req, res) => {
	const { id } = req.params;
	const { type, amount, category, description, date, user_id } = req.body;

	try {
		const result = await pool.query(
			"UPDATE transactions SET type = $1, amount = $2, category = $3, description = $4, date = $5 WHERE id = $6 AND user_id = $7 RETURNING *",
			[type, amount, category, description, date, id, user_id],
		);

		if (result.rows.length === 0) {
			return res
				.status(404)
				.json({ error: "Transaction not found or not authorized" });
		}

		res.json({
			message: "Transaction updated successfully!",
			transaction: result.rows[0],
		});
	} catch (err) {
		console.error("Error updating transaction:", err.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

//TRANSACTION: Delete a transaction (Delete)
app.delete("/transactions/:id", async (req, res) => {
	const { id } = req.params;
	const { user_id } = req.body;

	try {
		const result = await pool.query(
			"DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *",
			[id, user_id],
		);

		if (result.rows.length === 0) {
			return res
				.status(404)
				.json({ error: "Transaction not found or not authorized" });
		}

		res.json({
			message: "Transaction deleted successfully!",
			transaction: result.rows[0],
		});
	} catch (err) {
		console.error("Error deleting transaction:", err.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

//FINANCIAL SUMMARY: Get financial summary for a user
app.get("/financial-summary/:userId", async (req, res) => {
	const { userId } = req.params;

	try {
		// Validate userId
		if (!userId) {
			return res.status(400).json({ error: "User ID is required." });
		}

		// Calculate total income
		const incomeResult = await pool.query(
			"SELECT COALESCE(SUM(amount), 0) AS total_income FROM transactions WHERE user_id = $1 AND type = 'Income'",
			[userId],
		);

		// Calculate total expenses
		const expensesResult = await pool.query(
			"SELECT COALESCE(SUM(amount), 0) AS total_expenses FROM transactions WHERE user_id = $1 AND type = 'Expense'",
			[userId],
		);

		const totalIncome = parseFloat(incomeResult.rows[0].total_income);
		const totalExpenses = parseFloat(expensesResult.rows[0].total_expenses);

		// Calculate current balance
		const currentBalance = totalIncome - totalExpenses;

		res.json({
			currentBalance,
			totalIncome,
			totalExpenses,
		});
	} catch (err) {
		console.error("Error fetching financial summary:", err.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

//LOGOUT
app.post("/logout", (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error("Error destroying session:", err);
                return res.status(500).json({ error: "Failed to log out." });
            }
            res.clearCookie("connect.sid"); // Clear the session cookie
            res.status(200).json({ message: "Logged out successfully." });
        });
    } catch (err) {
        console.error("Error during logout:", err.message);
        res.status(500).json({ error: "Internal server error." });
    }
});

// Start the server
app.listen(3000, () => {
	console.log("Server is running on http://localhost:3000");
});
