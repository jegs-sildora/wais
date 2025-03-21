import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import * as motion from 'motion/react-client';
import FormNav from '../components/FormNav';

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [email, dataEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email) {
      toast.error('Please fill input email.');
      setLoading(false);
      return;
    }

    try {
      const userEmail = {
        email: email,
      };

      const response = await fetch(
        'http://192.168.113.109:3000/forgotpassword',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userEmail),
        },
      );

      const data = await response.json();

      if (response.ok) {
        toast.success('Email found! Redirecting...');
        setTimeout(() => {
          navigate('/changepassword', { state: { email } });
        }, 2500);
      } else {
        toast.error(data.error || 'Email not found!');
      }
    } catch (err) {
      console.error('Login failed', err);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FormNav title={'BACK'} textClassName='text-2xl' />
      <div className='flex flex-col h-screen justify-center px-6 pt-26 lg:pt-0 bg-[url("/src/assets/blurry_bg.svg")] bg-cover bg-center'>
        <div className='sm:mx-auto sm:w-full sm:max-w-sm'>
          <h2 className='text-left text-2xl font-bold tracking-tight text-forest-green'>
            Find your account
          </h2>
        </div>

        <div className='mt-5 sm:mx-auto sm:w-full sm:max-w-sm'>
          <form className='space-y-6' onSubmit={handleSubmit}>
            <div>
              <label htmlFor='email' className='text-forest-green block pb-3'>
                Enter your email to search for your account.
              </label>
              <div className='mt-2'>
                <input
                  type='email'
                  name='email'
                  placeholder='Enter email'
                  autoComplete='off'
                  className='block w-full rounded-md bg-white px-3 py-1.5 text-lg text-forest-green placeholder-gray-400 outline-1 focus:outline-2 focus:outline-forest-green input validator  placeholder:text-base'
                  value={email}
                  onChange={(e) => dataEmail(e.target.value)}
                />
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.99 }}>
              <button
                type='submit'
                className={`flex w-full justify-center rounded-4xl bg-bright-green px-3 py-1.5 text-lg font-bold text-forest-green shadow-xs outline-3 outline-offset-3 outline-forest-green hover:bg-bright-green-hover hover:text-forest-green focus-visible:outline-2 focus-visible:outline-offset-2 mt-10 ${
                  loading ? 'cursor-not-allowed opacity-50' : ''
                }`}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </motion.div>
          </form>

          <p className='mt-5 text-center text-base text-forest-green'>
            Already have an account?&nbsp;
            <Link to='/login' className='font-bold underline'>
              Log in.
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
