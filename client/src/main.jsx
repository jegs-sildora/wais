import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import "./index.css";

//AUTH PAGES
import Login from "./auth/Login.jsx";
import Signup from "./auth/Signup.jsx";
import NotFound from "./pages/NotFound.jsx";
import ForgotPassword from "./auth/ForgotPassword.jsx";
import ChangePassword from "./auth/ChangePassword.jsx";

//LANDING PAGES
import LandingPage from "./LandingPage.jsx";

//MAIN PAGE
import Home from "./main/pages/Home.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <NotFound />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/forgotpassword",
    element: <ForgotPassword />,
  },
  {
    path: "/changepassword",
    element: <ChangePassword />
  }
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Toaster
      richColors
      position='top-right'
      toastOptions={{
        className: "font-primary text-5xl",
      }}
    />
    <RouterProvider router={router} />
  </StrictMode>,
);
