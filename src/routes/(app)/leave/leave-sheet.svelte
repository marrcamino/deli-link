<script lang="ts">
  import YearSelector from "$lib/components/inputs/year-selector.svelte";
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import {
    DEFAULT_SETTINGS,
    LEAVE_TYPE_MAP,
    type LeaveTypeEntry,
  } from "$lib/constants";
  import { getDBConn } from "$lib/db";

  import AnimationWrapper from "$lib/components/display/animation-wrapper.svelte";
  import EmptyStateWrapper from "$lib/components/display/empty-state-wrapper.svelte";
  import { formatFullName } from "$lib/utils";
  import { FileX, Plus } from "@lucide/svelte";
  import NumberFlow from "@number-flow/svelte";
  import { untrack } from "svelte";
  import { toast } from "svelte-sonner";
  import { fade } from "svelte/transition";
  import AddEditLeaveDialog from "./add-edit-leave-dialog.svelte";
  import { getLeaveContext } from "./context.svelte";
  import LeaveCard from "./leave-card.svelte";

  const ctx = getLeaveContext();

  let disableTransition = $state(false);
  let alterDialogContinueButton: HTMLButtonElement = $state(null!);

  // For Number-flow
  const springEasing =
    "linear(0, 0.0021 0.42%, 0.0092, 0.021, 0.0371 1.85%, 0.0838 2.86%, 0.1484 3.92%, 0.2974 5.88%, 0.6283 9.69%, 0.7636 11.34%, 0.8884 13.03%, 0.9878 14.62%, 1.0659 16.16%, 1.0991, 1.1275, 1.1511, 1.1701 19.34%, 1.1856, 1.1964 21.03%, 1.2038, 1.2052 23.15%, 1.2007 24.32%, 1.1904 25.53%, 1.177 26.65%, 1.1582 27.92%, 1.0554 33.8%, 1.0312 35.33%, 1.0108 36.82%, 0.9915 38.51%, 0.9772 40.15%, 0.9667 41.85%, 0.9604 43.6%, 0.9578 45.82%, 0.9608 48.37%, 0.9675 50.8%, 0.9971 59.44%, 1.0039 62.56%, 1.0077 65.79%, 1.0081 71.14%, 0.9988 86.88%, 0.9991 99.96%)";
  const numberFlowTiming = {
    wellness: {
      duration: 750,
      easing: springEasing,
    },
    personal: {
      duration: 800,
      easing: springEasing,
    },
  };

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
    if (ctx.openLeave) {
      ctx.removeLeave(ctx.openLeave.leave_pk);
      await ctx.refreshLeaveInfo(ctx.openLeave.user_fk);
    }
    ctx.deleteDialogState = false;
  }

  $effect(() => {
    ctx.sheetState;
    untrack(() => {
      if (!ctx.sheetState) return (disableTransition = true);
      setTimeout(() => {
        disableTransition = false;
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
            class={buttonVariants({ variant: "destructive" })}
            onclick={deleteLeave}
            bind:ref={alterDialogContinueButton}
          >
            Delete
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
              <span>{LEAVE_TYPE_MAP.WELLNESS} bal.</span>
              <NumberFlow
                value={ctx.wellnessLeaveBal}
                suffix="/{DEFAULT_SETTINGS.maxWellnessLeave}"
                transformTiming={numberFlowTiming.wellness}
                spinTiming={numberFlowTiming.wellness}
              />
            </div>
            <div class="leading-4 -translate-y-1">
              <span>{LEAVE_TYPE_MAP.PERSONAL} bal.</span>
              <NumberFlow
                value={ctx.officeLeaveBal}
                suffix="/{DEFAULT_SETTINGS.maxPersonalLeave}"
                transformTiming={numberFlowTiming.personal}
                spinTiming={numberFlowTiming.personal}
              />
            </div>
          </div>
          <div class="ml-auto flex gap-2">
            <YearSelector
              size="sm"
              class="w-19"
              yearsForward={1}
              bind:value={ctx.selectedYear}
            />
            <Button size="sm" onclick={() => (ctx.addEditDialogState = true)}>
              Add Leave
            </Button>
          </div>
        </div>
      </Sheet.Header>

      <div class="relative" style="height: calc(100dvh - 130px);">
        <EmptyStateWrapper items={ctx.listOfLeave} {disableTransition}>
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
        </EmptyStateWrapper>

        <div class="pb-15">
          {#each ctx.listOfLeave as leave (leave.leave_pk)}
            <AnimationWrapper {disableTransition}>
              <LeaveCard {leave} />
            </AnimationWrapper>
          {/each}
        </div>
      </div>

      {#if ctx.listOfLeave.length}
        <div in:fade={{ duration: 250 }} out:fade={{ duration: 200 }}>
          <div class="absolute bottom-0 bg-background/95 w-full pt-1.5">
            <div
              class="flex items-center justify-center text-xs text-muted-foreground gap-4 pb-2"
            >
              {#each Object.entries(LEAVE_TYPE_MAP) as LeaveTypeEntry[] as [key, label]}
                <div class="flex gap-1 items-center">
                  <div
                    class="h-3 w-1 rounded-xs {key === 'WELLNESS'
                      ? 'bg-primary'
                      : 'bg-blue-600/80'}"
                  ></div>
                  {label}
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/if}
    </ScrollArea>
  </Sheet.Content>
</Sheet.Root>
