import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <section className=" pt-14  mb-4 md:pb-20 bg-pink-white-pink">
      <div className="max-w-8xl mx-auto px-4 md:px-20 mt-16 md:mt-10 grid md:grid-cols-2 items-center md:gap-60">
        {/* Left Content */}
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-snug">
            Start Your <span className="text-pink-500">Career</span> & <br />
            Pursue Your <span className="text-pink-500">Passion</span>
          </h1>

          <p className="text-gray-600 text-lg">
            Complete E-Learning Management Solution for you. Create Your Own
            perfect website with Dreams LMS
          </p>

          <Link
            href="#"
            className="bg-indigo-900 text-white px-5 py-2 rounded-full text-xs font-bold  inline-block hover:bg-indigo-800"
          >
            Get Started
          </Link>
        </div>

        {/* Right Image */}
        <div className="relative mt-5">
          <Image
            src="/img/school.jpg"
            width={400}
            height={300}
            alt="Hero UI"
            priority
            className="rounded-lg shadow-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;