import FormModal from "@/components/FormModal";
import Table from "@/components/Table";
import { getRoute } from "@/lib/graphql/fetchers";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

type Stop = {
  id: string;
  name: string;
  order: number;
  time?: string;
  routeId: string;
};

const columns = [
  { headerKey: "order", accessor: "order" },
  { headerKey: "stopName", accessor: "name" },
  { headerKey: "time", accessor: "time", className: "hidden md:table-cell" },
  { headerKey: "actions", accessor: "action" },
];

const RouteDetailPage = async ({ params }: { params: { id: string } }) => {
  const role = cookies().get("role")?.value ?? "admin";
  const canEdit = role === "admin";
  const route = await getRoute(params.id);

  if (!route) return notFound();

  const stops: Stop[] = [...(route.stops ?? [])].sort((a, b) => a.order - b.order);

  const renderRow = (item: Stop) => (
    <tr
      key={item.id}
      className="border-b border-border even:bg-bg/50 text-sm hover:bg-accentLight transition-colors"
    >
      <td className="p-4">{item.order}</td>
      <td className="font-semibold">{item.name}</td>
      <td className="hidden md:table-cell">{item.time ?? "-"}</td>
      <td>
        <div className="flex items-center gap-2">
          {canEdit && (
            <>
              <FormModal table="stop" type="update" data={item} />
              <FormModal table="stop" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-cardBg border border-border shadow-sm p-4 rounded-2xl flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold text-textPrimary">
          {route.name} — Stops
        </h1>
        {canEdit && <FormModal table="stop" type="create" data={{ routeId: route.id }} />}
      </div>
      <Table columns={columns} renderRow={renderRow} data={stops} />
    </div>
  );
};

export default RouteDetailPage;