"use client";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const banners = [
  {
    id: 1,
    href: "/courses",
    image: "/img/images1.jpeg",
    title: "Empowering Future Generations",
    subtitle: "Comprehensive courses to shape your academic journey.",
  },
  {
    id: 2,
    href: "/events",
    image: "/img/images3.jpeg",
    title: "Inspiring Educational Events",
    subtitle: "Join seminars, workshops, and career-building programs.",
  },
  {
    id: 3,
    href: "/blog",
    image: "/img/images4.jpeg",
    title: "Stay Informed, Stay Ahead",
    subtitle: "Read insights, tips, and stories from our experts.",
  },
  {
    id: 4,
    href: "/contact",
    image: "/img/images1.jpeg",
    title: "Join Our Learning Community",
    subtitle: "Get in touch with us and start your learning journey today.",
  },
];

const Hero = () => {
  return (
    <section className="w-full h-screen relative">
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        modules={[Autoplay, Pagination]}
        className="h-full"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div className="relative w-full h-screen">
              <Link href={banner.href}>
                <Image
                  src={banner.image}
                  fill
                  alt={banner.title}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center px-4">
                  <h2 className="text-white text-2xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow">
                    {banner.title}
                  </h2>
                  <p className="text-white text-base md:text-lg max-w-2xl drop-shadow-md">
                    {banner.subtitle}
                  </p>
                  <button className="mt-6 px-6 py-3 bg-white text-black font-semibold rounded hover:bg-gray-200 transition">
                    Learn More
                  </button>
                </div>
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Hero;
