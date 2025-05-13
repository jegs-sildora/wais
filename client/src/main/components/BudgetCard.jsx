import { useEffect, useState, useRef } from "react";
import {
	Book,
	ShoppingBag,
	Film,
	Utensils,
	Home,
	School,
	Bus,
	Zap,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer } from "react-toastify"; // Import react-toastify
import "react-toastify/dist/ReactToastify.css"; // Import react-toastify styles

const BudgetCard = () => {
	const [budgets, setBudgets] = useState([]);
	const [selectedBudget, setSelectedBudget] = useState(null); // For the selected budget
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false); // Delete confirmation modal
	const [isUpdateConfirmOpen, setIsUpdateConfirmOpen] = useState(false); // Update confirmation modal
	const notifiedBudgets = useRef(new Set()); // Persist notifications across renders

	// Map categories to icons
	const categoryIcons = {
		"Clothing": <ShoppingBag className="w-5 h-5 text-white" />,
		"Books": <Book className="w-5 h-5 text-white" />,
		"Entertainment": <Film className="w-5 h-5 text-white" />,
		"Food": <Utensils className="w-5 h-5 text-white" />,
		"Rent": <Home className="w-5 h-5 text-white" />,
		"School Supplies": <School className="w-5 h-5 text-white" />,
		"Transportation": <Bus className="w-5 h-5 text-white" />,
		"Utilities": <Zap className="w-5 h-5 text-white" />,
	};

	useEffect(() => {
		const fetchBudgets = async () => {
			try {
				const response = await fetch("http://localhost:3000/budget", {
					credentials: "include",
				});
				if (!response.ok) {
					throw new Error("Failed to fetch budgets");
				}
				const data = await response.json();

				// Recalculate daily budgets dynamically
				const updatedBudgets = data.map((budget) => {
					const today = new Date();
					const endDate = new Date(budget.end_date);
					const remainingDays = Math.max(
						Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)),
						1, // Ensure at least 1 day to avoid division by zero
					);
					const remainingBudget = budget.limit - budget.spent;
					const newDailyBudget = remainingBudget / remainingDays;

					// Check if the user has overspent
					if (
						budget.spent > newDailyBudget &&
						!notifiedBudgets.current.has(budget.id)
					) {
						toast.warn(
							`Warning: You have exceeded your daily budget for ${budget.category}!`,
						);
						notifiedBudgets.current.add(budget.id); // Mark this budget as notified
					}

					return {
						...budget,
						daily_budget: newDailyBudget, // Update the daily budget dynamically
					};
				});

				// Reset notifications for budgets that are no longer exceeding
				notifiedBudgets.current.forEach((id) => {
					if (
						!updatedBudgets.some(
							(budget) =>
								budget.id === id && budget.spent > budget.daily_budget,
						)
					) {
						notifiedBudgets.current.delete(id);
					}
				});

				setBudgets(updatedBudgets);
			} catch (error) {
				console.error("Error fetching budgets:", error);
			}
		};

		fetchBudgets();
	}, []); // Only run on mount

	// Toggle the main modal
	const toggleModal = (budget = null) => {
		if (budget) {
			setSelectedBudget(budget);
		} else {
			// Set default values for a new budget
			setSelectedBudget({
				category: "",
				limit: 0,
				start_date: new Date(), // Default to today's date
				end_date: new Date(), // Default to today's date
				description: "",
			});
		}
		setIsModalOpen(!isModalOpen);
	};

	// Toggle delete confirmation modal
	const toggleDeleteConfirm = () => {
		setIsDeleteConfirmOpen(!isDeleteConfirmOpen);
	};

	// Toggle update confirmation modal
	const toggleUpdateConfirm = () => {
		setIsUpdateConfirmOpen(!isUpdateConfirmOpen);
	};

	// Handle delete action
	const handleDelete = async () => {
		try {
			await fetch(`http://localhost:3000/budget/${selectedBudget.id}`, {
				method: "DELETE",
				credentials: "include",
			});
			setIsModalOpen(false);
			setIsDeleteConfirmOpen(false); // Close confirmation modal

			// Refresh budgets
			const response = await fetch("http://localhost:3000/budget", {
				credentials: "include",
			});
			const data = await response.json();
			setBudgets(data);

			// Show success toast
			toast.success("Budget deleted successfully!");
		} catch (error) {
			console.error("Error deleting budget:", error);
			toast.error("Failed to delete budget. Please try again.");
		}
	};

	// Handle update action
	const handleUpdate = async (e) => {
		e.preventDefault();

		// Ensure selectedBudget is valid
		if (!selectedBudget || !selectedBudget.id) {
			console.error("No budget selected or missing ID");
			return;
		}

		// Prepare the data to send
		const updatedBudget = {
			budgetFor: selectedBudget.category, // Match backend field name
			allocatedAmount: selectedBudget.limit, // Match backend field name
			startDate: selectedBudget.start_date,
			endDate: selectedBudget.end_date,
			description: selectedBudget.description || "", // Optional field
		};

		console.log("Updating budget with data:", updatedBudget); // Debugging log

		try {
			const response = await fetch(
				`http://localhost:3000/budget/${selectedBudget.id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(updatedBudget),
					credentials: "include",
				},
			);

			if (!response.ok) {
				const errorText = await response.text();
				console.error(`Error response: ${response.status} - ${errorText}`);
				throw new Error(`Failed to update budget: ${errorText}`);
			}

			console.log("Budget updated successfully"); // Debugging log
			setIsModalOpen(false);
			setIsUpdateConfirmOpen(false); // Close confirmation modal

			// Refresh budgets
			const refreshedResponse = await fetch("http://localhost:3000/budget", {
				credentials: "include",
			});
			const data = await refreshedResponse.json();
			setBudgets(data);

			// Show success toast
			toast.success("Budget updated successfully!");
		} catch (error) {
			console.error("Error updating budget:", error);
			toast.error("Failed to update budget. Please try again.");
		}
	};

	return (
		<div>
			{/* Toast Container */}
			<ToastContainer />

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-12 mt-6">
				{budgets.map((budget, index) => {
					const { category, spent, limit, daily_budget, start_date, end_date } =
						budget;
					const remaining = limit - spent;
					const percentage = Math.min((spent / limit) * 100, 100).toFixed(1);

					// Format start_date and end_date as "Month Day, Year"
					const formattedStartDate = new Date(start_date).toLocaleDateString(
						"en-US",
						{
							year: "numeric",
							month: "long",
							day: "numeric",
							timeZone: "Asia/Manila",
						},
					);
					const formattedEndDate = new Date(end_date).toLocaleDateString(
						"en-US",
						{
							year: "numeric",
							month: "long",
							day: "numeric",
							timeZone: "Asia/Manila",
						},
					);

					return (
						<div
							key={index}
							className="bg-white rounded-xl p-4 shadow-md cursor-pointer"
							onClick={() => toggleModal(budget)}
						>
							{/* Header */}
							<div className="flex justify-between items-center mb-2">
								<div className="flex items-center gap-2">
									<div className="bg-neutral rounded-full p-2">
										{categoryIcons[category] || (
											<Book className="w-5 h-5 text-white" />
										)}
									</div>
									<span className="font-black text-base-content uppercase">
										{category}
									</span>
								</div>
								<div className="text-forest-green font-black">
									₱{remaining.toLocaleString()}
								</div>
							</div>

							{/* Progress Info */}
							<div className="text-sm text-forest-green mb-1">
								Spent ₱{spent.toLocaleString()} of ₱{limit.toLocaleString()} (₱
								{daily_budget.toFixed(2).toLocaleString()}/day)
							</div>

							{/* Progress Bar */}
							<div className="relative w-full h-3 bg-neutral rounded-full overflow-hidden mb-1 ">
								<div
									className="h-full bg-lime-500"
									style={{ width: `${percentage}%` }}
								></div>
							</div>

							{/* Bottom Labels */}
							<div className="flex justify-between text-xs text-forest-green opacity-70 ">
								<span>{percentage}%</span>
								<span>
									{formattedStartDate} - {formattedEndDate}
								</span>
							</div>
						</div>
					);
				})}
			</div>

			{/* Modal */}
			{isModalOpen && selectedBudget && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-sm">
					<div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
						<h3 className="text-xl font-black text-forest-green text-center mb-2">
							Edit Budget
						</h3>
						<form
							className="space-y-4 mt-2"
							onSubmit={(e) => {
								e.preventDefault();
								toggleUpdateConfirm(); // Show update confirmation modal
							}}
						>
							<div className="flex space-x-8">
								<div className="flex-1">
									<label className="block text-sm font-bold py-2">
										Budget for
									</label>
									<select
										className="select select-bordered w-full font-extrabold"
										value={selectedBudget.category}
										onChange={(e) =>
											setSelectedBudget({
												...selectedBudget,
												category: e.target.value,
											})
										}
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
										className="input input-bordered w-full font-extrabold"
										value={selectedBudget.limit}
										onChange={(e) =>
											setSelectedBudget({
												...selectedBudget,
												limit: Number(e.target.value),
											})
										}
										required
									/>
								</div>
							</div>

							{/* Start and End Date */}
							<div className="flex space-x-4">
								<div className="flex-1">
									<label className="block text-sm font-bold py-2">
										Start Date
									</label>
									<DatePicker
										selected={new Date(selectedBudget.start_date)}
										onChange={(date) =>
											setSelectedBudget({ ...selectedBudget, start_date: date })
										}
										className="input input-bordered w-full font-extrabold"
										dateFormat="MM-dd-yyyy"
									/>
								</div>
								<div className="flex-1">
									<label className="block text-sm font-bold py-2">
										End Date
									</label>
									<DatePicker
										selected={new Date(selectedBudget.end_date)}
										onChange={(date) =>
											setSelectedBudget({ ...selectedBudget, end_date: date })
										}
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
									value={selectedBudget.description}
									onChange={(e) =>
										setSelectedBudget({
											...selectedBudget,
											description: e.target.value,
										})
									}
								></textarea>
							</div>

							{/* Buttons */}
							<div className="flex justify-end gap-2 mt-6">
								<button
									type="button"
									className="btn uppercase font-extrabold"
									onClick={() => toggleModal()}
								>
									Cancel
								</button>
								<button
									type="button"
									className="btn btn-error uppercase font-extrabold"
									onClick={toggleDeleteConfirm} // Show delete confirmation modal
								>
									Delete
								</button>
								<button
									type="submit"
									className="btn btn-primary uppercase font-extrabold"
								>
									Save Changes
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{isDeleteConfirmOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-sm">
					<div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
						<h3 className="text-lg font-bold text-center mb-4">
							Are you sure you want to delete this budget?
						</h3>
						<div className="flex justify-center gap-4">
							<button
								className="btn"
								onClick={toggleDeleteConfirm}
							>
								Cancel
							</button>
							<button
								className="btn btn-error"
								onClick={handleDelete}
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Update Confirmation Modal */}
			{isUpdateConfirmOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-sm">
					<div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
						<h3 className="text-lg font-bold text-center mb-4">
							Are you sure you want to save these changes?
						</h3>
						<div className="flex justify-center gap-4">
							<button
								className="btn"
								onClick={toggleUpdateConfirm}
							>
								Cancel
							</button>
							<button
								className="btn btn-primary"
								onClick={handleUpdate}
							>
								Save
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default BudgetCard;
