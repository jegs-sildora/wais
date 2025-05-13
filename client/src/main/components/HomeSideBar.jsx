import { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function HomeNavSideBar() {
	const modalRef = useRef(null);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const navigate = useNavigate();

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
							className="menu menu-lg dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow"
						>
							<li>
								<Link to="/transactions">Transactions</Link>
							</li>
							<li>
								<Link to="/budget">Budgets</Link>
							</li>
              <li>
								<Link to="/reports">Reports</Link>
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
					<div className="relative">
						<div
							role="button"
							className="btn btn-ghost btn-circle avatar"
							onClick={() => setIsDropdownOpen((prev) => !prev)}
						>
							<div className="w-10 rounded-full">
								<img
									alt="Profile"
									src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
								/>
							</div>
						</div>

						{isDropdownOpen && (
							<ul className="absolute right-0 mt-3 w-52 p-2 shadow menu menu-lg bg-base-100 rounded-box z-20">
								<li>
									<a>Profile</a>
								</li>
								<li>
									<a>Settings</a>
								</li>
								<li>
									<button
										className="w-full text-left"
										onClick={() => {
											setIsDropdownOpen(false);
											modalRef.current?.showModal();
										}}
									>
										Log out
									</button>
								</li>
							</ul>
						)}
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
							className="btn btn-primary"
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
