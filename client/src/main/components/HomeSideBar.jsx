import { useRef, useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import {
	Wallet,
	BarChart,
	FileText,
	LogOut,
	ChevronDown,
	Users,
} from "lucide-react";

export default function HomeNavSideBar() {
	const modalRef = useRef(null);
	const navigate = useNavigate();
	const [userData, setUserData] = useState({ username: "", email: "" });

	// Initialize from localStorage or default to false
	const [isTransactionCollapsed, setIsTransactionCollapsed] = useState(() => {
		const saved = localStorage.getItem("isTransactionCollapsed");
		return saved === "true";
	});

	useEffect(() => {
		// Save state to localStorage whenever it changes
		localStorage.setItem("isTransactionCollapsed", isTransactionCollapsed);
	}, [isTransactionCollapsed]);

	useEffect(() => {
		// Fetch user data from the database
		const fetchUserData = async () => {
			try {
				const response = await fetch("http://localhost:3000/currentuser", {
					method: "GET",
					credentials: "include",
				});
				if (response.ok) {
					const data = await response.json();
					setUserData(data);
				} else {
					toast.error("Failed to fetch user data.");
				}
			} catch (err) {
				console.error("Error fetching user data:", err);
				toast.error("An error occurred while fetching user data.");
			}
		};

		fetchUserData();
	}, []);

	const handleLogout = async () => {
		try {
			const response = await fetch("http://localhost:3000/logout", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			if (response.ok) {
				toast.success("Logged out successfully!");
				modalRef.current?.close();
				navigate("/");
			} else {
				toast.error("Failed to log out. Please try again.");
			}
		} catch (err) {
			console.error("Error logging out:", err);
			toast.error("An error occurred while logging out.");
		}
	};

	return (
		<>
			{/* Fixed Left Sidebar with Top Layer */}
			<div className="fixed top-0 left-0 h-full w-64 bg-base-100 shadow-lg flex flex-col z-50">
				<div className="flex items-center justify-center py-6">
					<a className="text-4xl text-forest-green font-secondary">WAIS</a>
				</div>
				<hr className="w-60 mx-auto mb-4 border-2 rounded-4xl"></hr>
				<ul className="menu menu-lg p-4">
					{/* Transactions Nav Link */}
					<li className="mb-1.5">
						<NavLink
							to="/transactions"
							className={({ isActive }) =>
								`flex items-center gap-2 p-2 rounded-lg cursor-pointer w-56 ${
									isActive ? "bg-bright-green font-bold" : ""
								}`
							}
						>
							<div className="flex items-center gap-2">
								<Wallet size={20} />
								<span>Transactions</span>
								<div
									className="cursor-pointer"
									onClick={(e) => {
										e.preventDefault();
										setIsTransactionCollapsed(!isTransactionCollapsed);
									}}
								>
									<ChevronDown
										size={20}
										className={`ml-8 transition-transform duration-300 ${
											isTransactionCollapsed ? "-rotate-180" : ""
										}`}
									/>
								</div>
							</div>
						</NavLink>
						{/* Sub Nav Links */}
						{isTransactionCollapsed && (
							<ul className=" mt-2">
								<li className="mb-1.5">
									<NavLink
										to="/groupexpense"
										className={({ isActive }) =>
											`flex items-center gap-2 p-2 rounded-lg ${
												isActive
													? "bg-bright-green  font-bold"
													: "hover:bg-gray-200"
											}`
										}
									>
										<Users size={20} />
										Group Expense
									</NavLink>
								</li>
							</ul>
						)}
					</li>
					{/* Budgets Nav Link */}
					<li className="mb-1.5">
						<NavLink
							to="/budget"
							className={({ isActive }) =>
								`flex items-center gap-2 p-2 rounded-lg ${
									isActive
										? "bg-bright-green w-56 font-bold"
										: "hover:bg-gray-200"
								}`
							}
						>
							<BarChart size={20} /> Budgets
						</NavLink>
					</li>
					{/* Reports Nav Link */}
					<li className="mb-1.5">
						<NavLink
							to="/reports"
							className={({ isActive }) =>
								`flex items-center gap-2 p-2 rounded-lg ${
									isActive
										? "bg-bright-green w-56 font-bold"
										: "hover:bg-gray-200"
								}`
							}
						>
							<FileText size={20} /> Reports
						</NavLink>
					</li>
				</ul>
				<div className="mt-auto p-4 flex items-center gap-4">
					{/* Avatar */}
					<div className="btn btn-ghost btn-circle avatar">
						<div className="rounded-full">
							<img
								alt="Profile"
								src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
							/>
						</div>
					</div>
					{/* User Info */}
					<div className="flex flex-col text-sm">
						<span className="font-bold">{userData.username}</span>
						<hr></hr>
						<span className="text-xs text-gray-500">{userData.email}</span>
					</div>
					{/* Logout Icon */}
					<div
						className="btn btn-ghost btn-circle ml-10"
						onClick={() => modalRef.current?.showModal()}
					>
						<LogOut size={24} />
					</div>
				</div>
			</div>

			{/* Logout Confirmation Modal */}
			<dialog
				id="my_modal_2"
				className="modal"
				ref={modalRef}
			>
				<div className="modal-box text-center">
					<h3 className="font-bold text-lg">CONFIRM LOGOUT</h3>
					<p className="py-2">Are you sure you want to log out?</p>
					<div className="modal-action flex justify-center">
						<form method="dialog">
							<button className="btn font-black">CANCEL</button>
						</form>
						<button
							className="btn btn-primary font-black"
							onClick={handleLogout}
						>
							LOG OUT
						</button>
					</div>
				</div>
			</dialog>
		</>
	);
}
