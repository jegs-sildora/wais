import { Link } from "react-router-dom";

export default function FormNav({ title, textClassName = "text-5xl" }) {
  return (
    <>
      <nav className='fixed w-full z-20 top-0 start-0 bg-white shadow-sm'>
        <div className='max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4 md:mx-4'>
          <Link
            to='/'
            className={`group self-center ${textClassName} font-secondary motion-blur-in motion-opacity-in hover:underline decoration-bright-green`}
          >
            {title}
            <span className='group-hover:text-bright-green-hover'>.</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
