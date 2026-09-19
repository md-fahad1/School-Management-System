import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Copy, Lock } from "lucide-react";
import RoleForm from "@/components/forms/RoleForm";
import { getPermissions, getCustomRole } from "@/lib/graphql/fetchers";
import { prettyRoleName } from "@/lib/roles";

const EditRolePage = async ({ params }: { params: { id: string } }) => {
  const [permissions, role] = await Promise.all([getPermissions(), getCustomRole(params.id)]);
  if (!role) notFound();

  const title = role.isSystem ? prettyRoleName(role.name) : role.name;

  return (
    <div className="flex-1 m-4 mt-0">
      <Link
        href="/admin/roles"
        className="inline-flex items-center gap-1.5 text-sm text-textSecondary hover:text-textPrimary mb-3"
      >
        <ArrowLeft size={16} /> Back to roles
      </Link>

      <div className="bg-cardBg border border-border shadow-sm p-4 md:p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-lg font-semibold text-textPrimary">
              {role.isSystem ? title : `Edit “${title}”`}
            </h1>
            {role.isSystem && (
              <p className="text-sm text-textMuted inline-flex items-center gap-1.5 mt-1">
                <Lock size={14} /> Built-in role — read only. Clone it to make your own version.
              </p>
            )}
          </div>
          {role.isSystem && (
            <Link href={`/admin/roles/new?from=${role.id}`} className="btn-accent">
              <Copy size={16} /> Clone this role
            </Link>
          )}
        </div>

        <RoleForm
          mode="update"
          permissions={permissions}
          readOnly={role.isSystem}
          initial={{
            id: role.id,
            name: role.isSystem ? title : role.name,
            description: role.description,
            permissionKeys: role.permissionKeys,
          }}
        />
      </div>
    </div>
  );
};

export default EditRolePage;