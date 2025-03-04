import { Link } from "react-router-dom";
import money from "../assets/money.svg";
import phone from "../assets/phone.png";

export default function HomeSection() {
  return (
    <section
      id='home'
      className='flex justify-center items-center text-forest-green font-medium bg-[url("/src/assets/waves_bg.svg")] bg-cover bg-center py-8 md:py-0 lg:py-0 min-h-screen md:min-h-screen lg:min-h-screen'
    >
      <div className='hero'>
        <div className='hero-content flex flex-col lg:flex-row items-center text-center lg:text-left gap-10 lg:gap-20 pt-10 lg:mt-0 md:-mt-20'>
          <div className='max-w-2xl p-6'>
            <h1 className='text-5xl lg:text-6xl font-black leading-tight'>
              How will you spend your{" "}
              <span className='line-through decoration-bright-green decoration-6 drop-shadow-2xl'>
                money
              </span>{" "}
              life?
            </h1>
            <p className='py-6 text-lg'>
              Become{" "}
              <span className='font-secondary text-3xl hover:underline cursor-pointer decoration-bright-green'>
                WAIS
              </span>
              , and take control of your finances with smart budgeting and
              tracking. Plan ahead and make informed financial decisions
              effortlessly.
            </p>
            <Link
              to='/login'
              className='btn btn-primary outline-3 outline-forest-green'
            >
              START MY <span className='font-black'>WAIS</span> JOURNEY
            </Link>
            <p className='italic text-sm mt-2'>
              It's easy! No credit card required!
            </p>
          </div>

          <div className='relative flex justify-center items-center lg:max-w-sm md:max-w-md '>
            <img
              src={phone}
              className='motion-preset-oscillate-sm motion-ease-smooth motion-duration-[6s]'
            />
            <img
              src={money}
              className='absolute'
            />
          </div>
        </div>
      </div>
    </section>
  );
}
