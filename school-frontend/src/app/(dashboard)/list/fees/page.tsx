import FormModal from "@/components/FormModal";
import Table from "@/components/Table";
import { getFeeStructures } from "@/lib/graphql/fetchers";
import { cookies } from "next/headers";
import Link from "next/link";

type FeeStructure = {
  id: string;
  name: string;
  amount: number;
  frequency: string;
};

const columns = [
  { header: "Name", accessor: "name" },
  { header: "Amount", accessor: "amount" },
  { header: "Frequency", accessor: "frequency", className: "hidden md:table-cell" },
  { header: "Actions", accessor: "action" },
];

const FeesListPage = async () => {
  const role = cookies().get("role")?.value ?? "admin";
  const feeStructures = await getFeeStructures();

  const renderRow = (item: FeeStructure) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">
        <h3 className="font-semibold">{item.name}</h3>
      </td>
      <td>${item.amount.toFixed(2)}</td>
      <td className="hidden md:table-cell">{item.frequency}</td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormModal table="feeStructure" type="update" data={item} />
              <FormModal table="feeStructure" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Fee Structures</h1>
        <div className="flex items-center gap-4">
          <Link href="/list/fees/invoices">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaSky text-xs">
              Invoices
            </button>
          </Link>
          {role === "admin" && <FormModal table="feeStructure" type="create" />}
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={feeStructures} />
    </div>
  );
};

export default FeesListPage;