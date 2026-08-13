// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import axios from "axios";

// const Navbar = () => {
//   const [categories, setCategories] = useState([]);

//   useEffect(() => {
//     const getData = async () => {
//       try {
//         const res = await axios.get(
//           `${process.env.NEXT_PUBLIC_API_ENDPOINT}/Category/search`
//         );
//         console.log("res", res);
//         setCategories(res.data.slice(0, 8)); // Limit to 8 categories
//       } catch (error) {
//         console.error("Error fetching categories:", error);
//       }
//     };

//     getData();
//   }, []);

//   return (
//     <nav className="bg-[#f5f6fa] hidden drop-shadow-md w-full py-4 lg:flex lg:justify-center">
//       <ul className="hidden lg:flex justify-center gap-4">
//         {categories.map((category, index) => (
//           <span
//             key={index}
//             className="relative group/nav px-4 py-1 hover:bg-[#d3dae8]"
//           >
//             <Link
//               href={`/Category/${category.Id}`}
//               className="block text-sm font-semibold uppercase duration-300 md:text-sm md:px-1 xl:px-2 text-[#192A56] hover:text-[#130b2efa]"
//             >
//               {category.name}
//             </Link>
//           </span>
//         ))}
//       </ul>
//     </nav>
//   );
// };

// export default Navbar;
