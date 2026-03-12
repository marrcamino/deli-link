<script lang="ts">
  import RouteContent from "$lib/components/route-content.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Printer } from "@lucide/svelte";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { onMount } from "svelte";
  import { setDTRContext } from "./context.svelte";

  import {
    createSvelteTable,
    FlexRender,
  } from "$lib/components/ui/data-table/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import {
    type ColumnFiltersState,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    type SortingState,
    type VisibilityState,
  } from "@tanstack/table-core";
  import { columns } from "./tbl-schema";

  const ctx = setDTRContext();

  let sorting = $state<SortingState>([]);
  let columnFilters = $state<ColumnFiltersState>([]);
  let columnVisibility = $state<VisibilityState>({});
  const table = createSvelteTable({
    get data() {
      return ctx.users;
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),

    onSortingChange: (updater) => {
      if (typeof updater === "function") {
        sorting = updater(sorting);
      } else {
        sorting = updater;
      }
    },
    onColumnVisibilityChange: (updater) => {
      if (typeof updater === "function") {
        columnVisibility = updater(columnVisibility);
      } else {
        columnVisibility = updater;
      }
    },
    onGlobalFilterChange: (updater) => {
      if (typeof updater === "function") {
        columnFilters = updater(columnFilters);
      } else {
        columnFilters = updater;
      }
    },
    onColumnFiltersChange: (updater) => {
      if (typeof updater === "function") {
        columnFilters = updater(columnFilters);
      } else {
        columnFilters = updater;
      }
    },
    state: {
      get sorting() {
        return sorting;
      },
      get columnVisibility() {
        return columnVisibility;
      },
      get globalFilter() {
        return columnFilters;
      },
    },
  });
  onMount(async () => {
    ctx.loadUsers();
    await getCurrentWindow().setTitle(`Daily Time Record`);
  });
</script>

<RouteContent bind:contentRef={ctx.pageContent}>
  {#snippet header()}
    <div class="w-full">
      <div
        class="flex items-center w-full place-self-center md:max-w-xl"
      >
        <Button class="ml-auto">
          <Printer />
          Import Logs
        </Button>
      </div>
    </div>
  {/snippet}

  <div class="p-4">
    <div
      class="rounded-md min-w-0 w-full md:max-w-xl h-max border place-self-center"
    >
      <Table.Root>
        <Table.Header class="bg-accent">
          {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
            <Table.Row class="hover:[&>th,td]:bg-transparent">
              {#each headerGroup.headers as header (header.id)}
                <Table.Head
                  colspan={header.colSpan}
                  class="first:rounded-tl-md last:rounded-tr-md text-xs"
                >
                  {#if !header.isPlaceholder}
                    <FlexRender
                      content={header.column.columnDef.header}
                      context={header.getContext()}
                    />
                  {/if}
                </Table.Head>
              {/each}
            </Table.Row>
          {/each}
        </Table.Header>
        <Table.Body>
          {#each table.getRowModel().rows as row (row.id)}
            <Table.Row>
              {#each row.getVisibleCells() as cell (cell.id)}
                <Table.Cell>
                  <FlexRender
                    content={cell.column.columnDef.cell}
                    context={cell.getContext()}
                  />
                </Table.Cell>
              {/each}
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    </div>
  </div>
</RouteContent>
