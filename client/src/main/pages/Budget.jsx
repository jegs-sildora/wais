import { useState, useEffect } from "react";
import HomeNavSideBar from "../components/HomeSideBar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Budget() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [budgetFor, setBudgetFor] = useState("");
	const [allocatedAmount, setAllocatedAmount] = useState(null);
	const [remainingBalance, setRemainingBalance] = useState();
	const [startDate, setStartDate] = useState(new Date());
	const [endDate, setEndDate] = useState("");
	const [description, setDescription] = useState("");

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

	const toggleModal = () => {
		setIsModalOpen(!isModalOpen);
	};

	const resetForm = () => {
		setBudgetFor("");
		setAllocatedAmount("");
		setStartDate(new Date());
		setEndDate("");
		setDescription("");
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (allocatedAmount > remainingBalance) {
			toast.error("Allocated amount exceeds your remaining balance!");
			return;
		}

		try {
			await axios.post(
				"http://localhost:3000/budget",
				{
					budgetFor,
					allocatedAmount: parseFloat(allocatedAmount),
					startDate,
					endDate,
					description,
				},
				{ withCredentials: true },
			);

			toast.success("Budget saved successfully!");
			resetForm();
			toggleModal();
		} catch (err) {
			console.error("Error saving budget:", err);
			toast.error("Failed to save budget. Please try again.");
		}
	};

	return (
		<>
			<div className="bg-base-100">
				<HomeNavSideBar />
				<h1 className="font-secondary text-3xl pt-6 px-12">BUDGET</h1>
			</div>

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
		</>
	);
}
