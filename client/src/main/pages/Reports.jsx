import { useState, useEffect } from "react";
import { Bar, Line } from "react-chartjs-2";
import HomeNavSideBar from "../components/HomeSideBar";
import Modal from "../components/Modal"; // Reusable Modal component
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	PointElement,
	LineElement,
	Filler,
} from "chart.js";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	PointElement,
	LineElement,
	Filler,
);

export default function Reports() {
	const [monthlyExpenses, setMonthlyExpenses] = useState([]);
	const [budgetVsActual, setBudgetVsActual] = useState([]);
	const [allBudgetData, setAllBudgetData] = useState([]); // Store all budget data
	const [incomeVsExpense, setIncomeVsExpense] = useState([]);
	const [selectedExpenseMonth, setSelectedExpenseMonth] = useState("");
	const [selectedBudgetMonth, setSelectedBudgetMonth] = useState("");
	const [selectedReport, setSelectedReport] = useState(null); // Track selected report
	const [modalData, setModalData] = useState([]); // Data for the modal

	const allMonths = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	useEffect(() => {
		const fetchExpenses = async () => {
			try {
				const res = await fetch(
					"http://localhost:3000/reports/monthly-expenses",
					{ credentials: "include" },
				);
				const data = await res.json();
				setMonthlyExpenses(Array.isArray(data) ? data : []);
			} catch (err) {
				console.error("Error fetching monthly expenses:", err);
			}
		};
		fetchExpenses();
	}, []);

	useEffect(() => {
		const fetchBudget = async () => {
			try {
				// Always fetch all budget data first
				const res = await fetch(
					"http://localhost:3000/reports/budget-vs-actual",
					{ credentials: "include" },
				);
				const data = await res.json();
				const budgetData = Array.isArray(data) ? data : [];

				// Store all budget data
				setAllBudgetData(budgetData);

				// Filter data based on selected month using the same logic
				if (selectedBudgetMonth && budgetData.length > 0) {
					const filtered = budgetData.filter((item) => {
						let monthName = "";

						if (item.month) {
							// If month is in YYYY-MM format (like "2025-06")
							if (
								typeof item.month === "string" &&
								item.month.match(/^\d{4}-\d{2}$/)
							) {
								const [year, monthNum] = item.month.split("-");
								const date = new Date(year, monthNum - 1);
								monthName = date.toLocaleDateString("en-US", { month: "long" });
							}
							// If month is already a date string
							else if (!isNaN(Date.parse(item.month))) {
								const date = new Date(item.month);
								monthName = date.toLocaleDateString("en-US", { month: "long" });
							}
							// If month is already in "Month YYYY" format
							else if (typeof item.month === "string") {
								const monthPart = item.month.split(" ")[0];
								if (allMonths.includes(monthPart)) {
									monthName = monthPart;
								} else {
									monthName = item.month;
								}
							}
						}

						return monthName === selectedBudgetMonth;
					});
					setBudgetVsActual(filtered);
				} else {
					setBudgetVsActual(budgetData);
				}
			} catch (error) {
				console.error("Error fetching budget vs actual:", error);
				setAllBudgetData([]);
				setBudgetVsActual([]);
			}
		};

		fetchBudget();
	}, [selectedBudgetMonth]);

	useEffect(() => {
		const fetchIncomeVsExpense = async () => {
			try {
				const res = await fetch(
					"http://localhost:3000/reports/income-vs-expense",
					{ credentials: "include" },
				);
				const data = await res.json();
				console.log("Income vs Expense Data:", data); // Debugging
				setIncomeVsExpense(Array.isArray(data) ? data : []);
			} catch (err) {
				console.error("Error fetching income vs expense:", err);
			}
		};
		fetchIncomeVsExpense();
	}, []);

	const filterByMonth = (data, monthName) => {
		if (!Array.isArray(data)) return [];
		if (!monthName) return data;
		return data.filter((item) => {
			const dateStr = item.start_date || item.month || item.date;
			if (!dateStr) return false;
			const date = new Date(dateStr);
			const itemMonth = date.toLocaleString("en-US", { month: "long" });
			return itemMonth === monthName;
		});
	};

	const handleReportClick = (reportType, data) => {
		setSelectedReport(reportType);
		setModalData(data);
	};

	const closeModal = () => {
		setSelectedReport(null);
		setModalData([]);
	};

	// Expense Chart
	const filteredExpenses = filterByMonth(monthlyExpenses, selectedExpenseMonth);
	const expenseCategories = [
		...new Set(filteredExpenses.map((item) => item.category)),
	];
	const expenseMonths = [
		...new Set(filteredExpenses.map((item) => item.month)),
	];

	const expenseChartData = {
		labels: expenseMonths.map((month) => {
			const date = new Date(`${month}-01`); // Convert 'YYYY-MM' to a Date object
			return date.toLocaleDateString("en-US", {
				month: "long",
				year: "numeric",
			});
		}),
		datasets: expenseCategories.map((category) => ({
			label: category,
			data: expenseMonths.map((month) => {
				const item = filteredExpenses.find(
					(e) => e.month === month && e.category === category,
				);
				return item ? item.total_expense : 0;
			}),
			backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
				Math.random() * 255,
			)}, ${Math.floor(Math.random() * 255)}, 0.6)`,
		})),
	};
	const expenseChartOptions = {
		responsive: true,
		plugins: {
			legend: { position: "top" },
			title: {
				display: true,
				text: "Monthly Expense Summary (Stacked by Category)",
			},
		},
		scales: {
			x: { stacked: true },
			y: {
				stacked: true,
				beginAtZero: true,
				title: {
					display: true,
					text: "Amount (₱)",
				},
			},
		},
	};

	// Budget Chart - Use allBudgetData for filtering
	const filteredBudgetData = selectedBudgetMonth
		? allBudgetData.filter((item) => {
				// Handle different possible month formats
				let monthName = "";

				if (item.month) {
					// If month is in YYYY-MM format (like "2025-06")
					if (
						typeof item.month === "string" &&
						item.month.match(/^\d{4}-\d{2}$/)
					) {
						const [year, monthNum] = item.month.split("-");
						const date = new Date(year, monthNum - 1); // monthNum - 1 because Date months are 0-indexed
						monthName = date.toLocaleDateString("en-US", { month: "long" });
					}
					// If month is already a date string
					else if (!isNaN(Date.parse(item.month))) {
						const date = new Date(item.month);
						monthName = date.toLocaleDateString("en-US", { month: "long" });
					}
					// If month is already in "Month YYYY" format
					else if (typeof item.month === "string") {
						// Extract just the month name if it contains year
						const monthPart = item.month.split(" ")[0];
						if (allMonths.includes(monthPart)) {
							monthName = monthPart;
						} else {
							monthName = item.month;
						}
					}
				}

				console.log(
					"Filtering budget item:",
					item.month,
					"->",
					monthName,
					"comparing with:",
					selectedBudgetMonth,
				);
				return monthName === selectedBudgetMonth;
			})
		: allBudgetData;

	const budgetChartData = {
		labels:
			filteredBudgetData.length > 0
				? filteredBudgetData.map((item) => item.category)
				: ["No Data"], // Show placeholder when no data
		datasets: [
			{
				label: "Budget (₱)",
				data:
					filteredBudgetData.length > 0
						? filteredBudgetData.map((item) => Number(item.budget) || 0)
						: [0], // Show zero value when no data
				backgroundColor: "#709fe8",
			},
			{
				label: "Actual Spending (₱)",
				data:
					filteredBudgetData.length > 0
						? filteredBudgetData.map(
								(item) => Number(item.actual_spending) || 0,
							)
						: [0], // Show zero value when no data
				backgroundColor: "#e8709f",
			},
		],
	};

	const budgetChartOptions = {
		responsive: true,
		plugins: {
			legend: { position: "top" },
			title: {
				display: true,
				text: selectedBudgetMonth
					? `Budget vs. Actual Spending - ${selectedBudgetMonth}`
					: "Budget vs. Actual Spending",
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				title: {
					display: true,
					text: "Amount (₱)",
				},
			},
		},
	};

	// Income vs Expense Trend Chart
	const incomeExpenseChartData = {
		labels: incomeVsExpense.map((item) => {
			const date = new Date(item.day); // Convert 'day' to a Date object
			return date.toLocaleDateString("en-US", {
				month: "long",
				day: "numeric",
				year: "numeric",
			});
		}),
		datasets: [
			{
				label: "Income (₱)",
				data: incomeVsExpense.map((item) => Number(item.income) || 0),
				borderColor: "rgba(112, 159, 232, 1)",
				backgroundColor: "rgba(112, 159, 232, 0.2)",
				fill: true,
			},
			{
				label: "Expense (₱)",
				data: incomeVsExpense.map((item) => Number(item.expense) || 0),
				borderColor: "rgba(232, 112, 159, 1)",
				backgroundColor: "rgba(232, 112, 159, 0.2)",
				fill: true,
			},
		],
	};

	console.log("Income Expense Chart Data:", incomeExpenseChartData); // Debugging

	const incomeExpenseChartOptions = {
		responsive: true,
		plugins: {
			legend: { position: "top" },
			title: {
				display: true,
				text: "Daily Income vs. Expense Trend", // Update title to reflect daily trend
			},
		},
		scales: {
			x: { title: { display: true, text: "Day" } }, // Update x-axis label to 'Day'
			y: { title: { display: true, text: "Amount (₱)" } },
		},
	};

	return (
		<div className="bg-base-100 ml-65 min-h-screen p-6 relative">
			<HomeNavSideBar />
			<div className="px-12 pt-6">
				<h1 className="text-3xl font-bold mb-4 font-secondary text-center">
					REPORTS
				</h1>

				{/* Conditional Rendering for No Reports */}
				{monthlyExpenses.length === 0 &&
				allBudgetData.length === 0 &&
				incomeVsExpense.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-132 mt-20">
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
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
							<polyline points="14,2 14,8 20,8"></polyline>
							<line
								x1="16"
								y1="13"
								x2="8"
								y2="13"
							></line>
							<line
								x1="16"
								y1="17"
								x2="8"
								y2="17"
							></line>
							<polyline points="10,9 9,9 8,9"></polyline>
						</svg>
						<h3 className="text-2xl font-bold text-gray-500 mb-2">
							No Reports Available Yet
						</h3>
						<p className="text-lg text-center max-w-md">
							No reports here yet — start by{" "}
							<span className="font-semibold text-forest-green">
								creating your first budget and adding some expenses
							</span>{" "}
							to generate insightful financial reports!
						</p>
						<div className="mt-6 flex items-center gap-2 text-sm text-gray-400">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<line
									x1="12"
									y1="1"
									x2="12"
									y2="23"
								></line>
								<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
							</svg>
							<span>Budget • Track • Analyze • Improve</span>
						</div>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Monthly Summary Expense */}
						{monthlyExpenses.length > 0 && (
							<div
								className="card w-full shadow-sm bg-white cursor-pointer"
								onClick={() =>
									handleReportClick("Monthly Summary Expense", filteredExpenses)
								}
							>
								<div className="card-body items-center">
									<h2 className="card-title font-extrabold">
										Monthly Summary Expense
									</h2>
									<div
										className="mb-2 w-full flex justify-center"
										onClick={(e) => e.stopPropagation()} // Prevent modal from opening
									>
										<select
											className="select select-bordered w-30"
											value={selectedExpenseMonth}
											onChange={(e) => setSelectedExpenseMonth(e.target.value)}
										>
											<option value="">All Months</option>
											{allMonths.map((month) => (
												<option
													key={month}
													value={month}
												>
													{month}
												</option>
											))}
										</select>
									</div>
									{filteredExpenses.length === 0 && selectedExpenseMonth ? (
										<div className="flex flex-col items-center justify-center h-64 text-gray-500">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="48"
												height="48"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="1.5"
												strokeLinecap="round"
												strokeLinejoin="round"
												className="mb-2 mt-16"
											>
												<circle
													cx="12"
													cy="12"
													r="10"
												></circle>
												<path d="M12 6v6l4 2"></path>
											</svg>
											<p className="text-sm font-medium text-center">
												No data for {selectedExpenseMonth}
												<br />
												Try selecting a different month
											</p>
										</div>
									) : (
										<Bar
											data={expenseChartData}
											options={expenseChartOptions}
										/>
									)}
								</div>
							</div>
						)}

						{/* Budget vs Actual Spending - Always show if allBudgetData has data */}
						{Array.isArray(allBudgetData) && allBudgetData.length > 0 && (
							<div
								className="card w-full shadow-sm bg-white cursor-pointer"
								onClick={() =>
									handleReportClick(
										"Budget vs. Actual Spending",
										filteredBudgetData.length > 0
											? filteredBudgetData
											: allBudgetData,
									)
								}
							>
								<div className="card-body items-center">
									<h2 className="card-title font-extrabold">
										Budget vs. Actual Spending
									</h2>
									<div
										className="mb-2 w-full flex justify-center"
										onClick={(e) => e.stopPropagation()}
									>
										<select
											className="select select-bordered w-30"
											value={selectedBudgetMonth}
											onChange={(e) => setSelectedBudgetMonth(e.target.value)}
										>
											<option value="">All Months</option>
											{allMonths.map((month) => (
												<option
													key={month}
													value={month}
												>
													{month}
												</option>
											))}
										</select>
									</div>
									{filteredBudgetData.length === 0 && selectedBudgetMonth ? (
										<div className="flex flex-col items-center justify-center h-64 text-gray-500">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="48"
												height="48"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="1.5"
												strokeLinecap="round"
												strokeLinejoin="round"
												className="mb-2 mt-16"
											>
												<circle
													cx="12"
													cy="12"
													r="10"
												></circle>
												<path d="M12 6v6l4 2"></path>
											</svg>
											<p className="text-sm font-medium text-center">
												No data for {selectedBudgetMonth}
												<br />
												Try selecting a different month
											</p>
										</div>
									) : (
										<Bar
											data={budgetChartData}
											options={budgetChartOptions}
										/>
									)}
								</div>
							</div>
						)}

						{/* Income vs Expense Trend */}
						{incomeVsExpense.length > 0 && (
							<div
								className="card w-full shadow-sm bg-white cursor-pointer col-span-2 mb-10"
								onClick={() =>
									handleReportClick("Income vs. Expense Trend", incomeVsExpense)
								}
							>
								<div className="card-body items-center">
									<h2 className="card-title font-extrabold text-center">
										Income vs. Expense Trend
									</h2>
									<Line
										data={incomeExpenseChartData}
										options={incomeExpenseChartOptions}
									/>
								</div>
							</div>
						)}
					</div>
				)}

				{/* Modal */}
				{selectedReport && (
					<Modal onClose={closeModal}>
						<div className="max-h-[85vh] overflow-y-auto">
							<h2 className="text-2xl font-black py-8 text-center uppercase sticky top-0 bg-white z-10">
								{selectedReport}
							</h2>

							{/* Chart Section */}
							<div className="px-6 pb-6">
								{selectedReport === "Monthly Summary Expense" && (
									<Bar
										data={expenseChartData}
										options={expenseChartOptions}
									/>
								)}
								{selectedReport === "Budget vs. Actual Spending" && (
									<Bar
										data={{
											labels:
												modalData.length > 0
													? modalData.map((item) => item.category)
													: ["No Data"],
											datasets: [
												{
													label: "Budget (₱)",
													data:
														modalData.length > 0
															? modalData.map(
																	(item) => Number(item.budget) || 0,
																)
															: [0],
													backgroundColor: "#709fe8",
												},
												{
													label: "Actual Spending (₱)",
													data:
														modalData.length > 0
															? modalData.map(
																	(item) => Number(item.actual_spending) || 0,
																)
															: [0],
													backgroundColor: "#e8709f",
												},
											],
										}}
										options={{
											responsive: true,
											plugins: {
												legend: { position: "top" },
												title: {
													display: true,
													text: selectedBudgetMonth
														? `Budget vs. Actual Spending - ${selectedBudgetMonth}`
														: "Budget vs. Actual Spending",
												},
											},
											scales: {
												y: {
													beginAtZero: true,
													title: {
														display: true,
														text: "Amount (₱)",
													},
												},
											},
										}}
									/>
								)}
								{selectedReport === "Income vs. Expense Trend" && (
									<Line
										data={incomeExpenseChartData}
										options={incomeExpenseChartOptions}
									/>
								)}
							</div>

							{/* Table Headlines and Descriptions */}
							<div className="px-6 py-4 ">
								{selectedReport === "Monthly Summary Expense" && (
									<>
										<h3 className="text-xl font-bold text-center mb-2 text-forest-green">
											DETAILED MONTHLY EXPENSE BREAKDOWN
										</h3>
										<p className="text-sm text-gray-600 text-center mb-4">
											This table shows a comprehensive breakdown of your
											expenses by month and category. Use this data to track
											spending patterns, identify high-expense categories, and
											monitor your financial habits over time.
										</p>
									</>
								)}
								{selectedReport === "Budget vs. Actual Spending" && (
									<>
										<h3 className="text-xl font-bold text-center mb-2 text-forest-green">
											BUDGET PERFORMANCE ANALYSIS
										</h3>
										<p className="text-sm text-gray-600 text-center mb-4">
											This table compares your planned budget against actual
											spending for each category. Categories with actual
											spending exceeding budget indicate areas where you may
											need better financial control or budget adjustments.
										</p>
									</>
								)}
								{selectedReport === "Income vs. Expense Trend" && (
									<>
										<h3 className="text-xl font-bold text-center mb-2 text-forest-green">
											DAILY FINANCIAL FLOW ANALYSIS
										</h3>
										<p className="text-sm text-gray-600 text-center mb-4">
											This table displays your daily income and expenses,
											helping you understand your cash flow patterns. Track
											which days you earn more or spend more to better manage
											your daily financial decisions and identify trends.
										</p>
									</>
								)}
							</div>

							{/* Table Section */}
							<div className="px-6 pb-6">
								<div className="overflow-x-auto rounded-2xl shadow-lg border-2 border-forest-green">
									<table className="table w-full ">
										<thead className="bg-bright-green text-forest-green sticky ">
											<tr>
												{Object.keys(modalData[0] || {}).map((key) => (
													<th
														key={key}
														className="px-6 font-bold text-forest-green text-sm uppercase tracking-wide border-forest-green last:border-r-0 text-center border-b border-r-2"
													>
														{key.replace(/_/g, " ")}
													</th>
												))}
											</tr>
										</thead>
										<tbody>
											{modalData.map((row, index) => (
												<tr
													key={index}
													className={`${
														index % 2 === 0 ? "bg-white" : "bg-gray-100"
													} hover:bg-green-50 transition-colors duration-200 `}
												>
													{Object.entries(row).map(([key, value], idx) => {
														let formattedValue = value;

														// Format day dates for Income vs Expense Trend
														if (
															key === "day" &&
															typeof value === "string" &&
															!isNaN(Date.parse(value))
														) {
															const date = new Date(value);
															formattedValue = date.toLocaleDateString(
																"en-US",
																{
																	month: "long",
																	day: "numeric",
																	year: "numeric",
																},
															);
														}

														// Format month dates for Monthly Summary Expense (2025-06 -> June 2025)
														if (
															key === "month" &&
															typeof value === "string" &&
															value.match(/^\d{4}-\d{2}$/)
														) {
															const [year, monthNum] = value.split("-");
															const date = new Date(year, monthNum - 1); // monthNum - 1 because Date months are 0-indexed
															formattedValue = date.toLocaleDateString(
																"en-US",
																{
																	month: "long",
																	year: "numeric",
																},
															);
														}

														// Format currency values
														if (
															typeof value === "number" &&
															(key.includes("amount") ||
																key.includes("budget") ||
																key.includes("spending") ||
																key.includes("income") ||
																key.includes("expense") ||
																key.includes("total"))
														) {
															formattedValue = `₱${value.toLocaleString()}`;
														}

														// Format percentage values
														if (
															typeof value === "number" &&
															key.includes("percent")
														) {
															formattedValue = `${value.toFixed(1)}%`;
														}

														return (
															<td
																key={idx}
																className={`py-4 px-6 text-center font-medium text-gray-800 border-r border-forest-green last:border-r-0 ${
																	typeof value === "number" &&
																	(key.includes("amount") ||
																		key.includes("budget") ||
																		key.includes("spending") ||
																		key.includes("income") ||
																		key.includes("expense") ||
																		key.includes("total"))
																		? "font-bold text-forest-green"
																		: ""
																}`}
															>
																{formattedValue || "—"}
															</td>
														);
													})}
												</tr>
											))}
										</tbody>
									</table>
								</div>

								{/* Summary Footer for large tables */}
								{modalData.length > 10 && (
									<div className="mt-4 text-center text-sm text-gray-600 bg-gray-50 py-3 rounded-lg">
										<span className="font-medium">
											Showing {modalData.length} total records
										</span>
									</div>
								)}
							</div>
						</div>
					</Modal>
				)}
			</div>
		</div>
	);
}
