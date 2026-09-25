"use client";

import { BookOpen, Briefcase, FlaskConical } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

const TopCategories = () => {
  const { t } = useTranslation();

  const categories = [
    {
      titleKey: "science",
      count: 134,
      icon: <FlaskConical size={40} className="text-indigo-900" />,
    },
    {
      titleKey: "commerce",
      count: 112,
      icon: <Briefcase size={40} className="text-indigo-900" />,
    },
    {
      titleKey: "arts",
      count: 98,
      icon: <BookOpen size={40} className="text-indigo-900" />,
    },
  ];

  return (
    <section className="py-4 bg-white text-center">
      {/* Section Title */}
      <div className="mb-12">
        <span className="inline-block bg-pink-100 text-pink-600 text-sm px-4 py-1 rounded-full font-semibold mb-2">
          {t("courses.badge")}
        </span>
        <h2 className="text-4xl font-bold text-gray-800">{t("courses.topCategoryTitle")}</h2>
        <p className="text-gray-500 mt-2">
          {t("courses.subtitle")}
        </p>
      </div>

      {/* Category Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-6 mb-10">
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className="bg-white border rounded-xl px-6 py-8 shadow-md hover:shadow-xl transition"
          >
            <div className="flex justify-center mb-4">
              <div className="bg-indigo-50 p-4 rounded-xl">{cat.icon}</div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">{t(`courses.${cat.titleKey}`)}</h3>
            <p className="text-sm text-gray-500 mt-1">{cat.count} {t("courses.coursesSuffix")}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TopCategories;