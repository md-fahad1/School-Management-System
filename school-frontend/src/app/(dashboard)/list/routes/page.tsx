import FormModal from "@/components/FormModal";
import Table from "@/components/Table";
import { getRoutes } from "@/lib/graphql/fetchers";
import { cookies } from "next/headers";
import Link from "next/link";

type Route = {
  id: string;
  name: string;
  description?: string;
  stops: { id: string }[];
};

const columns = [
  { headerKey: "routeName", accessor: "name" },
  { headerKey: "description", accessor: "description", className: "hidden md:table-cell" },
  { headerKey: "stops", accessor: "stops" },
  { headerKey: "actions", accessor: "action" },
];

const RouteListPage = async () => {
  const role = cookies().get("role")?.value ?? "admin";
  const canEdit = role === "admin";
  const routes: Route[] = await getRoutes();

  const renderRow = (item: Route) => (
    <tr
      key={item.id}
      className="border-b border-border even:bg-bg/50 text-sm hover:bg-accentLight transition-colors"
    >
      <td className="p-4 font-semibold">
        <Link href={`/list/routes/${item.id}`} className="hover:underline">
          {item.name}
        </Link>
      </td>
      <td className="hidden md:table-cell">{item.description ?? "-"}</td>
      <td>{item.stops?.length ?? 0} stop(s)</td>
      <td>
        <div className="flex items-center gap-2">
          {canEdit && (
            <>
              <FormModal table="route" type="update" data={item} />
              <FormModal table="route" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-cardBg border border-border shadow-sm p-4 rounded-2xl flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold text-textPrimary">Routes</h1>
        {canEdit && <FormModal table="route" type="create" />}
      </div>
      <Table columns={columns} renderRow={renderRow} data={routes} />
    </div>
  );
};

export default RouteListPage;