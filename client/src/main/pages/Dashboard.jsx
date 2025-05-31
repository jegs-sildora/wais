import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState, useEffect } from "react";
import axios from "axios";
import HomeSideBar from "../components/HomeSideBar";
import { Banknote, ArrowDown, ArrowUp } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Dashboard = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [type, setType] = useState("Money In");
	const [amount, setAmount] = useState(null);
	const [category, setCategory] = useState("");
	const [description, setDescription] = useState("");
	const [date, setDate] = useState(new Date());
	const [transactions, setTransactions] = useState([]); // State to store fetched transactions
	const [editTransaction, setEditTransaction] = useState(null); // State for the transaction being edited
	const [dailyBudgets, setDailyBudgets] = useState([]); // State to store daily budgets
	const notifiedCategories = new Set(); // Track categories that have triggered notifications

	const toggleModal = () => setIsModalOpen(!isModalOpen);

	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [transactionToDelete, setTransactionToDelete] = useState(null);

	// Fetch transactions and budgets when the component mounts
	useEffect(() => {
		const fetchTransactionsAndBudgets = async () => {
			try {
				// Fetch transactions
				const transactionsResponse = await axios.get(
					"http://localhost:3000/transactions",
					{ withCredentials: true },
				);
				setTransactions(transactionsResponse.data);

				// Fetch budgets
				const budgetsResponse = await axios.get(
					"http://localhost:3000/budget",
					{
						withCredentials: true,
					},
				);
				setDailyBudgets(budgetsResponse.data);

				// Check for over-limit expenses
				checkOverLimitExpenses(transactionsResponse.data, budgetsResponse.data);
			} catch (err) {
				console.error("Failed to fetch data:", err);
				toast.error("Failed to load data.");
			}
		};

		fetchTransactionsAndBudgets();
	}, []);

	// Check if any category exceeds its daily budget
	const checkOverLimitExpenses = (transactions, budgets) => {
		// Calculate total expenses per category
		const categoryExpenses = transactions.reduce((acc, transaction) => {
			if (transaction.type === "Expense") {
				acc[transaction.category] =
					(acc[transaction.category] || 0) + transaction.amount;
			}
			return acc;
		}, {});

		// Compare with daily budgets
		budgets.forEach((budget) => {
			if (
				categoryExpenses[budget.category] > budget.daily_budget &&
				!notifiedCategories.has(budget.category)
			) {
				toast.warn(
					`Warning: You have exceeded your daily budget for ${budget.category}!`,
				);
				notifiedCategories.add(budget.category); // Mark this category as notified
			}
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Format the date to Asia/Manila timezone
		const options = {
			timeZone: "Asia/Manila",
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		};
		const formattedDate = new Intl.DateTimeFormat("en-CA", options).format(
			date,
		);

		try {
			if (editTransaction) {
				// Update existing transaction
				await axios.put(
					`http://localhost:3000/transactions/${editTransaction.transaction_id}`,
					{ type, amount, category, description, date: formattedDate },
					{ withCredentials: true },
				);
				toast.success("Transaction successfully updated!");
			} else {
				// Create new transaction
				await axios.post(
					"http://localhost:3000/transactions",
					{ type, amount, category, description, date: formattedDate },
					{ withCredentials: true },
				);
				toast.success("Transaction successfully added!");
			}

			// Reset form fields
			setType("Money In");
			setAmount("");
			setCategory("");
			setDescription("");
			setDate(new Date());
			setEditTransaction(null);

			// Refetch transactions and budgets
			const transactionsResponse = await axios.get(
				"http://localhost:3000/transactions",
				{ withCredentials: true },
			);
			setTransactions(transactionsResponse.data);

			const budgetsResponse = await axios.get("http://localhost:3000/budget", {
				withCredentials: true,
			});
			setDailyBudgets(budgetsResponse.data);

			// Refetch summary data
			const summaryResponse = await axios.get(
				"http://localhost:3000/transactions/summary",
				{ withCredentials: true },
			);
			setSummary(summaryResponse.data);

			// Recheck for over-limit expenses
			checkOverLimitExpenses(transactionsResponse.data, budgetsResponse.data);

			toggleModal();
		} catch (err) {
			console.error("Failed to save transaction:", err);
			toast.error("Failed to save transaction.");
		}
	};

	// Edit transaction (populate form with existing transaction)
	const handleEdit = (transaction) => {
		setEditTransaction(transaction);
		setType(transaction.type);
		setAmount(transaction.amount);
		setCategory(transaction.category);
		setDescription(transaction.description);
		setDate(new Date(transaction.date));
		toggleModal();
	};

	// Delete transaction
	const handleDelete = async () => {
		try {
			await axios.delete(
				`http://localhost:3000/transactions/${transactionToDelete}`,
				{
					withCredentials: true,
				},
			);
			toast.success("Transaction successfully deleted!");

			// Refetch transactions and summary
			const transactionsResponse = await axios.get(
				"http://localhost:3000/transactions",
				{
					withCredentials: true,
				},
			);
			setTransactions(transactionsResponse.data);

			const summaryResponse = await axios.get(
				"http://localhost:3000/transactions/summary",
				{
					withCredentials: true,
				},
			);
			setSummary(summaryResponse.data);

			setShowDeleteModal(false);
			setTransactionToDelete(null);
		} catch (err) {
			console.error("Failed to delete transaction:", err);
			toast.error("Failed to delete transaction.");
		}
	};

	const [summary, setSummary] = useState({
		totalIncome: 0,
		totalExpense: 0,
		balance: 0,
	});

	useEffect(() => {
		fetch("http://localhost:3000/transactions/summary", {
			credentials: "include",
		})
			.then((res) => {
				if (!res.ok) {
					throw new Error(`Error: ${res.status} ${res.statusText}`);
				}
				return res.json();
			})
			.then((data) => {
				setSummary(data);
			})
			.catch((err) => {
				console.error("Error fetching summary:", err);
				toast.error("Failed to fetch transaction summary.");
			});
	}, []);

	return (
		<>
			<div className="bg-base-100 ml-65 min-h-screen p-6 relative">
				<HomeSideBar />
				<h1 className="font-secondary text-3xl pt-6 text-center">TRANSACTIONS</h1>
				<h1 className="font-secondary text-2xl pt-6 ml-4">Cash Flow</h1>
				<div className="flex justify-center items-center space-x-4 py-5">
					{/* Current Balance Card */}
					<div className="card w-96 shadow-sm bg-white">
						<div className="card-body items-center">
							<h2 className="card-title flex items-center font-extrabold">
								<Banknote className="text-forest-green" />
								CURRENT BALANCE
							</h2>
							<p className="text-2xl font-black">
								₱ {(summary.balance || 0).toFixed(2)}
							</p>
						</div>
					</div>
					{/* Total Income Card */}
					<div className="card w-96 shadow-sm bg-white">
						<div className="card-body items-center">
							<h2 className="card-title flex items-center font-extrabold">
								<ArrowDown className="text-green-500" />
								TOTAL INCOMING FUNDS
							</h2>
							<p className="text-2xl font-black">
								₱ {(summary.totalIncome || 0).toFixed(2)}
							</p>
						</div>
					</div>
					{/* Total Expenses Card */}
					<div className="card w-96 shadow-sm bg-white">
						<div className="card-body items-center">
							<h2 className="card-title flex items-center font-extrabold">
								<ArrowUp className="text-red-500" />
								TOTAL OUTGOING FUNDS
							</h2>
							<p className="text-2xl font-black text-red-500">
								₱ {(summary.totalExpense || 0).toFixed(2)}
							</p>
						</div>
					</div>
				</div>
				{/* Floating Add Button */}
				<button
					className="btn btn-primary fixed bottom-10 right-10 rounded-full text-2xl p-0 w-16 h-16"
					onClick={toggleModal}
				>
					+
				</button>
				{/* Modal */}
				{isModalOpen && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-sm">
						<div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
							<h3 className="text-xl font-black text-forest-green text-center mb-2">
								{editTransaction ? "EDIT TRANSACTION" : "ADD NEW TRANSACTION"}
							</h3>
							<p className="text-sm text-center mb-4 font-bold">
								Enter the details of your transaction below.
							</p>
							<hr></hr>
							<form
								className="space-y-4 mt-2"
								onSubmit={handleSubmit}
							>
								<div className="flex space-x-8">
									<div className="flex-1">
										<label className="block text-sm font-bold py-2">
											Type of Transaction
										</label>
										<select
											className="select select-bordered w-full font-extrabold"
											value={type}
											onChange={(e) => setType(e.target.value)}
											required
										>
											<option value="Money In">Money In</option>
											<option value="Expense">Expense</option>
										</select>
									</div>
									<div className="flex-1">
										<label className="block text-sm font-bold py-2">
											Amount (₱)
										</label>
										<input
											type="number"
											className="input input-bordered w-full  font-extrabold"
											placeholder="0.00"
											value={amount}
											onChange={(e) => setAmount(Number(e.target.value))}
											required
										/>
									</div>
								</div>
								<div className="flex space-x-4">
									<div className="flex-1">
										<label className="block text-sm font-bold py-2">
											Category
										</label>
										<select
											className="select select-bordered w-full font-extrabold"
											value={category}
											onChange={(e) => setCategory(e.target.value)}
											required
										>
											<option value="">Select Category</option>
											{type === "Money In" ? (
												<optgroup label="Incoming Funds">
													<option value="Allowance">Allowance</option>
													<option value="Income">Income</option>
													<option value="Scholarship">Scholarship</option>
												</optgroup>
											) : (
												<optgroup label="Outgoing Funds">
													<option value="Books">Books</option>
													<option value="Entertainment">Entertainment</option>
													<option value="Food">Food</option>
													<option value="Rent">Rent</option>
													<option value="School Supplies">
														School Supplies
													</option>
													<option value="Transportation">Transportation</option>
													<option value="Utilities">Utilities</option>
												</optgroup>
											)}
										</select>
									</div>
									<div className="flex-1">
										<label className="block text-sm font-bold py-2">Date</label>
										<DatePicker
											selected={date}
											onChange={(d) => setDate(d)}
											className="input input-bordered w-full font-extrabold"
											dateFormat="MM-dd-yyyy"
										/>
									</div>
								</div>
								<div>
									<label className="block text-sm font-bold mt-4 py-2">
										Description
									</label>
									<textarea
										className="textarea textarea-bordered w-full font-extrabold"
										rows={3}
										placeholder="Optional..."
										value={description}
										onChange={(e) => setDescription(e.target.value)}
									></textarea>
								</div>
								<div className="flex justify-end gap-2 mt-6">
									<button
										type="button"
										className="btn uppercase font-extrabold"
										onClick={toggleModal}
									>
										Cancel
									</button>
									<button
										type="submit"
										className="btn btn-primary uppercase font-extrabold"
									>
										{editTransaction ? "Update Transaction" : "Add Transaction"}
									</button>
								</div>
							</form>
						</div>
					</div>
				)}
				<ToastContainer />
				{transactions.length > 0 ? (
					<div className="overflow-x-auto rounded-box px-6 py-6 items-center">
					<h1 className="font-secondary text-2xl pb-6 ml-4">Transaction History</h1>
						<table className="table items-center bg-white shadow-md">
							{/* Table Header */}
							<thead className="text-center">
								<tr className="uppercase">
									<th className="py-6">#</th>
									<th className="py-6">Type</th>
									<th className="py-6">Amount</th>
									<th className="py-6">Category</th>
									<th className="py-6">Description</th>
									<th className="py-6">Date</th>
									<th className="py-6">Actions</th>
								</tr>
							</thead>
							<tbody className="text-center">
								{transactions.map((transaction, index) => (
									<tr
										key={transaction.transaction_id}
										className="text-center"
									>
										<th>{index + 1}</th>
										<td>{transaction.type}</td>
										<td>₱ {transaction.amount}</td>
										<td>{transaction.category}</td>
										<td>{transaction.description}</td>
										<td>
											{new Date(transaction.date).toLocaleDateString("en-US", {
												year: "numeric",
												month: "long",
												day: "numeric",
											})}
										</td>
										<td>
											<button
												className="btn btn-md rounded-4xl"
												onClick={() => handleEdit(transaction)}
											>
												Edit
											</button>
											<button
												className="btn btn-error btn-md ml-2 rounded-4xl"
												onClick={() => {
													setTransactionToDelete(transaction.transaction_id);
													setShowDeleteModal(true);
												}}
											>
												Delete
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<div className="text-center mt-10 text-gray-500 font-semibold"></div>
				)}
				{showDeleteModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-sm">
						<div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
							<h3 className="font-bold text-lg text-red-600">CONFIRM DELETE</h3>
							<p className="py-4">
								Are you sure you want to delete this transaction?
							</p>
							<div className="flex justify-center gap-4 mt-4">
								<button
									className="btn font-bold"
									onClick={() => {
										setShowDeleteModal(false);
										setTransactionToDelete(null);
									}}
								>
									Cancel
								</button>
								<button
									className="btn btn-error font-bold"
									onClick={handleDelete}
								>
									Delete
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	);
};

export default Dashboard;
