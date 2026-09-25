"use client";
import { MoreVertical } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n/useTranslation";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
} from "recharts";

const CountChart = ({ boys = 0, girls = 0 }: { boys?: number; girls?: number }) => {
  const { t } = useTranslation();
  const total = boys + girls;
  const boysPct = total > 0 ? Math.round((boys / total) * 100) : 0;
  const girlsPct = total > 0 ? Math.round((girls / total) * 100) : 0;

  const data = [
    { name: "Total", count: total, fill: "#F4F6FB" },
    { name: "Girls", count: girls, fill: "#F5B301" },
    { name: "Boys", count: boys, fill: "#3563E9" },
  ];

  return (
    <div className="bg-cardBg rounded-2xl border border-border shadow-sm w-full h-full p-4">
      {/* TITLE */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-textPrimary">{t("dashboard.studentsChartTitle")}</h1>
        <button type="button" className="text-textMuted hover:text-textSecondary" aria-label="More options">
          <MoreVertical size={18} />
        </button>
      </div>
      {/* CHART */}
      <div className="relative w-full h-[75%]">
        <ResponsiveContainer>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="40%"
            outerRadius="100%"
            barSize={32}
            data={data}
          >
            <RadialBar background dataKey="count" />
          </RadialBarChart>
        </ResponsiveContainer>
        <Image
          src="/maleFemale.png"
          alt=""
          width={50}
          height={50}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </div>
      {/* BOTTOM */}
      <div className="flex justify-center gap-16">
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-info rounded-full" />
          <h1 className="font-bold text-textPrimary">{boys.toLocaleString()}</h1>
          <h2 className="text-xs text-textMuted">{t("dashboard.boys")} ({boysPct}%)</h2>
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-warning rounded-full" />
          <h1 className="font-bold text-textPrimary">{girls.toLocaleString()}</h1>
          <h2 className="text-xs text-textMuted">{t("dashboard.girls")} ({girlsPct}%)</h2>
        </div>
      </div>
    </div>
  );
};

export default CountChart;