"use client";

import Image from "next/image";
import Link from "next/link";
import { SlLocationPin } from "react-icons/sl";
import { LuPhoneCall } from "react-icons/lu";
import { MdOutlineEmail } from "react-icons/md";
import {
  FaFacebookF,
  FaTwitter,
  FaYoutube,
  FaLinkedinIn,
} from "react-icons/fa";

const Footer = () => {
  const handleSubscribe = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    // handle newsletter subscription logic here
    console.log("Subscribed email:", email);
  };

  return (
    <footer className="bg-gray-900 text-gray-300 py-16 px-6 md:px-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Logo & About */}
        <div className="space-y-6">
          <Image
            src="/logo.png" // Replace with your actual logo
            alt="School Logo"
            width={60}
            height={30}
            className="object-contain"
          />
          <p className="text-gray-400">
            Our School Management System helps schools efficiently manage
            students, teachers, classes, exams, and more — all in one place.
            Empower your institution with streamlined digital tools.
          </p>
          <div className="flex space-x-4 text-gray-400">
            <Link
              href="https://facebook.com/YourSchoolPage"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-500 transition"
              aria-label="Facebook"
            >
              <FaFacebookF size={24} />
            </Link>
            <Link
              href="https://twitter.com/YourSchoolPage"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-500 transition"
              aria-label="Twitter"
            >
              <FaTwitter size={24} />
            </Link>
            <Link
              href="https://youtube.com/YourSchoolChannel"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-500 transition"
              aria-label="YouTube"
            >
              <FaYoutube size={24} />
            </Link>
            <Link
              href="https://linkedin.com/in/YourSchoolPage"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-500 transition"
              aria-label="LinkedIn"
            >
              <FaLinkedinIn size={24} />
            </Link>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-white text-xl font-semibold mb-6">Contact Us</h3>
          <ul className="space-y-4 text-gray-400">
            <li className="flex items-center gap-3">
              <SlLocationPin size={22} className="text-green-500" />
              <span>123 Education Street, Dhaka 1212, Bangladesh</span>
            </li>
            <li className="flex items-center gap-3">
              <LuPhoneCall size={22} className="text-green-500" />
              <span>+880 1625 262932</span>
            </li>
            <li className="flex items-center gap-3">
              <MdOutlineEmail size={22} className="text-green-500" />
              <span>support@schoolmanagement.com</span>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white text-xl font-semibold mb-6">Quick Links</h3>
          <nav className="flex flex-col space-y-3 text-gray-400">
            <Link href="/" className="hover:text-green-500 transition">
              Home
            </Link>
            <Link href="/about" className="hover:text-green-500 transition">
              About Us
            </Link>
            <Link href="/students" className="hover:text-green-500 transition">
              Students
            </Link>
            <Link href="/events" className="hover:text-green-500 transition">
              Events
            </Link>
            <Link href="/contact" className="hover:text-green-500 transition">
              Contact Us
            </Link>
          </nav>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-white text-xl font-semibold mb-6">Newsletter</h3>
          <p className="text-gray-400 mb-6">
            Subscribe to get the latest news and updates about our school.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col space-y-4">
            <input
              type="email"
              name="email"
              required
              placeholder="Enter your email"
              className="p-3 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 transition text-white py-3 rounded-md font-semibold"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="mt-12 border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
        © 2024 School Management System. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
