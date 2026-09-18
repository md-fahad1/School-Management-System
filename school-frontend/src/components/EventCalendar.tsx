"use client";

import { MoreVertical } from "lucide-react";
import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

// TEMPORARY
const events = [
  {
    id: 1,
    title: "Lorem ipsum dolor",
    time: "12:00 PM - 2:00 PM",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: 2,
    title: "Lorem ipsum dolor",
    time: "12:00 PM - 2:00 PM",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: 3,
    title: "Lorem ipsum dolor",
    time: "12:00 PM - 2:00 PM",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
];

const EventCalendar = () => {
  const [value, onChange] = useState<Value>(new Date());

  return (
    <div className="bg-cardBg border border-border shadow-sm rounded-2xl p-4">
      <Calendar onChange={onChange} value={value} />
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-textPrimary my-4">Events</h1>
        <button type="button" className="text-textMuted hover:text-textSecondary" aria-label="More options">
          <MoreVertical size={18} />
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {events.map((event, i) => (
          <div
            className={`p-4 rounded-xl border border-border border-t-4 ${
              i % 2 === 0 ? "border-t-info" : "border-t-accent"
            }`}
            key={event.id}
          >
            <div className="flex items-center justify-between">
              <h1 className="font-semibold text-textPrimary text-sm">{event.title}</h1>
              <span className="text-textMuted text-xs shrink-0 ml-2">{event.time}</span>
            </div>
            <p className="mt-2 text-textSecondary text-sm">{event.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventCalendar;