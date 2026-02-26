import TblCellValue from "$lib/components/tbl-cell-value.svelte";
import { renderComponent } from "$lib/components/ui/data-table/index.js";
import { formatFullName } from "$lib/name-formatter";
import type { ColumnDef } from "@tanstack/table-core";
import TblActions from "./tbl-actions.svelte";

export const columns: ColumnDef<User, unknown>[] = [
  {
    accessorKey: "user_pk",
    header: "USER ID",
  },
  {
    id: "fullname",
    header: "FULL NAME",
    accessorFn: (row) => formatFullName(row),
    cell: ({ row }) =>
      renderComponent(TblCellValue, { value: formatFullName(row.original), class: "text-wrap text-left" }),
  },
  {
    accessorKey: "designation",
    header: "DESIGNATION",
    cell: ({ row }) =>
      renderComponent(TblCellValue, { value: row.original.designation, class: "text-wrap text-left" }),
  },

  {
    id: "action",
    cell: ({ row }) =>
      renderComponent(TblActions, { user: row.original }),
  },
];
