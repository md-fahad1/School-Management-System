import FormModal from "./FormModal";

type Parent = {
  id: string;
  name: string;
  email?: string;
  students: string[];
  phone?: string;
  address?: string;
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const ParentCard = ({ item, role }: { item: Parent; role: string }) => {
  return (
    <div className="bg-cardBg border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-4">
      {/* Header: initials avatar, name, email */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-accentLight text-accent font-semibold flex items-center justify-center shrink-0">
          {initials(item.name)}
        </div>
        <div>
          <h3 className="font-semibold text-textPrimary">{item.name}</h3>
          <p className="text-xs text-textMuted">{item.email ?? "-"}</p>
        </div>
      </div>

      {/* Linked students — shown as tags since a parent can have more
          than one child */}
      {item.students.length > 0 && (
        <div>
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1.5">Children</p>
          <div className="flex flex-wrap gap-1.5">
            {item.students.map((s) => (
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
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Phone</p>
          <p className="text-textPrimary font-medium">{item.phone ?? "-"}</p>
        </div>
        <div>
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Address</p>
          <p className="text-textPrimary font-medium truncate">{item.address ?? "-"}</p>
        </div>
      </div>

      {/* Footer: edit / delete */}
      {role === "admin" && (
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <FormModal table="parent" type="update" data={item} />
          <FormModal table="parent" type="delete" id={item.id} />
        </div>
      )}
    </div>
  );
};

export default ParentCard;