<script lang="ts">
  import ApproveBadgeIndicator from "$lib/components/display/approve-badge-indicator.svelte";
  import * as Card from "$lib/components/ui/card";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import type { PassSlipWithDates } from "$lib/types";
  import {
    cn,
    formatDate,
    formatTime,
    getHoursBetween,
    pluralize,
    prettifyDates,
  } from "$lib/utils";
  import {
    Calendar,
    CircleCheck,
    Clock,
    EllipsisVertical,
    File,
    Pencil,
    Trash2,
    Undo2,
  } from "@lucide/svelte";
  import { tick } from "svelte";
  import { fade } from "svelte/transition";
  import { getPassSlipContext } from "./context.svelte";

  interface Props {
    passSlip: PassSlipWithDates;
  }

  let { passSlip }: Props = $props();
  const ctx = getPassSlipContext();

  let totalDays = $derived(passSlip.dates.length);
  let totalHours = $derived(
    pluralize(
      getHoursBetween(passSlip.start_time, passSlip.end_time, true),
      "hr",
    ),
  );

  const isOfficial = $derived(passSlip.slip_type === "OFFICIAL");
  const TRANSITION_CLASS = cn("duration-500 transition-colors");
  const textColor = $derived.by(() =>
    cn(TRANSITION_CLASS, isOfficial ? "text-primary" : "text-blue-600/80"),
  );
  const badgeBg = $derived.by(() =>
    cn(
      TRANSITION_CLASS,
      isOfficial
        ? "bg-primary/10 text-primary"
        : "bg-blue-600/10 text-blue-600/80",
    ),
  );
  // async function updateApproveState(id: number, approve: boolean) {
  //   const db = await getDBConn();
  //   await db.execute(
  //     "UPDATE pass_slip SET is_approved = ? WHERE pass_slip_pk = ?",
  //     [Number(approve), id],
  //   );

  //   ctx.updateSlip({ pass_slip_pk: id, is_approved: Number(approve) as Bit });

  //   if (ctx.openUser) await ctx.refreshPassSlipInfo(ctx.openUser.user_pk);
  // }
</script>

<Card.Root
  class="overflow-hidden relative rounded-xl pt-3 pb-3 border-l-4 {TRANSITION_CLASS}
  {isOfficial ? 'border-l-primary' : 'border-l-blue-600/80'}"
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
              // updateApproveState(passSlip.pass_slip_pk, !passSlip.is_approved);
            }}
          >
            {#if passSlip.is_approved}
              <Undo2 />
              <span>Undo Approval</span>
            {:else}
              <CircleCheck />
              <span>Approve</span>
            {/if}
          </DropdownMenu.Item>
          <!-- <DropdownMenu.Item>
            <Printer />
            Print
          </DropdownMenu.Item> -->
        </DropdownMenu.Group>

        <DropdownMenu.Separator />

        <DropdownMenu.Group>
          <DropdownMenu.Item
            onclick={async () => {
              ctx.openSlip = passSlip;
              await tick();
              ctx.addEditDialogState = true;
            }}
          >
            <Pencil />
            Edit
          </DropdownMenu.Item>
          <DropdownMenu.Item
            variant="destructive"
            onclick={() => {
              ctx.openSlip = passSlip;
              ctx.deleteDialogState = true;
            }}
          >
            <Trash2 />
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </div>

  <Card.Content class="px-4">
    <!-- Header row: icon, date, time chip, type badge -->
    <div class="flex items-start gap-3">
      <div class="bg-secondary p-2 rounded-lg transition-colors {textColor}">
        <Calendar class="size-4" />
      </div>

      <div class="text-sm min-w-0 flex-1">
        <p class="font-medium">
          {prettifyDates(passSlip.dates.map((d) => d.date_value))}
          <span class="text-muted-foreground font-normal text-xs">
            &bull; {pluralize(totalDays, "day")}
          </span>
        </p>

        <div class="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <span
            class="inline-flex items-center gap-1 border border-border rounded-md px-2 py-0.5 text-xs text-muted-foreground"
          >
            <Clock class="size-3" />
            {formatTime(passSlip.start_time)} &ndash; {formatTime(
              passSlip.end_time,
            )} &bull; {totalHours}
          </span>

          {#key passSlip.slip_type}
            <span
              class="rounded-md px-2 py-0.5 text-[11px] font-medium capitalize {badgeBg}"
              in:fade={{ delay: 300, duration: 250 }}
              out:fade={{ duration: 200 }}
            >
              {passSlip.slip_type.replace("_", " ").toLowerCase()}
            </span>
          {/key}
        </div>
      </div>
    </div>

    <!-- Reason row: separated by divider, indented to align with text above -->
    <div class="border-t border-border mt-3 pt-2.5 pl-11">
      <p class="text-xs text-muted-foreground leading-tight line-clamp-3">
        <span class="text-muted-foreground/70">Reason</span><br />
        <span>{passSlip.reason}</span>
      </p>
    </div>

    <!-- Footer row: filed date, approved badge -->
    <div class="flex items-center justify-between pl-11 mt-2.5">
      <div class="flex text-xs text-muted-foreground items-center gap-1">
        <File class="size-3.5" />
        Filed: {formatDate(passSlip.filed_at)}
      </div>
      <ApproveBadgeIndicator is_approved={passSlip.is_approved} />
    </div>
  </Card.Content>
</Card.Root>
