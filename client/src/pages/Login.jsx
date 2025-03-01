import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Toaster, toast } from "sonner";
import FormNav from "../components/FormNav";
import logo from "../assets/logo.png";

export default function Login() {
  const [usernameOrEmail, dataUsernameOrEmail] = useState("");
  const [password, dataPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!usernameOrEmail || !password) {
      toast.error("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const userData = {
        usernameOrEmail: usernameOrEmail,
        password: password,
      };
      const response = await fetch("http://192.168.73.109:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Log in successfully!");
        setTimeout(() => navigate("/"), 3000);
      } else {
        toast.error(data.error || "Invalid credentials, please try again.");
      }
    } catch (err) {
      console.error("Login failed", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FormNav title={"WAIS."} />
      <div className='flex flex-col h-screen justify-center px-6 md:mt-0 bg-[url("/src/assets/blurry_bg.svg")] bg-cover bg-center'>
        <div className='sm:mx-auto sm:w-full sm:max-w-sm'>
          <img
            className='mx-auto h-20 w-auto motion-preset-focus motion-preset-oscillate motion-safe:motion-ease-spring-smooth'
            src={logo}
          />
          <h2 className='mt-5 text-center text-2xl font-bold tracking-tight text-forest-green'>
            Welcome back!
          </h2>
        </div>

        <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
          <form
            className='space-y-6'
            onSubmit={handleSubmit}
          >
            <div>
              <label
                htmlFor='email'
                className='block text-lg font-bold text-forest-green'
              >
                Username or email address
              </label>
              <div className='mt-2'>
                <input
                  type='text'
                  name='email'
                  placeholder='sample@sample.com'
                  required
                  autoComplete='off'
                  className='block w-full rounded-md bg-white px-3 py-1.5 text-lg text-forest-green placeholder-gray-400 outline-1 focus:outline-2 focus:outline-forest-green'
                  value={usernameOrEmail}
                  onChange={(e) => dataUsernameOrEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className='flex items-center justify-between'>
                <label
                  htmlFor='password'
                  className='block text-lg font-bold text-forest-green'
                >
                  Password
                </label>
                <div className='text-base'>
                  <a
                    href='#'
                    className='text-forest-green hover:underline italic'
                  >
                    Forgot password?
                  </a>
                </div>
              </div>
              <div className='relative mt-2'>
                <input
                  type={showPassword ? "text" : "password"}
                  name='password'
                  placeholder='********'
                  required
                  autoComplete='off'
                  className='block w-full rounded-md bg-white px-3 py-1.5 text-lg text-forest-green placeholder-gray-400 outline-1 focus:outline-2 focus:outline-forest-green pr-10'
                  value={password}
                  onChange={(e) => dataPassword(e.target.value)}
                />
                <button
                  type='button'
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-forest-green pr-1.5'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon size={24} />
                  ) : (
                    <EyeIcon size={24} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type='submit'
                className={`flex w-full justify-center rounded-4xl bg-bright-green px-3 py-1.5 text-lg font-bold text-forest-green shadow-xs outline-3 outline-offset-3 outline-forest-green hover:bg-bright-green-hover hover:text-forest-green focus-visible:outline-2 focus-visible:outline-offset-2 mt-10 ${
                  loading ? "cursor-not-allowed opacity-50" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log in"}
              </button>
            </div>
          </form>

          <p className='mt-5 text-center text-base text-forest-green'>
            New to WAIS?&nbsp;
            <Link
              to='/signup'
              className='font-bold underline'
            >
              Sign Up.
            </Link>
          </p>

          <Toaster
            richColors
            position='top-right'
            toastOptions={{
              className: "font-primary text-5xl",
            }}
          />
        </div>
      </div>
    </>
  );
}
