export default function DashboardLoading() {
  return (
    <div className="p-4 flex flex-col gap-4 animate-pulse">
      <div className="h-6 w-40 bg-gray-200 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="h-24 bg-gray-200 rounded-2xl" />
        <div className="h-24 bg-gray-200 rounded-2xl" />
        <div className="h-24 bg-gray-200 rounded-2xl" />
        <div className="h-24 bg-gray-200 rounded-2xl" />
      </div>
      <div className="h-72 bg-gray-200 rounded-2xl" />
    </div>
  );
}