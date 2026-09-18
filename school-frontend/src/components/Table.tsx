import React from "react";

const Table = ({
  columns,
  renderRow,
  renderCard,
  data,
}: {
  columns: { header: string; accessor: string; className?: string }[];
  renderRow: (item: any) => React.ReactNode;
  // Optional: a page can supply its own polished mobile card design.
  // If omitted, Table builds a generic label:value card automatically
  // from the same renderRow() output used for the desktop table.
  renderCard?: (item: any) => React.ReactNode;
  data: any[];
}) => {
  const actionIndex = columns.findIndex((c) => c.accessor === "action");

  return (
    <>
      {/* DESKTOP / TABLET — unchanged table */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="w-full mt-4 min-w-[640px]">
          <thead>
            <tr className="text-left text-textSecondary text-xs uppercase tracking-wide border-b border-border">
              {columns.map((col) => (
                <th key={col.accessor} className={`py-3 ${col.className ?? ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-sm text-textMuted">
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((item) => renderRow(item))
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE — card list, no horizontal scroll */}
      <div className="md:hidden flex flex-col gap-3 mt-4">
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-textMuted">No records found.</p>
        ) : (
          data.map((item, idx) => {
            if (renderCard) {
              return <React.Fragment key={item.id ?? idx}>{renderCard(item)}</React.Fragment>;
            }

            // Generic fallback: pull the <td> children out of the same
            // <tr> used for desktop, dropping the "hidden md:table-cell"
            // classes those <td>s carry (those were only for the table's
            // column layout, not relevant to a stacked card).
            const row = renderRow(item) as React.ReactElement;
            const cells = React.Children.toArray(row.props.children) as React.ReactElement[];
            const headerIndex = cells.findIndex((_, i) => i !== actionIndex);

            return (
              <div
                key={item.id ?? idx}
                className="bg-cardBg border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-3"
              >
                {headerIndex !== -1 && <div>{cells[headerIndex]?.props?.children}</div>}

                <div className="flex flex-col gap-2 text-sm">
                  {columns.map((col, i) => {
                    if (i === actionIndex || i === headerIndex) return null;
                    return (
                      <div key={col.accessor} className="flex items-center justify-between gap-3">
                        <span className="text-textMuted text-xs uppercase tracking-wide shrink-0">
                          {col.header}
                        </span>
                        <span className="text-textPrimary text-right truncate">
                          {cells[i]?.props?.children}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {actionIndex !== -1 && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                    {cells[actionIndex]?.props?.children}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default Table;