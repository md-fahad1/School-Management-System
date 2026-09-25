"use client";

import React from "react";
import { Users, BookOpen, Calendar, CheckCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

const EventPage = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Users size={36} className="text-[var(--primary)]" />,
      titleKey: "studentManagementTitle",
      descKey: "studentManagementDesc",
    },
    {
      icon: <BookOpen size={36} className="text-[var(--primary)]" />,
      titleKey: "classSchedulingTitle",
      descKey: "classSchedulingDesc",
    },
    {
      icon: <Calendar size={36} className="text-[var(--primary)]" />,
      titleKey: "attendanceTrackingTitle",
      descKey: "attendanceTrackingDesc",
    },
    {
      icon: <CheckCircle size={36} className="text-[var(--primary)]" />,
      titleKey: "examResultsTitle",
      descKey: "examResultsDesc",
    },
  ];

  return (
    <div className="min-h-screen bg-pink-white-pink px-4 py-12 flex flex-col items-center">
      {/* Main Card */}
      <div className="bg-white shadow-2xl rounded-3xl p-10 sm:p-14 max-w-4xl w-full text-center">
        {/* Header */}
        <h1 className="text-3xl sm:text-5xl font-bold text-[var(--primary)] mb-4">
          {t("events.title")}
        </h1>
        <p className="text-gray-700 mb-8 max-w-2xl mx-auto text-base sm:text-lg">
          {t("events.subtitle")}
        </p>

        {/* CTA */}
        <button className="bg-[var(--primary)] hover:bg-[var(--secondary)] text-white px-8 py-3 rounded-full font-semibold transition shadow-lg mb-10">
          {t("hero.getStarted")}
        </button>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left">
          {features.map((f, idx) => (
            <div key={idx} className="flex items-start space-x-4">
              {f.icon}
              <div>
                <h3 className="text-lg font-semibold text-[var(--text)] mb-1">
                  {t(`events.${f.titleKey}`)}
                </h3>
                <p className="text-gray-600 text-sm">{t(`events.${f.descKey}`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventPage;