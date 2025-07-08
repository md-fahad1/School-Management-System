"use client";
import React, { useState } from "react";

const categories = ["All", "Notices", "Events", "Academic", "Sports"];

const blogs = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  title: `Inspiring School Update ${i + 1}`,
  category: categories[i % categories.length],
  date: "2025-07-06",
  image: "https://placeimg.com/640/360/tech",
}));

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
      <section className="bg-[var(--primary)] text-white py-16 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          Welcome to Our Blog
        </h1>
        <p className="text-lg md:text-xl">
          Stay informed with updates for Students, Parents, and Teachers
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search & Category Filter */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search blog posts..."
            className="w-full md:w-1/2 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
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
                    ? "bg-[var(--secondary)] text-white border-[var(--secondary)]"
                    : "border-gray-300 text-gray-700 hover:bg-[var(--accent)] hover:text-white"
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
                  <span className="text-sm text-[var(--primary)] font-semibold">
                    {blog.category}
                  </span>
                  <span className="text-sm text-gray-500">{blog.date}</span>
                </div>
                <h2 className="text-lg font-semibold mb-1">{blog.title}</h2>
                <p className="text-sm text-gray-600">
                  A quick summary of this blog post goes here...
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
                  ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                  : "text-gray-700 border-gray-300 hover:bg-[var(--accent)] hover:text-white"
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
