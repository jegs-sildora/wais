import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <>
      <nav
        className="fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600"
      >
        <div
          className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4"
        >
          <Link to="/" class="flex items-center space-x-3">
            <span
              className="self-center text-5xl font-semibold whitespace-nowrap font-secondary motion-preset-blur-right"
              >WAIS.</span
            >
          </Link>
          <div className="flex md:order-2 space-x-3 md:space-x-0">
            <Link 
              to="/login"
              className="text-forest-green bg-bright-green hover:bg-bright-green-hover font-bold rounded-2xl text-md px-5 py-2 md:py-1 text-center inline-block"
            >
              Get started
            </Link>
            <button
              data-collapse-toggle="navbar-sticky"
              type="button"
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-forest-green rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-forest-green"
              aria-controls="navbar-sticky"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M1 1h15M1 7h15M1 13h15"
                />
              </svg>
            </button>
          </div>
          <div
            className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
            id="navbar-sticky"
          >
            <ul
              className="flex flex-col p-4 md:p-0 mt-4 font-bold border rounded-lg md:space-x-1 space-y-2 md:space-y-px rtl:space-x-reverse md:flex-row md:mt-0 md:border-0"
            >
              <li>
                <a
                  href="#home"
                  className="block py-1 px-5 rounded-2xl bg-bright-green text-forest-green hover:bg-bright-green-hover"
                  >Home</a
                >
              </li>
              <li>
                <a
                  href="#about"
                  className="block py-1 px-5 text-forest-green hover:rounded-2xl hover:bg-white-hover"
                  >About</a
                >
              </li>
              <li>
                <a
                  href="#contact"
                  className="block py-1 px-5 text-forest-green hover:rounded-2xl hover:bg-white-hover"
                  >Contact</a
                >
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  )
}