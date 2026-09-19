import Link from "next/link";
import { Plus, Copy, Eye, Pencil, ShieldCheck } from "lucide-react";
import { getCustomRoles } from "@/lib/graphql/fetchers";
import { prettyRoleName } from "@/lib/roles";
import DeleteRoleButton from "@/components/DeleteRoleButton";

type RoleItem = {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  baseRole: string | null;
  permissionKeys: string[];
};

const RoleCard = ({ role }: { role: RoleItem }) => (
  <div className="bg-cardBg border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-3">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-accentLight flex items-center justify-center shrink-0">
          <ShieldCheck size={18} className="text-accent" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-textPrimary truncate">
            {role.isSystem ? prettyRoleName(role.name) : role.name}
          </h3>
          <p className="text-xs text-textMuted">{role.permissionKeys.length} permissions</p>
        </div>
      </div>
      <span
        className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
          role.isSystem ? "bg-infoLight text-info" : "bg-successLight text-success"
        }`}
      >
        {role.isSystem ? "Built-in" : "Custom"}
      </span>
    </div>

    <p className="text-sm text-textSecondary min-h-[2.5rem]">
      {role.isSystem ? "Default permissions for this account type." : role.description || "No description."}
    </p>

    <div className="flex items-center gap-2">
      {role.isSystem ? (
        <>
          <Link href={`/admin/roles/${role.id}`} className="btn-secondary !py-1.5 !px-3">
            <Eye size={14} /> View
          </Link>
          <Link href={`/admin/roles/new?from=${role.id}`} className="btn-secondary !py-1.5 !px-3">
            <Copy size={14} /> Clone
          </Link>
        </>
      ) : (
        <>
          <Link href={`/admin/roles/${role.id}`} className="btn-secondary !py-1.5 !px-3">
            <Pencil size={14} /> Edit
          </Link>
          <DeleteRoleButton id={role.id} name={role.name} />
        </>
      )}
    </div>
  </div>
);

const RolesPage = async () => {
  // The platform-owner role has no school permissions, so hide it here.
  const roles = (await getCustomRoles()).filter((r: RoleItem) => r.baseRole !== "SUPER_ADMIN");
  const custom = roles.filter((r: RoleItem) => !r.isSystem);
  const builtIn = roles.filter((r: RoleItem) => r.isSystem);

  return (
    <div className="bg-cardBg border border-border shadow-sm p-4 rounded-2xl flex-1 m-4 mt-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-textPrimary">Roles &amp; Permissions</h1>
          <p className="text-sm text-textMuted">
            Decide exactly what each person can see and do. Built-in roles can be cloned to make your own.
          </p>
        </div>
        <Link
          href="/admin/roles/new"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-white hover:opacity-90 whitespace-nowrap"
        >
          <Plus size={16} /> Create role
        </Link>
      </div>

      <h2 className="mt-6 mb-3 text-sm font-semibold text-textPrimary">Your custom roles</h2>
      {custom.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-6 text-center">
          <p className="font-medium text-textPrimary">No custom roles yet</p>
          <p className="text-sm text-textMuted mt-1">
            Create one from scratch, or clone a built-in role below and adjust it.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {custom.map((r: RoleItem) => (
            <RoleCard key={r.id} role={r} />
          ))}
        </div>
      )}

      <h2 className="mt-8 mb-3 text-sm font-semibold text-textPrimary">Built-in roles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {builtIn.map((r: RoleItem) => (
          <RoleCard key={r.id} role={r} />
        ))}
      </div>
    </div>
  );
};

export default RolesPage;