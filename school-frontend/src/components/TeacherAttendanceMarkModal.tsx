"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

const TeacherAttendanceMarkForm = dynamic(() => import("./forms/TeacherAttendanceMarkForm"), {
  loading: () => <h1>Loading...</h1>,
});

const TeacherAttendanceMarkModal = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        className="w-8 h-8 flex items-center justify-center rounded-full bg-brandPurple text-white hover:opacity-80 transition"
        onClick={() => setOpen(true)}
        title="Mark attendance"
      >
        <Plus size={16} />
      </button>
      {open && (
        <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            <TeacherAttendanceMarkForm
              onSuccess={() => {
                setOpen(false);
                router.refresh();
              }}
            />
            <div
              className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-brandInk"
              onClick={() => setOpen(false)}
            >
              <X size={18} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeacherAttendanceMarkModal;