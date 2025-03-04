import wave from "../assets/wave.svg";

export default function AboutSection() {
  return (
    <section
      id='about'
      className='relative flex justify-center items-center lg:h-screen text-forest-green bg-[url("/src/assets/blob-2-vert.svg")] lg:bg-[url("/src/assets/blob-2.svg")] bg-cover bg-right-bottom'
    >
      <img
        src={wave}
        className='absolute top-0 left-0 w-full -mt-6 md:-mt-14 lg:-mt-24 drop-shadow-2xl'
      />

      <div className='container px-6 py-16 lg:py-0 mx-auto'>
        <h1 className='text-3xl font-black text-center uppercase lg:text-5xl lg:py-8'>
          The Simplest Way to Make the Most of Your Money
        </h1>

        <div className='grid grid-cols-1 gap-8 mt-8 lg:mt-12 lg:grid-cols-2 lg:mx-auto lg:max-w-5xl md:grid-cols-2'>
          <div className='flex flex-col items-center p-6 space-y-3 text-center rounded-xl bg-forest-green'>
            <span className='inline-block p-3 bg-bright-green rounded-full'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='w-6 h-6'
                fill='none'
                viewBox='0 0 24 24'
                style={{ fill: "rgba(0, 0, 0, 1)" }}
              >
                <path d='M21 4H3a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1zm-1 11a3 3 0 0 0-3 3H7a3 3 0 0 0-3-3V9a3 3 0 0 0 3-3h10a3 3 0 0 0 3 3v6z'></path>
                <path d='M12 8c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4zm0 6c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2z'></path>
              </svg>
            </span>

            <h1 className='text-xl font-semibold uppercase text-white'>
              Master Your Money
            </h1>

            <p className='text-gray-300 text-md'>
              Track income, log expenses, and categorize transactions
              effortlessly. Set budgets, monitor spending, and stay in
              control—your money, your rules!
            </p>

            <a
              href='#'
              className='flex items-center -mx-1 text-sm text-bright-green capitalize transform hover:underline font-bold'
            >
              <span className='mx-1'>read more</span>
              <svg
                className='w-4 h-4 mx-1'
                fill='currentColor'
                viewBox='0 0 20 20'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  fill-rule='evenodd'
                  d='M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z'
                  clip-rule='evenodd'
                ></path>
              </svg>
            </a>
          </div>

          <div className='flex flex-col items-center p-6 space-y-3 text-center rounded-xl bg-forest-green'>
            <span className='inline-block p-3 bg-bright-green rounded-full'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 24 24'
                style={{ fill: "rgba(0, 0, 0, 1)" }}
              >
                <circle
                  cx='15.5'
                  cy='13.5'
                  r='2.5'
                ></circle>
                <path d='M12 13.5c0-.815.396-1.532 1-1.988A2.47 2.47 0 0 0 11.5 11a2.5 2.5 0 1 0 0 5 2.47 2.47 0 0 0 1.5-.512 2.486 2.486 0 0 1-1-1.988z'></path>
                <path d='M20 4H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM4 18V6h16l.002 12H4z'></path>
              </svg>
            </span>

            <h1 className='text-xl font-semibold uppercase text-white'>
              Spend Smarter
            </h1>

            <p className='text-gray-300 text-md'>
              Easily manage finances with{" "}
              <span className='font-bold text-white'>WAIS!</span> Organize
              transactions, set spending limits, and track every peso in one
              place. No stress, just smart budgeting!
            </p>

            <a
              href='#'
              className='flex items-center -mx-1 text-sm text-bright-green capitalize transform hover:underline font-bold'
            >
              <span className='mx-1'>read more</span>
              <svg
                className='w-4 h-4 mx-1 rtl:-scale-x-100'
                fill='currentColor'
                viewBox='0 0 20 20'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  fill-rule='evenodd'
                  d='M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z'
                  clip-rule='evenodd'
                ></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
