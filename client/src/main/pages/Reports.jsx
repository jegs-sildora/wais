import { useState, useEffect } from "react";
import { Bar, Line } from "react-chartjs-2"; // Import Line chart from react-chartjs-2
import HomeNavSideBar from "../components/HomeSideBar";
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
	const [selectedExpenseMonth, setSelectedExpenseMonth] = useState("");
	const [selectedBudgetMonth, setSelectedBudgetMonth] = useState("");
	const [incomeVsExpense, setIncomeVsExpense] = useState([]);

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
			// Use start_date or month property to parse date
			const dateStr = item.start_date || item.month || item.date;
			if (!dateStr) return false;
			const date = new Date(dateStr);
			const itemMonth = date.toLocaleString("en-US", { month: "long" });
			return itemMonth === monthName;
		});
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
		labels: expenseMonths,
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

	// Budget Chart filtered by selected month frontend
	const filteredBudget = budgetVsActual; // No client-side filtering needed

	const budgetChartData = {
		labels: filteredBudget.map((item) => item.category),
		datasets: [
			{
				label: "Budget (₱)",
				data: filteredBudget.map((item) => Number(item.budget) || 0),
				backgroundColor: "rgba(75, 192, 192, 0.6)",
			},
			{
				label: "Actual Spending (₱)",
				data: filteredBudget.map((item) => Number(item.actual_spending) || 0),
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
		labels: incomeVsExpense.map((item) => item.month),
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

	const incomeExpenseChartOptions = {
		responsive: true,
		plugins: {
			legend: { position: "top" },
			title: {
				display: true,
				text: "Income vs Expense Trend",
			},
		},
		scales: {
			x: { title: { display: true, text: "Month" } },
			y: { title: { display: true, text: "Amount (₱)" } },
		},
	};

	return (
		<div className="bg-base-100 ml-64 min-h-screen p-6 relative">
			<HomeNavSideBar />
			<div className="px-12 pt-6">
				<h1 className="text-3xl font-bold mb-4 font-secondary text-center">
					REPORTS
				</h1>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Monthly Summary Expense */}
					{monthlyExpenses.length > 0 && (
						<div className="card w-full shadow-sm bg-white">
							<div className="card-body items-center">
								<h2 className="card-title font-extrabold">
									Monthly Summary Expense
								</h2>
								<div className="mb-2 w-full flex justify-center">
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
					{Array.isArray(budgetVsActual) && (
						<div className="card w-full shadow-sm bg-white">
							<div className="card-body items-center">
								<h2 className="card-title font-extrabold">
									Budget vs. Actual Spending
								</h2>
								<div className="mb-2 w-full flex justify-center">
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
				</div>

				{/* Income vs Expense Trend */}
				{incomeVsExpense.length > 0 && (
					<div className="card w-full shadow-sm bg-white mt-6">
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

				{/* No reports fallback */}
				{monthlyExpenses.length === 0 &&
					(!Array.isArray(budgetVsActual) || budgetVsActual.length === 0) &&
					incomeVsExpense.length === 0 && (
						<div className="flex flex-col items-center justify-center mt-64">
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
								/>
								<line
									x1="12"
									y1="16"
									x2="12"
									y2="12"
								/>
								<line
									x1="12"
									y1="8"
									x2="12"
									y2="8"
								/>
							</svg>
							<p className="text-lg font-semibold text-gray-500">
								No reports here yet — start by{" "}
								<span className="font-bold">creating a budget</span>!
							</p>
						</div>
					)}
			</div>
		</div>
	);
}
