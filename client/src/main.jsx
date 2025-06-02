import { StrictMode, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Lenis from "@studio-freight/lenis";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

// AUTH PAGES
import Login from "./auth/Login.jsx";
import Signup from "./auth/Signup.jsx";
import NotFound from "./pages/NotFound.jsx";
import ForgotPassword from "./auth/ForgotPassword.jsx";
import ChangePassword from "./auth/ChangePassword.jsx";

// LANDING PAGE
import LandingPage from "./LandingPage.jsx";

// MAIN PAGES
import ObserverProvider from "./components/ObserverProvider.jsx";
import Dashboard from "./main/pages/Dashboard.jsx";
import Budget from "./main/pages/Budget.jsx";
import Reports from "./main/pages/Reports.jsx";
import GroupExpense from "./main/pages/GroupExpense.jsx";

// ROUTER SETUP
const router = createBrowserRouter([
  { path: "/", element: <LandingPage />, errorElement: <NotFound /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/forgotpassword", element: <ForgotPassword /> },
  { path: "/changepassword", element: <ChangePassword /> },
  { path: "/transactions", element: <Dashboard /> },
  { path: "/budget", element: <Budget /> },
  { path: "/reports", element: <Reports /> },
  { path: "/groupexpense", element: <GroupExpense /> },
]);

function App() {
  const lenis = useRef(null);

  useEffect(() => {
    lenis.current = new Lenis({
      duration: 0.5,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smooth: true,
      smoothTouch: true,
    });

    const animate = (time) => {
      lenis.current.raf(time);
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    return () => {
      lenis.current.destroy();
    };
  }, []);

  return (
    <ObserverProvider>
      {/* ToastContainer is now globally available */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="font-primary text-sm"
      />
      <RouterProvider router={router} />
    </ObserverProvider>
  );
}

// Mount the app
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);