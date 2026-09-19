import Announcements from "@/components/Announcements";
import BigCalendar from "@/components/BigCalender";
import FormModal from "@/components/FormModal";
import Performance from "@/components/Performance";
import { getTeacher, getTeacherSchedule } from "@/lib/graphql/fetchers";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { School, BookOpen, Layers, User, Droplet, Calendar, Mail, Phone } from "lucide-react";

const SingleTeacherPage = async ({ params }: { params: { id: string } }) => {
  const role = cookies().get("role")?.value ?? "admin";
  const teacher = await getTeacher(params.id);

  if (!teacher) {
    notFound();
  }

  const schedule = await getTeacherSchedule(params.id);

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      <div className="w-full xl:w-2/3">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="bg-primary py-6 px-4 rounded-2xl flex-1 flex flex-col sm:flex-row gap-4">
            <div className="w-24 sm:w-1/3 shrink-0">
              <Image
                src={teacher.photo}
                alt=""
                width={144}
                height={144}
                className="w-24 h-24 sm:w-36 sm:h-36 rounded-full object-cover"
              />
            </div>
            <div className="w-full sm:w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                                <h1 className="text-xl font-semibold text-white">{teacher.name}</h1>
                {role === "admin" && (
                  <FormModal
                    table="teacher"
                    type="update"
                    data={{
                      id: teacher.id,
                      name: teacher.name,
                      phone: teacher.phone,
                      address: teacher.address,
                      subjectIds: teacher.subjectIds,
                    }}
                  />
                )}
              </div>
              <p className="text-sm text-white/70">
                {teacher.subjects.length > 0
                  ? `Teaches ${teacher.subjects.join(", ")}`
                  : "No subjects assigned"}
              </p>
                            <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium text-white/80">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Droplet size={14} className="text-white/80" />
                  <span>{teacher.bloodType}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Calendar size={14} className="text-white/80" />
                  <span>{teacher.birthday !== "-" ? teacher.birthday : "No birthday set"}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Mail size={14} className="text-white/80" />
                  <span className="truncate">{teacher.email ?? "-"}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Phone size={14} className="text-white/80" />
                  <span>{teacher.phone}</span>
                </div>
            </div>
          </div>
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
                       <div className="bg-cardBg border border-border shadow-sm p-4 rounded-2xl flex gap-4 w-full sm:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <School size={24} className="text-primary" />
              <div>
                <h1 className="text-xl font-semibold">{teacher.classes.length}</h1>
                <span className="text-sm text-textMuted">Classes</span>
              </div>
            </div>
            <div className="bg-cardBg border border-border shadow-sm p-4 rounded-2xl flex gap-4 w-full sm:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <BookOpen size={24} className="text-primary" />
              <div>
                <h1 className="text-xl font-semibold">{teacher.subjects.length}</h1>
                <span className="text-sm text-textMuted">Subjects</span>
              </div>
            </div>
            <div className="bg-cardBg border border-border shadow-sm p-4 rounded-2xl flex gap-4 w-full sm:w-[48%] xl:w-[45%] 2xl:w-[48%] truncate">
              <Layers size={24} className="text-primary" />
              <div className="min-w-0">
                <h1 className="text-xl font-semibold truncate">
                  {teacher.classes.join(", ") || "-"}
                </h1>
                <span className="text-sm text-textMuted">Class list</span>
              </div>
            </div>
            <div className="bg-cardBg border border-border shadow-sm p-4 rounded-2xl flex gap-4 w-full sm:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <User size={24} className="text-primary" />
              <div>
                <h1 className="text-xl font-semibold">{teacher.sex ?? "-"}</h1>
                <span className="text-sm text-textMuted">Sex</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 h-[600px] bg-cardBg border border-border shadow-sm rounded-2xl p-4">
          <h1 className="text-xl font-semibold text-textPrimary">Teacher&apos;s Schedule</h1>
          <div className="mt-3 h-[calc(100%-2.75rem)]">
            <BigCalendar events={schedule} />
          </div>
        </div>
      </div>
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-cardBg border border-border shadow-sm p-4 rounded-2xl">
          <h1 className="text-xl font-semibold">Shortcuts</h1>
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-textMuted">
            <Link className="p-3 rounded-md bg-lamaSkyLight" href={`/list/classes?teacherId=${teacher.id}`}>
              Teacher&apos;s Classes
            </Link>
            <Link className="p-3 rounded-md bg-lamaPurpleLight" href={`/list/lessons?teacherId=${teacher.id}`}>
              Teacher&apos;s Lessons
            </Link>
            <Link className="p-3 rounded-md bg-pink-50" href={`/list/exams?teacherId=${teacher.id}`}>
              Teacher&apos;s Exams
            </Link>
            <Link className="p-3 rounded-md bg-lamaSkyLight" href={`/list/assignments?teacherId=${teacher.id}`}>
              Teacher&apos;s Assignments
            </Link>
          </div>
        </div>
        <Performance />
        <Announcements />
      </div>
      </div>
    </div>
  );
};

export default SingleTeacherPage;