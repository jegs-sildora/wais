import HomeSideBar from "../components/HomeSideBar";
import GroupExpenseCard from "../components/GroupExpenseCard";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Equal, Percent } from "lucide-react";

export default function GroupExpense() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [activeTab, setActiveTab] = useState("create"); // Tabs: 'create' or 'join'
	const [expenseTitle, setExpenseTitle] = useState("");
	const [amount, setAmount] = useState("");
	const [startDate, setStartDate] = useState(new Date());
	const [endDate, setEndDate] = useState("");
	const [numOfParticipants, setNumOfParticipants] = useState(2);
	const [splitType, setSplitType] = useState("Equal");
	const [yourPercentage, setYourPercentage] = useState("50%");
	const [otherPercentage, setOtherPercentage] = useState("50%");
	const [groupCode, setGroupCode] = useState("");
	const [joinGroupCode, setJoinGroupCode] = useState(""); // Add state for join group code

	// Generate random 6-character code
	const generateGroupCode = () => {
		const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		let result = "";
		for (let i = 0; i < 6; i++) {
			result += characters.charAt(
				Math.floor(Math.random() * characters.length),
			);
		}
		return result;
	};

	const toggleModal = () => {
		setIsModalOpen(!isModalOpen);
		// Generate new group code when modal opens for create tab
		if (!isModalOpen && activeTab === "create") {
			setGroupCode(generateGroupCode());
		}
	};

	const handleCreateGroupExpense = async (e) => {
		e.preventDefault();

		// Add validation to ensure all required fields are filled
		if (
			!expenseTitle ||
			!amount ||
			!startDate ||
			!numOfParticipants ||
			!splitType
		) {
			toast.error("Please fill in all required fields");
			return;
		}

		const groupExpenseData = {
			expenseTitle,
			amount: parseFloat(amount),
			startDate,
			endDate: endDate || null,
			numOfParticipants: parseInt(numOfParticipants),
			splitType,
			yourPercentage,
			otherPercentage,
			groupCode,
		};

		console.log("Sending data:", groupExpenseData); // Debug log

		try {
			const response = await fetch("http://localhost:3000/group-expense", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include", // Add this for session cookies
				body: JSON.stringify(groupExpenseData),
			});

			console.log("Response status:", response.status); // Debug log
			const text = await response.text();
			console.log("Response text:", text); // Debug log

			try {
				const result = JSON.parse(text);

				if (response.ok) {
					toast.success(result.message);
					// Reset form fields
					setExpenseTitle("");
					setAmount("");
					setStartDate(new Date());
					setEndDate("");
					setNumOfParticipants(2);
					setSplitType("Equal");
					setYourPercentage("50%");
					setOtherPercentage("50%");
					toggleModal();

					// Dispatch custom event to notify GroupExpenseCard
					window.dispatchEvent(new CustomEvent("groupExpenseCreated"));

					// Also update localStorage to trigger storage event
					localStorage.setItem("lastExpenseCreated", Date.now().toString());
				} else {
					toast.error(result.error || "Failed to create group expense.");
				}
			} catch (err) {
				console.error("Invalid JSON response:", text);
				toast.error(
					"Server returned invalid response. Check console for details.",
				);
			}
		} catch (err) {
			console.error("Error creating group expense:", err.message);
			toast.error("An unexpected error occurred.");
		}
	};

	const handleJoinGroupExpense = async (e) => {
		e.preventDefault();

		if (!joinGroupCode.trim()) {
			toast.error("Please enter a group code");
			return;
		}

		try {
			const response = await fetch("http://localhost:3000/group-expense/join", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({ groupCode: joinGroupCode }),
			});

			const result = await response.json();

			if (response.ok) {
				toast.success(result.message);
				setJoinGroupCode(""); // Reset the input
				toggleModal();

				// Dispatch custom event to notify GroupExpenseCard
				window.dispatchEvent(new CustomEvent("groupExpenseCreated"));

				// Also update localStorage to trigger storage event
				localStorage.setItem("lastExpenseCreated", Date.now().toString());
			} else {
				toast.error(result.error || "Failed to join group expense");
			}
		} catch (err) {
			console.error("Error joining group expense:", err.message);
			toast.error("An unexpected error occurred");
		}
	};

	// Add useEffect to recalculate percentages when participants or split type changes
	useEffect(() => {
		// Check if numOfParticipants is valid (not empty and greater than 0)
		if (!numOfParticipants || numOfParticipants <= 0) {
			setYourPercentage("0%");
			setOtherPercentage("0%");
			return;
		}

		if (splitType === "Equal") {
			const equalPercentage = (100 / numOfParticipants).toFixed(1);
			setYourPercentage(`${equalPercentage}%`);
			setOtherPercentage(`${equalPercentage}%`);
		} else {
			// For percentage split, recalculate other percentage when participants change
			const yourValue = parseInt(yourPercentage.replace("%", ""), 10);
			const remainingPercentage = 100 - yourValue;
			const otherValue = remainingPercentage / (numOfParticipants - 1);
			setOtherPercentage(`${otherValue.toFixed(2)}%`);
		}
	}, [numOfParticipants, splitType]);

	// Update the participants input change handler
	const handleParticipantsChange = (e) => {
		const value = e.target.value;

		// Allow empty input for better UX
		if (value === "") {
			setNumOfParticipants("");
			return;
		}

		const numValue = parseInt(value, 10);

		// Validate the number is within reasonable bounds
		if (numValue >= 2 && numValue <= 50) {
			setNumOfParticipants(numValue);
		}
	};

	// Update the your percentage change handler
	const handleYourPercentageChange = (e) => {
		const value = parseInt(e.target.value.replace("%", ""), 10);
		setYourPercentage(`${value}%`);

		if (splitType === "Percentage") {
			// Calculate the percentage for other participants
			const remainingPercentage = 100 - value;
			const otherValue = remainingPercentage / (numOfParticipants - 1);
			setOtherPercentage(`${otherValue.toFixed(2)}%`);
		}
	};

	return (
		<>
			<div className="bg-base-100 ml-65 min-h-screen p-6 relative">
				<HomeSideBar />
				<h1 className="font-secondary text-3xl pt-6 text-center">
					GROUP EXPENSE
				</h1>

				{/* Group Expense Cards */}
				<GroupExpenseCard />

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
								{activeTab === "create"
									? "CREATE GROUP EXPENSE"
									: "JOIN GROUP EXPENSE"}
							</h3>
							<p className="text-sm text-center mb-4 font-bold">
								{activeTab === "create"
									? "Fill out the form to create a new group expense."
									: "Enter the group code to join an existing group expense."}
							</p>
							<hr />

							{/* Tabs */}
							<div className="flex justify-center space-x-4 mt-4">
								<button
									className={`btn ${activeTab === "create" ? "btn-primary" : ""}`}
									onClick={() => setActiveTab("create")}
								>
									CREATE
								</button>
								<button
									className={`btn ${activeTab === "join" ? "btn-primary" : ""}`}
									onClick={() => setActiveTab("join")}
								>
									JOIN
								</button>
							</div>

							{/* Tab Content */}
							{activeTab === "create" ? (
								<form
									className="space-y-4"
									onSubmit={handleCreateGroupExpense}
								>
									{/* Group Code */}
									<div className="flex items-center justify-end space-x-4">
										<label className="block text-sm font-bold py-2"></label>
									</div>

									<div>
										<label className="block text-sm font-bold py-2">
											Expense / Group Title{" "}
											<span className="ml-26">
												Group Code:{" "}
												<span className="font-mono">{groupCode}</span>
											</span>
										</label>
										<input
											type="text"
											className="input input-bordered w-full font-extrabold"
											placeholder="---"
											value={expenseTitle}
											onChange={(e) => setExpenseTitle(e.target.value)}
											required
										/>
									</div>

									<div className="flex space-x-4">
										<div className="flex-1">
											<label className="block text-sm font-bold py-2">
												No. of Participants
											</label>
											<input
												type="number"
												className="input input-bordered w-full font-extrabold"
												placeholder="---"
												value={numOfParticipants || ""}
												onChange={handleParticipantsChange}
												min="2"
												max="50"
												step="1"
												required
											/>
										</div>
										<div className="flex-1">
											<label className="block text-sm font-bold py-2">
												Amount
											</label>
											<input
												type="number"
												className="input input-bordered w-full font-extrabold"
												placeholder="---"
												value={amount}
												onChange={(e) => setAmount(e.target.value)}
												required
											/>
										</div>
									</div>

									<div className="flex space-x-4 mt-4">
										<div className="flex-1">
											<label className="block text-sm font-bold py-2">
												Start Date
											</label>
											<DatePicker
												selected={startDate}
												onChange={(d) => setStartDate(d)}
												className="input input-bordered w-full font-extrabold"
												dateFormat="MM-dd-yyyy"
												required
											/>
										</div>
										<div className="flex-1">
											<label className="block text-sm font-bold py-2">
												End Date
											</label>
											<DatePicker
												selected={endDate}
												onChange={(d) => setEndDate(d)}
												className="input input-bordered w-full font-extrabold"
												dateFormat="MM-dd-yyyy"
												placeholderText="mm-dd-yyyy"
											/>
										</div>
									</div>

									{/* Split Type */}
									<div>
										<label className="block text-sm font-bold py-2">
											Split Type
										</label>
										<div className="flex justify-center space-x-4">
											<button
												type="button"
												className={`btn flex flex-col items-center w-32 h-18 text-sm ${
													splitType === "Equal" ? "btn-primary" : ""
												}`}
												onClick={() => setSplitType("Equal")}
											>
												<Equal className="mb-1 w-6 h-6" />
												<span>EQUAL</span>
											</button>
											<button
												type="button"
												className={`btn flex flex-col items-center w-32 h-18 text-sm ${
													splitType === "Percentage" ? "btn-primary" : ""
												}`}
												onClick={() => setSplitType("Percentage")}
											>
												<Percent className="mb-1 w-6 h-6" />
												<span>PERCENTAGE</span>
											</button>
										</div>
									</div>

									{/* Split Breakdown */}
									<div className="mt-4">
										<label className="block text-sm font-bold py-2">
											Split Breakdown
										</label>
										<div className="flex space-x-4">
											{/* You */}
											<div className="flex-1">
												<label className="block text-sm font-bold py-2 text-center">
													You
												</label>
												{splitType === "Equal" ? (
													<input
														type="text"
														className="input input-bordered w-full font-extrabold"
														value={
															!numOfParticipants || numOfParticipants <= 0
																? "0%"
																: `${(100 / numOfParticipants).toFixed(1)}%`
														}
														disabled
														readOnly
													/>
												) : (
													<select
														className="select select-bordered w-full font-extrabold"
														value={yourPercentage}
														onChange={handleYourPercentageChange}
													>
														{Array.from({ length: 21 }, (_, i) => {
															const percentage = i * 5; // Generate percentages from 0% to 100% in 5% increments
															return (
																<option
																	key={percentage}
																	value={`${percentage}%`}
																>
																	{percentage}%
																</option>
															);
														})}
													</select>
												)}
											</div>

											{/* Other Participants */}
											<div className="flex-1">
												<label className="block text-sm font-bold py-2 text-center">
													Other Participant(s)
												</label>
												<input
													type="text"
													className="input input-bordered w-full font-extrabold"
													value={
														!numOfParticipants || numOfParticipants <= 0
															? "0%"
															: splitType === "Equal"
																? `${(100 / numOfParticipants).toFixed(1)}%`
																: `${parseFloat(
																		otherPercentage.replace("%", ""),
																	).toFixed(1)}%`
													}
													disabled
													readOnly
												/>
												{splitType === "Percentage" && (
													<div className="text-xs text-gray-500 mt-1 text-center">
														Total for others:{" "}
														{100 -
															parseInt(yourPercentage.replace("%", ""), 10)}
														%
													</div>
												)}
											</div>
										</div>
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
											Create Group
										</button>
									</div>
								</form>
							) : (
								<form
									className="space-y-4 mt-6"
									onSubmit={handleJoinGroupExpense}
								>
									<div>
										<label className="block text-sm font-bold py-2">
											Group Code
										</label>
										<input
											type="text"
											className="input input-bordered w-full font-extrabold"
											placeholder="---"
											value={joinGroupCode}
											onChange={(e) =>
												setJoinGroupCode(e.target.value.toUpperCase())
											}
											required
										/>
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
											Join Group
										</button>
									</div>
								</form>
							)}
						</div>
					</div>
				)}

				<ToastContainer />
			</div>
		</>
	);
}
