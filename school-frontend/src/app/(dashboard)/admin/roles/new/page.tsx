import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RoleForm from "@/components/forms/RoleForm";
import { getPermissions, getCustomRole } from "@/lib/graphql/fetchers";
import { prettyRoleName } from "@/lib/roles";

const NewRolePage = async ({ searchParams }: { searchParams?: { from?: string } }) => {
  const fromId = searchParams?.from;
  const [permissions, source] = await Promise.all([
    getPermissions(),
    fromId ? getCustomRole(fromId) : Promise.resolve(null),
  ]);

  const sourceName = source ? (source.isSystem ? prettyRoleName(source.name) : source.name) : "";

  return (
    <div className="flex-1 m-4 mt-0">
      <Link href="/admin/roles" className="inline-flex items-center gap-1.5 text-sm text-textSecondary hover:text-textPrimary mb-3">
        <ArrowLeft size={16} /> Back to roles
      </Link>

      <div className="bg-cardBg border border-border shadow-sm p-4 md:p-6 rounded-2xl">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-textPrimary">
            {source ? `Clone “${sourceName}”` : "Create a new role"}
          </h1>
          <p className="text-sm text-textMuted mt-1">
            {source
              ? "Adjust the name and permissions, then save it as your own custom role."
              : "Give the role a name and choose exactly what people with this role can do."}
          </p>
        </div>

        <RoleForm
          mode="create"
          permissions={permissions}
          initial={
            source
              ? { name: `${sourceName} (copy)`, description: source.description, permissionKeys: source.permissionKeys }
              : undefined
          }
        />
      </div>
    </div>
  );
};

export default NewRolePage;