export default function ContactSection() {
  return (
    <section
      id='contact'
      className='relative flex justify-center items-center lg:h-screen text-forest-green bg-[url("/src/assets/blob-3-vert.svg")] md:bg-[url("/src/assets/blob-3.svg")] lg:bg-[url("/src/assets/blob-3.svg")] bg-cover bg-right-bottom lg:-mt-18'
    >
      <div className='hero lg:mt-16 intersect:motion-preset-fade intersect:motion-opacity-in-0 intersect:-motion-translate-x-in-25 intersect:motion-ease-spring-smooth intersect:motion-preset-blur-right'>
        <div className='hero-content flex-col lg:flex-row-reverse lg:gap-20'>
          <div className='text-center lg:text-left'>
            <h1 className='text-3xl md:text-5xl lg:text-5xl font-black text-forest-green uppercase '>
              Got Money Matters? <br /> Let&#39;s Talk!
            </h1>
            <div className='max-w-2xl lg:max-w-5xl'>
              <p className='py-6 text-base lg:text-xl text-forest-green'>
                Whether you have questions about{' '}
                <span className='font-bold'>
                  budgeting smarter, tracking expenses, or making the most of{' '}
                  <span className='font-black'>WAIS</span>
                </span>
                , we’re here to help. Drop us a message and take
                <span className='font-bold'>
                  {' '}
                  one step closer to financial freedom!
                </span>
              </p>
              <p className='italic text-sm lg:text-md text-gray-600 font-bold'>
                * Your journey to better money management starts with a simple
                message! *
              </p>
            </div>
            <br />
          </div>

          <div className='card bg-base-100 w-full max-w-md md:max-w-lg'>
            <div className='card-body outline-4 rounded-4xl drop-shadow-sm'>
              <h2 className='text-2xl lg:text-3xl font-extrabold text-center mb-4'>
                SEND A MESSAGE
              </h2>

              <fieldset className='fieldset space-y-2 text-base'>
                <label className='fieldset-label font-bold text-forest-green'>
                  Full Name
                </label>
                <input
                  type='text'
                  className='input input-bordered w-full rounded-2xl'
                  placeholder='John Doe'
                />

                <label className='fieldset-label font-bold text-forest-green'>
                  Email
                </label>
                <input
                  type='email'
                  className='input input-bordered w-full rounded-2xl'
                  placeholder='example@email.com'
                />

                <label className='fieldset-label font-bold text-forest-green'>
                  Your Finance Inquiry
                </label>
                <textarea
                  className='textarea textarea-bordered w-full rounded-2xl'
                  placeholder='Write your message here...'
                  rows={4}
                />

                <button className='btn bg-bright-green w-full mt-4 font-extrabold'>
                  SEND MESSAGE
                </button>
              </fieldset>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
