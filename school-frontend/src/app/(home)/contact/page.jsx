"use client";
import React, { useState } from "react";

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = () => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
    // You can integrate backend/email here
  };

  return (
    <div className="text-[var(--text)] bg-[var(--bg)]">
      {/* Hero Section */}
      <section className="bg-[var(--primary)] text-white py-16 text-center">
        <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
        <p className="text-lg">
          We’re here to help students, parents, and teachers
        </p>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-semibold text-[var(--primary)] mb-4">
              Get in Touch
            </h2>
            <p className="mb-4">Reach out for any questions or support.</p>
            <ul className="space-y-2 text-sm">
              <li>
                <strong>📞 Phone:</strong> +880 1234-567890
              </li>
              <li>
                <strong>📧 Email:</strong> info@school.edu.bd
              </li>
              <li>
                <strong>🏫 Address:</strong> 123 School Road, Dhaka, Bangladesh
              </li>
              <li className="mt-4 flex gap-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  className="text-[var(--secondary)] hover:text-[var(--primary)]"
                >
                  Facebook
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  className="text-[var(--secondary)] hover:text-[var(--primary)]"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <strong>🕒 Office Hours:</strong> Sun - Thu: 9 AM – 5 PM
              </li>
            </ul>

            {/* Google Map */}
            <div className="mt-6 w-full h-64">
              <iframe
                className="w-full h-full rounded-md border"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.841581774753!2d90.39841961445669!3d23.750903294649675!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8b9a12a1c6b%3A0xb833553f7ae9a3cb!2sDhaka!5e0!3m2!1sen!2sbd!4v1688888888888"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-semibold text-[var(--primary)] mb-4">
              Send a Message
            </h2>
            {submitted ? (
              <div className="p-6 bg-green-100 text-green-800 rounded-md shadow">
                ✅ Thank you for your message. We'll get back to you soon!
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
                />
                <textarea
                  name="message"
                  placeholder="Your Message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
                ></textarea>
                <button
                  type="submit"
                  className="bg-[var(--primary)] text-white px-6 py-2 rounded-md hover:bg-[var(--secondary)] transition"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
