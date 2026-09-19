import dynamic from "next/dynamic";
import Announcements from "@/components/Announcements";
import BigCalendar from "@/components/BigCalender";
import FormModal from "@/components/FormModal";

const Performance = dynamic(() => import("@/components/Performance"), {
  loading: () => <div className="h-72 bg-gray-100 rounded-2xl animate-pulse" />,
});
import { getStudent, getClassSchedule } from "@/lib/graphql/fetchers";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Layers, School, User, Users, Droplet, Calendar, Mail, Phone } from "lucide-react";

const SingleStudentPage = async ({ params }) => {
  const role = cookies().get("role")?.value ?? "admin";
  const student = await getStudent(params.id);

  if (!student) {
    notFound();
  }

  const schedule = student.classId ? await getClassSchedule(student.classId) : [];

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      <div className="w-full xl:w-2/3">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="bg-primary py-6 px-4 rounded-2xl flex-1 flex flex-col sm:flex-row gap-4">
            <div className="w-24 sm:w-1/3 shrink-0">
              <Image
                src={student.photo}
                alt=""
                width={144}
                height={144}
                className="w-24 h-24 sm:w-36 sm:h-36 rounded-full object-cover"
              />
            </div>
            <div className="w-full sm:w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold text-white">{student.name}</h1>
                {role === "admin" && (
                  <FormModal
                    table="student"
                    type="update"
                    data={{
                      id: student.id,
                      name: student.name,
                      phone: student.phone,
                      address: student.address,
                      classId: student.classId,
                      gradeId: student.gradeId,
                      parentId: student.parentId,
                    }}
                  />
                )}
              </div>
              <p className="text-sm text-white/70">
                {student.className !== "-" ? `Class ${student.className}` : "No class assigned"}
                {student.parentName !== "-" ? ` · Parent: ${student.parentName}` : ""}
              </p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium text-white/80">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Droplet size={14} className="text-white/80" />
                  <span>{student.bloodType}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Calendar size={14} className="text-white/80" />
                  <span>{student.birthday !== "-" ? student.birthday : "No birthday set"}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Mail size={14} className="text-white/80" />
                  <span className="truncate">{student.email ?? "-"}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Phone size={14} className="text-white/80" />
                  <span>{student.phone}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            <div className="bg-cardBg border border-border shadow-sm p-4 rounded-2xl flex gap-4 w-full sm:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Layers size={24} className="text-primary" />
              <div>
                <h1 className="text-xl font-semibold">{student.gradeLevel}</h1>
                <span className="text-sm text-gray-400">Grade</span>
              </div>
            </div>

            <div className="bg-cardBg border border-border shadow-sm p-4 rounded-2xl flex gap-4 w-full sm:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <School size={24} className="text-primary" />
              <div>
                <h1 className="text-xl font-semibold">{student.className}</h1>
                <span className="text-sm text-gray-400">Class</span>
              </div>
            </div>

            <div className="bg-cardBg border border-border shadow-sm p-4 rounded-2xl flex gap-4 w-full sm:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <User size={24} className="text-primary" />
              <div>
                <h1 className="text-xl font-semibold">{student.sex ?? "-"}</h1>
                <span className="text-sm text-gray-400">Sex</span>
              </div>
            </div>

            <div className="bg-cardBg border border-border shadow-sm p-4 rounded-2xl flex gap-4 w-full sm:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Users size={24} className="text-primary" />
              <div>
                <h1 className="text-xl font-semibold truncate">{student.parentName}</h1>
                <span className="text-sm text-gray-400">Parent</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 h-[600px] bg-cardBg border border-border shadow-sm rounded-2xl p-4">
          <h1 className="text-xl font-semibold text-textPrimary">Student&apos;s Schedule</h1>
          <div className="mt-3 h-[calc(100%-2.75rem)]">
            <BigCalendar events={schedule} />
          </div>
        </div>
      </div>

      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-cardBg border border-border shadow-sm p-4 rounded-2xl">
          <h1 className="text-xl font-semibold">Shortcuts</h1>
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-textMuted">
            <Link className="p-3 rounded-md bg-lamaSkyLight" href={`/list/lessons?classId=${student.classId ?? ""}`}>
              Student&apos;s Lessons
            </Link>
            <Link className="p-3 rounded-md bg-lamaPurpleLight" href={`/list/exams?classId=${student.classId ?? ""}`}>
              Student&apos;s Exams
            </Link>
            <Link className="p-3 rounded-md bg-pink-50" href={`/list/assignments?classId=${student.classId ?? ""}`}>
              Student&apos;s Assignments
            </Link>
            <Link className="p-3 rounded-md bg-lamaYellowLight" href={`/list/results?studentId=${student.id}`}>
              Student&apos;s Results
            </Link>
          </div>
        </div>

        <Performance />
        <Announcements />
      </div>
    </div>
  );
};

export default SingleStudentPage;