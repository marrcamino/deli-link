<script lang="ts">
  import YearSelector from "$lib/components/inputs/year-selector.svelte";
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import { getDBConn } from "$lib/db";
  import { formatDate, formatFullName } from "$lib/utils";
  import {
    ArrowRight,
    Calendar,
    EllipsisVertical,
    Pencil,
    Trash2,
    Plus,
    FileX,
  } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import AddEditLeaveDialog from "./add-edit-leave-dialog.svelte";
  import { getLeaveContext } from "./context.svelte";
  import { getUser } from "$lib/helper/db-helper";

  const ctx = getLeaveContext();

  async function deleteLeave() {
    const db = await getDBConn();

    const res = await db.execute(
      "DELETE FROM leave_application WHERE leave_pk = ?",
      [ctx.openLeave?.leave_pk],
    );

    if (!res.rowsAffected) {
      toast.error("There was an error while deleting leave");
      return;
    }

    toast.success("Leave deleted successfully");

    ctx.remove(ctx.openLeave?.leave_pk!);
    ctx.deleteDialogState = false;
  }

  const calculateTotalDays = (from: string, to: string): number => {
    const startDate = new Date(from);
    const endDate = new Date(to);

    // Calculate difference in milliseconds
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());

    // Convert to days and add 1 (to include the start day)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };
</script>

<Sheet.Root
  bind:open={ctx.sheetState}
  onOpenChangeComplete={(isOpen) => {
    if (!isOpen) {
      ctx.listOfLeave = [];
      ctx.selectedYear = new Date().getFullYear().toString();
    }
  }}
>
  <Sheet.Content>
    <!-- #region DIALOGS -->
    <AddEditLeaveDialog />

    <AlertDialog.Root
      bind:open={ctx.deleteDialogState}
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen) ctx.openLeave = null;
      }}
    >
      <AlertDialog.Content class="sm:max-w-sm">
        <AlertDialog.Header>
          <AlertDialog.Title>Delete Leave Application?</AlertDialog.Title>
          <AlertDialog.Description>
            This will permanently delete leave application. This action is
            irreversible.
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
          <AlertDialog.Action onclick={deleteLeave}>Continue</AlertDialog.Action
          >
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Root>
    <!-- #endregion  -->

    <ScrollArea viewPortClasses="max-h-dvh" class="px-4">
      <Sheet.Header class="sticky top-0 z-1 bg-background px-0">
        <div class="font-semibold text-lg">
          {ctx.openUser && formatFullName(ctx.openUser)}
        </div>
        <div class="flex mt-1">
          <div class=" self-end">
            <div class="leading-4 text-lg font-semibold">
              {ctx.countTotalLeaveDays(ctx.listOfLeave)} out of 5
            </div>
            <div class="leading-4 text-sm text-muted-foreground">
              Leave Balance
            </div>
          </div>
          <div class="ml-auto flex gap-2">
            <YearSelector
              size="sm"
              class="w-29"
              bind:value={ctx.selectedYear}
            />
            <Button size="sm" onclick={() => (ctx.addEditDialogState = true)}>
              Add Leave
            </Button>
          </div>
        </div>
      </Sheet.Header>
      <div class="mt-2">
        {#each ctx.listOfLeave as leave (leave.leave_pk)}
          {@const totalDays = calculateTotalDays(
            leave.inclusive_from,
            leave.inclusive_to,
          )}
          <div class="pt-2 first:pt-0">
            <Card.Root class="overflow-hidden relative rounded-lg">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger
                  class="absolute top-1.5 p-1 right-1.5 hover:bg-accent rounded-md"
                >
                  <EllipsisVertical class="text-muted-foreground size-4" />
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end">
                  <DropdownMenu.Group>
                    <DropdownMenu.Item
                      onclick={() => {
                        ctx.openLeave = leave;
                        ctx.addEditDialogState = true;
                      }}
                    >
                      <Pencil />
                      Edit
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      variant="destructive"
                      onclick={() => {
                        ctx.openLeave = leave;
                        ctx.deleteDialogState = true;
                      }}
                    >
                      <Trash2 />
                      Delete
                    </DropdownMenu.Item>
                  </DropdownMenu.Group>
                </DropdownMenu.Content>
              </DropdownMenu.Root>

              <Card.Content class="px-4">
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <div class="bg-secondary p-2 text-primary rounded-lg">
                      <Calendar class="w-4 h-4" />
                    </div>
                    <div class="text-sm">
                      <p class="font-semibold flex items-center gap-2">
                        {formatDate(leave.inclusive_from)}
                        <ArrowRight class="text-muted-foreground size-4" />
                        {formatDate(leave.inclusive_to)}
                      </p>
                      <p class="text-xs text-muted-foreground font-light">
                        Duration Period
                      </p>
                    </div>
                  </div>

                  <div class="text-right pr-2 absolute bottom-1.5 right-0">
                    <span
                      class="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                    >
                      {totalDays}
                      Day{totalDays > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </Card.Content>
            </Card.Root>
          </div>
        {:else}
          <Empty.Root class="border">
            <Empty.Header>
              <Empty.Media variant="icon">
                <FileX />
              </Empty.Media>
              <Empty.Title>No Leave Applications</Empty.Title>
              <Empty.Description>
                No leave records found for the year {ctx.selectedYear}.
              </Empty.Description>
            </Empty.Header>
            <Empty.Content>
              <Button
                variant="outline"
                size="sm"
                onclick={() => (ctx.addEditDialogState = true)}
              >
                <Plus />
                Add New Leave
              </Button>
            </Empty.Content>
          </Empty.Root>
        {/each}
      </div>
    </ScrollArea>
    <!-- DIALOG -->
  </Sheet.Content>
</Sheet.Root>
