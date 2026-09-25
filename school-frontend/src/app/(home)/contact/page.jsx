"use client";
import React, { useState } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";

const ContactPage = () => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
    // You can integrate backend/email here
  };

  return (
    <div className="text-[var(--text)] bg-[var(--bg)]">
      {/* Hero Section */}
      <section className="bg-[var(--primary)] text-white py-16 text-center">
        <h1 className="text-4xl font-bold mb-2">{t("contact.title")}</h1>
        <p className="text-lg">
          {t("contact.subtitle")}
        </p>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-semibold text-[var(--primary)] mb-4">
              {t("contact.getInTouch")}
            </h2>
            <p className="mb-4">{t("contact.reachOut")}</p>
            <ul className="space-y-2 text-sm">
              <li>
                <strong>📞 {t("contact.phoneLabel")}</strong> +880 1234-567890
              </li>
              <li>
                <strong>📧 {t("contact.emailLabel")}</strong> info@school.edu.bd
              </li>
              <li>
                <strong>🏫 {t("contact.addressLabel")}</strong> 123 School Road, Dhaka, Bangladesh
              </li>
              <li className="mt-4 flex gap-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--secondary)] hover:text-[var(--primary)]"
                >
                  {t("contact.facebook")}
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--secondary)] hover:text-[var(--primary)]"
                >
                  {t("contact.linkedin")}
                </a>
              </li>
              <li>
                <strong>🕒 {t("contact.officeHoursLabel")}</strong> {t("contact.officeHoursValue")}
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
              {t("contact.sendMessageTitle")}
            </h2>
            {submitted ? (
              <div className="p-6 bg-green-100 text-green-800 rounded-md shadow">
                ✅ {t("contact.thankYou")}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder={t("contact.namePlaceholder")}
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
                />
                <input
                  type="email"
                  name="email"
                  placeholder={t("contact.emailPlaceholder")}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
                />
                <textarea
                  name="message"
                  placeholder={t("contact.messagePlaceholder")}
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
                  {t("contact.sendMessageButton")}
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