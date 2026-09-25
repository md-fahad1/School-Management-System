"use client";
import { MoreVertical } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "@/lib/i18n/useTranslation";

type DayAttendance = {
  day: string;
  present: number;
  absent: number;
};

const AttendanceChart = ({ data }: { data: DayAttendance[] }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-cardBg rounded-2xl border border-border shadow-sm p-4 h-full">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-textPrimary">{t("dashboard.attendanceChartTitle")}</h1>
        <button type="button" className="text-textMuted hover:text-textSecondary" aria-label="More options">
          <MoreVertical size={18} />
        </button>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart width={500} height={300} data={data} barSize={20}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7EAF2" />
          <XAxis
            dataKey="day"
            axisLine={false}
            tick={{ fill: "#A3A9BC" }}
            tickLine={false}
          />
          <YAxis axisLine={false} tick={{ fill: "#A3A9BC" }} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: "10px", borderColor: "#E7EAF2" }}
          />
          <Legend
            align="left"
            verticalAlign="top"
            wrapperStyle={{ paddingTop: "20px", paddingBottom: "40px" }}
          />
          <Bar
            dataKey="present"
            name={t("dashboard.present")}
            fill="#17255A"
            legendType="circle"
            radius={[10, 10, 0, 0]}
          />
          <Bar
            dataKey="absent"
            name={t("dashboard.absent")}
            fill="#B7CDF0"
            legendType="circle"
            radius={[10, 10, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceChart;