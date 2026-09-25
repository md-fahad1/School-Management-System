import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { getBooks } from "@/lib/graphql/fetchers";
import { cookies } from "next/headers";
import Link from "next/link";
import BookCard from "@/components/BookCard";
import { parsePage, type ListSearchParams } from "@/lib/pagination";
type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
};

const columns = [
  { headerKey: "title", accessor: "title" },
  { headerKey: "author", accessor: "author", className: "hidden md:table-cell" },
  { headerKey: "isbn", accessor: "isbn", className: "hidden md:table-cell" },
  { headerKey: "category", accessor: "category", className: "hidden lg:table-cell" },
  { headerKey: "copies", accessor: "copies", className: "hidden lg:table-cell" },
  { headerKey: "actions", accessor: "action" },
];

const LibraryListPage = async ({ searchParams }: { searchParams?: ListSearchParams }) => {
  const role = cookies().get("role")?.value ?? "admin";
 const page = parsePage(searchParams?.page);
  const search = searchParams?.search?.trim() || undefined;
  const { rows: books, hasNextPage } = await getBooks(search, page);

  const renderRow = (item: Book) => (
    <tr
      key={item.id}
      className="border-b border-border even:bg-bg/50 text-sm hover:bg-accentLight transition-colors"
    >
      <td className="p-4">
        <h3 className="font-semibold">{item.title}</h3>
      </td>
      <td className="hidden md:table-cell">{item.author}</td>
      <td className="hidden md:table-cell">{item.isbn}</td>
      <td className="hidden lg:table-cell">{item.category}</td>
      <td className="hidden lg:table-cell">
        <span className={item.availableCopies === 0 ? "text-red-500" : ""}>
          {item.availableCopies} / {item.totalCopies}
        </span>
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormModal table="book" type="update" data={item} />
              <FormModal table="book" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="	bg-cardBg border border-border shadow-sm p-4 rounded-2xl flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold text-textPrimary">Library — Books</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <Link href="/list/library/loans">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-infoLight text-xs">
                Loans
              </button>
            </Link>
            {role === "admin" && <FormModal table="book" type="create" />}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table
        columns={columns}
        renderRow={renderRow}
        renderCard={(item) => <BookCard item={item} role={role} />}
        data={books}
      />
      {/* PAGINATION */}
      <Pagination page={page} hasNextPage={hasNextPage} />
    </div>
  );
};

export default LibraryListPage;