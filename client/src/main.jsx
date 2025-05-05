import { StrictMode, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import Lenis from "@studio-freight/lenis";
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
import ObserverProvider from "./components/ObserverProvider.jsx";
import Budget from "./main/pages/Budget.jsx";

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
    element: <ChangePassword />,
  },
  {
    path: "/budget",
    element: <Budget />
  }
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
    <>
      <ObserverProvider>
        <Toaster
          richColors
          position='top-right'
          toastOptions={{
            className: "font-primary text-5xl",
          }}
        />
        <RouterProvider router={router} />
      </ObserverProvider>
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
