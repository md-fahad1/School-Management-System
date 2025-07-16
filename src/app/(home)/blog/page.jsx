"use client";
import React, { useState } from "react";

// Blog categories
const categories = ["All", "Notices", "Events", "Academic", "Sports"];

// Dummy blog data
const blogs = [
  {
    id: 1,
    title: "Dream Education Hosts Annual Science Fair 2025",
    category: "Events",
    date: "2025-07-01",
    image:
      "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 2,
    title: "Important Midterm Exam Notice for All Students",
    category: "Notices",
    date: "2025-07-02",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 3,
    title: "Academic Excellence: Top Performers of the Year",
    category: "Academic",
    date: "2025-07-03",
    image:
      "https://images.unsplash.com/photo-1584697964154-36f43fdd79c4?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 4,
    title: "Dream Education Sports Week 2025 Highlights",
    category: "Sports",
    date: "2025-07-04",
    image:
      "https://images.unsplash.com/photo-1600172454520-0e20f59c45cc?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 5,
    title: "New Library Books Added for Students",
    category: "Notices",
    date: "2025-07-05",
    image:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 6,
    title: "Teachers' Workshop on Modern Learning Tools",
    category: "Academic",
    date: "2025-07-06",
    image:
      "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 7,
    title: "Independence Day Celebration at Dream Education",
    category: "Events",
    date: "2025-07-07",
    image:
      "https://images.unsplash.com/photo-1593113478854-46e0abf9c4c3?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 8,
    title: "Monthly Sports Meet – Winners Announced",
    category: "Sports",
    date: "2025-07-08",
    image:
      "https://images.unsplash.com/photo-1601571119985-3294c8a1668b?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 9,
    title: "Class Routine Updated for All Grades",
    category: "Notices",
    date: "2025-07-09",
    image:
      "https://images.unsplash.com/photo-1612423284934-cfb5f816c3ac?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 10,
    title: "How Dream Education Is Using Smart Classrooms",
    category: "Academic",
    date: "2025-07-10",
    image:
      "https://images.unsplash.com/photo-1588072432882-e8d6a05cce8f?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 11,
    title: "Field Trip to National Museum Announced",
    category: "Events",
    date: "2025-07-11",
    image:
      "https://images.unsplash.com/photo-1505666285084-a2e09b397814?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 12,
    title: "Inter-Class Football Tournament Coming Soon",
    category: "Sports",
    date: "2025-07-12",
    image:
      "https://images.unsplash.com/photo-1602045481955-7c55e21a199d?auto=format&fit=crop&w=640&q=80",
  },
];

const BlogPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const filteredBlogs = blogs.filter((b) => {
    return (
      (selectedCategory === "All" || b.category === selectedCategory) &&
      b.title.toLowerCase().includes(search.toLowerCase())
    );
  });

  const paginatedBlogs = filteredBlogs.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const totalPages = Math.ceil(filteredBlogs.length / postsPerPage);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-white text-black py-16 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          Dream Education Blog
        </h1>
        <p className="text-lg md:text-xl">
          Stay informed with updates for Students, Parents, and Teachers
        </p>
      </section>

      <div className="max-w-7xl mx-auto bg-pink-white-pink px-4  py-8">
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search blog posts..."
            className="w-full md:w-1/2 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-4 py-1 rounded-full text-sm font-medium border transition ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 text-gray-700 hover:bg-blue-100 hover:text-blue-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedBlogs.map((blog) => (
            <div
              key={blog.id}
              className="rounded-lg overflow-hidden shadow-md border border-gray-200 hover:shadow-lg transition"
            >
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-blue-600 font-semibold">
                    {blog.category}
                  </span>
                  <span className="text-sm text-gray-500">{blog.date}</span>
                </div>
                <h2 className="text-lg font-semibold mb-1">{blog.title}</h2>
                <p className="text-sm text-gray-600">
                  A quick summary of this blog post goes here to give readers a
                  glimpse of what it's about.
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-10 space-x-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-8 h-8 rounded-full text-sm font-medium border transition ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white border-blue-600"
                  : "text-gray-700 border-gray-300 hover:bg-blue-100 hover:text-blue-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
