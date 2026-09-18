"use client";
import { MoreVertical } from "lucide-react";
import { PieChart, Pie, ResponsiveContainer } from "recharts";

const data = [
  { name: "Group A", value: 92, fill: "#17255A" },
  { name: "Group B", value: 8, fill: "#B7CDF0" },
];

const Performance = () => {
  return (
    <div className="bg-cardBg border border-border shadow-sm p-4 rounded-2xl h-80 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-textPrimary">Performance</h1>
        <button type="button" className="text-textMuted hover:text-textSecondary" aria-label="More options">
          <MoreVertical size={16} />
        </button>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            dataKey="value"
            startAngle={180}
            endAngle={0}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <h1 className="text-3xl font-bold text-textPrimary">9.2</h1>
        <p className="text-xs text-textMuted">of 10 max LTS</p>
      </div>
      <h2 className="font-medium text-textSecondary absolute bottom-16 left-0 right-0 m-auto text-center">
        1st Semester - 2nd Semester
      </h2>
    </div>
  );
};

export default Performance;