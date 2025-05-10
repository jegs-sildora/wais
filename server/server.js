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

//TRANSACTION: ADDING NEW TRANSACTION
app.post("/transactions", async (req, res) => {
	const { type, amount, category, description, date } = req.body;
	const user_id = req.session.user_id;

	if (!user_id) {
			return res.status(401).json({ error: "User not authenticated" });
	}

	try {
			console.log("Saving transaction for user:", user_id);
			console.log("Transaction details:", { type, amount, category, description, date });

			await pool.query(
					`INSERT INTO transactions (user_id, type, amount, category, description, date)
					 VALUES ($1, $2, $3, $4, $5, $6)`,
					[user_id, type, amount, category, description, date],
			);

			res.status(201).json({ message: "Transaction saved successfully!" });
	} catch (err) {
			console.error("Error saving transaction:", err.message);
			res.status(500).json({ error: "Failed to save transaction" });
	}
});

// Fetch all transactions for the currently logged-in user
app.get("/transactions", async (req, res) => {
	const user_id = req.session.user_id;

	if (!user_id) {
		return res.status(401).json({ error: "User not authenticated" });
	}

	try {
		// Fetch all transactions for the logged-in user
		const result = await pool.query(
			"SELECT transaction_id, type, amount, category, description, date FROM transactions WHERE user_id = $1 ORDER BY date DESC",
			[user_id],
		);

		res.json(result.rows); // Return the transactions as JSON
	} catch (err) {
		console.error("Error fetching transactions:", err.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Edit Transaction: Update an existing transaction
app.put("/transactions/:transactionId", async (req, res) => {
	const { transactionId } = req.params;
	const { type, amount, category, description, date } = req.body;
	const user_id = req.session.user_id;

	if (!user_id) {
		return res.status(401).json({ error: "User not authenticated" });
	}

	try {
		// Check if the transaction belongs to the logged-in user
		const result = await pool.query(
			"SELECT * FROM transactions WHERE transaction_id = $1 AND user_id = $2",
			[transactionId, user_id],
		);

		if (result.rows.length === 0) {
			return res
				.status(404)
				.json({ error: "Transaction not found or unauthorized" });
		}

		// Update the transaction
		await pool.query(
			`UPDATE transactions 
       SET type = $1, amount = $2, category = $3, description = $4, date = $5
       WHERE transaction_id = $6 AND user_id = $7`,
			[type, amount, category, description, date, transactionId, user_id],
		);

		res.status(200).json({ message: "Transaction updated successfully!" });
	} catch (err) {
		console.error("Error updating transaction:", err.message);
		res.status(500).json({ error: "Failed to update transaction" });
	}
});

// Delete Transaction: Remove an existing transaction
app.delete("/transactions/:transactionId", async (req, res) => {
	const { transactionId } = req.params;
	const user_id = req.session.user_id;

	if (!user_id) {
		return res.status(401).json({ error: "User not authenticated" });
	}

	try {
		// Check if the transaction belongs to the logged-in user
		const result = await pool.query(
			"SELECT * FROM transactions WHERE transaction_id = $1 AND user_id = $2",
			[transactionId, user_id],
		);

		if (result.rows.length === 0) {
			return res
				.status(404)
				.json({ error: "Transaction not found or unauthorized" });
		}

		// Delete the transaction
		await pool.query(
			"DELETE FROM transactions WHERE transaction_id = $1 AND user_id = $2",
			[transactionId, user_id],
		);

		res.status(200).json({ message: "Transaction deleted successfully!" });
	} catch (err) {
		console.error("Error deleting transaction:", err.message);
		res.status(500).json({ error: "Failed to delete transaction" });
	}
});

// GET /transactions/summary
app.get("/transactions/summary", async (req, res) => {
	const userId = req.session.user_id; // Ensure user authentication
	if (!userId) {
			return res.status(401).json({ error: "User not authenticated" });
	}

	try {
			// Query for total income
			const incomeResult = await pool.query(
					"SELECT COALESCE(SUM(amount), 0) AS totalIncome FROM transactions WHERE type = 'Money In' AND user_id = $1",
					[userId]
			);

			// Query for total expenses
			const expenseResult = await pool.query(
					"SELECT COALESCE(SUM(amount), 0) AS totalExpense FROM transactions WHERE type = 'Expense' AND user_id = $1",
					[userId]
			);

			// Debugging logs
			console.log("Income Query Result:", incomeResult.rows);
			console.log("Expense Query Result:", expenseResult.rows);

			// Parse results
			const totalIncome = parseFloat(incomeResult.rows[0]?.totalincome || "0");
			const totalExpense = parseFloat(expenseResult.rows[0]?.totalexpense || "0");
			const balance = totalIncome - totalExpense;

			// Debugging logs
			console.log("Total Income:", totalIncome);
			console.log("Total Expense:", totalExpense);
			console.log("Balance:", balance);

			// Send the summary data
			res.json({ totalIncome, totalExpense, balance });
	} catch (error) {
			console.error("Error fetching summary:", error);
			res.status(500).json({ error: "Internal Server Error" });
	}
});

// Start server
app.listen(3000, () => {
	console.log("Server is running on http://localhost:3000");
});
