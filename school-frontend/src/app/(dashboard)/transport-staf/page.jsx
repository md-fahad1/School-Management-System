import Link from "next/link";
import { getMyVehicles } from "@/lib/graphql/fetchers";

const statusColor = {
  ACTIVE: "text-success",
  MAINTENANCE: "text-warning",
  INACTIVE: "text-textMuted",
};

const TransportStaffPage = async () => {
  const vehicles = await getMyVehicles();
  const active = vehicles.filter((v) => v.status === "ACTIVE").length;

  return (
    <div className="p-4 flex flex-col gap-4">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-cardBg border border-border p-4 rounded-2xl shadow-sm">
          <p className="text-xs text-textMuted">Vehicles assigned to me</p>
          <p className="text-xl font-semibold text-textPrimary">{vehicles.length}</p>
        </div>
        <div className="bg-cardBg border border-border p-4 rounded-2xl shadow-sm">
          <p className="text-xs text-textMuted">Active</p>
          <p className="text-xl font-semibold text-success">{active}</p>
        </div>
        <div className="bg-cardBg border border-border p-4 rounded-2xl shadow-sm">
          <p className="text-xs text-textMuted">Needs attention</p>
          <p className="text-xl font-semibold text-warning">{vehicles.length - active}</p>
        </div>
      </div>

      <div className="bg-cardBg border border-border shadow-sm p-4 rounded-2xl">
        <h2 className="text-lg font-semibold text-textPrimary mb-4">My vehicles</h2>
        {vehicles.length === 0 ? (
          <p className="text-sm text-textMuted">No vehicles assigned to you yet — ask an admin to assign one.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-textSecondary border-b border-border">
                <th className="p-2">Vehicle No.</th>
                <th className="p-2">Type</th>
                <th className="p-2">Capacity</th>
                <th className="p-2">Route</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="border-b border-border even:bg-bg/50">
                  <td className="p-2 font-semibold text-textPrimary">{v.vehicleNumber}</td>
                  <td className="p-2 text-textSecondary">{v.type}</td>
                  <td className="p-2 text-textSecondary">{v.capacity}</td>
                  <td className="p-2 text-textSecondary">{v.route}</td>
                  <td className={`p-2 font-medium ${statusColor[v.status] ?? "text-textMuted"}`}>{v.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Link href="/list/vehicles">
        <button className="bg-infoLight text-info px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity w-max">View all vehicles</button>
      </Link>
    </div>
  );
};

export default TransportStaffPage;