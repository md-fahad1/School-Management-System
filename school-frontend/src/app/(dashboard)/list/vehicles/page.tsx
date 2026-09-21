import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import { getVehicles } from "@/lib/graphql/fetchers";
import { parsePage, type ListSearchParams } from "@/lib/pagination";
import { cookies } from "next/headers";
import VehicleCard from "@/components/VehicleCard";
type Vehicle = {
  id: string;
  vehicleNumber: string;
  type: string;
  capacity: number;
  driverName: string;
  route: string;
  status: string;
  transportStaffName: string;
};

const columns = [
  { header: "Vehicle No.", accessor: "vehicleNumber" },
  { header: "Type", accessor: "type", className: "hidden md:table-cell" },
  { header: "Capacity", accessor: "capacity", className: "hidden md:table-cell" },
  { header: "Driver", accessor: "driverName" },
  { header: "Route", accessor: "route", className: "hidden lg:table-cell" },
  { header: "Status", accessor: "status" },
  { header: "Actions", accessor: "action" },
];

const statusColor: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  MAINTENANCE: "bg-yellow-100 text-yellow-700",
  INACTIVE: "bg-gray-100 text-gray-700",
};

const VehicleListPage = async ({ searchParams }: { searchParams?: ListSearchParams }) => {
  const role = cookies().get("role")?.value ?? "admin";
  const canEdit = role === "admin";
  const page = parsePage(searchParams?.page);
  const { rows: vehicles, hasNextPage } = await getVehicles(page);

  const renderRow = (item: Vehicle) => (
    <tr
      key={item.id}
      className="border-b border-border even:bg-bg/50 text-sm hover:bg-accentLight transition-colors"
    >
      <td className="p-4 font-semibold">{item.vehicleNumber}</td>
      <td className="hidden md:table-cell">{item.type}</td>
      <td className="hidden md:table-cell">{item.capacity}</td>
      <td>{item.driverName}</td>
      <td className="hidden lg:table-cell">{item.route}</td>
      <td>
        <span className={`px-2 py-1 rounded-full text-xs ${statusColor[item.status] ?? "bg-gray-100 text-gray-700"}`}>
          {item.status}
        </span>
      </td>
      <td>
        <div className="flex items-center gap-2">
          {canEdit && (
            <>
              <FormModal table="vehicle" type="update" data={item} />
              <FormModal table="vehicle" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-cardBg border border-border shadow-sm p-4 rounded-2xl flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold text-textPrimary">Vehicles</h1>
        {canEdit && <FormModal table="vehicle" type="create" />}
      </div>
      <Table
        columns={columns}
        renderRow={renderRow}
        renderCard={(item) => <VehicleCard item={item} role={role} />}
        data={vehicles}
      />
      <Pagination page={page} hasNextPage={hasNextPage} />
    </div>
  );
};

export default VehicleListPage;