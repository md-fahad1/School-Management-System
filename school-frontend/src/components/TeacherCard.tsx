import Image from "next/image";
import Link from "next/link";
import FormModal from "./FormModal";

type Teacher = {
  id: string;
  teacherId: string;
  name: string;
  email?: string;
  photo?: string;
  phone?: string;
  subjects: string[];
  subjectIds: string[];
  classes: string[];
  address?: string;
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const TeacherCard = ({ item, role }: { item: Teacher; role: string }) => {
  return (
    <div className="bg-cardBg border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-4">
      {/* Header: avatar, name, email, teacher ID badge (top-right) */}
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
            <p className="text-xs text-textMuted">{item.email ?? "-"}</p>
          </div>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-infoLight text-info font-medium shrink-0">
          {item.teacherId}
        </span>
      </div>

      {/* Subjects / Classes — taught subjects shown as small tags, like
          the "Manager Manager" tags in the reference image */}
      {item.subjects.length > 0 && (
        <div>
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1.5">Subjects</p>
          <div className="flex flex-wrap gap-1.5">
            {item.subjects.map((s) => (
              <span
                key={s}
                className="text-xs px-2 py-1 rounded-full bg-accentLight text-accent font-medium"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Classes</p>
          <p className="text-textPrimary font-medium">{item.classes.join(", ") || "-"}</p>
        </div>
        <div>
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Phone</p>
          <p className="text-textPrimary font-medium">{item.phone ?? "-"}</p>
        </div>
      </div>

      {item.address && (
        <div className="text-sm">
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Address</p>
          <p className="text-textPrimary truncate">{item.address}</p>
        </div>
      )}

      {/* Footer: view / edit / delete */}
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
        <Link href={`/list/teachers/${item.id}`}>
          <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border text-textPrimary hover:bg-accentLight transition-colors">
            <Image src="/view.png" alt="" width={14} height={14} />
            View
          </button>
        </Link>
        {role === "admin" && (
          <>
            <FormModal
              table="teacher"
              type="update"
              data={{
                id: item.id,
                name: item.name,
                phone: item.phone,
                address: item.address,
                subjectIds: item.subjectIds,
              }}
            />
            <FormModal table="teacher" type="delete" id={item.id} />
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherCard;