import { useState, useEffect } from "react";
import HomeNavSideBar from "../components/HomeNavSideBar";
import { toast } from "sonner";

export default function Budget() {
	const [budgets, setBudgets] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
	const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false); // State for transaction modal
	const [currentBudget, setCurrentBudget] = useState({
		id: null,
		category: "",
		allocated_amount: "",
		start_date: "",
		end_date: "",
		expense_budget: "",
		savings_budget: "",
		type: "Expense",
	});
	const [budgetToDelete, setBudgetToDelete] = useState(null);
	const [transaction, setTransaction] = useState({
		type: "Expense",
		amount: "",
		category: "",
		description: "",
		date: new Date().toISOString().split("T")[0],
	}); // State for transaction details
	const [expenseTotal, setExpenseTotal] = useState(0); // Total for Expense Budget
	const [savingsTotal, setSavingsTotal] = useState(0); // Total for Savings Budget

	// Fetch budgets
	const fetchBudgets = async () => {
		try {
			const response = await fetch("http://localhost:3000/budgets", {
				method: "GET",
				credentials: "include",
			});
			const data = await response.json();

			if (Array.isArray(data)) {
				setBudgets(data);

				// Calculate totals for Expense and Savings Budgets
				const expenseSum = data
					.filter((budget) => budget.type === "Expense")
					.reduce(
						(sum, budget) => sum + (Number(budget.allocated_amount) || 0),
						0,
					);

				const savingsSum = data
					.filter((budget) => budget.type === "Savings")
					.reduce(
						(sum, budget) => (Number(budget.allocated_amount) - sum  || 0),
						0,
					);

				// Calculate spent amounts for Expense and Savings Budgets
				const expenseSpent = data
					.filter((budget) => budget.type === "Expense")
					.reduce((sum, budget) => sum + (Number(budget.spent_amount) || 0), 0);

				const savingsSpent = data
					.filter((budget) => budget.type === "Savings")
					.reduce((sum, budget) => sum - (Number(budget.saved_amount) || 0), 0);

				// Update totals
				setExpenseTotal(expenseSum - expenseSpent); // Remaining Expense Budget
				setSavingsTotal(savingsSum + savingsSpent); // Remaining Savings Budget
			} else {
				setBudgets([]);
				setExpenseTotal(0);
				setSavingsTotal(0);
				toast.error("Unexpected response format.");
			}
		} catch (err) {
			console.error("Error fetching budgets:", err);
			toast.error("Failed to fetch budgets.");
			setExpenseTotal(0);
			setSavingsTotal(0);
		}
	};

	// Save (Add or Edit) budget
	const handleSaveBudget = async () => {
		const { id, category, allocated_amount, start_date, end_date, type } =
			currentBudget;

		// Validate required fields
		if (!category.trim()) {
			toast.error("Category is required.");
			return;
		}
		if (!allocated_amount || allocated_amount <= 0) {
			toast.error("Allocated amount must be greater than 0.");
			return;
		}
		if (!start_date) {
			toast.error("Start date is required.");
			return;
		}
		if (!end_date) {
			toast.error("End date is required.");
			return;
		}
		if (new Date(start_date) > new Date(end_date)) {
			toast.error("Start date cannot be later than end date.");
			return;
		}
		if (!type || (type !== "Expense" && type !== "Savings")) {
			toast.error("Type of budget is required.");
			return;
		}

		// Set expense_budget or savings_budget based on the selected type
		const expense_budget = type === "Expense" ? allocated_amount : "";
		const savings_budget = type === "Savings" ? allocated_amount : "";

		try {
			const response = await fetch(
				id
					? `http://localhost:3000/budgets/${id}`
					: "http://localhost:3000/budgets",
				{
					method: id ? "PUT" : "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({
						category,
						allocated_amount,
						start_date,
						end_date,
						type, // Include the type field
						expense_budget,
						savings_budget,
					}),
				},
			);

			if (response.ok) {
				toast.success(id ? "Budget updated!" : "Budget added!");
				fetchBudgets();
				setIsModalOpen(false);
				setCurrentBudget({
					id: null,
					category: "",
					allocated_amount: "",
					start_date: "",
					end_date: "",
					expense_budget: "",
					savings_budget: "",
					type: "Expense", // Reset to default
				});
			} else {
				const errorData = await response.json();
				toast.error(errorData.error || "Failed to save budget.");
			}
		} catch (err) {
			console.error("Error saving budget:", err);
			toast.error("An error occurred.");
		}
	};

	// Delete budget
	const handleDeleteBudget = async () => {
		try {
			const response = await fetch(
				`http://localhost:3000/budgets/${budgetToDelete}`,
				{
					method: "DELETE",
					credentials: "include",
				},
			);

			if (response.ok) {
				toast.success("Budget deleted!");
				fetchBudgets();
				setIsConfirmModalOpen(false);
				setBudgetToDelete(null);
			} else {
				const errorData = await response.json();
				toast.error(errorData.error || "Failed to delete budget.");
			}
		} catch (err) {
			console.error("Error deleting budget:", err);
			toast.error("An error occurred.");
		}
	};

	// Handle row click to open transaction modal
	const handleRowClick = (budget) => {
		setTransaction({
			type: "Expense", // Default to Expense
			amount: "",
			category: budget.category, // Pre-fill category from budget
			description: "",
			date: new Date().toISOString().split("T")[0], // Default to today's date
		});
		setIsTransactionModalOpen(true);
	};

	// Handle transaction save
	const handleSaveTransaction = async () => {
		// Validate required fields
		if (!transaction.amount || transaction.amount <= 0) {
			toast.error("Amount must be greater than 0.");
			return;
		}
		if (!transaction.category.trim()) {
			toast.error("Category is required.");
			return;
		}
		if (!transaction.date) {
			toast.error("Date is required.");
			return;
		}

		try {
			const response = await fetch("http://localhost:3000/transactions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(transaction),
			});

			if (response.ok) {
				toast.success("Transaction added successfully!");
				setIsTransactionModalOpen(false);

				// Fetch updated budgets and financial summary
				fetchBudgets(); // Update budgets in Budget.jsx
				if (
					window.fetchFinancialSummary &&
					typeof window.fetchFinancialSummary === "function"
				) {
					window.fetchFinancialSummary(); // Update financial summary in Home.jsx
				}
			} else {
				const errorData = await response.json();
				toast.error(errorData.error || "Failed to save transaction.");
			}
		} catch (err) {
			console.error("Error saving transaction:", err);
			toast.error("An error occurred.");
		}
	};

	useEffect(() => {
		fetchBudgets();
	}, []);

	return (
		<>
			<HomeNavSideBar />
			<div className="p-6">
				<h1 className="ml-10 mt-5 text-3xl font-bold text-forest-green font-secondary">
					BUDGET
				</h1>

				{/* Budget Summary Cards */}
				<div className="flex justify-center">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-6/12">
						{/* Expense Budget Card */}
						<div className="bg-white shadow-lg rounded-lg p-6 text-center">
							<h3 className="text-lg font-bold text-forest-green">
								Expense Budget
							</h3>
							<p className="text-2xl font-black text-forest-green mt-2">
								₱ {expenseTotal.toFixed(2)}
							</p>
							<p className="text-sm text-gray-500 mt-1">
								Total remaining for expenses
							</p>
						</div>

						{/* Savings Budget Card */}
						<div className="bg-white shadow-lg rounded-lg p-6 text-center">
							<h3 className="text-lg font-bold text-forest-green">
								Savings Budget
							</h3>
							<p className="text-2xl font-black text-forest-green mt-2">
								₱ {savingsTotal.toFixed(2)}
							</p>
							<p className="text-sm text-gray-500 mt-1">
								Total remaining for savings
							</p>
						</div>
					</div>
				</div>

				{/* Expense Budget Section */}
				{budgets.filter((budget) => budget.type === "Expense").length > 0 && (
					<div className="mt-10 p-6">
						<h2 className="text-xl font-bold text-forest-green">
							Expense Budget
						</h2>
						<div className="mt-4">
							<table className="table table-zebra w-full text-center">
								<thead>
									<tr>
										<th>#</th>
										<th>Category</th>
										<th>Allocated Amount</th>
										<th>Spent</th>
										<th>Remaining</th>
										<th>Start Date</th>
										<th>End Date</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									{budgets
										.filter((budget) => budget.type === "Expense")
										.map((budget, index) => (
											<tr
												key={budget.id}
												className="cursor-pointer hover:bg-gray-100"
												onClick={() => handleRowClick(budget)} // Open transaction modal
											>
												<td>{index + 1}</td>
												<td>{budget.category}</td>
												<td>₱ {budget.allocated_amount}</td>
												<td>₱ {budget.spent_amount}</td>
												<td>₱ {budget.remaining_budget}</td>
												<td>
													{new Date(budget.start_date).toLocaleDateString(
														"en-US",
														{
															year: "numeric",
															month: "short",
															day: "numeric",
														},
													)}
												</td>
												<td>
													{new Date(budget.end_date).toLocaleDateString(
														"en-US",
														{
															year: "numeric",
															month: "short",
															day: "numeric",
														},
													)}
												</td>
												<td>
													{/* Action Buttons */}
													<div className="flex flex-wrap gap-2 justify-center">
														{/* Edit Button */}
														<button
															className="btn btn-sm btn-primary"
															onClick={(e) => {
																e.stopPropagation(); // Prevent row click
																setCurrentBudget(budget);
																setIsModalOpen(true);
															}}
														>
															Edit
														</button>
														{/* Delete Button */}
														<button
															className="btn btn-sm btn-error"
															onClick={(e) => {
																e.stopPropagation(); // Prevent row click
																setBudgetToDelete(budget.id);
																setIsConfirmModalOpen(true);
															}}
														>
															Delete
														</button>
													</div>
												</td>
											</tr>
										))}
								</tbody>
							</table>
						</div>
					</div>
				)}

				{/* Savings Budget Section */}
				{budgets.filter((budget) => budget.type === "Savings").length > 0 && (
					<div className="mt-10  p-6">
						<h2 className="text-xl font-bold text-forest-green">
							Savings Budget
						</h2>
						<div className="mt-4">
							<table className="table table-zebra w-full text-center">
								<thead>
									<tr>
										<th>#</th>
										<th>Category / Purpose</th>
										<th>Allocated Amount</th>
										<th>Saved</th>
										<th>Remaining</th>
										<th>Start Date</th>
										<th>End Date</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									{budgets
										.filter((budget) => budget.type === "Savings")
										.map((budget, index) => (
											<tr
												key={budget.id}
												className="cursor-pointer hover:bg-gray-100"
												onClick={() => handleRowClick(budget)} // Open transaction modal
											>
												<td>{index + 1}</td>
												<td>{budget.category}</td>
												<td>
													₱ {Number(budget.allocated_amount || 0).toFixed(2)}
												</td>
												<td>₱ {Number(budget.saved_amount || 0).toFixed(2)}</td>
												<td>
													₱ {Number(budget.remaining_budget || 0).toFixed(2)}
												</td>
												<td>
													{new Date(budget.start_date).toLocaleDateString(
														"en-US",
														{
															year: "numeric",
															month: "short",
															day: "numeric",
														},
													)}
												</td>
												<td>
													{new Date(budget.end_date).toLocaleDateString(
														"en-US",
														{
															year: "numeric",
															month: "short",
															day: "numeric",
														},
													)}
												</td>
												<td>
													{/* Action Buttons */}
													<div className="flex flex-wrap gap-2 justify-center">
														<button
															className="btn btn-sm btn-primary"
															onClick={(e) => {
																e.stopPropagation(); // Prevent row click
																setCurrentBudget(budget);
																setIsModalOpen(true);
															}}
														>
															Edit
														</button>
														<button
															className="btn btn-sm btn-error"
															onClick={(e) => {
																e.stopPropagation(); // Prevent row click
																setBudgetToDelete(budget.id);
																setIsConfirmModalOpen(true);
															}}
														>
															Delete
														</button>
													</div>
												</td>
											</tr>
										))}
								</tbody>
							</table>
						</div>
					</div>
				)}

				{/* Add Budget Button */}
				<div className="fixed bottom-8 right-8">
					<button
						className="btn btn-primary px-4 py-2 font-extrabold text-forest-green bg-bright-green hover:bg-bright-green-hover shadow-lg rounded-full"
						onClick={() => {
							setCurrentBudget({
								id: null,
								category: "",
								allocated_amount: "",
								start_date: "",
								end_date: "",
								expense_budget: "",
								savings_budget: "",
								type: "Expense", // Default to "Expense"
							});
							setIsModalOpen(true);
						}}
					>
						Add Budget
					</button>
				</div>

				{/* Modal for Add/Edit Budget */}
				{isModalOpen && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-[0.1] backdrop-blur-lg">
						<div className="bg-white rounded-lg shadow-lg w-1/3 p-8">
							<h2 className="text-xl font-bold text-center">
								{currentBudget.id ? "Edit Budget" : "Add New Budget"}
							</h2>
							<p className="text-forest-green text-center">
								Enter the details of your budget below.
							</p>
							<br />
							<hr />
							<br />
							<form
								onSubmit={(e) => {
									e.preventDefault();
									handleSaveBudget();
								}}
							>
								{/* Category and Type of Budget */}
								<div className="flex gap-4 mb-4">
									{/* Category */}
									<div className="flex-1">
										<label className="block text-sm font-semibold mb-1">
											Category / Purpose
										</label>
										<input
											type="text"
											placeholder="Enter Category"
											className="w-full p-2 border rounded"
											value={currentBudget.category}
											onChange={(e) =>
												setCurrentBudget({
													...currentBudget,
													category: e.target.value,
												})
											}
										/>
									</div>
									{/* Type of Budget */}
									<div className="flex-1">
										<label className="block text-sm font-semibold mb-1">
											Type of Budget
										</label>
										<select
											className="w-full p-2 border rounded"
											value={currentBudget.type || "Expense"} // Default to "Expense"
											onChange={(e) => {
												const type = e.target.value;
												setCurrentBudget({
													...currentBudget,
													type,
													expense_budget:
														type === "Expense"
															? currentBudget.allocated_amount
															: "",
													savings_budget:
														type === "Savings"
															? currentBudget.allocated_amount
															: "",
												});
											}}
										>
											<option value="Expense">Expense Budget</option>
											<option value="Savings">Savings Budget</option>
										</select>
									</div>
								</div>

								{/* Allocated Amount */}
								<div className="mb-4">
									<label className="block text-sm font-semibold mb-1">
										Allocated Amount
									</label>
									<input
										type="number"
										placeholder="Enter Allocated Amount"
										className="w-full p-2 border rounded"
										value={currentBudget.allocated_amount}
										onChange={(e) =>
											setCurrentBudget({
												...currentBudget,
												allocated_amount: e.target.value,
											})
										}
									/>
								</div>

								{/* Start Date and End Date */}
								<div className="flex gap-4 mb-4">
									{/* Start Date */}
									<div className="flex-1">
										<label className="block text-sm font-semibold mb-1">
											Start Date
										</label>
										<input
											type="date"
											className="w-full p-2 border rounded"
											value={currentBudget.start_date}
											onChange={(e) =>
												setCurrentBudget({
													...currentBudget,
													start_date: e.target.value,
												})
											}
										/>
									</div>

									{/* End Date */}
									<div className="flex-1">
										<label className="block text-sm font-semibold mb-1">
											End Date
										</label>
										<input
											type="date"
											className="w-full p-2 border rounded"
											value={currentBudget.end_date}
											onChange={(e) =>
												setCurrentBudget({
													...currentBudget,
													end_date: e.target.value,
												})
											}
										/>
									</div>
								</div>

								{/* Buttons */}
								<div className="flex justify-end gap-2">
									<button
										type="button"
										className="px-4 py-2 font-bold text-forest-green bg-gray-200 rounded hover:bg-gray-300"
										onClick={() => setIsModalOpen(false)}
									>
										Cancel
									</button>
									<button
										type="submit"
										className="px-4 py-2 font-bold text-forest-green bg-bright-green rounded hover:bg-bright-green-hover"
									>
										{currentBudget.id ? "Update Budget" : "Add Budget"}
									</button>
								</div>
							</form>
						</div>
					</div>
				)}

				{/* Confirmation Modal for Delete */}
				{isConfirmModalOpen && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-[0.1] backdrop-blur-lg">
						<div className="bg-white rounded-lg shadow-lg w-1/3 p-8">
							<h2 className="text-xl font-bold text-center text-forest-green">
								Confirm Delete
							</h2>
							<p className="text-center text-forest-green mt-4">
								Are you sure you want to delete this budget? This action cannot
								be undone.
							</p>
							<div className="flex justify-center gap-4 mt-8">
								<button
									type="button"
									className="px-4 py-2 font-bold text-forest-green bg-gray-200 rounded hover:bg-gray-300"
									onClick={() => setIsConfirmModalOpen(false)} // Close the modal
								>
									Cancel
								</button>
								<button
									type="button"
									className="px-4 py-2 font-bold text-forest-green bg-bright-green rounded hover:bg-bright-green-hover"
									onClick={handleDeleteBudget} // Call delete function
								>
									Delete Budget
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Transaction Modal */}
				{isTransactionModalOpen && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-[0.1] backdrop-blur-lg">
						<div className="bg-white rounded-lg shadow-lg w-1/3 p-8">
							<h2 className="text-xl font-bold text-center">
								Add New Transaction
							</h2>
							<p className="text-forest-green text-center">
								Enter the details of your transaction below.
							</p>
							<br />
							<hr />
							<br />
							<form
								onSubmit={(e) => {
									e.preventDefault();
									handleSaveTransaction();
								}}
							>
								{/* Type and Amount */}
								<div className="mb-4 grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-semibold mb-1">
											Type
										</label>
										<select
											name="type"
											value={transaction.type}
											onChange={(e) =>
												setTransaction((prev) => ({
													...prev,
													type: e.target.value,
												}))
											}
											className="w-full p-2 border rounded appearance-none"
										>
											<option value="Expense">Expense</option>
											<option value="Income">Savings</option>
										</select>
									</div>
									<div>
										<label className="block text-sm font-semibold mb-1">
											Amount
										</label>
										<input
											type="number"
											name="amount"
											value={transaction.amount}
											onChange={(e) =>
												setTransaction((prev) => ({
													...prev,
													amount: e.target.value,
												}))
											}
											className="w-full p-2 border rounded"
											placeholder="Enter amount"
										/>
									</div>
								</div>

								{/* Category */}
								<div className="mb-4">
									<label className="block text-sm font-semibold mb-1">
										Category
									</label>
									<input
										type="text"
										name="category"
										value={transaction.category}
										onChange={(e) =>
											setTransaction((prev) => ({
												...prev,
												category: e.target.value,
											}))
										}
										className="w-full p-2 border rounded"
										placeholder="Enter category"
									/>
								</div>

								{/* Description */}
								<div className="mb-4">
									<label className="block text-sm font-semibold mb-1">
										Description
									</label>
									<textarea
										name="description"
										value={transaction.description}
										onChange={(e) =>
											setTransaction((prev) => ({
												...prev,
												description: e.target.value,
											}))
										}
										className="w-full p-2 border rounded"
										placeholder="Enter description"
									/>
								</div>

								{/* Date */}
								<div className="mb-4">
									<label className="block text-sm font-semibold mb-1">
										Date
									</label>
									<input
										type="date"
										name="date"
										value={transaction.date}
										onChange={(e) =>
											setTransaction((prev) => ({
												...prev,
												date: e.target.value,
											}))
										}
										className="w-full p-2 border rounded"
									/>
								</div>

								{/* Buttons */}
								<div className="flex justify-end gap-2">
									<button
										type="button"
										className="btn btn-primary font-bold text-forest-green bg-gray-200  hover:bg-gray-300"
										onClick={() => setIsTransactionModalOpen(false)}
									>
										Cancel
									</button>
									<button
										type="submit"
										className="btn btn-primary font-bold text-forest-green bg-bright-green hover:bg-bright-green-hover"
									>
										Add Transaction
									</button>
								</div>
							</form>
						</div>
					</div>
				)}
			</div>
		</>
	);
}
