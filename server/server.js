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

// BUDGET: Create
app.post("/budgets", async (req, res) => {
	const user_id = req.session.user_id;
	if (!user_id) return res.status(401).json({ error: "User not logged in" });

	const { category, allocated_amount, start_date, end_date, type } = req.body;

	// Validate required fields
	if (!category || !allocated_amount || !start_date || !end_date || !type) {
		return res.status(400).json({ error: "Missing required fields" });
	}

	// Validate type field
	if (type !== "Expense" && type !== "Savings") {
		return res
			.status(400)
			.json({ error: "Invalid type. Must be 'Expense' or 'Savings'." });
	}

	try {
		const result = await pool.query(
			`INSERT INTO budgets (user_id, category, allocated_amount, spent_amount, saved_amount, start_date, end_date, type)
             VALUES ($1, $2, $3, 0, 0, $4, $5, $6) RETURNING *`,
			[user_id, category, allocated_amount, start_date, end_date, type],
		);

		res.status(201).json({
			message: "Budget added successfully!",
			budget: result.rows[0],
		});
	} catch (err) {
		console.error("Error adding budget:", err.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

// BUDGET: Read
app.get("/budgets", async (req, res) => {
	const user_id = req.session.user_id;
	if (!user_id) return res.status(401).json({ error: "User not logged in" });

	try {
		const result = await pool.query(
			`SELECT id, category, 
                    CAST(allocated_amount AS NUMERIC) AS allocated_amount, 
                    CAST(spent_amount AS NUMERIC) AS spent_amount, 
                    CAST(saved_amount AS NUMERIC) AS saved_amount,
                    (allocated_amount - spent_amount - saved_amount) AS remaining_budget,
                    start_date, end_date, type
             FROM budgets
             WHERE user_id = $1
             ORDER BY start_date DESC`,
			[user_id],
		);
		res.json(result.rows);
	} catch (err) {
		console.error("Error fetching budgets:", err.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

// BUDGET: Update
app.put("/budgets/:id", async (req, res) => {
	const user_id = req.session.user_id;
	const { id } = req.params;
	const { allocated_amount, start_date, end_date } = req.body;

	if (!user_id) return res.status(401).json({ error: "User not logged in" });

	try {
		const result = await pool.query(
			`UPDATE budgets
             SET allocated_amount = $1, start_date = $2, end_date = $3
             WHERE id = $4 AND user_id = $5 RETURNING *`,
			[allocated_amount, start_date, end_date, id, user_id],
		);

		if (result.rows.length === 0) {
			return res
				.status(404)
				.json({ error: "Budget not found or not authorized" });
		}

		res.json(result.rows[0]);
	} catch (err) {
		console.error("Error updating budget:", err.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

app.put("/budgets/update", async (req, res) => {
	const user_id = req.session.user_id;
	const { category, adjustment } = req.body;

	if (!user_id) {
		return res.status(401).json({ error: "User not logged in" });
	}

	// Validate adjustment
	if (isNaN(parseFloat(adjustment))) {
		return res
			.status(400)
			.json({ error: "Invalid adjustment value. Must be a number." });
	}

	try {
		const result = await pool.query(
			`UPDATE budgets
             SET spent_amount = spent_amount + $1
             WHERE user_id = $2 AND category = $3
             RETURNING *`,
			[adjustment, user_id, category],
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Budget category not found." });
		}

		res.json({
			message: "Budget updated successfully!",
			budget: result.rows[0],
		});
	} catch (err) {
		console.error("Error updating budget:", err.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

// BUDGET: Delete
app.delete("/budgets/:id", async (req, res) => {
	const user_id = req.session.user_id;
	const { id } = req.params;

	if (!user_id) return res.status(401).json({ error: "User not logged in" });

	try {
		const result = await pool.query(
			`DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING *`,
			[id, user_id],
		);

		if (result.rows.length === 0) {
			return res
				.status(404)
				.json({ error: "Budget not found or not authorized" });
		}

		res.json({
			message: "Budget deleted successfully",
			budget: result.rows[0],
		});
	} catch (err) {
		console.error("Error deleting budget:", err.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

// TRANSACTION: Create
app.post("/transactions", async (req, res) => {
	const { type, amount, category, description, date } = req.body;
	const user_id = req.session.user_id;

	if (!user_id) return res.status(401).json({ error: "User not logged in" });

	// Validate amount
	if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
		return res
			.status(400)
			.json({ error: "Invalid amount. Must be a positive number." });
	}

	try {
		// Insert the transaction
		const transactionResult = await pool.query(
			`INSERT INTO transactions (user_id, type, amount, category, description, date)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
			[user_id, type, amount, category, description, date],
		);

		// Update the corresponding budget's saved_amount or spent_amount
		if (type === "Expense") {
			// Update spent_amount for Expense transactions
			const result = await pool.query(
				`UPDATE budgets
                 SET spent_amount = spent_amount + $1
                 WHERE user_id = $2 AND category = $3
                 RETURNING *`,
				[amount, user_id, category],
			);

			if (result.rows.length === 0) {
				return res
					.status(404)
					.json({ error: "Budget category not found for Expense." });
			}
		} else if (type === "Income") {
			// Update saved_amount for Income transactions
			const result = await pool.query(
				`UPDATE budgets
                 SET saved_amount = saved_amount + $1
                 WHERE user_id = $2 AND category = $3
                 RETURNING *`,
				[amount, user_id, category],
			);

			if (result.rows.length === 0) {
				return res
					.status(404)
					.json({ error: "Budget category not found for Income." });
			}
		}

		res.status(201).json({
			message: "Transaction added successfully!",
			transaction: transactionResult.rows[0],
		});
	} catch (err) {
		console.error("Error adding transaction:", err.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

// TRANSACTION: Get all
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

// TRANSACTION: Get one
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

// TRANSACTION: Update
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

// TRANSACTION: Delete
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

// FINANCIAL SUMMARY
app.get("/financial-summary", async (req, res) => {
	const user_id = req.session.user_id;

	if (!user_id) return res.status(401).json({ error: "User not logged in" });

	try {
		// Fetch total income, expenses, and calculate current balance from transactions only
		const financialSummary = await pool.query(
			`SELECT 
                COALESCE(SUM(CASE WHEN t.type = 'Income' THEN t.amount ELSE 0 END), 0) AS total_income,
                COALESCE(SUM(CASE WHEN t.type = 'Expense' THEN t.amount ELSE 0 END), 0) AS total_expenses,
                COALESCE(SUM(CASE WHEN t.type = 'Income' THEN t.amount ELSE 0 END), 0) -
                COALESCE(SUM(CASE WHEN t.type = 'Expense' THEN t.amount ELSE 0 END), 0) AS current_balance
            FROM transactions t
            WHERE t.user_id = $1`,
			[user_id],
		);

		res.status(200).json({
			totalIncome: parseFloat(financialSummary.rows[0].total_income) || 0,
			totalExpenses: parseFloat(financialSummary.rows[0].total_expenses) || 0,
			currentBalance: parseFloat(financialSummary.rows[0].current_balance) || 0,
		});
	} catch (err) {
		console.error("Error fetching financial summary:", err.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Start server
app.listen(3000, () => {
	console.log("Server is running on http://localhost:3000");
});
