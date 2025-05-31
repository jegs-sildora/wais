process.env.TZ = "Asia/Manila";

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const pool = require("./db");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());

// Set timezone for PostgreSQL
pool.query("SET TIME ZONE 'Asia/Manila';", (err) => {
	if (err) {
		console.error("Error setting timezone for PostgreSQL:", err.message);
	} else {
		console.log("Timezone set to Asia/Manila for PostgreSQL.");
	}
});

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

	// Validate input lengths
	if (type.length > 10) {
		return res.status(400).json({
			error: "Transaction type exceeds maximum length of 10 characters.",
		});
	}
	if (category.length > 50) {
		return res
			.status(400)
			.json({ error: "Category exceeds maximum length of 50 characters." });
	}

	try {
		console.log("Saving transaction for user:", user_id);
		console.log("Transaction details:", {
			type,
			amount,
			category,
			description,
			date,
		});

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

// GET /transactions/filter-by-month
app.get("/transactions/filter-by-month", async (req, res) => {
	const user_id = req.session.user_id;
	const { month } = req.query; // Get the month from query parameters

	if (!user_id) {
		return res.status(401).json({ error: "User not authenticated" });
	}

	if (!month) {
		return res.status(400).json({ error: "Month query parameter is required" });
	}

	try {
		// Fetch transactions filtered by the specified month
		const result = await pool.query(
			`SELECT transaction_id, type, amount, category, description, date
            FROM transactions
            WHERE user_id = $1 AND TO_CHAR(date::DATE, 'YYYY-MM') = $2
            ORDER BY date DESC`,
			[user_id, month],
		);

		res.json(result.rows); // Return the filtered transactions as JSON
	} catch (err) {
		console.error("Error fetching transactions by month:", err.message);
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
			[userId],
		);

		// Query for total expenses
		const expenseResult = await pool.query(
			"SELECT COALESCE(SUM(amount), 0) AS totalExpense FROM transactions WHERE type = 'Expense' AND user_id = $1",
			[userId],
		);

		// Parse results
		const totalIncome = parseFloat(incomeResult.rows[0]?.totalincome || "0");
		const totalExpense = parseFloat(expenseResult.rows[0]?.totalexpense || "0");
		const balance = totalIncome - totalExpense;

		// Send the summary data
		res.json({ totalIncome, totalExpense, balance });
	} catch (error) {
		console.error("Error fetching summary:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// GET /budget/income
app.get("/budget/income", async (req, res) => {
	const user_id = req.session.user_id;
	if (!user_id) {
		return res.status(401).json({ error: "User not authenticated" });
	}

	try {
		const incomeResult = await pool.query(
			`SELECT COALESCE(SUM(amount), 0) AS total_income
			 FROM transactions
			 WHERE user_id = $1 AND type = 'Money In'`,
			[user_id],
		);

		const expenseResult = await pool.query(
			`SELECT COALESCE(SUM(amount), 0) AS total_expenses
			 FROM transactions
			 WHERE user_id = $1 AND type = 'Expense'`,
			[user_id],
		);

		const totalIncome = parseFloat(incomeResult.rows[0].total_income);
		const totalExpenses = parseFloat(expenseResult.rows[0].total_expenses);
		const remainingBalance = totalIncome - totalExpenses;

		res.json({ totalIncome, totalExpenses, remainingBalance });
	} catch (err) {
		console.error("Error fetching income and expenses:", err.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

// POST /budget: Save a new budget
app.post("/budget", async (req, res) => {
	const { budgetFor, allocatedAmount, startDate, endDate, description } =
		req.body;
	const user_id = req.session.user_id;

	if (!user_id) {
		return res.status(401).json({ error: "User not authenticated" });
	}

	try {
		// Adjust the startDate and endDate to ensure they are in Asia/Manila timezone
		const adjustedStartDate = new Intl.DateTimeFormat("en-CA", {
			timeZone: "Asia/Manila",
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		})
			.format(new Date(startDate))
			.split("-")
			.join("-");

		const adjustedEndDate = new Date(endDate);
		adjustedEndDate.setHours(23, 59, 59, 999); // Set to the end of the day

		const result = await pool.query(
			`INSERT INTO budgets (user_id, budget_for, allocated_amount, start_date, end_date, description)
			 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
			[
				user_id,
				budgetFor,
				allocatedAmount,
				adjustedStartDate,
				adjustedEndDate,
				description,
			],
		);

		res.status(201).json(result.rows[0]); // Return the newly created budget
	} catch (err) {
		console.error("Error saving budget:", err.message);
		res.status(500).json({ error: "Failed to save budget" });
	}
});

// GET /budget: Fetch all budgets for the logged-in user
app.get("/budget", async (req, res) => {
	const user_id = req.session.user_id;

	if (!user_id) {
		return res.status(401).json({ error: "User not authenticated" });
	}

	try {
		const result = await pool.query(
			`SELECT 
                b.budget_id AS id,
                b.budget_for AS category, 
                b.allocated_amount AS limit, 
                COALESCE(SUM(t.amount), 0) AS spent, 
                b.start_date, 
                b.end_date,
                b.daily_budget,
                b.description,
                MAX(t.date) AS last_transaction_date -- Add this to get the most recent transaction date
            FROM budgets b
            LEFT JOIN transactions t
            ON b.user_id = t.user_id AND b.budget_for = t.category AND t.type = 'Expense'
            WHERE b.user_id = $1
            GROUP BY b.budget_id, b.budget_for, b.allocated_amount, b.start_date, b.end_date, b.daily_budget, b.description`,
			[user_id],
		);

		res.json(result.rows);
	} catch (err) {
		console.error("Error fetching budgets:", err.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

// PUT /budget/:budgetId: Update an existing budget
app.put("/budget/:budgetId", async (req, res) => {
	const { budgetId } = req.params;
	const { budgetFor, allocatedAmount, startDate, endDate, description } =
		req.body;
	const user_id = req.session.user_id;

	if (!user_id) {
		return res.status(401).json({ error: "User not authenticated" });
	}

	// Validate required fields
	if (!budgetFor || !allocatedAmount || !startDate || !endDate) {
		return res.status(400).json({ error: "All fields are required." });
	}

	try {
		// Check if the budget belongs to the logged-in user
		const result = await pool.query(
			"SELECT * FROM budgets WHERE budget_id = $1 AND user_id = $2",
			[budgetId, user_id],
		);

		if (result.rows.length === 0) {
			return res
				.status(404)
				.json({ error: "Budget not found or unauthorized" });
		}

		// Adjust the startDate and endDate to Asia/Manila timezone
		const adjustedStartDate = new Date(
			new Date(startDate).toLocaleString("en-US", { timeZone: "Asia/Manila" }),
		);

		const adjustedEndDate = new Date(
			new Date(endDate).toLocaleString("en-US", { timeZone: "Asia/Manila" }),
		);

		// Update the budget
		await pool.query(
			`UPDATE budgets 
       SET budget_for = $1, allocated_amount = $2, start_date = $3, end_date = $4, description = $5
       WHERE budget_id = $6 AND user_id = $7`,
			[
				budgetFor,
				allocatedAmount,
				adjustedStartDate,
				adjustedEndDate,
				description,
				budgetId,
				user_id,
			],
		);

		res.status(200).json({ message: "Budget updated successfully!" });
	} catch (err) {
		console.error("Error updating budget:", err.message);
		res.status(500).json({ error: "Failed to update budget" });
	}
});

// DELETE /budget/:budgetId: Remove an existing budget
app.delete("/budget/:budgetId", async (req, res) => {
	const { budgetId } = req.params;
	const user_id = req.session.user_id;

	if (!user_id) {
		return res.status(401).json({ error: "User not authenticated" });
	}

	try {
		// Check if the budget belongs to the logged-in user
		const result = await pool.query(
			"SELECT * FROM budgets WHERE budget_id = $1 AND user_id = $2",
			[budgetId, user_id],
		);

		if (result.rows.length === 0) {
			return res
				.status(404)
				.json({ error: "Budget not found or unauthorized" });
		}

		// Delete the budget
		await pool.query(
			"DELETE FROM budgets WHERE budget_id = $1 AND user_id = $2",
			[budgetId, user_id],
		);

		res.status(200).json({ message: "Budget deleted successfully!" });
	} catch (err) {
		console.error("Error deleting budget:", err.message);
		res.status(500).json({ error: "Failed to delete budget" });
	}
});

// GET /reports/monthly-expenses
app.get("/reports/monthly-expenses", async (req, res) => {
	const user_id = req.session.user_id;

	if (!user_id) {
		return res.status(401).json({ error: "User not authenticated" });
	}

	try {
		const result = await pool.query(
			`SELECT 
                TO_CHAR(date::DATE, 'YYYY-MM') AS month,
                category,
                SUM(amount) AS total_expense
            FROM transactions
            WHERE user_id = $1 AND type = 'Expense'
            GROUP BY month, category
            ORDER BY month, category`,
			[user_id],
		);

		res.json(result.rows);
	} catch (err) {
		console.error("Error fetching monthly expenses:", err.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

app.get("/reports/budget-vs-actual", async (req, res) => {
	const user_id = req.session.user_id;
	if (!user_id) {
		return res.status(401).json({ error: "User not authenticated" });
	}

	const { month } = req.query;

	try {
		let queryParams = [user_id];
		let dateFilterClause = "";
		let spendingDateClause = "";

		if (month) {
			const startOfMonth = `${month}-01`;
			const endOfMonth =
				`${month}-01` + " + INTERVAL '1 month' - INTERVAL '1 day'";

			dateFilterClause = `
				AND b.start_date <= DATE_TRUNC('month', TO_DATE($2, 'YYYY-MM-DD')) + INTERVAL '1 month' - INTERVAL '1 day'
				AND b.end_date >= DATE_TRUNC('month', TO_DATE($2, 'YYYY-MM-DD'))
			`;

			spendingDateClause = `
				AND t.date >= DATE_TRUNC('month', TO_DATE($2, 'YYYY-MM-DD'))
				AND t.date < DATE_TRUNC('month', TO_DATE($2, 'YYYY-MM-DD')) + INTERVAL '1 month'
			`;

			queryParams.push(startOfMonth);
		}

		const query = `
			SELECT 
				b.budget_for AS category,
				b.allocated_amount AS budget,
				COALESCE(SUM(
					CASE 
						WHEN t.type = 'Expense' ${spendingDateClause}
						THEN t.amount 
						ELSE 0 
					END
				), 0) AS actual_spending
			FROM budgets b
			LEFT JOIN transactions t
				ON b.budget_for = t.category AND t.user_id = $1
			WHERE b.user_id = $1
			${dateFilterClause}
			GROUP BY b.budget_for, b.allocated_amount
			ORDER BY b.budget_for;
		`;

		const result = await pool.query(query, queryParams);
		res.json(result.rows);
	} catch (err) {
		console.error("Error fetching budget vs actual spending:", err.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

// GET /reports/income-vs-expense
app.get("/reports/income-vs-expense", async (req, res) => {
	const user_id = req.session.user_id;

	if (!user_id) {
		return res.status(401).json({ error: "User not authenticated" });
	}

	try {
		const query = `
            SELECT 
                TO_CHAR(date::DATE, 'YYYY-MM') AS month,
                SUM(CASE WHEN type = 'Money In' THEN amount ELSE 0 END) AS income,
                SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END) AS expense
            FROM transactions
            WHERE user_id = $1
            GROUP BY month
            ORDER BY month;
		`;

		const result = await pool.query(query, [user_id]);
		res.json(result.rows); // Return the income vs expense data as JSON
	} catch (err) {
		console.error("Error fetching income vs expense trend:", err.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Start server
app.listen(3000, () => {
	console.log("Server is running on http://localhost:3000");
});
