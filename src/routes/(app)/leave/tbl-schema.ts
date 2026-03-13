import { tsh } from "$lib/helper";
import { formatFullName } from "$lib/utils";
import type { ColumnDef } from "@tanstack/table-core";
import TblActions from "./tbl-actions.svelte";
import { renderComponent } from "$lib/components/ui/data-table/index.js";
import TblCellUsedLeave from "./tbl-cell-used-leave.svelte";

export const columns: ColumnDef<User, unknown>[] = [
  {
    id: "number",
    header: "#",
    cell: (cell) => tsh(cell).rowNum
  },
  {
    id: "fullname",
    header: "FULLNAME",
    accessorFn: (row) => formatFullName(row),
    cell: ({ row }) => formatFullName(row.original, { abbreviateMiddle: true })
  },
  {
    id: "usedLeave",
    header: "USED LEAVE",
    cell: ({ row }) =>
      renderComponent(TblCellUsedLeave, { user: row.original }),

  },
  {
    id: "action",
    cell: ({ row }) =>
      renderComponent(TblActions, { user: row.original }),
  }
]