import Image from "next/image";
import Link from "next/link";
import FormModal from "./FormModal";

type Student = {
  id: string;
  name: string;
  class: string;
  studentId: string;
  grade: string | number;
  phone?: string;
  address?: string;
  photo?: string;
  classId?: string;
  gradeId?: string;
  parentId?: string;
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const StudentCard = ({ item, role }: { item: Student; role: string }) => {
  return (
    <div className="bg-cardBg border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-4">
      {/* Header: avatar, name + class + ID (small, muted), status badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {item.photo ? (
            <Image
              src={item.photo}
              alt=""
              width={44}
              height={44}
              className="w-11 h-11 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-accentLight text-accent font-semibold flex items-center justify-center shrink-0">
              {initials(item.name)}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-textPrimary">{item.name}</h3>
            <p className="text-xs text-textMuted">
              {item.class} · ID: {item.studentId}
            </p>
          </div>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-successLight text-success font-medium shrink-0">
          Active
        </span>
      </div>

      {/* Grade — the one info-grid field worth its own row */}
      <div className="text-sm">
        <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Grade</p>
        <p className="text-textPrimary font-medium">{item.grade}</p>
      </div>

      {(item.phone || item.address) && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          {item.phone && (
            <div>
              <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Phone</p>
              <p className="text-textPrimary">{item.phone}</p>
            </div>
          )}
          {item.address && (
            <div>
              <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Address</p>
              <p className="text-textPrimary truncate">{item.address}</p>
            </div>
          )}
        </div>
      )}

      {/* Footer: view / edit / delete, matching Edit/Remove pill buttons */}
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
        <Link href={`/list/students/${item.id}`}>
          <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border text-textPrimary hover:bg-accentLight transition-colors">
            <Image src="/view.png" alt="" width={14} height={14} />
            View
          </button>
        </Link>
        {role === "admin" && (
          <>
            <FormModal
              table="student"
              type="update"
              data={{
                id: item.id,
                name: item.name,
                phone: item.phone,
                address: item.address,
                classId: item.classId,
                gradeId: item.gradeId,
                parentId: item.parentId,
              }}
            />
            <FormModal table="student" type="delete" id={item.id} />
          </>
        )}
      </div>
    </div>
  );
};

export default StudentCard;