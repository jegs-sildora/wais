import { useState, useEffect } from "react";
import HomeNavSideBar from "../components/HomeNavSideBar";
import { toast } from "sonner";

export default function Home() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [deleteTransactionId, setDeleteTransactionId] = useState(null);
	const [transactions, setTransactions] = useState([]);
	const [transaction, setTransaction] = useState({
		type: "Expense",
		amount: "",
		category: "",
		description: "",
		date: new Date().toISOString().split("T")[0],
	});
	const [loading, setLoading] = useState(false);
	const [editingTransactionId, setEditingTransactionId] = useState(null); // State to track editing
	const [currentUser, setCurrentUser] = useState(null); // State to store the logged-in user
	const [financialSummary, setFinancialSummary] = useState({
		currentBalance: 0,
		totalIncome: 0,
		totalExpenses: 0,
	}); // State to store the financial summary

	// Fetch the logged-in user's details
	const fetchCurrentUser = async () => {
		try {
			const response = await fetch("http://localhost:3000/currentuser", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include", // Include cookies for session management
			});

			const data = await response.json();
			console.log("Current user response:", data);

			if (response.ok) {
				setCurrentUser(data); // Set the logged-in user's details
			} else {
				toast.error(
					data.error || "Failed to fetch user details. Please log in again.",
				);
			}
		} catch (err) {
			console.error("Error fetching user details:", err);
			toast.error("An error occurred while fetching user details.");
		}
	};

	useEffect(() => {
		fetchCurrentUser();
	}, []);

	// Fetch transactions from the database
	useEffect(() => {
		if (!currentUser) return; // Wait until the user is fetched

		const fetchTransactions = async () => {
			try {
				const response = await fetch(
					`http://localhost:3000/transactions/${currentUser.id}`,
				);
				const data = await response.json();
				if (response.ok) {
					setTransactions(data);
				} else {
					toast.error("Failed to fetch transactions.");
				}
			} catch (err) {
				console.error("Error fetching transactions:", err);
				toast.error("An error occurred while fetching transactions.");
			}
		};

		fetchTransactions();
	}, [currentUser]);

	// Fetch financial summary from the database
	const fetchFinancialSummary = async () => {
		try {
			const response = await fetch("http://localhost:3000/financial-summary", {
				method: "GET",
				credentials: "include",
			});
			const data = await response.json();

			if (response.ok) {
				setFinancialSummary({
					currentBalance: parseFloat(data.currentBalance) || 0,
					totalIncome: parseFloat(data.totalIncome) || 0,
					totalExpenses: parseFloat(data.totalExpenses) || 0,
				});
			} else {
				toast.error(data.error || "Failed to fetch financial summary.");
			}
		} catch (err) {
			console.error("Error fetching financial summary:", err);
			toast.error("An error occurred while fetching financial summary.");
		}
	};

	// Expose fetchFinancialSummary to the global window object
	useEffect(() => {
		window.fetchFinancialSummary = fetchFinancialSummary;
	}, []);

	// Fetch financial summary when the user is loaded
	useEffect(() => {
		if (currentUser && currentUser.id) {
			fetchFinancialSummary();
		}
	}, [currentUser]);

	// Handle input changes
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setTransaction((prev) => ({ ...prev, [name]: value }));
	};

	// Function to update the budget for a specific category
	const updateBudget = async (category, amount, type) => {
		try {
			// Ensure the adjustment is a valid number
			const adjustment =
				type === "Income" ? parseFloat(amount) : -parseFloat(amount);

			// Send a request to the backend to update the budget
			const response = await fetch(`http://localhost:3000/budgets/update`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include", // Include cookies for session management
				body: JSON.stringify({ category, adjustment }), // Ensure correct data format
			});

			if (!response.ok) {
				const errorData = await response.json();
				toast.error(errorData.error || "Failed to update budget.");
			}
		} catch (err) {
			console.error("Error updating budget:", err);
			toast.error("An error occurred while updating the budget.");
		}
	};

	// Handle form submission (Add or Edit)
	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		if (!currentUser) {
			toast.error("User not logged in. Please log in again.");
			setLoading(false);
			return;
		}

		// Validate fields
		if (
			!transaction.type ||
			!transaction.amount ||
			!transaction.category ||
			!transaction.date
		) {
			toast.error("Please fill in all fields!");
			setLoading(false);
			return;
		}

		try {
			let response;
			if (editingTransactionId) {
				// Edit transaction
				response = await fetch(
					`http://localhost:3000/transactions/${editingTransactionId}`,
					{
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(transaction),
					},
				);
			} else {
				// Add new transaction
				response = await fetch("http://localhost:3000/transactions", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
					body: JSON.stringify(transaction),
				});
			}

			const data = await response.json();

			if (response.ok) {
				toast.success(
					editingTransactionId
						? "Transaction updated successfully!"
						: "Transaction added successfully!",
				);

				setIsModalOpen(false);
				setTransaction({
					type: "Expense",
					amount: "",
					category: "",
					description: "",
					date: new Date().toISOString().split("T")[0],
				});
				setEditingTransactionId(null);

				// Refresh transactions
				const updatedTransactions = await fetch(
					`http://localhost:3000/transactions/${currentUser.id}`,
				);
				setTransactions(await updatedTransactions.json());

				// Refresh financial summary
				await fetchFinancialSummary(); // Ensure this is awaited
			} else {
				toast.error(
					data.error || "Failed to save transaction. Please try again.",
				);
			}
		} catch (err) {
			console.error("Failed to save transaction", err);
			toast.error("An error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	// Handle Edit button click
	const handleEdit = (transaction) => {
		// Adjust the date to account for the timezone offset
		const localDate = new Date(transaction.date);
		localDate.setMinutes(
			localDate.getMinutes() - localDate.getTimezoneOffset(),
		);

		// Format the date to YYYY-MM-DD for the date input
		const formattedDate = localDate.toISOString().split("T")[0];

		// Set the transaction state with the formatted date
		setTransaction({
			...transaction,
			date: formattedDate, // Ensure the date is in YYYY-MM-DD format
		});

		setEditingTransactionId(transaction.id);
		setIsModalOpen(true);
	};

	// Handle Delete button click
	const handleDelete = async (id) => {
		if (!id) return;

		try {
			const response = await fetch(`http://localhost:3000/transactions/${id}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ user_id: currentUser.id }),
			});

			if (response.ok) {
				toast.success("Transaction deleted successfully!");
				// Refresh transactions
				const updatedTransactions = await fetch(
					`http://localhost:3000/transactions/${currentUser.id}`,
				);
				setTransactions(await updatedTransactions.json());
				// Refresh financial summary
				fetchFinancialSummary();
			} else {
				toast.error("Failed to delete transaction. Please try again.");
			}
		} catch (err) {
			console.error("Failed to delete transaction", err);
			toast.error("An error occurred. Please try again.");
		} finally {
			setIsDeleteModalOpen(false); // Close the modal after deletion
		}
	};

	const confirmDelete = (id) => {
		setDeleteTransactionId(id);
		setIsDeleteModalOpen(true);
	};

	return (
		<>
			<HomeNavSideBar />
			<h1 className="ml-10 mt-5 text-3xl font-bold text-forest-green font-secondary">
				DASHBOARD
			</h1>
			<div className="p-6">
				{/* Financial Summary Cards */}
				<div className="flex justify-center">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-10/12">
						{/* Current Balance Card */}
						<div className="bg-white shadow-lg rounded-lg p-6 text-center">
								<h3 className="text-lg font-bold text-forest-green">Current Balance</h3>
								<p
										className={`text-2xl font-black mt-2 ${
												financialSummary.currentBalance < 0 ? "text-red-500" : "text-forest-green"
										}`}
								>
										₱ {financialSummary.currentBalance.toFixed(2)}
								</p>
								<p className="text-sm text-gray-500 mt-1">Your current financial balance</p>
						</div>

						{/* Total Income Card */}
						<div className="bg-white shadow-lg rounded-lg p-6 text-center">
							<h3 className="text-lg font-bold text-forest-green">
								Total Inflows
							</h3>
							<p className="text-2xl font-black text-forest-green mt-2">
								₱ {financialSummary.totalIncome.toFixed(2)}
							</p>
							<p className="text-sm text-gray-500 mt-1">
								Total money coming in
							</p>
						</div>

						{/* Total Expenses Card */}
						<div className="bg-white shadow-lg rounded-lg p-6 text-center">
							<h3 className="text-lg font-bold text-forest-green">
								Total Outflows
							</h3>
							<p className="text-2xl font-black text-red-500 mt-2">
								₱ {financialSummary.totalExpenses.toFixed(2)}
							</p>
							<p className="text-sm text-gray-500 mt-1">
								Total money going out
							</p>
						</div>
					</div>
				</div>

				{/* Modal */}
				{isModalOpen && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-[0.1] backdrop-blur-lg">
						<div className="bg-white rounded-lg shadow-lg w-1/3 p-8">
							<h2 className="text-xl font-bold text-center">
								{editingTransactionId
									? "Edit Transaction"
									: "Add New Transaction"}
							</h2>
							<p className="text-forest-green text-center">
								Enter the details of your transaction below.
							</p>
							<br />
							<hr />
							<br />
							<form onSubmit={handleSubmit}>
								{/* Type and Amount */}
								<div className="mb-4 grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-semibold mb-1">
											Type
										</label>
										<select
											name="type"
											value={transaction.type}
											onChange={handleInputChange}
											className="w-full p-2 border rounded appearance-none"
										>
											<option value="Expense">Money Out</option>
											<option value="Income">Money In</option>
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
											onChange={handleInputChange}
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
										onChange={handleInputChange}
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
										onChange={handleInputChange}
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
										value={transaction.date} // This will now be in YYYY-MM-DD format
										onChange={handleInputChange}
										className="w-full p-2 border rounded"
									/>
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
										disabled={loading}
									>
										{loading
											? "Saving..."
											: editingTransactionId
												? "Update Transaction"
												: "Add Transaction"}
									</button>
								</div>
							</form>
						</div>
					</div>
				)}

				{/* Delete Modal */}
				{isDeleteModalOpen && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-[0.1] backdrop-blur-lg">
						<div className="bg-white rounded-lg shadow-lg w-1/3 p-8">
							<h2 className="text-xl font-bold text-center text-forest-green">
								Confirm Delete
							</h2>
							<p className="text-center text-forest-green mt-4">
								Are you sure you want to delete this transaction? This action
								cannot be undone.
							</p>
							<div className="flex justify-center gap-4 mt-8">
								<button
									type="button"
									className="px-4 py-2 font-bold text-forest-green bg-gray-200 rounded hover:bg-gray-300"
									onClick={() => setIsDeleteModalOpen(false)} // Close the modal
								>
									Cancel
								</button>
								<button
									type="button"
									className="px-4 py-2 font-bold text-forest-green bg-bright-green rounded hover:bg-bright-green-hover"
									onClick={() => handleDelete(deleteTransactionId)} // Call delete function
								>
									Delete Transaction
								</button>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Add Transaction Button */}
			<div className="fixed bottom-8 right-8">
				<button
					className="btn btn-primary px-4 py-2 font-extrabold text-forest-green bg-bright-green hover:bg-bright-green-hover shadow-lg rounded-full"
					onClick={() => {
						setTransaction({
							type: "Expense",
							amount: "",
							category: "",
							description: "",
							date: new Date().toISOString().split("T")[0],
						});
						setEditingTransactionId(null);
						setIsModalOpen(true);
					}}
				>
					Add Transaction
				</button>
			</div>

			{/* Transactions Table */}
			<div className="overflow-x-auto pl-10 pr-10">
				{transactions.length > 0 ? (
					<table className="table table-zebra w-full">
						<thead>
							<tr>
								<th className="text-center">#</th>
								<th className="text-center">Type</th>
								<th className="text-center">Amount</th>
								<th className="text-center">Category</th>
								<th className="text-center">Description</th>
								<th className="text-center">Date</th>
								<th className="text-center">Actions</th>
							</tr>
						</thead>
						<tbody>
							{transactions.map((transaction, index) => (
								<tr key={transaction.id}>
									<th className="text-center">{index + 1}</th>
									<td className="text-center">{transaction.type}</td>
									<td className="text-center">{transaction.amount}</td>
									<td className="text-center">{transaction.category}</td>
									<td className="text-center">{transaction.description}</td>
									<td className="text-center">
										{/* Format the date to MM-DD-YYYY */}
										{new Date(transaction.date).toLocaleDateString("en-US", {
											month: "2-digit",
											day: "2-digit",
											year: "numeric",
										})}
									</td>
									<td className="text-center">
										<button
											className="btn btn-sm btn-primary"
											onClick={() => handleEdit(transaction)}
										>
											Edit
										</button>
										<button
											className="btn btn-sm btn-error ml-2"
											onClick={() => confirmDelete(transaction.id)}
										>
											Delete
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				) : (
					<div className="text-center text-gray-500 mt-6">
						<p></p>
					</div>
				)}
			</div>
		</>
	);
}
