import { useState, useEffect } from "react";
import HomeNavSideBar from "../components/HomeSideBar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { toast } from "react-toastify"; // Import react-toastify
import "react-toastify/dist/ReactToastify.css"; // Import react-toastify styles
import BudgetCard from "../components/BudgetCard";

export default function Budget() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [budgetFor, setBudgetFor] = useState("");
	const [allocatedAmount, setAllocatedAmount] = useState("");
	const [remainingBalance, setRemainingBalance] = useState();
	const [startDate, setStartDate] = useState(new Date());
	const [endDate, setEndDate] = useState("");
	const [description, setDescription] = useState("");
	const [budgets, setBudgets] = useState([]);

	useEffect(() => {
		const fetchRemainingBalance = async () => {
			try {
				const res = await axios.get("http://localhost:3000/budget/income", {
					withCredentials: true,
				});
				const { remainingBalance } = res.data;
				setRemainingBalance(remainingBalance);
				setAllocatedAmount(""); // Default to blank
			} catch (err) {
				console.error("Failed to fetch balance:", err);
			}
		};

		fetchRemainingBalance();
	}, []);

	useEffect(() => {
		const fetchBudgets = async () => {
			try {
				const response = await axios.get("http://localhost:3000/budget", {
					withCredentials: true,
				});
				if (response.status === 200) {
					setBudgets(response.data); // Update the budgets state with the fetched data
				} else {
					console.error("Failed to fetch budgets:", response.statusText);
				}
			} catch (error) {
				console.error("Error fetching budgets:", error);
			}
		};

		fetchBudgets(); // Fetch budgets when the component mounts
	}, []);

	const toggleModal = () => {
		setIsModalOpen(!isModalOpen);
	};

	const resetForm = () => {
		setBudgetFor("");
		setAllocatedAmount("");
		setStartDate(new Date());
		setEndDate(null);
		setDescription("");
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (allocatedAmount > remainingBalance) {
			console.log("Allocated amount exceeds remaining balance"); // Debugging
			toast.error("Allocated amount exceeds your remaining balance!");
			return;
		}

		try {
			// Send the new budget to the server
			const response = await fetch("http://localhost:3000/budget", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					budgetFor,
					allocatedAmount,
					startDate,
					endDate,
					description,
				}),
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Failed to add budget");
			}

			const newBudget = await response.json();

			// Update the budgets state to include the new budget
			setBudgets((prevBudgets) => [...prevBudgets, newBudget]);

			// Reset the form and close the modal
			resetForm();
			toggleModal();

			console.log("Budget added successfully"); // Debugging
			toast.success("Budget added successfully!");
		} catch (error) {
			console.error("Error adding budget:", error);

			// Show error toaster
			toast.error("Failed to add budget. Please try again.");
		}
	};

	return (
		<>
			{/* Main Content */}
			<div className="bg-base-100 ml-65 min-h-screen p-6 relative">
				<HomeNavSideBar />
				<h1 className="font-secondary text-3xl pt-6 text-center">BUDGETS</h1>

				{/* Conditional Rendering for No Budgets */}
				{budgets.length === 0 ? (
					<div className="flex flex-col items-center justify-center mt-68">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="100"
							height="100"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="text-gray-500 mb-4"
						>
							<circle
								cx="12"
								cy="12"
								r="10"
							></circle>
							<line
								x1="12"
								y1="16"
								x2="12"
								y2="12"
							></line>
							<line
								x1="12"
								y1="8"
								x2="12"
								y2="8"
							></line>
						</svg>
						<p className="text-lg font-semibold text-gray-500">
							No budgets here yet — start by{" "}
							<span className="font-bold">creating your first one!</span>
						</p>
					</div>
				) : (
					<BudgetCard
						key={budgets.length} // Force re-render when budgets change
						budgets={budgets}
						setBudgets={setBudgets}
					/>
				)}

				{/* Add Budget Button */}
				<button
					onClick={toggleModal}
					className="btn btn-primary fixed bottom-10 right-10 rounded-full text-2xl p-0 w-16 h-16"
				>
					+
				</button>

				{/* Modal */}
				{isModalOpen && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-sm">
						<div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
							<h3 className="text-xl font-black text-forest-green text-center mb-2">
								ADD NEW BUDGET
							</h3>
							<p className="text-sm text-center mb-4 font-bold">
								Enter the details of your budget below.
							</p>
							<hr />
							<form
								className="space-y-4 mt-2"
								onSubmit={handleSubmit}
							>
								<div className="flex space-x-8">
									<div className="flex-1">
										<label className="block text-sm font-bold py-2">
											Budget for
										</label>
										<select
											className="select select-bordered w-full font-extrabold"
											value={budgetFor}
											onChange={(e) => setBudgetFor(e.target.value)}
											required
										>
											<option
												value=""
												disabled
											>
												---
											</option>
											<optgroup label="Budget Categories">
												<option value="Clothing">Clothing</option>
												<option value="Books">Books</option>
												<option value="Entertainment">Entertainment</option>
												<option value="Food">Food</option>
												<option value="Rent">Rent</option>
												<option value="School Supplies">School Supplies</option>
												<option value="Transportation">Transportation</option>
												<option value="Utilities">Utilities</option>
											</optgroup>
										</select>
									</div>

									<div className="flex-1">
										<label className="block text-sm font-bold py-2">
											Allocated Amount (₱)
										</label>
										<input
											type="number"
											className={`input input-bordered w-full font-extrabold ${
												allocatedAmount > remainingBalance
													? "border-red-500 outline-2 outline-red-500 text-red-500 focus:outline-red-500 "
													: ""
											}`}
											placeholder="0.00"
											value={allocatedAmount === null ? "" : allocatedAmount}
											onChange={(e) => {
												const value = e.target.value;
												setAllocatedAmount(value === "" ? "" : Number(value));
											}}
											required
										/>

										<p className="text-xs text-right text-gray-500 mt-1">
											Available: ₱{remainingBalance.toLocaleString()}
										</p>
										{allocatedAmount > remainingBalance}
									</div>
								</div>

								{/* Start and End Date */}
								<div className="flex space-x-4">
									<div className="flex-1">
										<label className="block text-sm font-bold py-2">
											Start Date
										</label>
										<DatePicker
											selected={startDate}
											onChange={(date) => setStartDate(date)}
											className="input input-bordered w-full font-extrabold"
											dateFormat="MM-dd-yyyy"
										/>
									</div>
									<div className="flex-1">
										<label className="block text-sm font-bold py-2">
											End Date
										</label>
										<DatePicker
											placeholderText="mm-dd-yyyy"
											selected={endDate}
											onChange={(date) => setEndDate(date)}
											className="input input-bordered w-full font-extrabold"
											dateFormat="MM-dd-yyyy"
										/>
									</div>
								</div>

								{/* Description */}
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

								{/* Buttons */}
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
										Add Budget
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
