import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function HomeNavSideBar() {
	const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // State for logout modal
	const navigate = useNavigate(); // For navigation

	const handleLogout = async () => {
		try {
			const response = await fetch("http://localhost:3000/logout", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include", // Include cookies for session management
			});

			if (response.ok) {
				toast.success("Logged out successfully!");
				setIsLogoutModalOpen(false); // Close the modal
				navigate("/"); // Redirect to the home page
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
			<div className="navbar bg-base-100 shadow-sm">
				<div className="navbar-start ml-5">
					<div className="dropdown">
						<div
							tabIndex={0}
							role="button"
							className="btn btn-ghost btn-circle"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M4 6h16M4 12h16M4 18h7"
								/>
							</svg>
						</div>
						<ul
							tabIndex={0}
							className="menu menu-lg dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
						>
							<li>
								<a>Dashboard</a>
							</li>
							<li>
								<a>Budget</a>
							</li>
						</ul>
					</div>
				</div>
				<div className="flex">
					<a className="btn btn-ghost text-4xl text-forest-green font-secondary">
						WAIS
					</a>
				</div>
				<div className="navbar-end mr-5">
					<div className="dropdown dropdown-end">
						<div
							tabIndex={0}
							role="button"
							className="btn btn-ghost btn-circle avatar"
						>
							<div className="w-10 rounded-full">
								<img
									alt="Profile"
									src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
								/>
							</div>
						</div>
						<ul
							tabIndex={0}
							className="menu menu-lg dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
						>
							<li>
								<a>Profile</a>
							</li>
							<li>
								<a>Settings</a>
							</li>
							<li>
								<a
									role="button"
									onClick={() => setIsLogoutModalOpen(true)} // Open the logout modal
								>
									Log out
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>

			{/* Logout Confirmation Modal */}
			{isLogoutModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-[0.1] backdrop-blur-lg">
					<div className="bg-white rounded-lg shadow-lg w-1/3 p-8">
						<h2 className="text-xl font-bold text-center text-forest-green">
							Confirm Logout
						</h2>
						<p className="text-center text-forest-green mt-4">
							Are you sure you want to log out?
						</p>
						<div className="flex justify-center gap-4 mt-8">
							<button
								type="button"
								className="px-4 py-2 font-bold text-forest-green bg-gray-200 rounded hover:bg-gray-300"
								onClick={() => setIsLogoutModalOpen(false)} // Close the modal
							>
								Cancel
							</button>
							<button
								type="button"
								className="px-4 py-2 font-bold text-forest-green bg-bright-green rounded hover:bg-bright-green-hover"
								onClick={handleLogout} // Call logout function
							>
								Log out
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
