import { Link } from "react-router-dom";
import { X } from "lucide-react";

export default function FormNav() {
	return (
		<>
			<nav>
				<div className="fixed top-0 left-0 w-full z-50 navbar shadow-sm px-10 md:px-15 lg:px-20 bg-white">
					<div className="navbar-start">
						<Link
							to="/"
							className={`group text-4xl font-secondary text-forest-green motion-blur-in motion-opacity-in hover:underline decoration-bright-green`}
						>
							WAIS
							<span className="text-forest-green group-hover:text-bright-green-hover">
								.
							</span>
						</Link>
					</div>
					<div className="navbar-end">
						<div className="hover:drop-shadow-sm motion-blur-in motion-opacity-in">
							<Link
								to="/"
							>
								<X size={38} strokeWidth={3} className="hover:bg-gray-200 hover:rounded-4xl p-1.5"/>
							</Link>
						</div>
					</div>
				</div>
			</nav>
		</>
	);
}
