export default function ContactSection() {
  return (
    <section
      id='contact'
      className='relative flex justify-center items-center lg:h-screen text-forest-green bg-[url("/src/assets/blob-3-vert.svg")] lg:bg-[url("/src/assets/blob-3.svg")] bg-cover bg-right-bottom lg:-mt-18'
    >
      <div className='hero'>
        <div className='hero-content flex-col lg:flex-row-reverse lg:gap-20'>
          <div className='text-center lg:text-left'>
            <h1 className='text-3xl lg:text-5xl font-black text-forest-green'>
              Got Money Matters? <br /> Let's Talk!
            </h1>
            <p className='py-6 text-md lg:text-lg text-forest-green'>
              Whether you have questions about{" "}
              <span className='font-bold'>
                budgeting smarter, tracking expenses, or making the most of{" "}
                <span className='font-black'>WAIS</span>
              </span>
              , we’re here to help. Drop us a message and take
              <span className='font-bold'>
                {" "}
                one step closer to financial freedom!
              </span>
            </p>
            <p className='italic text-sm text-gray-600 font-bold'>
              * Your journey to better money management starts with a simple
              message! *
            </p>
            <br />
          </div>

          <div className='card bg-base-100 w-full max-w-md shadow-xl'>
            <div className='card-body'>
              <h2 className='text-2xl lg:text-3xl font-extrabold text-center mb-4'>
                SEND A MESSAGE
              </h2>

              <fieldset className='fieldset space-y-2 text-base'>
                <label className='fieldset-label font-bold text-forest-green'>
                  Full Name
                </label>
                <input
                  type='text'
                  className='input input-bordered w-full'
                  placeholder='John Doe'
                />

                <label className='fieldset-label font-bold text-forest-green'>
                  Email
                </label>
                <input
                  type='email'
                  className='input input-bordered w-full'
                  placeholder='example@email.com'
                />

                <label className='fieldset-label font-bold text-forest-green'>
                  Your Finance Inquiry
                </label>
                <textarea
                  className='textarea textarea-bordered w-full'
                  placeholder='Write your message here...'
                  rows={4}
                />

                <button className='btn btn-primary w-full mt-4 font-extrabold'>
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
