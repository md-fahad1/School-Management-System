import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="pt-[72px] bg-gradient-to-b from-accentLight/40 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid md:grid-cols-2 items-center gap-10 lg:gap-16">
        {/* Left Content */}
        <div className="space-y-6">
          <span className="inline-flex items-center gap-1.5 bg-accentLight text-accent text-xs font-semibold px-3 py-1.5 rounded-full">
            <Sparkles size={14} />
            Trusted by 500+ Schools
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-textPrimary leading-tight">
            Start Your <span className="text-accent">Career</span> &<br />
            Pursue Your <span className="text-accent">Passion</span>
          </h1>

          <p className="text-textSecondary text-base sm:text-lg max-w-md">
            Complete e-learning management solution for your institution.
            Manage students, teachers, classes and exams — all in one place
            with DreamsEdu.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/signup"
              className="flex items-center gap-1.5 bg-primary hover:bg-primaryDark text-white px-6 py-3 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              Get Started
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/courses"
              className="flex items-center gap-1.5 border border-border hover:border-primary text-textPrimary px-6 py-3 rounded-lg text-sm font-semibold transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        </div>

        {/* Right Image */}
        <div className="relative">
          <div className="absolute -inset-4 bg-accentLight rounded-3xl -z-10 hidden sm:block" />
          <Image
            src="/img/school.jpg"
            width={600}
            height={450}
            alt="Students using DreamsEdu"
            priority
            className="rounded-2xl shadow-lg border border-border w-full h-auto object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;