import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import FormNav from "../components/FormNav";
import { Toaster, toast } from "sonner";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onCreateAccount = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!username || !email || !password) {
      toast.error("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const body = { username, email, password };
      const response = await fetch("http://192.168.254.109:3000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      setTimeout(() => {
        if (response.ok) {
          toast.success("Account created successfully!");
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          toast.error(data.error || "Signup failed. Please try again.");
        }
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error(err.message);
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <FormNav
        title={"BACK"}
        textClassName='text-2xl'
      />

      <div className='flex flex-col h-screen justify-center px-6 py-12 lg:px-8 md:mt-0'>
        <div className='sm:mx-auto sm:w-full sm:max-w-sm'>
          <h2 className='text-center text-2xl/9 font-bold tracking-tight text-forest-green'>
            Create your&nbsp;
            <Link to='/'>
              <span className='font-secondary text-5xl'>WAIS</span>
            </Link>
            &nbsp;account!
          </h2>
          <p className='mt-4 text-center text-base font-light text-forest-green'>
            Already have an account?&nbsp;
            <Link
              to='/login'
              className='font-bold underline'
            >
              Log in.
            </Link>
          </p>
        </div>
        <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
          <form
            className='space-y-6'
            onSubmit={onCreateAccount}
          >
            <div>
              <label
                htmlFor='username'
                className='block text-lg font-bold text-forest-green'
              >
                Username
              </label>
              <div className='mt-2'>
                <input
                  type='text'
                  name='username'
                  id='username'
                  placeholder='sample'
                  required
                  autoComplete='off'
                  className='block w-full rounded-md bg-white px-3 py-1.5 text-lg text-forest-green placeholder:text-gray-400 outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 focus:outline-forest-green ring-forest-green'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor='email'
                className='block text-lg font-semibold text-forest-green'
              >
                Email address
              </label>
              <div className='mt-2'>
                <input
                  type='email'
                  name='email'
                  id='email'
                  placeholder='sample@sample.com'
                  required
                  autoComplete='off'
                  className='block w-full rounded-md bg-white px-3 py-1.5 text-lg text-forest-green placeholder:text-gray-400 outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 focus:outline-forest-green ring-forest-green'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
              </div>
              <div className='relative mt-2'>
                <input
                  type={showPassword ? "text" : "password"}
                  name='password'
                  id='password'
                  placeholder='********'
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
              <button
                type='submit'
                disabled={loading}
                className='flex w-full justify-center rounded-4xl bg-bright-green px-3 py-1.5 text-lg font-bold text-forest-green shadow-xs outline-3 outline-offset-3 outline-forest-green hover:bg-bright-green-hover hover:text-forest-green focus-visible:outline-2 focus-visible:outline-offset-2 mt-10'
              >
                {loading ? "Creating account..." : "Create account"}
              </button>

              <div className='flex items-center justify-center mt-5'>
                <label
                  htmlFor='terms'
                  className='ms-4 text-sm text-forest-green'
                >
                  By registering, you accept our&nbsp;
                  <a
                    href='#'
                    className='text-forest-green underline font-bold'
                  >
                    terms and conditions.
                  </a>
                </label>
              </div>
            </div>
          </form>
          <Toaster
            richColors
            position='top-right'
          />
        </div>
      </div>
    </>
  );
}
