import { Link as RouterLink } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";

export default function LandingPageNavBar() {
  return (
    <>
      <nav>
        <div className='fixed top-0 left-0 w-full z-50 navbar shadow-sm md:px-20 bg-white'>
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
                className='menu menu-lg dropdown-content rounded-box mt-3 w-36 p-2 shadow'
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
              className='group text-4xl font-secondary text-forest-green motion-blur-in motion-opacity-in'
            >
              WAIS
              <span className='text-forest-green group-hover:text-bright-green-hover'>
                .
              </span>
            </RouterLink>
          </div>
          <div className='navbar-center hidden lg:flex'>
            <ul className='menu menu-horizontal px-1 font-bold text-base'>
              <li className=' hover:bg-bright-green rounded-4xl '>
                <ScrollLink
                  to='home'
                  smooth={true}
                  duration={800}
                >
                  Home
                </ScrollLink>
              </li>
              <li className='hover:bg-bright-green rounded-4xl focus:bg-bright-green'>
                <ScrollLink
                  to='about'
                  smooth={true}
                  duration={800}
                >
                  About
                </ScrollLink>
              </li>
              <li className='hover:bg-bright-green rounded-4xl'>
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
          <div className='navbar-end'>
            <RouterLink
              to='/login'
              className='btn rounded-4xl text-base bg-bright-green hover:bg-bright-green-hover'
            >
              Get Started
            </RouterLink>
          </div>
        </div>
      </nav>
    </>
  );
}
