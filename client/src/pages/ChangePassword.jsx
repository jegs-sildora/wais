import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";

export default function ChangePassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!password || !confirmPassword) {
      toast.error("Both password fields are required.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match! Please try again.");
      setLoading(false);
      return;
    }

    try {
      const requestBody = {
        email: email,
        password: password,
      };

      const response = await fetch("http://172.16.150.50:3000/changepassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Password updated successfully! Redirecting...");
        setTimeout(() => navigate("/login"), 2500);
      } else {
        toast.error(data.error || "Failed to update password.");
      }
    } catch (err) {
      console.error("Password update failed", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className='flex flex-col h-screen justify-center px-6 pt-26 lg:pt-0 bg-[url("/src/assets/blurry_bg.svg")] bg-cover bg-center'>
        <div className='sm:mx-auto sm:w-full sm:max-w-sm'>
          <h2 className='text-left text-2xl font-bold tracking-tight text-forest-green'>
            Change Password
          </h2>
        </div>

        <div className='mt-5 sm:mx-auto sm:w-full sm:max-w-sm'>
          <form
            className='space-y-6'
            onSubmit={handleSubmit}
          >
            <div>
              <div className='flex items-center justify-between'>
                <label
                  htmlFor='password'
                  className='block text-lg font-bold text-forest-green'
                >
                  Password
                </label>
              </div>
              <div className='relative mt-2'>
                <input
                  type={showPassword ? "text" : "password"}
                  name='password'
                  id='password'
                  placeholder='········'
                  required
                  autoComplete='off'
                  className='block w-full rounded-md bg-white px-3 py-1.5 text-lg text-forest-green placeholder:text-gray-400 outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 focus:outline-forest-green ring-forest-green'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <div className='flex items-center justify-between'>
                <label
                  htmlFor='password'
                  className='block text-lg font-bold text-forest-green'
                >
                  Confirm Password
                </label>
              </div>
              <div className='relative mt-2'>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name='password'
                  id='password'
                  placeholder='········'
                  required
                  autoComplete='off'
                  className='block w-full rounded-md bg-white px-3 py-1.5 text-lg text-forest-green placeholder:text-gray-400 outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 focus:outline-forest-green ring-forest-green'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type='button'
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-forest-green pr-1.5'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
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
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </form>

          <p className='mt-5 text-center text-base text-forest-green'>
            Already have an account?&nbsp;
            <Link
              to='/login'
              className='font-bold underline'
            >
              Log in.
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
