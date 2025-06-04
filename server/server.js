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

// GET /auth/me: Get current user information
app.get("/auth/me", async (req, res) => {
	const userId = req.session.user_id;

	if (!userId) {
		return res.status(401).json({ error: "User not authenticated" });
	}

	try {
		const query =
			"SELECT user_id, username, email FROM users WHERE user_id = $1";
		const result = await pool.query(query, [userId]);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "User not found" });
		}

		res.json(result.rows[0]);
	} catch (error) {
		console.error("Error fetching current user:", error);
		res.status(500).json({ error: "Failed to fetch user information" });
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

		const extracted = [
			budgetFor,
			allocatedAmount,
			adjustedStartDate,
			adjustedEndDate,
			description,
			budgetId,
			user_id,
		];
		// Update the budget
		await pool.query(
			`UPDATE budgets 
       SET budget_for = $1, allocated_amount = $2, start_date = $3, end_date = $4, description = $5
       WHERE budget_id = $6 AND user_id = $7`,
			extracted,
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
							TO_CHAR(b.start_date, 'YYYY-MM') AS month,
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
					GROUP BY b.budget_for, b.allocated_amount, b.start_date
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
                TO_CHAR(date::DATE, 'YYYY-MM-DD') AS day,
                SUM(CASE WHEN type = 'Money In' THEN amount ELSE 0 END) AS income,
                SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END) AS expense
            FROM transactions
            WHERE user_id = $1
            GROUP BY day
            ORDER BY day;
        `;

		const result = await pool.query(query, [user_id]);
		res.json(result.rows); // Return the daily income vs expense data as JSON
	} catch (err) {
		console.error("Error fetching daily income vs expense trend:", err.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

// POST /group-expense: Create a new group expense
app.post("/group-expense", async (req, res) => {
	const user_id = req.session.user_id;

	if (!user_id) {
		console.error("User not authenticated");
		return res.status(401).json({ error: "User not authenticated" });
	}

	const {
		expenseTitle,
		amount,
		startDate,
		endDate,
		numOfParticipants,
		splitType,
		yourPercentage,
		otherPercentage,
		groupCode,
	} = req.body;

	// Add input validation
	if (
		!expenseTitle ||
		!amount ||
		!startDate ||
		!numOfParticipants ||
		!splitType ||
		!groupCode
	) {
		return res.status(400).json({ error: "Missing required fields" });
	}

	try {
		// Improved date parsing with validation
		let adjustedStartDate;
		let adjustedEndDate = null;

		// Parse start date
		if (startDate) {
			const startDateObj = new Date(startDate);
			if (isNaN(startDateObj.getTime())) {
				return res.status(400).json({ error: "Invalid start date format" });
			}
			// Set to beginning of day in Asia/Manila timezone
			adjustedStartDate = new Date(
				startDateObj.getFullYear(),
				startDateObj.getMonth(),
				startDateObj.getDate(),
				0,
				0,
				0,
			);
		} else {
			return res.status(400).json({ error: "Start date is required" });
		}

		// Parse end date if provided
		if (endDate) {
			const endDateObj = new Date(endDate);
			if (isNaN(endDateObj.getTime())) {
				return res.status(400).json({ error: "Invalid end date format" });
			}
			// Set to end of day in Asia/Manila timezone
			adjustedEndDate = new Date(
				endDateObj.getFullYear(),
				endDateObj.getMonth(),
				endDateObj.getDate(),
				23,
				59,
				59,
			);
		}

		const query = `
        INSERT INTO groupexpense (
            owner, 
            expense_title, 
            amount, 
            start_date, 
            end_date, 
            num_participants, 
            participants,
            split_type, 
            your_percentage, 
            other_percentage,
            group_code
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *;
    `;

		const values = [
			user_id,
			expenseTitle,
			parseFloat(amount),
			adjustedStartDate,
			adjustedEndDate,
			parseInt(numOfParticipants),
			[],
			splitType,
			parseFloat(yourPercentage.replace("%", "")),
			parseFloat(otherPercentage.replace("%", "")),
			groupCode,
		];

		const result = await pool.query(query, values);

		res.status(201).json({
			message: "Group expense created successfully!",
			groupExpense: result.rows[0],
		});
	} catch (err) {
		console.error("Error creating group expense:", err.message);

		// Return JSON error response
		if (err.code === "23505") {
			return res.status(400).json({ error: "Duplicate entry detected." });
		}

		if (err.code === "23502") {
			return res
				.status(400)
				.json({ error: "Missing required database field." });
		}

		return res.status(500).json({ error: "Failed to create group expense." });
	}
});

// POST /group-expense/join: Join an existing group expense
app.post("/group-expense/join", async (req, res) => {
	const user_id = req.session.user_id;

	if (!user_id) {
		console.error("User not authenticated");
		return res.status(401).json({ error: "User not authenticated." });
	}

	const { groupCode } = req.body;

	if (!groupCode) {
		return res.status(400).json({ error: "Group code is required." });
	}

	try {
		// Find the group expense by group code
		const groupExpenseResult = await pool.query(
			"SELECT * FROM groupexpense WHERE group_code = $1",
			[groupCode],
		);

		if (groupExpenseResult.rows.length === 0) {
			return res.status(404).json({ error: "Invalid group code." });
		}

		const groupExpense = groupExpenseResult.rows[0];

		// Check if user is the owner
		if (groupExpense.owner === user_id) {
			return res.status(400).json({ error: "You cannot join your own group." });
		}

		// Check if user is already a participant
		if (
			groupExpense.participants &&
			groupExpense.participants.includes(user_id)
		) {
			return res
				.status(400)
				.json({ error: "You are already a member of this group." });
		}

		// Check if the group is already full
		const currentParticipants = groupExpense.participants
			? groupExpense.participants.length
			: 0;
		const maxParticipants = groupExpense.num_participants - 1;

		if (currentParticipants >= maxParticipants) {
			return res.status(400).json({
				error: `Oops! This group is already full!`,
			});
		}

		// Add the user to the participants array
		const updatedParticipants = groupExpense.participants
			? [...groupExpense.participants, user_id]
			: [user_id];

		// Update the group expense with the new participant
		const updateResult = await pool.query(
			"UPDATE groupexpense SET participants = $1 WHERE group_code = $2 RETURNING *",
			[updatedParticipants, groupCode],
		);

		// Calculate remaining slots
		const remainingSlots = maxParticipants - updatedParticipants.length;

		res.status(200).json({
			message: `Successfully joined the group!`,
			groupExpense: updateResult.rows[0],
			participantInfo: {
				currentParticipants: updatedParticipants.length,
				maxParticipants: maxParticipants,
				remainingSlots: remainingSlots,
			},
		});
	} catch (err) {
		console.error("Error joining group expense:", err.message);

		// Handle specific database errors
		if (err.code === "23505") {
			return res
				.status(400)
				.json({ error: "Unable to join group due to duplicate entry" });
		}

		if (err.code === "23502") {
			return res.status(400).json({ error: "Invalid group data" });
		}

		return res
			.status(500)
			.json({ error: "Failed to join group expense. Please try again." });
	}
});

// GET /group-expense: Fetch all group expenses for the logged-in user
app.get("/group-expense", async (req, res) => {
	const user_id = req.session.user_id;

	if (!user_id) {
		return res.status(401).json({ error: "User not authenticated" });
	}

	try {
		// Fetch group expenses where user is either owner or participant
		const result = await pool.query(
			`SELECT 
                groupexpense_id as id,
                owner,
                expense_title,
                amount,
                start_date,
                end_date,
                num_participants,
                participants,
                split_type,
                your_percentage,
                other_percentage,
                group_code,
                created_at
            FROM groupexpense 
            WHERE owner = $1 OR $1 = ANY(participants)
            ORDER BY created_at DESC`,
			[user_id],
		);

		// For each group expense, fetch participant usernames
		const groupExpensesWithUsernames = await Promise.all(
			result.rows.map(async (expense) => {
				let participantUsernames = [];

				if (expense.participants && expense.participants.length > 0) {
					// Fetch usernames for all participants
					const participantResult = await pool.query(
						`SELECT user_id, username FROM users WHERE user_id = ANY($1)`,
						[expense.participants],
					);
					participantUsernames = participantResult.rows;
				}

				// Fetch owner username
				const ownerResult = await pool.query(
					`SELECT username FROM users WHERE user_id = $1`,
					[expense.owner],
				);

				return {
					...expense,
					owner_username: ownerResult.rows[0]?.username || "Unknown",
					participant_usernames: participantUsernames,
				};
			}),
		);

		res.json(groupExpensesWithUsernames);
	} catch (err) {
		console.error("Error fetching group expenses:", err.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

// PUT /group-expense/:id: Update an existing group expense
app.put("/group-expense/:id", async (req, res) => {
	const { id } = req.params;
	const user_id = req.session.user_id;

	if (!user_id) {
		return res.status(401).json({ error: "User not authenticated" });
	}

	const {
		expenseTitle,
		amount,
		startDate,
		endDate,
		numOfParticipants,
		splitType,
		yourPercentage,
		otherPercentage,
		groupCode,
	} = req.body;

	try {
		// First, check if the group expense exists
		const existsResult = await pool.query(
			"SELECT owner, expense_title FROM groupexpense WHERE groupexpense_id = $1",
			[id],
		);

		if (existsResult.rows.length === 0) {
			return res.status(404).json({
				error: "Group expense not found",
				message:
					"The group expense you're trying to update doesn't exist or may have been deleted.",
			});
		}

		const groupExpense = existsResult.rows[0];

		// Check if the current user is the owner
		if (groupExpense.owner !== user_id) {
			return res.status(403).json({
				error: "Access denied",
				message: `Only the owner of "${groupExpense.expense_title}" can make changes to this group expense. Contact the group owner if you need updates.`,
			});
		}

		// Improved date parsing with validation for updates
		let adjustedStartDate;
		let adjustedEndDate = null;

		// Parse start date
		if (startDate) {
			const startDateObj = new Date(startDate);
			if (isNaN(startDateObj.getTime())) {
				return res.status(400).json({ error: "Invalid start date format" });
			}
			adjustedStartDate = new Date(
				startDateObj.getFullYear(),
				startDateObj.getMonth(),
				startDateObj.getDate(),
				0,
				0,
				0,
			);
		} else {
			return res.status(400).json({ error: "Start date is required" });
		}

		// Parse end date if provided
		if (endDate) {
			const endDateObj = new Date(endDate);
			if (isNaN(endDateObj.getTime())) {
				return res.status(400).json({ error: "Invalid end date format" });
			}
			adjustedEndDate = new Date(
				endDateObj.getFullYear(),
				endDateObj.getMonth(),
				endDateObj.getDate(),
				23,
				59,
				59,
			);
		}

		// Update the group expense
		const updateResult = await pool.query(
			`UPDATE groupexpense 
            SET 
                expense_title = $1,
                amount = $2,
                start_date = $3,
                end_date = $4,
                num_participants = $5,
                split_type = $6,
                your_percentage = $7,
                other_percentage = $8,
                group_code = $9
            WHERE groupexpense_id = $10 AND owner = $11
            RETURNING *`,
			[
				expenseTitle,
				parseFloat(amount),
				adjustedStartDate,
				adjustedEndDate,
				parseInt(numOfParticipants),
				splitType,
				parseFloat(yourPercentage.replace("%", "")),
				parseFloat(otherPercentage.replace("%", "")),
				groupCode,
				id,
				user_id,
			],
		);

		if (updateResult.rows.length === 0) {
			return res.status(500).json({
				error: "Update failed",
				message:
					"Something went wrong while updating the group expense. Please try again.",
			});
		}

		res.status(200).json({
			message: "Group expense updated successfully!",
			groupExpense: updateResult.rows[0],
		});
	} catch (err) {
		console.error("Error updating group expense:", err.message);

		// Handle specific database errors
		if (err.code === "23505") {
			return res.status(400).json({
				error: "Duplicate entry",
				message:
					"A group expense with this group code already exists. Please use a different group code.",
			});
		}

		if (err.code === "23502") {
			return res.status(400).json({
				error: "Invalid data",
				message:
					"Some required information is missing. Please fill in all required fields.",
			});
		}

		if (err.code === "22P02") {
			return res.status(400).json({
				error: "Invalid format",
				message:
					"Please check that all numbers and dates are in the correct format.",
			});
		}

		res.status(500).json({
			error: "Update failed",
			message:
				"An unexpected error occurred while updating the group expense. Please try again later.",
		});
	}
});

// DELETE /group-expense/:id: Delete an existing group expense
app.delete("/group-expense/:id", async (req, res) => {
	const { id } = req.params;
	const user_id = req.session.user_id;

	if (!user_id) {
		return res.status(401).json({
			error: "Authentication required",
			message: "Please log in to delete group expenses.",
		});
	}

	try {
		// First, check if the group expense exists
		const existsResult = await pool.query(
			"SELECT owner, expense_title FROM groupexpense WHERE groupexpense_id = $1",
			[id],
		);

		if (existsResult.rows.length === 0) {
			return res.status(404).json({
				error: "Group expense not found",
				message:
					"The group expense you're trying to delete doesn't exist or may have already been deleted.",
			});
		}

		const groupExpense = existsResult.rows[0];

		// Check if the current user is the owner BEFORE proceeding
		if (groupExpense.owner !== user_id) {
			return res.status(403).json({
				error: "Permission denied",
				message: `You don't have permission to delete "${groupExpense.expense_title}". Only the group owner can delete this expense.`,
			});
		}

		// Check if there are any payments associated with this group expense
		const paymentsResult = await pool.query(
			"SELECT COUNT(*) as payment_count FROM groupexpense_payments WHERE groupexpense_id = $1",
			[id],
		);

		const paymentCount = parseInt(paymentsResult.rows[0].payment_count);

		if (paymentCount > 0) {
			return res.status(400).json({
				error: "Cannot delete",
				message: `This group expense has ${paymentCount} payment(s) associated with it. Group expenses with payments cannot be deleted for record-keeping purposes.`,
			});
		}

		// Only delete if the user is the owner (double-check with WHERE clause)
		const deleteResult = await pool.query(
			"DELETE FROM groupexpense WHERE groupexpense_id = $1 AND owner = $2 RETURNING expense_title",
			[id, user_id],
		);

		// This should never happen given our checks above, but just in case
		if (deleteResult.rows.length === 0) {
			return res.status(403).json({
				error: "Permission denied",
				message: "You don't have permission to delete this group expense.",
			});
		}

		res.status(200).json({
			message: `Group expense "${deleteResult.rows[0].expense_title}" has been deleted successfully!`,
		});
	} catch (err) {
		console.error("Error deleting group expense:", err.message);

		// Handle foreign key constraint errors
		if (err.code === "23503") {
			return res.status(400).json({
				error: "Cannot delete",
				message:
					"This group expense cannot be deleted because it has related records. Please contact support if you need assistance.",
			});
		}

		res.status(500).json({
			error: "Delete failed",
			message:
				"An unexpected error occurred while deleting the group expense. Please try again later.",
		});
	}
});

