import Image from "next/image";
import FormModal from "./FormModal";

type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
};

const BookCard = ({ item, role }: { item: Book; role: string }) => {
  const outOfStock = item.availableCopies === 0;

  return (
    <div className="bg-cardBg border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-4">
      {/* Header: book icon, title/author, availability badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-accentLight flex items-center justify-center shrink-0">
            <Image src="/subject.png" alt="" width={20} height={20} />
          </div>
          <div>
            <h3 className="font-semibold text-textPrimary">{item.title}</h3>
            <p className="text-xs text-textMuted">{item.author}</p>
          </div>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
            outOfStock ? "bg-dangerLight text-danger" : "bg-successLight text-success"
          }`}
        >
          {item.availableCopies}/{item.totalCopies}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1">ISBN</p>
          <p className="text-textPrimary font-medium truncate">{item.isbn}</p>
        </div>
        <div>
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Category</p>
          <p className="text-textPrimary font-medium">{item.category || "-"}</p>
        </div>
      </div>

      {/* Footer: edit / delete */}
      {role === "admin" && (
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <FormModal table="book" type="update" data={item} />
          <FormModal table="book" type="delete" id={item.id} />
        </div>
      )}
    </div>
  );
};

export default BookCard;