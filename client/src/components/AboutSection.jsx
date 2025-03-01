import wave from "../assets/wave.svg";

export default function AboutSection() {
  return (
    <section
      id='about'
      className='relative flex justify-center items-center h-screen'
    >
      <img
        src={wave}
        className='absolute top-0 left-0 w-full -mt-6 lg:-mt-24 drop-shadow-lg'
      />

      <h1 className='z-10 text-4xl font-bold'>About</h1>
    </section>
  );
}
