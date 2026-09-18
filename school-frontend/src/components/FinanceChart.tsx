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

const data = [
  { name: "Jan", income: 4000, expense: 2400 },
  { name: "Feb", income: 3000, expense: 1398 },
  { name: "Mar", income: 2000, expense: 9800 },
  { name: "Apr", income: 2780, expense: 3908 },
  { name: "May", income: 1890, expense: 4800 },
  { name: "Jun", income: 2390, expense: 3800 },
  { name: "Jul", income: 3490, expense: 4300 },
  { name: "Aug", income: 3490, expense: 4300 },
  { name: "Sep", income: 3490, expense: 4300 },
  { name: "Oct", income: 3490, expense: 4300 },
  { name: "Nov", income: 3490, expense: 4300 },
  { name: "Dec", income: 3490, expense: 4300 },
];

const FinanceChart = () => {
  return (
    <div className="bg-cardBg rounded-2xl border border-border shadow-sm w-full h-full p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-textPrimary">Finance</h1>
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
          <Bar dataKey="income" fill="#17255A" radius={[6, 6, 0, 0]} legendType="circle" />
          <Bar dataKey="expense" fill="#B7CDF0" radius={[6, 6, 0, 0]} legendType="circle" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinanceChart;