<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { LEAVE_TYPE_MAP } from "$lib/constants";
  import { getDBConn } from "$lib/db";
  import type { LeaveApplicationWithDate } from "$lib/types";
  import { cn, formatDate, openPrintWindow, prettifyDates } from "$lib/utils";
  import {
    Calendar,
    CircleCheck,
    EllipsisVertical,
    File,
    Pencil,
    Printer,
    Trash2,
    Undo2,
  } from "@lucide/svelte";
  import { fade } from "svelte/transition";
  import ApproveBadgeIndicator from "./approve-badge-indicator.svelte";
  import { getLeaveContext } from "./context.svelte";

  interface Props {
    leave: LeaveApplicationWithDate;
  }
  let { leave }: Props = $props();

  let totalDays = $derived(leave.dates.length);
  const ctx = getLeaveContext();

  // tailwind classes
  const isWellnessLeave = $derived(leave.leave_type === "WELLNESS");
  const TRANSITION_CLASS = cn("duration-500 transition-colors");
  const textColor = $derived.by(() => {
    return cn(
      TRANSITION_CLASS,
      isWellnessLeave ? "text-primary" : "text-blue-600/80",
    );
  });

  async function updateApproveState(id: number, approve: boolean) {
    const db = await getDBConn();
    await db.execute(
      "UPDATE leave_application SET is_approved = ? WHERE leave_pk = ?",
      [Number(approve), id],
    );

    ctx.updateLeave({ leave_pk: id, is_approved: Number(approve) as Bit });

    if (ctx.openUser) await ctx.refreshLeaveInfo(ctx.openUser.user_pk);
  }
</script>

<Card.Root
  class="overflow-hidden relative rounded-xl pb-10 pt-3 border-l-4 {TRANSITION_CLASS}
  {isWellnessLeave ? 'border-l-primary' : 'border-l-blue-600/80'}"
>
  <div class="absolute top-1.5 right-1.5">
    <DropdownMenu.Root>
      <DropdownMenu.Trigger class="hover:bg-accent rounded-md py-1 px-0.5">
        <EllipsisVertical class="text-muted-foreground size-4" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Group>
          <DropdownMenu.Item
            onclick={() => {
              updateApproveState(leave.leave_pk, !leave.is_approved);
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
        <div class="bg-secondary p-2 rounded-lg transition-colors {textColor}">
          <Calendar class="w-4 h-4" />
        </div>
        <div class="text-sm">
          <div class="flex gap-1">
            <p class="font-semibold flex items-center gap-2">
              {#if leave.dates.length === 0}
                {formatDate(leave.dates[0].date_value, "long")}
              {:else}
                {prettifyDates(leave.dates.map((d) => d.date_value))}
              {/if}
            </p>

            <p class="text-muted-foreground text-xs leading-5">
              &bull;
              <span>
                {totalDays}
                day{totalDays > 1 ? "s" : ""}
              </span>
            </p>
          </div>
          <p class="text-xs space-x-4 {textColor} h-4">
            {#key leave.leave_type}
              <span
                in:fade={{ delay: 300, duration: 250 }}
                out:fade={{ duration: 200 }}
              >
                {LEAVE_TYPE_MAP[leave.leave_type]}
              </span>
            {/key}
          </p>
        </div>
      </div>

      <div class="text-right pr-2 absolute bottom-1.5 inset-x-0 flex">
        <div
          class="flex text-xs text-muted-foreground pl-15 items-center gap-1"
        >
          <File class="size-3.5" />
          Filed: {formatDate(leave.date_file)}
        </div>
        <div class="ml-auto">
          <ApproveBadgeIndicator is_approved={leave.is_approved} />
        </div>
      </div>
    </div>
  </Card.Content>
</Card.Root>
