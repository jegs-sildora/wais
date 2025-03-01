import { Link } from "react-router-dom";
import money from "../assets/money.svg";
import phone from "../assets/phone.png";
import wave from "../assets/wave.svg";

export default function HomeSection() {
  return (
    <section
      id='home'
      className='flex justify-center items-center text-forest-green font-medium bg-[url("/src/assets/waves_bg.svg")] bg-cover bg-center py-8 lg:py-0'
    >
      <div className='hero min-h-screen'>
        <div className='hero-content flex flex-col lg:flex-row items-center text-center lg:text-left gap-10 lg:gap-20 pt-20 lg:pt-0'>
          <div className='max-w-2xl p-6'>
            <h1 className='text-5xl lg:text-6xl font-black leading-tight'>
              How will you spend your{" "}
              <span className='line-through decoration-bright-green decoration-6 drop-shadow-md'>
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

          <div className='relative flex justify-center items-center'>
            <img
              src={phone}
              className='max-w-xs sm:max-w-md md:max-w-lg motion-preset-oscillate-sm motion-ease-smooth motion-duration-[8s]'
            />
            <img
              src={money}
              className='absolute max-w-xs sm:max-w-md md:max-w-lg'
            />
          </div>
        </div>
      </div>
    </section>
  );
}
