"use client";
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
            src="/img/img.jpg" // Make sure this image exists in /public
            width={400}
            height={300}
            alt="Hero UI"
            className="rounded-lg shadow-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;

// "use client";
// import Image from "next/image";
// import Link from "next/link";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";

// import "swiper/css";
// import "swiper/css/pagination";
// import "swiper/css/navigation";
// import "swiper/css/effect-fade";

// const banners = [
//   {
//     id: 1,
//     href: "/courses",
//     image: "/img/img.jpg",
//     title: "Empowering Future Generations",
//     subtitle: "Explore a wide range of courses to enhance student growth.",
//   },
//   {
//     id: 2,
//     href: "/events",
//     image: "/img/img1.svg",
//     title: "Engaging Educational Events",
//     subtitle: "Join workshops and learning activities across all grades.",
//   },
//   {
//     id: 3,
//     href: "/blog",
//     image: "/img/img3.svg",
//     title: "Informed Learning Culture",
//     subtitle: "Stay updated with educational tips, news, and insights.",
//   },
//   {
//     id: 4,
//     href: "/contact",
//     image: "/img/img.jpg",
//     title: "Be Part of Our School",
//     subtitle: "Reach out today to start your journey with us.",
//   },
// ];

// const Hero = () => {
//   return (
//     <section className="relative w-full h-screen">
//       <Swiper
//         effect="fade"
//         fadeEffect={{ crossFade: true }}
//         spaceBetween={0}
//         centeredSlides
//         autoplay={{ delay: 5000, disableOnInteraction: false }}
//         pagination={{
//           clickable: true,
//           bulletClass:
//             "swiper-pagination-bullet bg-blue-300 opacity-70 hover:opacity-100",
//           bulletActiveClass: "bg-blue-600 opacity-100",
//         }}
//         navigation={{
//           nextEl: ".swiper-button-next-custom",
//           prevEl: ".swiper-button-prev-custom",
//         }}
//         loop
//         modules={[Autoplay, Pagination, Navigation, EffectFade]}
//         className="h-full"
//       >
//         {banners.map((banner) => (
//           <SwiperSlide key={banner.id}>
//             <div className="relative w-full h-screen">
//               <Image
//                 src={banner.image}
//                 alt={banner.title}
//                 fill
//                 priority
//                 className="object-cover"
//               />

//               {/* Gradient fade on right side */}
//               <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white/90 to-transparent pointer-events-none" />

//               {/* Text content box */}
//               <div className="absolute top-1/2 left-10 transform -translate-y-1/2 max-w-md bg-white/80 backdrop-blur-md rounded-lg p-8 shadow-lg text-blue-900 z-20">
//                 <h2 className="text-4xl font-extrabold mb-4">{banner.title}</h2>
//                 <p className="text-lg mb-6">{banner.subtitle}</p>
//                 <Link
//                   href={banner.href}
//                   className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-shadow shadow-md"
//                 >
//                   Get Started
//                 </Link>
//               </div>
//             </div>
//           </SwiperSlide>
//         ))}

//         {/* Custom Navigation Buttons */}
//         <button
//           className="swiper-button-prev-custom absolute top-1/2 left-4 -translate-y-1/2 text-blue-600 hover:text-blue-800 text-4xl font-bold z-30 select-none"
//           aria-label="Previous Slide"
//         >
//           ‹
//         </button>
//         <button
//           className="swiper-button-next-custom absolute top-1/2 right-4 -translate-y-1/2 text-blue-600 hover:text-blue-800 text-4xl font-bold z-30 select-none"
//           aria-label="Next Slide"
//         >
//           ›
//         </button>
//       </Swiper>
//     </section>
//   );
// };

// export default Hero;
