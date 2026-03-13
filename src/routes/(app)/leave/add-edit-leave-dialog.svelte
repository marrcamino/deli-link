<script lang="ts">
  import Asterisk from "$lib/components/display/asterisk.svelte";
  import DatePicker from "$lib/components/inputs/date/date-picker.svelte";
  import DateRangePicker from "$lib/components/inputs/date/date-range-picker.svelte";
  import { CalendarDate, type DateValue } from "@internationalized/date";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { formatFullName, IntlDateHelper } from "$lib/utils";
  import { getLeaveContext } from "./context.svelte";
  import { getDBConn } from "$lib/db";
  import { toast } from "svelte-sonner";
  import { untrack } from "svelte";

  let startDateValue: DateValue | undefined = $state();
  let endDateValue: DateValue | undefined = $state();

  const ctx = getLeaveContext();

  async function onsubmit(e: SubmitEvent) {
    e.preventDefault();

    // UPDATE MODE
    if (ctx.openLeave) {
      updateLeave();
      return;
    }

    const db = await getDBConn();

    const res = await db.execute(
      `
      INSERT INTO leave_application (user_fk, inclusive_from, inclusive_to)
      VALUES (?, ?, ?)
    `,
      [
        ctx.openUser?.user_pk,
        startDateValue?.toString(),
        endDateValue?.toString(),
      ],
    );
    let newLeaveId: number | null = null;

    if (!res.rowsAffected) {
      toast.error("There was an error while saving leave");
      return;
    }

    newLeaveId = res.lastInsertId!;

    toast.success("Leave succesfully saved");

    ctx.add({
      leave_pk: newLeaveId,
      user_fk: ctx.openUser?.user_pk!,
      inclusive_from: startDateValue?.toString()!,
      inclusive_to: endDateValue?.toString()!,
    });
    ctx.addEditDialogState = false;
  }

  async function updateLeave() {
    const db = await getDBConn();

    const res = await db.execute(
      `
      UPDATE leave_application 
      SET inclusive_from = ?, inclusive_to = ?
      WHERE leave_pk = ?
    `,
      [
        startDateValue?.toString()!,
        endDateValue?.toString()!,
        ctx.openLeave?.leave_pk!,
      ],
    );

    if (!res.rowsAffected) {
      toast.error("There was an error while updating leave application");
      return;
    }

    toast.success("Updated successfully");
    ctx.addEditDialogState = false;
    ctx.update({
      leave_pk: ctx.openLeave?.leave_pk!,
      user_fk: ctx.openUser?.user_pk!,
      inclusive_from: startDateValue?.toString()!,
      inclusive_to: endDateValue?.toString()!,
    });
  }

  $effect(() => {
    ctx.openLeave;

    untrack(() => {
      if (!ctx.openLeave) return;
      startDateValue = IntlDateHelper.toDateValue(ctx.openLeave.inclusive_from);
      endDateValue = IntlDateHelper.toDateValue(ctx.openLeave.inclusive_to);
    });
  });
</script>

<Dialog.Root
  bind:open={ctx.addEditDialogState}
  onOpenChangeComplete={(isOpen) => {
    if (!isOpen) {
      ctx.openLeave = null;
      startDateValue = undefined;
      endDateValue = undefined;
    }
  }}
>
  <Dialog.Content class="sm:max-w-90">
    <form class="grid gap-4" {onsubmit} autocomplete="off">
      <Dialog.Header>
        <Dialog.Title>
          {ctx.openLeave ? "Update" : "Add New"} Leave Application
        </Dialog.Title>
      </Dialog.Header>
      <div class="grid gap-4 my-4">
        <div class="grid gap-1 cursor-not-allowed">
          <Label for="userName">User Name</Label>
          <Input
            id="userName"
            readonly
            value={ctx.openUser
              ? formatFullName(ctx.openUser, { abbreviateMiddle: true })
              : ""}
          />
        </div>

        <div class="">
          <DateRangePicker allRequired bind:startDateValue bind:endDateValue />
        </div>
      </div>
      <Dialog.Footer>
        <Dialog.Close
          type="button"
          class={buttonVariants({ variant: "outline" })}
        >
          Cancel
        </Dialog.Close>
        <Button type="submit">{ctx.openLeave ? "Update" : "Add"} Leave</Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
