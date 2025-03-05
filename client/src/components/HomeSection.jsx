import { Link } from "react-router-dom";
import { easeIn, motion } from "framer-motion";
import money from "../assets/money.svg";
import phone from "../assets/phone.png";

const containerVariants = {
  hidden: { opacity: 0, x: -100 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.9 }, ease: easeIn},
};

export default function HomeSection() {
  return (
    <section
      id='home'
      className='flex justify-center items-center text-forest-green font-medium bg-[url("/src/assets/waves_bg.svg")] bg-cover bg-center py-8 md:py-0 lg:py-0 min-h-screen md:min-h-screen lg:min-h-screen'
    >
      <motion.div
        className='hero'
        variants={containerVariants}

      >
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
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.99 }}
            >
              <Link
                to='/login'
                className='rounded-4xl border-2 border-dashed border-forest-green bg-bright-green px-6 py-3 font-semibold uppercase text-forest-green transition-all duration-300 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[4px_4px_0px_black] active:translate-x-[0px] active:translate-y-[0px] active:shadow-none hover:bg-bright-green-hover'
              >
                START MY <span className='font-black'>WAIS</span> JOURNEY
              </Link>
            </motion.div>
            <p className='italic text-sm mt-5'>
              It's easy! No credit card required!
            </p>
          </div>

          <div className='relative flex justify-center items-center md:max-w-lg lg:max-w-lg pb-8 md:pb-0 lg:pb-0'>
            <img
              src={phone}
              className='motion-preset-oscillate-sm motion-ease-smooth motion-duration-[6s] motion-delay-500'
            />
            <img
              src={money}
              className='absolute'
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
