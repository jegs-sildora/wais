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
				let url = "http://localhost:3000/reports/budget-vs-actual";

				if (selectedBudgetMonth) {
					const monthIndex = allMonths.indexOf(selectedBudgetMonth);
					if (monthIndex !== -1) {
						const now = new Date();
						const year = now.getFullYear();
						const monthNum = String(monthIndex + 1).padStart(2, "0");
						url += `?month=${year}-${monthNum}`;
					}
				}

				const res = await fetch(url, { credentials: "include" });
				const data = await res.json();
				setBudgetVsActual(Array.isArray(data) ? data : []);
			} catch (error) {
				console.error("Error fetching budget vs actual:", error);
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
		scales: { x: { stacked: true }, y: { stacked: true } },
	};

	// Budget Chart
	const budgetChartData = {
		labels: budgetVsActual.map((item) => item.category),
		datasets: [
			{
				label: "Budget (₱)",
				data: budgetVsActual.map((item) => Number(item.budget) || 0),
				backgroundColor: "rgba(75, 192, 192, 0.6)",
			},
			{
				label: "Actual Spending (₱)",
				data: budgetVsActual.map((item) => Number(item.actual_spending) || 0),
				backgroundColor: "rgba(255, 99, 132, 0.6)",
			},
		],
	};

	const budgetChartOptions = {
		responsive: true,
		plugins: {
			legend: { position: "top" },
			title: { display: true, text: "Budget vs. Actual Spending" },
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
				borderColor: "rgba(75, 192, 192, 1)",
				backgroundColor: "rgba(75, 192, 192, 0.2)",
				fill: true,
			},
			{
				label: "Expense (₱)",
				data: incomeVsExpense.map((item) => Number(item.expense) || 0),
				borderColor: "rgba(255, 99, 132, 1)",
				backgroundColor: "rgba(255, 99, 132, 0.2)",
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
				budgetVsActual.length === 0 &&
				incomeVsExpense.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-132 mt-20">
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
						<p className="text-lg font-semibold text-gray-500 ">
							No reports here yet — start by{" "}
							<span className="font-bold">creating your budget first!</span>
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Monthly Summary Expense */}
						{monthlyExpenses.length >= 0 && (
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
											className="select select-bordered"
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
									<Bar
										data={expenseChartData}
										options={expenseChartOptions}
									/>
								</div>
							</div>
						)}

						{/* Budget vs Actual Spending */}
						{Array.isArray(budgetVsActual) && budgetVsActual.length >= 0 && (
							<div
								className="card w-full shadow-sm bg-white cursor-pointer"
								onClick={() =>
									handleReportClick(
										"Budget vs. Actual Spending",
										budgetVsActual,
									)
								}
							>
								<div className="card-body items-center">
									<h2 className="card-title font-extrabold">
										Budget vs. Actual Spending
									</h2>
									<div
										className="mb-2 w-full flex justify-center"
										onClick={(e) => e.stopPropagation()} // Prevent modal from opening
									>
										<select
											className="select select-bordered"
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
									<Bar
										data={budgetChartData}
										options={budgetChartOptions}
									/>
								</div>
							</div>
						)}

						{/* Income vs Expense Trend */}
						{incomeVsExpense.length > 0 && (
							<div
								className="card w-full shadow-sm bg-white cursor-pointer col-span-2 mb-10"
								onClick={() =>
									handleReportClick("Income vs Expense Trend", incomeVsExpense)
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
						<h2 className="text-2xl font-black py-8 text-center uppercase">
							{selectedReport}
						</h2>
						{/* Render the graph */}
						{selectedReport === "Monthly Summary Expense" && (
							<Bar
								data={expenseChartData}
								options={expenseChartOptions}
							/>
						)}
						{selectedReport === "Budget vs. Actual Spending" && (
							<Bar
								data={budgetChartData}
								options={budgetChartOptions}
							/>
						)}
						{selectedReport === "Income vs Expense Trend" && (
							<Line
								data={incomeExpenseChartData}
								options={incomeExpenseChartOptions}
							/>
						)}

						{/* Render the table */}
						<div className="overflow-x-auto rounded-box px-6 py-6 items-center">
							<table className="table items-center bg-white shadow-md">
								<thead className="text-center">
									<tr className="uppercase">
										{Object.keys(modalData[0] || {}).map((key) => (
											<th
												key={key}
												className="py-6"
											>
												{key}
											</th>
										))}
									</tr>
								</thead>
								<tbody className="text-center mb-6">
									{modalData.map((row, index) => (
										<tr
											key={index}
											className="font-bold"
										>
											{Object.entries(row).map(([key, value], idx) => {
												let formattedValue = value;

												if (
													key === "day" &&
													typeof value === "string" &&
													!isNaN(Date.parse(value))
												) {
													const date = new Date(value);
													formattedValue = date.toLocaleDateString("en-US", {
														month: "long",
														day: "numeric",
														year: "numeric",
													}); 
												}

												return (
													<td
														key={idx}
														className="mb-6"
													>
														{formattedValue}
													</td>
												);
											})}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</Modal>
				)}
			</div>
		</div>
	);
}
