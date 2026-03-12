import type { Table, Row } from "@tanstack/table-core";

/** Tanstack Helper */
export function tsh(cell: { table: Table<any>; row: Row<any> }) {
  const { table, row } = cell;
  return {
    rowNum: table.getRowModel().flatRows.findIndex((r) => r.id === row.id) + 1,
  };
}