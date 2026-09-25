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

// monthKey — translations.ts-er "dashboard.months" theke translate hobe.
const rawData = [
  { monthKey: "jan", income: 4000, expense: 2400 },
  { monthKey: "feb", income: 3000, expense: 1398 },
  { monthKey: "mar", income: 2000, expense: 9800 },
  { monthKey: "apr", income: 2780, expense: 3908 },
  { monthKey: "may", income: 1890, expense: 4800 },
  { monthKey: "jun", income: 2390, expense: 3800 },
  { monthKey: "jul", income: 3490, expense: 4300 },
  { monthKey: "aug", income: 3490, expense: 4300 },
  { monthKey: "sep", income: 3490, expense: 4300 },
  { monthKey: "oct", income: 3490, expense: 4300 },
  { monthKey: "nov", income: 3490, expense: 4300 },
  { monthKey: "dec", income: 3490, expense: 4300 },
];

const FinanceChart = () => {
  const { t } = useTranslation();
  const data = rawData.map((d) => ({
    ...d,
    name: t(`dashboard.months.${d.monthKey}`),
  }));

  return (
    <div className="bg-cardBg rounded-2xl border border-border shadow-sm w-full h-full p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-textPrimary">{t("dashboard.financeChartTitle")}</h1>
        <button type="button" className="text-textMuted hover:text-textSecondary" aria-label="More options">
          <MoreVertical size={18} />
        </button>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={data}
          barGap={4}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7EAF2" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tick={{ fill: "#A3A9BC" }}
            tickLine={false}
            tickMargin={10}
          />
          <YAxis axisLine={false} tick={{ fill: "#A3A9BC" }} tickLine={false} tickMargin={10} />
          <Tooltip contentStyle={{ borderRadius: "10px", borderColor: "#E7EAF2" }} />
          <Legend
            align="left"
            verticalAlign="top"
            wrapperStyle={{ paddingTop: "10px", paddingBottom: "30px" }}
          />
          <Bar dataKey="income" name={t("dashboard.income")} fill="#17255A" radius={[6, 6, 0, 0]} legendType="circle" />
          <Bar dataKey="expense" name={t("dashboard.expense")} fill="#B7CDF0" radius={[6, 6, 0, 0]} legendType="circle" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinanceChart;