import { Link as RouterLink } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import * as motion from "motion/react-client";

export default function LandingPageNavBar() {
  return (
    <>
      <nav>
        <div className='fixed top-0 left-0 w-full z-50 navbar shadow-sm lg:px-20 bg-white'>
          <div className='navbar-start'>
            <div className='dropdown'>
              <div
                tabIndex={0}
                className='btn btn-ghost lg:hidden'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M4 6h16M4 12h8m-8 6h16'
                  />
                </svg>
              </div>
              <ul
                tabIndex={0}
                className='menu menu-lg dropdown-content rounded-box mt-3 w-36 p-2 shadow bg-white'
              >
                <li className='rounded-4xl hover:bg-bright-green'>
                  <ScrollLink
                    to='home'
                    smooth={true}
                    duration={800}
                  >
                    Home
                  </ScrollLink>
                </li>
                <li className='rounded-4xl hover:bg-bright-green'>
                  <ScrollLink
                    to='about'
                    smooth={true}
                    duration={800}
                  >
                    About
                  </ScrollLink>
                </li>
                <li className='rounded-4xl hover:bg-bright-green'>
                  <ScrollLink
                    to='contact'
                    smooth={true}
                    duration={800}
                  >
                    Contact Us
                  </ScrollLink>
                </li>
              </ul>
            </div>
            <RouterLink
              to='/'
              className='group text-4xl font-secondary text-forest-green motion-blur-in motion-opacity-in hover:underline decoration-bright-green'
            >
              WAIS
              <span className='text-forest-green group-hover:text-bright-green-hover'>
                .
              </span>
            </RouterLink>
          </div>
          <div className='navbar-center hidden lg:flex'>
            <ul className='menu menu-horizontal px-1 font-bold text-base'>
              <motion.li
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.99 }}
                className='hover:bg-bright-green rounded-4xl hover:drop-shadow-sm motion-blur-in motion-opacity-in'
              >
                <ScrollLink
                  to='home'
                  smooth={true}
                  duration={1600}
                >
                  Home
                </ScrollLink>
              </motion.li>
              <motion.li
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.99 }}
                className='hover:bg-bright-green rounded-4xl hover:drop-shadow-sm motion-blur-in motion-opacity-in'
              >
                <ScrollLink
                  to='about'
                  smooth={true}
                  duration={1600}
                >
                  About
                </ScrollLink>
              </motion.li>
              <motion.li
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.99 }}
                className='hover:bg-bright-green rounded-4xl hover:drop-shadow-sm motion-blur-in motion-opacity-in'
              >
                <ScrollLink
                  to='contact'
                  smooth={true}
                  duration={1600}
                >
                  Contact Us
                </ScrollLink>
              </motion.li>
            </ul>
          </div>
          <div className='navbar-end'>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.99 }}
              className='hover:bg-bright-green rounded-4xl hover:drop-shadow-sm motion-blur-in motion-opacity-in'
            >
              <RouterLink
                to='/login'
                className='btn rounded-4xl text-base bg-bright-green hover:bg-bright-green-hover font-bold'
              >
                Get Started
              </RouterLink>
            </motion.div>
          </div>
        </div>
      </nav>
    </>
  );
}
