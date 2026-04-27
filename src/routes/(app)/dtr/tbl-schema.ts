import { tableRowNumber } from "$lib/helper";
import { formatFullName } from "$lib/utils";
import type { ColumnDef } from "@tanstack/table-core";
import TblActions from "./tbl-actions.svelte";
import { renderComponent } from "$lib/components/ui/data-table/index.js";

export const columns: ColumnDef<User, unknown>[] = [
  {
    id: "number",
    header: "#",
    cell: (cell) => tableRowNumber(cell).rowNum
  },
  {
    id: "fullname",
    header: "FULLNAME",
    accessorFn: (row) => formatFullName(row),
    cell: ({ row }) => formatFullName(row.original, { abbreviateMiddle: true })
  },
  {
    id: "action",
    cell: ({ row }) =>
      renderComponent(TblActions, { user: row.original }),
  }
]