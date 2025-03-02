import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <>
      <section className='bg-[url("/src/assets/blurry_bg.svg")] bg-cover bg-center'>
        <div className='container flex items-center min-h-screen px-6 py-12 mx-auto text-forest-green'>
          <div className='flex flex-col items-center max-w-sm mx-auto text-center'>
            <p className='p-3 text-sm font-medium text-forest-green rounded-full bg-bright-green'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke-width='2'
                stroke='currentColor'
                className='w-6 h-6'
              >
                <path
                  stroke-linecap='round'
                  stroke-linejoin='round'
                  d='M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z'
                />
              </svg>
            </p>
            <h1 className='mt-3 text-5xl font-black'>404</h1>
            <h1 className='mt-3 text-2xl font-semibold'>PAGE NOT FOUND</h1>
            <p className='mt-4 text-gray-500'>
              The page you are looking for doesn't exist.
            </p>

            <div className='flex items-center mt-6 gap-x-3 shrink-0 sm:w-auto'>
              <Link
                to="">
                <button className='w-auto px-5 py-2 text-md font-semibold tracking-wide text-forest-green transition-colors duration-200 bg-bright-green rounded-lg shrink-0
                hover:text-bright-green hover:bg-forest-green'>
                  Take me home
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
