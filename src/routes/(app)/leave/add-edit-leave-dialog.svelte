<script lang="ts">
  import Asterisk from "$lib/components/display/asterisk.svelte";
  import DatePicker from "$lib/components/inputs/date/date-picker.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";

  import DateMultiplePicker from "$lib/components/inputs/date/date-multiple-picker.svelte";
  import { getDBConn } from "$lib/db";
  import {
    formatFullName,
    IntlDateHelper,
    NativeDateHelper,
    openPrintWindow,
  } from "$lib/utils";
  import { type DateValue } from "@internationalized/date";
  import { Printer } from "@lucide/svelte";
  import { untrack } from "svelte";
  import { toast } from "svelte-sonner";
  import { getLeaveContext } from "./context.svelte";

  // let dateFile = $state(NativeDateHelper.isoToday);
  let dateFile: DateValue | undefined = $state(IntlDateHelper.today);
  let startDateValue: DateValue | undefined = $state();
  let endDateValue: DateValue | undefined = $state();
  let inclusiveDates: DateValue[] = $state([]);
  let currentLeave: LeaveApplication | null = $state(null);
  let isApprove = $state(false);

  const ctx = getLeaveContext();

  async function onsubmit(e: SubmitEvent) {
    e.preventDefault();

    // UPDATE MODE
    if (ctx.openLeave) {
      updateLeave();
      return;
    }

    const db = await getDBConn();
    const created_at = NativeDateHelper.pHTimestamp();
    const res = await db.execute(
      `
      INSERT INTO leave_application (user_fk, date_file, inclusive_from, inclusive_to, is_approved, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        ctx.openUser?.user_pk,
        dateFile?.toString(),
        startDateValue?.toString(),
        endDateValue?.toString(),
        Number(isApprove),
        created_at,
      ],
    );
    let newLeaveId: number | null = null;

    if (!res.rowsAffected) {
      toast.error("There was an error while saving leave");
      return;
    }

    newLeaveId = res.lastInsertId!;

    toast.success("Leave succesfully saved");

    const newLeave = {
      leave_pk: newLeaveId,
      date_file: dateFile!.toString(),
      user_fk: ctx.openUser?.user_pk!,
      inclusive_from: startDateValue?.toString()!,
      inclusive_to: endDateValue?.toString()!,
      is_approved: Number(isApprove) as Bit,
      created_at,
    };
    currentLeave = newLeave;
    ctx.add(newLeave);
  }

  async function updateLeave() {
    const db = await getDBConn();

    const res = await db.execute(
      `
      UPDATE leave_application 
      SET 
        inclusive_from = ?, 
        inclusive_to = ?,
        is_approved = ?
      WHERE leave_pk = ?
    `,
      [
        startDateValue?.toString()!,
        endDateValue?.toString()!,
        Number(isApprove),
        ctx.openLeave?.leave_pk!,
      ],
    );

    if (!res.rowsAffected) {
      toast.error("There was an error while updating leave application");
      return;
    }

    toast.success("Updated successfully");
    ctx.update({
      leave_pk: ctx.openLeave?.leave_pk!,
      date_file: dateFile!.toString(),
      user_fk: ctx.openUser?.user_pk!,
      // inclusive_from: startDateValue?.toString()!,
      // inclusive_to: endDateValue?.toString()!,
      is_approved: Number(isApprove) as Bit,
    });
  }

  $effect(() => {
    ctx.openLeave;

    untrack(() => {
      if (!ctx.openLeave || !ctx.addEditDialogState) return;
      const leave = ctx.openLeave;
      dateFile = IntlDateHelper.toDateValue(leave.date_file);
      // startDateValue = IntlDateHelper.toDateValue(leave.inclusive_from);
      // endDateValue = IntlDateHelper.toDateValue(leave.inclusive_to);
      currentLeave = leave;
      isApprove = Boolean(leave.is_approved);
    });
  });
</script>

<Dialog.Root
  bind:open={ctx.addEditDialogState}
  onOpenChangeComplete={(isOpen) => {
    if (!isOpen) {
      ctx.openLeave = null;
      dateFile = IntlDateHelper.today;
      startDateValue = undefined;
      endDateValue = undefined;
      currentLeave = null;
      isApprove = false;
    }
  }}
>
  <Dialog.Content class="sm:max-w-90">
    <form class="grid gap-4" {onsubmit} autocomplete="off">
      <Dialog.Header>
        <Dialog.Title>
          {ctx.openLeave ? "Update" : "Add New"} Leave Application
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
            if (currentLeave) openPrintWindow(currentLeave);
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
        <Button type="submit">{ctx.openLeave ? "Update" : "Add"} Leave</Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
