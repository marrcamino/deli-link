<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import {
    Calendar,
    Pencil,
    Trash2,
    ArrowRight,
    EllipsisVertical,
  } from "@lucide/svelte";
  import AddEditLeaveDialog from "./add-edit-leave-dialog.svelte";
  import { getLeaveContext } from "./context.svelte";
  import { formatDate } from "$lib/utils";
  import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import { getDBConn } from "$lib/db";
  import { toast } from "svelte-sonner";

  const ctx = getLeaveContext();

  async function deleteLeave() {
    const db = await getDBConn();

    const res = await db.execute("DELETE FROM leave_application WHERE leave_pk = ?", [
      ctx.openLeave?.leave_pk,
    ]);

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
    if (!isOpen) ctx.listOfLeave = [];
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
          <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
          <AlertDialog.Description>
            This action cannot be undone. This will permanently leave
            application.
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

    <Sheet.Header>
      <div class="flex pb-2">
        <Button
          class="ml-auto"
          size="sm"
          onclick={() => {
            ctx.addEditDialogState = true;
          }}>Add Leave</Button
        >
      </div>
    </Sheet.Header>
    <ScrollArea viewPortClasses="max-height:100dvh" class="px-4">
      <div>
        {#each ctx.listOfLeave as leave (leave.leave_pk)}
          <div class="pt-2 first:pt-0">
            <Card.Root class="overflow-hidden relative">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger
                  class="absolute top-1.5 p-1 right-1.5 hover:bg-accent rounded-full"
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
                    <div class="bg-secondary p-2 rounded-lg text-primary">
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

                  <div class="text-right pr-2">
                    <span
                      class="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                    >
                      {calculateTotalDays(
                        leave.inclusive_from,
                        leave.inclusive_to,
                      )}
                      Days
                    </span>
                  </div>
                </div>
              </Card.Content>
            </Card.Root>
          </div>
        {/each}
      </div>
    </ScrollArea>
    <!-- DIALOG -->
  </Sheet.Content>
</Sheet.Root>
