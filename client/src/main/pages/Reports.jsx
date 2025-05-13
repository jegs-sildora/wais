import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import HomeNavSideBar from "../components/HomeSideBar";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
);

export default function Reports() {
	const [monthlyExpenses, setMonthlyExpenses] = useState([]);
	const [budgetVsActual, setBudgetVsActual] = useState([]);

	// Fetch monthly expenses from the backend
	useEffect(() => {
		const fetchMonthlyExpenses = async () => {
			try {
				const response = await fetch(
					"http://localhost:3000/reports/monthly-expenses",
					{
						credentials: "include",
					},
				);
				if (!response.ok) {
					throw new Error(
						`Failed to fetch monthly expenses: ${response.statusText}`,
					);
				}
				const data = await response.json();
				setMonthlyExpenses(data);
			} catch (error) {
				console.error("Error fetching monthly expenses:", error);
			}
		};

		const fetchBudgetVsActual = async () => {
			try {
				const response = await fetch(
					"http://localhost:3000/reports/budget-vs-actual",
					{
						credentials: "include",
					},
				);
				if (!response.ok) {
					throw new Error(
						`Failed to fetch budget vs actual spending: ${response.statusText}`,
					);
				}
				const data = await response.json();
				setBudgetVsActual(data);
			} catch (error) {
				console.error("Error fetching budget vs actual spending:", error);
			}
		};

		fetchMonthlyExpenses();
		fetchBudgetVsActual();
	}, []);

	// Process data for the stacked bar chart
	const categories = [
		...new Set(monthlyExpenses.map((expense) => expense.category)),
	]; // Unique categories
	const months = [...new Set(monthlyExpenses.map((expense) => expense.month))]; // Unique months

	const datasets = categories.map((category) => ({
		label: category,
		data: months.map((month) => {
			const expense = monthlyExpenses.find(
				(exp) => exp.month === month && exp.category === category,
			);
			return expense ? expense.total_expense : 0; // Default to 0 if no data
		}),
		backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
			Math.random() * 255,
		)}, ${Math.floor(Math.random() * 255)}, 0.6)`, // Random color for each category
		borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
			Math.random() * 255,
		)}, ${Math.floor(Math.random() * 255)}, 1)`,
		borderWidth: 1,
	}));

	// Get the current month and year dynamically
	const currentMonthYear = new Date().toLocaleString("default", {
		month: "long",
		year: "numeric",
	});

	// Update the chartData labels to use the current month and year
	const chartData = {
		labels: [currentMonthYear], // Dynamically set x-axis legend to the current month and year
		datasets: datasets, // Stacked datasets by category
	};
	const chartOptions = {
		responsive: true,
		plugins: {
			legend: {
				position: "top",
			},
			title: {
				display: true,
				text: "Monthly Expense Summary (Stacked by Category)",
			},
		},
		scales: {
			x: {
				stacked: true, // Enable stacking on the x-axis
			},
			y: {
				stacked: true, // Enable stacking on the y-axis
			},
		},
	};

	// Process data for Budget vs Actual Spending chart
	const budgetVsActualData = {
		labels: budgetVsActual.map((item) => item.category), // Categories
		datasets: [
			{
				label: "Budget (₱)",
				data: budgetVsActual.map((item) => item.budget), // Budget values
				backgroundColor: "rgba(75, 192, 192, 0.6)",
				borderColor: "rgba(75, 192, 192, 1)",
				borderWidth: 1,
			},
			{
				label: "Actual Spending (₱)",
				data: budgetVsActual.map((item) => item.actual_spending), // Actual spending values
				backgroundColor: "rgba(255, 99, 132, 0.6)",
				borderColor: "rgba(255, 99, 132, 1)",
				borderWidth: 1,
			},
		],
	};

	const budgetVsActualOptions = {
		responsive: true,
		plugins: {
			legend: {
				position: "top",
			},
			title: {
				display: true,
				text: "Budget vs Actual Spending",
			},
		},
		scales: {
			x: {
				stacked: false, // Disable stacking for grouped bars
			},
			y: {
				stacked: false, // Disable stacking for grouped bars
			},
		},
	};

	return (
		<div className="bg-base-100">
			<HomeNavSideBar />
			<div className="px-12 pt-6">
				<h1 className="text-3xl font-bold mb-4 font-secondary">REPORTS</h1>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Monthly Summary Expense */}
					<div className="card">
						<h2 className="text-lg font-bold mb-4 text-center uppercase">Monthly Summary Expense</h2>
						{monthlyExpenses.length > 0 ? (
							<Bar
								data={chartData}
								options={chartOptions}
							/>
						) : (
							<p>No data available for the selected period.</p>
						)}
					</div>

					{/* Budget vs Actual Spending */}
					<div className="card">
						<h2 className="text-lg font-bold mb-4 text-center uppercase">
							Budget vs Actual Spending
						</h2>
						{budgetVsActual.length > 0 ? (
							<Bar
								data={budgetVsActualData}
								options={budgetVsActualOptions}
							/>
						) : (
							<p>No data available for the selected period.</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
