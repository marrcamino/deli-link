<script lang="ts">
  import YearSelector from "$lib/components/inputs/year-selector.svelte";
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import Badge from "$lib/components/ui/badge/badge.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import { LEAVE_TYPE_MAP } from "$lib/constants";
  import { getDBConn } from "$lib/db";
  import {
    formatDate,
    formatFullName,
    openPrintWindow,
    prettifyDates,
  } from "$lib/utils";
  import {
    Calendar,
    CircleCheck,
    EllipsisVertical,
    FileX,
    Pencil,
    Plus,
    Printer,
    Trash2,
    Undo2,
  } from "@lucide/svelte";
  import { untrack } from "svelte";
  import { toast } from "svelte-sonner";
  import { expoIn, expoOut } from "svelte/easing";
  import { fly, scale, slide } from "svelte/transition";
  import AddEditLeaveDialog from "./add-edit-leave-dialog.svelte";
  import ApproveBadgeIndicator from "./approve-badge-indicator.svelte";
  import { getLeaveContext } from "./context.svelte";

  const ctx = getLeaveContext();

  let openComplete = $state(false);
  let defaultInTransDuration = $derived(openComplete ? 300 : 0);
  let alterDialogContinueButton: HTMLButtonElement = $state(null!);

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

  async function updateApproveState(id: number, approve: boolean) {
    const db = await getDBConn();
    await db.execute(
      "UPDATE leave_application SET is_approved = ? WHERE leave_pk = ?",
      [Number(approve), id],
    );

    ctx.update({ leave_pk: id, is_approved: Number(approve) as Bit });
  }

  $effect(() => {
    ctx.sheetState;
    untrack(() => {
      if (!ctx.sheetState) {
        openComplete = false;
        return;
      }
      setTimeout(() => {
        openComplete = true;
      }, 300);
    });
  });
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
      <AlertDialog.Content
        class="sm:max-w-sm"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          alterDialogContinueButton?.focus();
        }}
      >
        <AlertDialog.Header>
          <AlertDialog.Title>Delete Leave Application?</AlertDialog.Title>
          <AlertDialog.Description>
            This will permanently delete leave application. This action is
            irreversible.
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
          <AlertDialog.Action
            onclick={deleteLeave}
            bind:ref={alterDialogContinueButton}
          >
            Continue
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Root>
    <!-- #endregion  -->

    <ScrollArea viewPortClasses="max-h-dvh" class="px-4">
      <Sheet.Header class="sticky top-0 z-1 bg-background px-0">
        <div class="font-semibold text-lg grid">
          {#if ctx.openUser}
            <p>{formatFullName(ctx.openUser)}</p>
            <p class="text-sm text-muted-foreground">
              {ctx.openUser.designation}
            </p>
          {/if}
        </div>
        <div class="flex mt-1">
          <div class="text-xs self-end">
            <div class="leading-4">
              <span>Wellness Leave bal.</span>
              <span class="text-muted-foreground">{ctx.wellnessLeaveBal}/5</span
              >
            </div>
            <div class="leading-4">
              <span>Montly/Personal Leave bal.</span>
              <span class="text-muted-foreground">{ctx.officeLeaveBal}/2</span>
            </div>
          </div>
          <div class="ml-auto flex gap-2">
            <YearSelector
              size="sm"
              class="w-19"
              bind:value={ctx.selectedYear}
            />
            <Button size="sm" onclick={() => (ctx.addEditDialogState = true)}>
              Add Leave
            </Button>
          </div>
        </div>
      </Sheet.Header>
      <div>
        {#each ctx.listOfLeave as leave (leave.leave_pk)}
          {@const totalDays = leave.dates.length}
          <div
            in:slide={{ duration: defaultInTransDuration }}
            out:slide={{ delay: 200, duration: 250 }}
            class="pb-2"
          >
            <div
              in:scale={{
                start: 0.8,
                opacity: 0.8,
                delay: 100,
                easing: expoOut,
                duration: defaultInTransDuration,
              }}
              out:scale={{ easing: expoIn }}
            >
              <Card.Root class="overflow-hidden relative rounded-lg pb-9">
                <div class="absolute top-1.5 right-1.5">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger
                      class="hover:bg-accent rounded-md p-1"
                    >
                      <EllipsisVertical class="text-muted-foreground size-4" />
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="end">
                      <DropdownMenu.Group>
                        <DropdownMenu.Item
                          onclick={() => {
                            updateApproveState(
                              leave.leave_pk,
                              !leave.is_approved,
                            );
                          }}
                        >
                          {#if leave.is_approved}
                            <Undo2 />
                            <span>Undo Approval</span>
                          {:else}
                            <CircleCheck />
                            <span>Approve</span>
                          {/if}
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          onclick={() => {
                            openPrintWindow(leave, leave.leave_type);
                          }}
                        >
                          <Printer />
                          Print
                        </DropdownMenu.Item>
                      </DropdownMenu.Group>

                      <DropdownMenu.Separator />

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

                  <div></div>
                </div>

                <Card.Content class="px-4">
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3">
                      <div class="bg-secondary p-2 text-primary rounded-lg">
                        <Calendar class="w-4 h-4" />
                      </div>
                      <div class="text-sm">
                        <p class="font-semibold flex items-center gap-2">
                          {#if leave.dates.length === 0}
                            {formatDate(leave.dates[0].date_value, "long")}
                          {:else}
                            {prettifyDates(
                              leave.dates.map((d) => d.date_value),
                            )}
                          {/if}
                        </p>
                        <p
                          class="text-xs text-muted-foreground font-light space-x-4"
                        >
                          <span>Date File: {formatDate(leave.date_file)}</span>
                          <span>Type: {LEAVE_TYPE_MAP[leave.leave_type]}</span>
                        </p>
                      </div>
                    </div>

                    <div class="text-right pr-2 absolute bottom-1.5 right-0">
                      <Badge
                        class="bg-primary/10 px-2.5 py-0.5 text-xs rounded-md font-medium text-primary"
                      >
                        {totalDays}
                        Day{totalDays > 1 ? "s" : ""}
                      </Badge>
                      <ApproveBadgeIndicator is_approved={leave.is_approved} />
                    </div>
                  </div>
                </Card.Content>
              </Card.Root>
            </div>
          </div>
        {:else}
          <div class="overflow-hidden pb-4">
            <div
              in:fly={{ delay: 400, y: 10, opacity: 0 }}
              out:fly={{
                duration: defaultInTransDuration === 0 ? 0 : 400,
                y: -20,
              }}
            >
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
            </div>
          </div>
        {/each}
      </div>
    </ScrollArea>
    <!-- DIALOG -->
  </Sheet.Content>
</Sheet.Root>
