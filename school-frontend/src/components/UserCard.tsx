import Image from "next/image";

const colorMap: { [key: string]: string } = {
  student: "bg-lamaSky",
  teacher: "bg-lamaYellow",
  parent: "bg-lamaPurple",
  admin: "bg-lamaSky",
};

const UserCard = ({ type, count = 0 }: { type: string; count?: number }) => {
  return (
    <div className={`rounded-2xl ${colorMap[type] ?? "bg-lamaSky"} p-4 flex-1 min-w-[130px] shadow-sm`}>
      <div className="flex justify-between items-center">
        <span className="text-[10px] bg-white/70 px-2 py-1 rounded-full text-brandPurple font-medium">
          2024/25
        </span>
        <Image src="/more.png" alt="" width={20} height={20} />
      </div>
      <h1 className="text-2xl font-semibold my-4 text-brandInk">{count.toLocaleString()}</h1>
      <h2 className="capitalize text-sm font-medium text-gray-600">{type}s</h2>
    </div>
  );
};

export default UserCard;