<script lang="ts">
  import Asterisk from "$lib/components/display/asterisk.svelte";
  import DateMultiplePicker from "$lib/components/inputs/date/date-multiple-picker.svelte";
  import DatePicker from "$lib/components/inputs/date/date-picker.svelte";
  import LeaveTypeSelector from "$lib/components/inputs/leave-type-selector.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import type { LeaveTypeKey } from "$lib/constants";
  import type { LeaveApplicationWithDate } from "$lib/types";
  import {
    formatFullName,
    IntlDateHelper,
    NativeDateHelper,
    openPrintWindow,
  } from "$lib/utils";
  import { type DateValue } from "@internationalized/date";
  import { Printer } from "@lucide/svelte";
  import { invoke } from "@tauri-apps/api/core";
  import { untrack } from "svelte";
  import { toast } from "svelte-sonner";
  import { getLeaveContext } from "./context.svelte";
  import { slide } from "svelte/transition";

  interface DbResponse {
    success: boolean;
    message: string;
    data: LeaveApplicationWithDate;
  }

  let dateFile: DateValue | undefined = $state(IntlDateHelper.today);
  let inclusiveDates: DateValue[] = $state([]);
  let placeholder: DateValue | undefined = $state();
  let currentLeave: LeaveApplication | null = $state(null);
  let leaveType = $state<LeaveTypeKey>("WELLNESS");
  let isApprove = $state(false);

  const slideHorizontally = (node: HTMLElement) => {
    return slide(node, { axis: "x" });
  };

  const ctx = getLeaveContext();

  async function onsubmit(e: SubmitEvent) {
    e.preventDefault();

    // UPDATE MODE
    if (ctx.openLeave) {
      updateLeave();
      return;
    }

    try {
      const created_at = NativeDateHelper.pHTimestamp();

      const leaveApplicationToInsert = {
        user_fk: ctx.openUser?.user_pk as number,
        date_file: dateFile?.toString() as string,
        leave_type: leaveType,
        is_approved: Number(isApprove) as Bit,
        created_at,
      };

      const res: DbResponse = await invoke("save_leave_application", {
        leave: leaveApplicationToInsert,
        dates: inclusiveDates
          .map((d) => d.toString())
          .map((d) => ({ date_value: d })),
      });

      toast.success(res.message);
      ctx.add(res.data);
      currentLeave = res.data;
      ctx.openLeave = res.data;
    } catch (e) {
      console.error(e);
      toast.error("There was an error while saving", {
        description: "Please try again",
      });
    }
  }

  async function updateLeave() {
    try {
      if (!ctx.openLeave) return;
      const leave = ctx.openLeave;

      const res: DbResponse = await invoke("update_leave_application", {
        leave: {
          leave_pk: leave.leave_pk,
          user_fk: leave.user_fk,
          date_file: dateFile?.toString() as string,
          leave_type: leaveType,
          is_approved: Number(isApprove) as Bit,
          created_at: leave.created_at,
          dates: leave.dates,
        },
        newDates: inclusiveDates.map((d) => d.toString()),
      });

      toast.success(res.message, {duration: Infinity});
      ctx.update(res.data);
    } catch (error) {
      console.error(error);
      toast.error("There was an error while updating", {
        description: "Please try again",
      });
    }
  }

  // When dialog opens
  $effect(() => {
    ctx.openLeave;

    untrack(() => {
      if (!ctx.openLeave || !ctx.addEditDialogState) return;
      const leave = ctx.openLeave;
      dateFile = IntlDateHelper.toDateValue(leave.date_file);
      inclusiveDates = IntlDateHelper.toDateValues(
        leave.dates.map((d) => d.date_value),
      );
      currentLeave = leave;
      leaveType = leave.leave_type;
      isApprove = Boolean(leave.is_approved);
    });
  });

  // Set placeholder when datefile changes
  $effect(() => {
    dateFile;

    untrack(() => {
      if (!dateFile) return;
      placeholder = dateFile;
    });
  });
</script>

<Dialog.Root
  bind:open={ctx.addEditDialogState}
  onOpenChangeComplete={(isOpen) => {
    if (!isOpen) {
      ctx.openLeave = null;
      dateFile = IntlDateHelper.today;
      inclusiveDates = [];
      currentLeave = null;
      leaveType = "WELLNESS";
      isApprove = false;
    }
  }}
>
  <Dialog.Content class="sm:max-w-90">
    <form class="grid gap-4" {onsubmit} autocomplete="off">
      <Dialog.Header>
        <Dialog.Title class="*:block flex">
          <!-- {ctx.openLeave ? "Update" : "Add New"} Leave Application -->

          {#if ctx.openLeave}
            <span transition:slideHorizontally>Up</span>
          {:else}
            <span transition:slideHorizontally>Ad</span>
          {/if}
          <span>d</span>
          {#if ctx.openLeave}
            <span transition:slideHorizontally>at</span>
          {:else}
            <span transition:slideHorizontally class="pl-1">N</span>
          {/if}

          <span>e</span>
          {#if !ctx.openLeave}
            <span transition:slideHorizontally>w</span>
          {/if}

          <span class="pl-1">Leave Application</span>
        </Dialog.Title>
        <Dialog.Description>
          Fields marked with asterisk <Asterisk withParentheses /> are required.
        </Dialog.Description>
      </Dialog.Header>
      <div class="grid gap-5 mb-4 mt-2">
        <div class="grid gap-1 cursor-not-allowed">
          <Label for="userName">Employee Name</Label>
          <Input
            id="userName"
            readonly
            value={ctx.openUser
              ? formatFullName(ctx.openUser, { abbreviateMiddle: true })
              : ""}
          />
        </div>
        <div>
          <Label for="leave-type" class="grid gap-1.5">
            <div>Type of Leave <Asterisk /></div>
            <LeaveTypeSelector
              required
              name="leave-type"
              class="w-full"
              bind:value={leaveType}
            />
          </Label>
        </div>
        <div class="grid gap-1">
          <Label for="date_file" class="grid gap-1">
            <div>Date File <Asterisk /></div>
            <DatePicker
              bind:value={dateFile}
              required
              name="date_file"
              closeOnDateSelect
            />
          </Label>
        </div>

        <div class="grid gap-1">
          <Label for="date_file" class="grid gap-1">
            <div>Inclusive Dates <Asterisk /></div>
            <DateMultiplePicker
              required
              bind:values={inclusiveDates}
              name="date_file"
              triggerOptions={{ class: "max-w-77.5" }}
              bind:placeholder
            />
          </Label>
        </div>

        <div class="flex items-center gap-2 w-full">
          <Checkbox id="isApprove" bind:checked={isApprove} />
          <Label for="isApprove">Set as approved</Label>
        </div>
      </div>
      <Dialog.Footer>
        <Button
          type="button"
          variant="outline"
          class="mr-auto"
          disabled={!currentLeave}
          onclick={() => {
            if (!currentLeave) return;
            openPrintWindow(currentLeave, leaveType);
          }}
        >
          <Printer />
          Print
        </Button>
        <Dialog.Close
          type="button"
          class={buttonVariants({ variant: "secondary" })}
        >
          Close
        </Dialog.Close>
        <Button type="submit" class="*:block gap-0">
          {#if ctx.openLeave}
            <span transition:slideHorizontally>Up</span>
          {:else}
            <span transition:slideHorizontally>Ad</span>
          {/if}
          <span>d</span>
          {#if ctx.openLeave}
            <span transition:slideHorizontally>ate</span>
          {/if}
          <span class="pl-1">Leave</span>
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
