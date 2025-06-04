import { useEffect, useState } from "react";
import {
	Users,
	Calendar,
	UserCheck,
	Equal,
	Percent,
	CreditCard,
	Smartphone,
	Building,
	Banknote,
	Copy, // Add this import
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GroupExpenseCard = () => {
	const [groupExpenses, setGroupExpenses] = useState([]);
	const [selectedExpense, setSelectedExpense] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
	const [isUpdateConfirmOpen, setIsUpdateConfirmOpen] = useState(false);
	const [isPayModalOpen, setIsPayModalOpen] = useState(false);
	const [paymentMethod, setPaymentMethod] = useState("GCash");
	const [paymentAmount, setPaymentAmount] = useState("");
	const [referenceNotes, setReferenceNotes] = useState("");
	const [expensePayments, setExpensePayments] = useState({});
	const [currentUserId, setCurrentUserId] = useState(null);

	// Generate a palette based on #9fe870
	const generateColorPalette = () => {
		const baseColor = "#9fe870";
		return [
			"#9fe870", // Original green
			"#7dd55c", // Darker green
			"#b8f084", // Lighter green
			"#6bc248", // Much darker green
			"#d4f8a8", // Very light green
			"#8ee85f", // Medium green
			"#a5eb77", // Slightly darker than base
			"#5bb03d", // Deep green
			"#c8f294", // Light green
			"#92e563", // Vibrant green,
		];
	};

	// Get a consistent color for each expense based on its ID
	const getExpenseColors = (expenseId) => {
		const palette = generateColorPalette();
		const index = expenseId % palette.length;
		const yourColor = palette[index];
		const othersColor = palette[(index + 5) % palette.length]; // Offset for contrast
		return { yourColor, othersColor };
	};

	// Add this function to fetch payments for each expense
	const fetchPaymentsForExpense = async (expenseId) => {
		try {
			const response = await fetch(
				`http://localhost:3000/group-expense/${expenseId}/payments`,
				{
					credentials: "include",
				},
			);
			if (response.ok) {
				const payments = await response.json();
				return payments;
			}
			return [];
		} catch (error) {
			console.error("Error fetching payments:", error);
			return [];
		}
	};

	// Add this function to refresh group expenses
	const refreshGroupExpenses = async () => {
		try {
			const response = await fetch("http://localhost:3000/group-expense", {
				credentials: "include",
			});
			if (!response.ok) {
				throw new Error("Failed to fetch group expenses");
			}
			const data = await response.json();

			// Fetch payments for each expense
			const paymentsData = {};
			const expensesWithCompletionStatus = [];

			for (const expense of data) {
				const payments = await fetchPaymentsForExpense(expense.id);
				paymentsData[expense.id] = payments;

				// Calculate completion status
				const totalPaid = payments.reduce(
					(sum, payment) => sum + parseFloat(payment.amount),
					0,
				);
				const overallPercentage =
					expense.amount > 0 ? (totalPaid / expense.amount) * 100 : 0;

				expensesWithCompletionStatus.push({
					...expense,
					isCompleted: overallPercentage >= 100,
					overallPercentage: overallPercentage,
				});
			}

			// Sort expenses: incomplete first, completed last
			const sortedExpenses = expensesWithCompletionStatus.sort((a, b) => {
				// If completion status is different, sort by completion (incomplete first)
				if (a.isCompleted !== b.isCompleted) {
					return a.isCompleted ? 1 : -1;
				}
				// If both have same completion status, sort by creation date (newest first)
				return new Date(b.created_at) - new Date(a.created_at);
			});

			setGroupExpenses(sortedExpenses);
			setExpensePayments(paymentsData);
		} catch (error) {
			console.error("Error fetching group expenses:", error);
		}
	};

	useEffect(() => {
		const fetchCurrentUser = async () => {
			try {
				const response = await fetch("http://localhost:3000/auth/me", {
					credentials: "include",
				});
				if (response.ok) {
					const user = await response.json();
					setCurrentUserId(user.user_id); // Make sure this matches your user ID field
					localStorage.setItem("userId", user.user_id);
				}
			} catch (error) {
				console.error("Error fetching current user:", error);
				// Fallback to localStorage
				const storedUserId = localStorage.getItem("userId");
				if (storedUserId) {
					setCurrentUserId(parseInt(storedUserId));
				}
			}
		};

		fetchCurrentUser();
	}, []);

	// Update the getCurrentUserId function
	const getCurrentUserId = () => {
		return currentUserId;
	};

	useEffect(() => {
		refreshGroupExpenses();
	}, []);

	// Add a window event listener to refresh when a new expense is created
	useEffect(() => {
		const handleGroupExpenseCreated = () => {
			console.log("Group expense created event received"); // Add this for debugging
			refreshGroupExpenses();
		};

		// Listen for custom event when a group expense is created
		window.addEventListener("groupExpenseCreated", handleGroupExpenseCreated);

		// Also listen for focus event to refresh when user comes back to the page
		window.addEventListener("focus", handleGroupExpenseCreated);

		// Listen for storage changes (in case other tabs create expenses)
		window.addEventListener("storage", handleGroupExpenseCreated);

		// Listen for visibility change (when tab becomes visible)
		const handleVisibilityChange = () => {
			if (!document.hidden) {
				refreshGroupExpenses();
			}
		};
		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			window.removeEventListener(
				"groupExpenseCreated",
				handleGroupExpenseCreated,
			);
			window.removeEventListener("focus", handleGroupExpenseCreated);
			window.removeEventListener("storage", handleGroupExpenseCreated);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, []);

	// Add this function after your other utility functions
	const copyToClipboard = async (text) => {
		try {
			await navigator.clipboard.writeText(text);
			toast.success(`Group code "${text}" copied to clipboard!`);
		} catch (err) {
			// Fallback for browsers that don't support clipboard API
			const textArea = document.createElement("textarea");
			textArea.value = text;
			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();
			try {
				document.execCommand("copy");
				toast.success(`Group code "${text}" copied to clipboard!`);
			} catch (fallbackErr) {
				toast.error("Failed to copy group code");
			}
			document.body.removeChild(textArea);
		}
	};

	// Replace the handleCreateExpense function with handleCreatePayment
	const handleCreatePayment = async (paymentData) => {
		try {
			const response = await fetch("http://localhost:3000/group-expense/pay", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(paymentData),
				credentials: "include",
			});

			const result = await response.json();

			if (response.ok) {
				// Success - show success message
				toast.success(result.message || "Payment processed successfully!");

				// Dispatch custom event to notify other components
				window.dispatchEvent(new CustomEvent("groupExpensePaymentMade"));

				// Also update localStorage to trigger storage event
				localStorage.setItem("lastPaymentMade", Date.now().toString());

				// Refresh the group expenses list to show the updated payment status
				await refreshGroupExpenses();

				return { success: true, data: result };
			} else {
				// Error - show error message from server
				const errorMessage =
					result.message || result.error || "Failed to process payment";
				toast.error(errorMessage);
				console.error("Server error:", result);
				return { success: false, error: errorMessage };
			}
		} catch (error) {
			console.error("Error processing payment:", error);
			const errorMessage = "Network error. Please try again.";
			toast.error(errorMessage);
			return { success: false, error: errorMessage };
		}
	};

	// Update the handlePayment function to use handleCreatePayment
	const handlePayment = async (e) => {
		e.preventDefault();

		if (!selectedExpense || !paymentAmount || paymentAmount <= 0) {
			toast.error("Please enter a valid payment amount");
			return;
		}

		// Use the expected amount directly from selectedExpense
		const userExpectedAmount = selectedExpense.expected_amount;
		const userActualPayments = selectedExpense.actual_payments || 0;
		const userRemainingAmount = Math.max(
			userExpectedAmount - userActualPayments,
			0,
		);

		// Convert paymentAmount to number for comparison
		const paymentAmountNum = parseFloat(paymentAmount);

		// Allow payment up to their expected share
		const maxAllowablePayment = userExpectedAmount;

		if (paymentAmountNum > maxAllowablePayment) {
			toast.error(
				`Payment amount cannot exceed your share of ₱${maxAllowablePayment.toLocaleString()}`,
			);
			return;
		}

		// Optional: Warn if paying more than remaining balance
		if (userRemainingAmount > 0 && paymentAmountNum > userRemainingAmount) {
			toast.warning(
				`You're paying ₱${(paymentAmountNum - userRemainingAmount).toLocaleString()} more than your remaining balance of ₱${userRemainingAmount.toLocaleString()}`,
			);
		}

		// Prepare payment data
		const paymentData = {
			groupExpenseId: selectedExpense.id || selectedExpense.groupexpense_id,
			amount: paymentAmountNum,
			paymentMethod: paymentMethod,
			expenseTitle: selectedExpense.expense_title,
			referenceNotes: referenceNotes,
		};

		// Use the handleCreatePayment function
		const result = await handleCreatePayment(paymentData);

		if (result.success) {
			// Reset form and close modal
			setIsPayModalOpen(false);
			setReferenceNotes("");
			setPaymentAmount("");
		}
		// Error handling is already done in handleCreatePayment
	};

	// Toggle the main modal
	const toggleModal = (expense = null) => {
		if (expense) {
			setSelectedExpense(expense);
		} else {
			setSelectedExpense({
				expense_title: "",
				amount: 0,
				start_date: new Date(),
				end_date: new Date(),
				num_participants: 2,
				split_type: "Equal",
				your_percentage: 50,
				other_percentage: 50,
				group_code: "",
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

	// Replace the togglePayModal function
	const togglePayModal = (expense = null) => {
		if (expense) {
			const totalParticipants = Number(expense.num_participants);
			let currentUserPercentage;

			if (expense.split_type === "Equal") {
				currentUserPercentage = 100 / totalParticipants;
			} else {
				// Percentage split logic
				if (expense.owner === currentUserId) {
					// Current user is the owner
					currentUserPercentage = Number(expense.your_percentage);
				} else {
					// Current user is a participant (not owner)
					// Use the full other_percentage instead of dividing it
					currentUserPercentage = Number(expense.other_percentage);
				}
			}

			// Use the same calculation as in the main card rendering
			const expectedAmount = Math.round(
				(Number(expense.amount) * Number(currentUserPercentage)) / 100,
			);

			// Get current user's actual payments
			const payments = expensePayments[expense.id] || [];
			const actualPayments = payments
				.filter((payment) => payment.user_id === currentUserId)
				.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

			// Calculate remaining amount to pay
			const remainingAmount = Math.max(expectedAmount - actualPayments, 0);

			// Enhanced debug logging
			console.log("Payment Modal Calculation Debug:", {
				expenseTitle: expense.expense_title,
				expenseAmount: expense.amount,
				splitType: expense.split_type,
				totalParticipants: totalParticipants,
				isOwner: expense.owner === currentUserId,
				yourPercentage: expense.your_percentage,
				otherPercentage: expense.other_percentage,
				calculatedCurrentUserPercentage: currentUserPercentage,
				calculatedExpectedAmount: expectedAmount,
				formula: `${expense.amount} × ${currentUserPercentage}% ÷ 100 = ${expectedAmount}`,
				actualPayments: actualPayments,
				remainingAmount: remainingAmount,
			});

			setSelectedExpense({
				...expense,
				current_user_percentage: currentUserPercentage,
				expected_amount: expectedAmount,
				actual_payments: actualPayments,
				remaining_amount: remainingAmount,
			});

			// Set default payment amount to remaining amount or full expected amount
			const defaultPaymentAmount =
				remainingAmount > 0 ? remainingAmount : expectedAmount;
			setPaymentAmount(defaultPaymentAmount.toString());
		}
		setIsPayModalOpen(!isPayModalOpen);
	};

	// Handle delete action
	const handleDelete = async () => {
		try {
			const response = await fetch(
				`http://localhost:3000/group-expense/${selectedExpense.id}`,
				{
					method: "DELETE",
					credentials: "include",
				},
			);

			const result = await response.json();

			if (response.ok) {
				// Success - show success message
				toast.success(result.message);
				setIsModalOpen(false);
				setIsDeleteConfirmOpen(false);
				// Refresh the group expenses list
				await refreshGroupExpenses();
			} else {
				// Error - show error message from server
				toast.error(
					result.message || result.error || "Failed to delete group expense",
				);
				setIsDeleteConfirmOpen(false); // Close confirmation modal
				// Don't close the main modal, let user see the error
			}
		} catch (error) {
			console.error("Error deleting group expense:", error);
			toast.error("Network error. Please try again.");
			setIsDeleteConfirmOpen(false);
		}
	};

	// Handle update action
	const handleUpdate = async (e) => {
		e.preventDefault();

		if (!selectedExpense || !selectedExpense.id) {
			console.error("No expense selected or missing ID");
			toast.error("No expense selected for update");
			return;
		}

		const updatedExpense = {
			expenseTitle: selectedExpense.expense_title,
			amount: selectedExpense.amount,
			startDate: new Date(selectedExpense.start_date).toISOString(),
			endDate: new Date(selectedExpense.end_date).toISOString(),
			numOfParticipants: selectedExpense.num_participants,
			splitType: selectedExpense.split_type,
			yourPercentage: `${selectedExpense.your_percentage}%`,
			otherPercentage: `${selectedExpense.other_percentage}%`,
			groupCode: selectedExpense.group_code,
		};

		try {
			const response = await fetch(
				`http://localhost:3000/group-expense/${selectedExpense.id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(updatedExpense),
					credentials: "include",
				},
			);

			const result = await response.json();

			if (response.ok) {
				// Success - show success message
				toast.success(result.message || "Group expense updated successfully!");
				setIsModalOpen(false);
				setIsUpdateConfirmOpen(false);
				// Refresh the group expenses list
				await refreshGroupExpenses();
			} else {
				// Error - show error message from server
				toast.error(
					result.message || result.error || "Failed to update group expense",
				);
				setIsUpdateConfirmOpen(false); // Close confirmation modal
				// Don't close the main modal, let user see the error
			}
		} catch (error) {
			console.error("Error updating group expense:", error);
			toast.error("Network error. Please try again.");
			setIsUpdateConfirmOpen(false);
		}
	};

	return (
		<div>
			<ToastContainer />

			{/* Conditional Rendering for No Group Expenses */}
			{groupExpenses.length === 0 ? (
				<div className="flex flex-col items-center justify-center h-116 mt-30">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="120"
						height="120"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="text-gray-400 mb-6"
					>
						<circle
							cx="12"
							cy="12"
							r="10"
						></circle>
						<path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
						<line
							x1="9"
							y1="9"
							x2="9.01"
							y2="9"
						></line>
						<line
							x1="15"
							y1="9"
							x2="15.01"
							y2="9"
						></line>
					</svg>
					<h3 className="text-2xl font-bold text-gray-500 mb-2">
						No Group Expenses Yet
					</h3>
					<p className="text-lg text-center max-w-lg">
						Start by{" "}
						<span className="font-semibold text-forest-green">
							creating or joining your first group expense
						</span>{" "}
						to begin tracking shared costs with friends and family!
					</p>
					<div className="mt-6 flex items-center gap-2 text-sm text-gray-400">
						<Users className="w-4 h-4" />
						<span>Track • Split • Pay • Manage</span>
					</div>
				</div>
			) : (
				<div
					className={`grid ${
						groupExpenses.length === 1
							? "grid-cols-1"
							: groupExpenses.length === 2
								? "grid-cols-2"
								: "grid-cols-3"
					} gap-4 px-12 mt-6 flex-grow`}
				>
					{groupExpenses.map((expense, index) => {
						const {
							expense_title,
							amount,
							start_date,
							end_date,
							num_participants,
							participants,
							participant_usernames,
							owner_username,
							owner,
							split_type,
							your_percentage,
							other_percentage,
							group_code,
						} = expense;

						// Get colors for this specific expense
						const { yourColor, othersColor } = getExpenseColors(expense.id);

						// Get payments for this expense
						const payments = expensePayments[expense.id] || [];
						const currentUserId = getCurrentUserId();

						// Calculate participant sections for progress bar
						const totalParticipants = Number(num_participants);

						// Create participant sections based on split type
						let participantSections = [];

						if (split_type === "Equal") {
							const equalPercentage = 100 / totalParticipants;

							// Add owner section
							participantSections.push({
								name: owner_username,
								percentage: Number(equalPercentage),
								color: owner === currentUserId ? yourColor : othersColor,
								isCurrentUser: owner === currentUserId,
								userId: owner,
							});

							// Add participant sections
							if (participant_usernames && participant_usernames.length > 0) {
								participant_usernames.forEach((participant) => {
									participantSections.push({
										name: participant.username,
										percentage: Number(equalPercentage),
										color:
											participant.user_id === currentUserId
												? yourColor
												: othersColor,
										isCurrentUser: participant.user_id === currentUserId,
										userId: participant.user_id,
									});
								});
							}

							// Fill remaining slots if needed
							const remainingSlots =
								totalParticipants - participantSections.length;
							for (let i = 0; i < remainingSlots; i++) {
								participantSections.push({
									name: "Other Participant",
									percentage: Number(equalPercentage),
									color: "#cccccc",
									isCurrentUser: false,
									userId: null,
								});
							}
						} else {
							// Percentage split - FIXED LOGIC
							const remainingParticipants = totalParticipants - 1;

							// Calculate individual percentage for each "other" participant
							// This should be the total other_percentage divided by number of other participants
							const otherIndividualPercentage =
								remainingParticipants > 0
									? Number(other_percentage) / remainingParticipants
									: 0;

							// Add owner section
							participantSections.push({
								name: owner_username,
								percentage: Number(your_percentage),
								color: owner === currentUserId ? yourColor : othersColor,
								isCurrentUser: owner === currentUserId,
								userId: owner,
							});

							// Add actual participants (those who have joined)
							if (participant_usernames && participant_usernames.length > 0) {
								participant_usernames.forEach((participant) => {
									participantSections.push({
										name: participant.username,
										percentage: Number(otherIndividualPercentage),
										color:
											participant.user_id === currentUserId
												? yourColor
												: othersColor,
										isCurrentUser: participant.user_id === currentUserId,
										userId: participant.user_id,
									});
								});
							}

							// Fill remaining slots for participants who haven't joined yet
							const joinedParticipants = participant_usernames
								? participant_usernames.length
								: 0;
							const remainingSlots = remainingParticipants - joinedParticipants;

							for (let i = 0; i < remainingSlots; i++) {
								participantSections.push({
									name: "Other Participant(s)",
									percentage: Number(otherIndividualPercentage),
									color: "#cccccc",
									isCurrentUser: false,
									userId: null,
								});
							}

							// Ensure total percentages add up to 100% by adjusting rounding errors
							const totalPercentage = participantSections.reduce(
								(sum, section) => sum + section.percentage,
								0,
							);
							const difference = 100 - totalPercentage;

							if (Math.abs(difference) > 0.01) {
								console.warn(
									`Percentage split doesn't add up to 100%: ${totalPercentage}%. Adjusting by ${difference}%`,
								);
								// Distribute the difference equally among "other" participants
								const otherSections = participantSections.filter(
									(section, index) => index > 0,
								); // Exclude owner
								if (otherSections.length > 0) {
									const adjustmentPerSection =
										difference / otherSections.length;
									otherSections.forEach((section) => {
										section.percentage += adjustmentPerSection;
									});
								}
							}

							// Final verification - log the percentages for debugging
							console.log(
								"Participant percentages:",
								participantSections.map((section) => ({
									name: section.name,
									percentage: section.percentage.toFixed(2) + "%",
								})),
							);
						}

						// Calculate expected amounts and progress for each section
						participantSections = participantSections.map((section) => {
							const expectedAmount = Math.round(
								(Number(amount) * Number(section.percentage)) / 100,
							);
							let actualPayments = 0;

							if (section.userId) {
								// Get payments for this specific user
								actualPayments = payments
									.filter((payment) => payment.user_id === section.userId)
									.reduce(
										(sum, payment) => sum + parseFloat(payment.amount),
										0,
									);
							}

							const progressPercentage =
								expectedAmount > 0
									? Math.min((actualPayments / expectedAmount) * 100, 100)
									: 0;

							const barWidth =
								(Number(section.percentage) * Number(progressPercentage)) / 100;

							return {
								...section,
								percentage: Number(section.percentage),
								expectedAmount: Number(expectedAmount),
								actualPayments: Number(actualPayments),
								progressPercentage: Number(progressPercentage),
								barWidth: Number(barWidth),
							};
						});

						// Calculate totals AFTER processing participant sections
						const totalAmount = Number(amount);
						const totalPaid = participantSections.reduce(
							(sum, section) => sum + Number(section.actualPayments),
							0,
						);

						// Cap the displayed total paid at the expense amount
						const displayedTotalPaid = Math.min(totalPaid, totalAmount);

						// Overall completion percentage - cap at 100%
						const overallPercentage = Math.min(
							totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0,
							100,
						);

						// Format dates
						const formattedStartDate = new Date(start_date).toLocaleDateString(
							"en-US",
							{
								year: "numeric",
								month: "long",
								day: "numeric",
								timeZone: "Asia/Manila",
							},
						);
						const formattedEndDate = end_date
							? new Date(end_date).toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
									timeZone: "Asia/Manila",
								})
							: "Ongoing";

						const currentParticipants = participants
							? participants.length + 1
							: 1;

						return (
							<div
								key={index}
								className={`bg-white rounded-xl p-4 shadow-md relative ${
									overallPercentage >= 100 ? "opacity-50" : ""
								}`}
							>
								{/* COMPLETE Stamp Overlay */}
								{overallPercentage >= 100 && (
									<div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
										<div
											className="bg-green-600 text-white font-black text-2xl px-6 py-3 rounded-lg shadow-lg transform rotate-12 border-4 border-green-700"
											style={{
												background: "linear-gradient(45deg, #16a34a, #22c55e)",
												textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
												boxShadow:
													"0 8px 16px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.3)",
											}}
										>
											✓ COMPLETE
										</div>
									</div>
								)}

								{/* Card Content - Make clickable for edit */}
								<div
									className="cursor-pointer"
									onClick={() => toggleModal(expense)}
								>
									{/* Header */}
									<div className="flex justify-between items-center mb-2">
										<div className="flex items-center gap-2">
											<div className="bg-neutral rounded-full p-2">
												<Users className="w-5 h-5 text-white" />
											</div>
											<span className="font-black text-base-content uppercase text-base">
												{expense_title}
											</span>
										</div>
										<div className="text-forest-green font-black text-base">
											₱{Number(amount).toLocaleString()}
										</div>
									</div>

									{/* Group Info */}
									<div className="flex justify-between items-center mb-2 text-xs">
										<div className="flex items-center gap-1 text-forest-green">
											<UserCheck className="w-3 h-3" />
											<span>
												{currentParticipants}/{num_participants}
											</span>
										</div>
										<div className="flex items-center gap-1">
											<button
												onClick={(e) => {
													e.stopPropagation(); // Prevent triggering the card click
													copyToClipboard(group_code);
												}}
												className="btn btn-xs btn-ghost p-1 hover:bg-bright-green hover:text-forest-green transition-colors"
												title="Copy group code"
											>
												<Copy className="w-3 h-3" />
											</button>
											<div className="font-mono text-forest-green font-bold">
												{group_code}
											</div>
										</div>
									</div>

									{/* Payment Status Info */}
									<div className="text-base text-forest-green mb-1 font-bold">
										Paid ₱{Number(displayedTotalPaid).toLocaleString()} of ₱
										{Number(totalAmount).toLocaleString()} (
										{Number(overallPercentage).toFixed(1)}% complete)
									</div>

									{/* Individual Payment Status - HORIZONTAL LAYOUT */}
									<div
										className={`grid grid-cols-${Math.min(participantSections.length, 3)} gap-2 text-xs text-forest-green mb-2`}
									>
										{participantSections.map((section, idx) => (
											<div
												key={idx}
												className="flex flex-col border border-gray-200 rounded p-2"
											>
												{/* Participant info */}
												<div className="text-center font-bold mb-1 uppercase text-md">
													{section.name}
												</div>
												<div className="text-center mb-1">
													₱{Number(section.actualPayments).toLocaleString()} / ₱
													{Number(section.expectedAmount).toLocaleString()}
												</div>
												<div className="text-center mb-2">
													({Number(section.progressPercentage).toFixed(1)}%)
												</div>

												{/* Individual progress bar for this participant */}
												<div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
													<div
														className="h-full rounded-full transition-all duration-500 ease-out"
														style={{
															width: `${Math.min(Math.max(Number(section.progressPercentage), 0), 100)}%`,
															backgroundColor: section.color,
															transform: `translateX(0%)`,
															boxShadow:
																section.progressPercentage > 0
																	? "inset 0 1px 2px rgba(0,0,0,0.1)"
																	: "none",
														}}
													>
														{/* Add a shine effect for completed progress */}
														{section.progressPercentage >= 100 && (
															<div
																className="h-full w-full rounded-full animate-pulse"
																style={{
																	background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)`,
																}}
															/>
														)}
													</div>
												</div>

												{/* Progress status indicator */}
												<div className="text-center mt-1">
													{section.progressPercentage >= 100 && (
														<span className="text-xs font-bold text-green-600">
															✓ Complete
														</span>
													)}
													{section.progressPercentage > 0 &&
														section.progressPercentage < 100 && (
															<span className="text-xs font-medium text-orange-600">
																In Progress
															</span>
														)}
													{section.progressPercentage === 0 && (
														<span className="text-xs text-gray-500">
															Not Started
														</span>
													)}
												</div>
											</div>
										))}
									</div>

									{/* Split Type and Date Range */}
									<div className="flex justify-between text-xs text-forest-green opacity-70 mb-4">
										<span className="flex items-center gap-1 font-bold">
											Split Type: {split_type}
										</span>
										<span className="flex items-center gap-1">
											<Calendar className="w-3 h-3" />
											{formattedStartDate} - {formattedEndDate}
										</span>
									</div>
								</div>

								{/* Pay Button - Bottom Right */}
								<div className="flex justify-end">
									{(() => {
										// Check if overall expense is complete
										if (overallPercentage >= 100) {
											return (
												<button
													className="btn btn-sm btn-disabled opacity-50"
													disabled
												>
													<CreditCard className="w-4 h-4 mr-1" />
													Completed
												</button>
											);
										}

										// Check if current user has paid their share completely
										const currentUserSection = participantSections.find(
											(section) => section.userId === currentUserId,
										);
										const isCurrentUserComplete =
											currentUserSection &&
											currentUserSection.progressPercentage >= 100;

										if (isCurrentUserComplete) {
											return (
												<button
													className="btn btn-sm btn-disabled opacity-50"
													disabled
												>
													<CreditCard className="w-4 h-4 mr-1" />
													Paid
												</button>
											);
										}

										// User can still pay
										return (
											<button
												className="btn btn-sm btn-success"
												onClick={(e) => {
													e.stopPropagation();
													togglePayModal(expense);
												}}
											>
												<CreditCard className="w-4 h-4 mr-1" />
												Pay
											</button>
										);
									})()}
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Pay Modal */}
			{isPayModalOpen && selectedExpense && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-sm">
					<div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
						<h3 className="text-xl font-black text-forest-green text-center mb-2 uppercase">
							Pay Your Share
						</h3>
						<div className="text-center mb-4">
							<p className="text-sm font-bold text-gray-600">
								{selectedExpense.expense_title}
							</p>
							<p className="text-xl font-black text-forest-green">
								₱{selectedExpense.amount.toLocaleString()}
							</p>
						</div>

						<form
							className="space-y-4"
							onSubmit={handlePayment}
						>
							{/* Payment Method */}
							<div>
								<label className="block text-sm font-bold py-2">
									Payment Method
								</label>
								<div className="grid grid-cols-2 gap-2">
									<button
										type="button"
										className={`btn flex flex-col items-center w-full h-18 text-xs ${
											paymentMethod === "GCash" ? "btn-primary" : ""
										}`}
										onClick={() => setPaymentMethod("GCash")}
									>
										<Smartphone className="mb-1 w-6 h-6" />
										<span>GCASH</span>
									</button>
									<button
										type="button"
										className={`btn flex flex-col items-center w-full h-18 text-xs ${
											paymentMethod === "PayMaya" ? "btn-primary" : ""
										}`}
										onClick={() => setPaymentMethod("PayMaya")}
									>
										<Smartphone className="mb-1 w-6 h-6" />
										<span>MAYA</span>
									</button>
									<button
										type="button"
										className={`btn flex flex-col items-center w-full h-18 text-xs ${
											paymentMethod === "Bank Transfer" ? "btn-primary" : ""
										}`}
										onClick={() => setPaymentMethod("Bank Transfer")}
									>
										<Building className="mb-1 w-6 h-6" />
										<span>BANK TRANSFER</span>
									</button>
									<button
										type="button"
										className={`btn flex flex-col items-center w-full h-18 text-xs ${
											paymentMethod === "Cash" ? "btn-primary" : ""
										}`}
										onClick={() => setPaymentMethod("Cash")}
									>
										<Banknote className="mb-1 w-6 h-6" />
										<span>CASH</span>
									</button>
									<button
										type="button"
										className={`btn flex flex-col items-center w-full h-18 text-xs col-span-2 ${
											paymentMethod === "Credit Card" ? "btn-primary" : ""
										}`}
										onClick={() => setPaymentMethod("Credit Card")}
									>
										<CreditCard className="mb-1 w-6 h-6" />
										<span>CREDIT CARD</span>
									</button>
								</div>
							</div>

							{/* Payment Amount (NOW EDITABLE) */}
							<div>
								<label className="block text-sm font-bold py-2">
									Amount to Pay (₱)
									<span className="text-xs text-gray-500 font-normal ml-2">
										(You can pay any amount up to ₱
										{selectedExpense.expected_amount.toLocaleString()})
									</span>
								</label>
								<input
									type="number"
									className="input input-bordered w-full font-extrabold"
									value={paymentAmount}
									onChange={(e) => {
										// Ensure only whole numbers are accepted
										const value = e.target.value;
										if (
											value === "" ||
											(Number.isInteger(Number(value)) && Number(value) >= 0)
										) {
											setPaymentAmount(value);
										}
									}}
									onBlur={(e) => {
										// Round to nearest whole number on blur if somehow a decimal got in
										const value = e.target.value;
										if (value && !Number.isInteger(Number(value))) {
											setPaymentAmount(Math.round(Number(value)).toString());
										}
									}}
									placeholder="Enter amount to pay"
									min="1"
									max={selectedExpense.expected_amount}
									step="1"
									required
								/>
								<div className="flex justify-end mt-2">
									<button
										type="button"
										className="btn btn-xs"
										onClick={() =>
											setPaymentAmount(
												(selectedExpense.remaining_amount > 0
													? selectedExpense.remaining_amount
													: selectedExpense.expected_amount
												).toString(),
											)
										}
									>
										{selectedExpense.remaining_amount > 0 ? (
											<>
												Remaining Amount - ₱
												{selectedExpense.remaining_amount.toLocaleString()}
											</>
										) : (
											<>
												Your Share (
												{selectedExpense.current_user_percentage.toFixed(2)}%) -
												₱{selectedExpense.expected_amount.toLocaleString()}
											</>
										)}
									</button>
								</div>
							</div>

							{/* Reference/Notes */}
							<div>
								<label className="block text-sm font-bold py-2">
									Reference/Notes (Optional)
								</label>
								<textarea
									className="textarea textarea-bordered w-full font-extrabold"
									placeholder="Enter reference number or notes..."
									rows="3"
									value={referenceNotes}
									onChange={(e) => setReferenceNotes(e.target.value)}
								></textarea>
							</div>

							{/* Buttons */}
							<div className="flex justify-end gap-2 mt-6">
								<button
									type="button"
									className="btn uppercase font-extrabold"
									onClick={() => togglePayModal()}
								>
									Cancel
								</button>
								<button
									type="submit"
									className="btn btn-success uppercase font-extrabold"
									disabled={!paymentAmount || paymentAmount <= 0}
								>
									<CreditCard className="w-4 h-4 mr-2" />
									Pay ₱
									{paymentAmount
										? parseInt(paymentAmount).toLocaleString()
										: "0"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Edit Modal */}
			{isModalOpen && selectedExpense && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-sm">
					<div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
						<h3 className="text-xl font-black text-forest-green text-center mb-2 uppercase">
							Edit Group Expense
						</h3>
						<form
							className="space-y-4 mt-2"
							onSubmit={(e) => {
								e.preventDefault();
								toggleUpdateConfirm();
							}}
						>
							{/* Expense Title and Group Code */}
							<div>
								<label className="block text-sm font-bold py-2">
									Expense Title
									<span className="ml-42">
										Group Code:{" "}
										<span className="font-mono">
											{selectedExpense.group_code}
										</span>
									</span>
								</label>
								<input
									type="text"
									className="input input-bordered w-full font-extrabold"
									value={selectedExpense.expense_title}
									onChange={(e) =>
										setSelectedExpense({
											...selectedExpense,
											expense_title: e.target.value,
										})
									}
									required
								/>
							</div>

							{/* Amount and Participants */}
							<div className="flex space-x-4">
								<div className="flex-1">
									<label className="block text-sm font-bold py-2">
										Amount (₱)
									</label>
									<input
										type="number"
										className="input input-bordered w-full font-extrabold"
										value={selectedExpense.amount}
										onChange={(e) =>
											setSelectedExpense({
												...selectedExpense,
												amount:
													e.target.value === "" ? "" : Number(e.target.value), // Handle empty string
											})
										}
										required
									/>
								</div>
								<div className="flex-1">
									<label className="block text-sm font-bold py-2">
										Participants
									</label>
									<input
										type="number"
										className="input input-bordered w-full font-extrabold"
										value={selectedExpense.num_participants}
										onChange={(e) =>
											setSelectedExpense({
												...selectedExpense,
												num_participants:
													e.target.value === "" ? "" : Number(e.target.value), // Handle empty string
											})
										}
										min="2"
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
										selected={
											selectedExpense.start_date
												? new Date(selectedExpense.start_date)
												: null
										}
										onChange={(date) =>
											setSelectedExpense({
												...selectedExpense,
												start_date: date,
											})
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
										selected={
											selectedExpense.end_date
												? new Date(selectedExpense.end_date)
												: null
										}
										onChange={(date) =>
											setSelectedExpense({
												...selectedExpense,
												end_date: date,
											})
										}
										className="input input-bordered w-full font-extrabold"
										dateFormat="MM-dd-yyyy"
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
											selectedExpense.split_type === "Equal"
												? "btn-primary"
												: ""
										}`}
										onClick={() => {
											const equalPercentage =
												selectedExpense.num_participants > 0
													? (100 / selectedExpense.num_participants).toFixed(1)
													: 0;
											setSelectedExpense({
												...selectedExpense,
												split_type: "Equal",
												your_percentage: parseFloat(equalPercentage),
												other_percentage: parseFloat(equalPercentage),
											});
										}}
									>
										<Equal className="mb-1 w-6 h-6" />
										<span>EQUAL</span>
									</button>
									<button
										type="button"
										className={`btn flex flex-col items-center w-32 h-18 text-sm ${
											selectedExpense.split_type === "Percentage"
												? "btn-primary"
												: ""
										}`}
										onClick={() =>
											setSelectedExpense({
												...selectedExpense,
												split_type: "Percentage",
											})
										}
									>
										<Percent className="mb-1 w-6 h-6" />
										<span>PERCENTAGE</span>
									</button>
								</div>
							</div>

							{/* Split Breakdown */}
							<div className="flex space-x-4">
								<div className="flex-1">
									<label className="block text-sm font-bold py-2">
										Your Percentage (%)
									</label>
									{selectedExpense.split_type === "Equal" ? (
										<input
											type="text"
											className="input input-bordered w-full font-extrabold"
											value={
												!selectedExpense.num_participants ||
												selectedExpense.num_participants <= 0
													? "0%"
													: `${(100 / selectedExpense.num_participants).toFixed(1)}%`
											}
											disabled
											readOnly
										/>
									) : (
										<input
											type="number"
											className="input input-bordered w-full font-extrabold"
											value={selectedExpense.your_percentage}
											onChange={(e) => {
												const yourValue = Number(e.target.value);
												const otherValue = 100 - yourValue;
												setSelectedExpense({
													...selectedExpense,
													your_percentage: yourValue,
													other_percentage: otherValue,
												});
											}}
											min="0"
											max="100"
										/>
									)}
								</div>
								<div className="flex-1">
									<label className="block text-sm font-bold py-2">
										Others Percentage (%)
									</label>
									<input
										type="text"
										className="input input-bordered w-full font-extrabold"
										value={
											!selectedExpense.num_participants ||
											selectedExpense.num_participants <= 0
												? "0%"
												: selectedExpense.split_type === "Equal"
													? `${(100 / selectedExpense.num_participants).toFixed(1)}%`
													: `${selectedExpense.other_percentage}%`
										}
										disabled
										readOnly
									/>
								</div>
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
									onClick={toggleDeleteConfirm}
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
							Are you sure you want to delete this group expense?
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
						<div className="flex justify-center gap-4 uppercase">
							<button
								className="btn"
								onClick={toggleUpdateConfirm}
							>
								CANCEL
							</button>
							<button
								className="btn btn-primary uppercase"
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

export default GroupExpenseCard;
