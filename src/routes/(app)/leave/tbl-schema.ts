import { tableRowNumber } from "$lib/helper";
import { formatFullName } from "$lib/utils";
import type { ColumnDef } from "@tanstack/table-core";
import TblActions from "./tbl-actions.svelte";
import { renderComponent } from "$lib/components/ui/data-table/index.js";
import TblCellUsedLeave from "./tbl-cell-used-leave.svelte";
import TblCellTotalPending from "./tbl-cell-total-pending.svelte";
import { divWrap } from "$lib/components/display/div-wrapper.svelte";

export type UserWithLeaveStatus = User & {
  wellnesslLeaveBal: number,
  personalLeaveBal: number,
  pending: number
}
export const columns: ColumnDef<UserWithLeaveStatus, unknown>[] = [
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
    id: "leave-bal",
    header: () => divWrap("LEAVE BALANCE", 'text-center'),
    cell: ({ row }) =>
      renderComponent(TblCellUsedLeave, { user: row.original }),

  },
  {
    id: "total-pending",
    header: () => divWrap("PENDING", 'text-center'),
    cell: ({ row }) =>
      renderComponent(TblCellTotalPending, { user: row.original }),
  },
  {
    id: "action",
    cell: ({ row }) =>
      renderComponent(TblActions, { user: row.original }),
  }
]