// Handle group expense payment
app.post("/group-expense/pay", async (req, res) => {
	const {
		groupExpenseId,
		amount,
		paymentMethod,
		referenceNotes,
		expenseTitle,
	} = req.body;
	const userId = req.session.user_id;

	if (!userId) {
		return res.status(401).json({ error: "User not authenticated" });
	}

	if (!groupExpenseId || !amount || !paymentMethod) {
		return res.status(400).json({ error: "Missing required fields" });
	}

	const client = await pool.connect();

	try {
		await client.query("BEGIN");

		// 1. Get expense details
		const expenseQuery = `
            SELECT expense_title, amount as total_amount, owner
            FROM groupexpense 
            WHERE groupexpense_id = $1
        `;
		const expenseResult = await client.query(expenseQuery, [groupExpenseId]);

		if (expenseResult.rows.length === 0) {
			throw new Error("Group expense not found");
		}

		const expense = expenseResult.rows[0];

		// 2. Insert into transactions table (simplified - only required columns)
		const transactionQuery = `
            INSERT INTO transactions (
                user_id,
                type,
                category,
                amount,
                description,
                date
            ) VALUES (
                $1, $2, $3, $4, $5, $6
            ) RETURNING transaction_id
        `;

		const transactionValues = [
			userId,
			"Expense", // Match the type used in your other transactions
			"Group Expense",
			amount,
			`Payment for: ${
				expenseTitle || expense.expense_title
			} (via ${paymentMethod})`,
			new Date().toISOString().split("T")[0], // Format as YYYY-MM-DD
		];

		const transactionResult = await client.query(
			transactionQuery,
			transactionValues,
		);
		const transactionId = transactionResult.rows[0].transaction_id;

		// 3. Insert into groupexpense_payments table (simplified)
		const paymentQuery = `
            INSERT INTO groupexpense_payments (
                groupexpense_id,
                user_id,
                transaction_id,
                amount,
                payment_method,
                reference_notes,
                payment_status
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7
            ) RETURNING id
        `;

		const paymentValues = [
			groupExpenseId,
			userId,
			transactionId,
			amount,
			paymentMethod,
			referenceNotes || null,
			"completed",
		];

		const paymentResult = await client.query(paymentQuery, paymentValues);
		const paymentId = paymentResult.rows[0].id;

		await client.query("COMMIT");

		res.json({
			success: true,
			paymentId: paymentId,
			transactionId: transactionId,
			message: "Payment processed successfully",
		});
	} catch (error) {
		await client.query("ROLLBACK");
		console.error("Payment processing error:", error);
		res.status(500).json({
			error: "Payment processing failed",
			details: error.message,
		});
	} finally {
		client.release();
	}
});

// Add this route to get payments for a specific group expense
app.get("/group-expense/:id/payments", async (req, res) => {
	const { id } = req.params;
	const userId = req.session.user_id;

	if (!userId) {
		return res.status(401).json({ error: "User not authenticated" });
	}

	try {
		const query = `
            SELECT 
                gep.id as payment_id,
                gep.amount,
                gep.payment_method,
                gep.reference_notes,
                gep.payment_status,
                gep.created_at as payment_date,
                gep.user_id,
                u.username,
                u.email
            FROM groupexpense_payments gep
            JOIN users u ON gep.user_id = u.user_id
            WHERE gep.groupexpense_id = $1
            ORDER BY gep.created_at DESC
        `;

		const result = await pool.query(query, [id]);
		res.json(result.rows);
	} catch (error) {
		console.error("Error fetching payment history:", error);
		res.status(500).json({ error: "Failed to fetch payment history" });
	}
});

// Start server
app.listen(3000, () => {
	console.log("Server is running on http://localhost:3000");
});
