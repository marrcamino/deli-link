<script lang="ts">
  import Asterisk from "$lib/components/display/asterisk.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import Textarea from "$lib/components/ui/textarea/textarea.svelte";
  import { getDBConn } from "$lib/db";
  import { IntlDateHelper } from "$lib/utils";
  import { type DateValue } from "@internationalized/date";
  import { untrack } from "svelte";
  import { toast } from "svelte-sonner";
  import DateRangePicker from "../inputs/date/date-range-picker.svelte";

  interface Props {
    open?: boolean;
    afterSave?: (signatory: Signatory) => void;
    signatoryToUpdate?: Signatory;
  }

  let {
    open = $bindable(false),
    afterSave,
    signatoryToUpdate,
  }: Props = $props();

  let isSaving = $state(false);
  let full_name = $state("");
  let position_title = $state("");
  let isPresent = $state(false);
  let effective_from: DateValue | undefined = $state(undefined);
  let effective_until: DateValue | undefined = $state(undefined);

  function buildSignatoryValues() {
    return [
      full_name,
      position_title,
      effective_from?.toString(),
      isPresent ? null : effective_until?.toString(),
    ];
  }

  async function saveNewSignatory(e: SubmitEvent) {
    e.preventDefault();

    try {
      isSaving = false;
      const db = await getDBConn();
      const res = await db.select<Signatory[]>(
        "INSERT INTO signatory (full_name, position_title, effective_from, effective_until) VALUES (?, ?, ?, ?) RETURNING *;",
        buildSignatoryValues(),
      );

      console.log(res);

      if (!res.length) {
        toast.error("There was an error while saving signatory", {
          description: "Please try again",
        });
        return;
      }

      afterSave?.(res[0]);
      toast.success("Signatory saved successfully");

      open = false;
    } catch (error) {
      console.error(error);
      toast.error("There was an error while saving signatory", {
        description: "Please try again",
      });
    } finally {
      isSaving = false;
    }
  }

  async function updateSignatory(e: SubmitEvent) {
    e.preventDefault();

    try {
      if (!signatoryToUpdate) return;
      isSaving = false;
      const db = await getDBConn();

      const res = await db.select<Signatory[]>(
        "UPDATE signatory SET full_name = ?, position_title = ?, effective_from = ?, effective_until = ?, updated_at = CURRENT_TIMESTAMP WHERE signatory_pk = ? RETURNING *;",
        [...buildSignatoryValues(), signatoryToUpdate.signatory_pk],
      );

      if (!res.length) {
        toast.error("There was an error while updating signatory", {
          description: "Please try again",
        });
        return;
      }

      afterSave?.(res[0]);

      toast.success("Signatory updated successfully");
      open = false;
    } catch (error) {
      console.error(error);
    } finally {
      isSaving = false;
    }
  }

  $effect(() => {
    open;

    untrack(() => {
      if (!open || !signatoryToUpdate) return;
      full_name = signatoryToUpdate.full_name;
      position_title = signatoryToUpdate.position_title;
      effective_from = IntlDateHelper.toDateValue(
        signatoryToUpdate.effective_from,
      );
      if (signatoryToUpdate.effective_until) {
        effective_until = IntlDateHelper.toDateValue(
          signatoryToUpdate.effective_until,
        );
      } else isPresent = true;
    });
  });
</script>

<Dialog.Root
  bind:open
  onOpenChangeComplete={(open) => {
    if (!open) {
      full_name = "";
      position_title = "";
      isPresent = false;
      effective_from = undefined;
      effective_until = undefined;
    }
  }}
>
  <Dialog.Content class="sm:max-w-110">
    <form
      class="grid gap-4"
      onsubmit={signatoryToUpdate ? updateSignatory : saveNewSignatory}
      autocomplete="off"
    >
      <Dialog.Header>
        <Dialog.Title>
          {signatoryToUpdate ? "Update" : "Add New"} Signatory
        </Dialog.Title>
        <Dialog.Description>
          Fields marked with asterisk <Asterisk withParentheses /> are required.
        </Dialog.Description>
      </Dialog.Header>
      <div class="grid gap-4">
        <div class="grid gap-1">
          <Label for="full-name" class="gap-0.5">
            Fullname <Asterisk />
          </Label>
          <Input
            id="full-name"
            name="full-name"
            required
            bind:value={full_name}
          />
        </div>
        <div class="grid gap-1">
          <Label for="position-title" class="gap-0.5">
            Position Title<Asterisk />
          </Label>
          <Textarea
            id="position-title"
            name="position-title"
            bind:value={position_title}
            required
            autoHeight
            autoTrim
          />
        </div>
      </div>

      <div class="mt-1">
        <DateRangePicker
          bind:startDateValue={effective_from}
          bind:endDateValue={effective_until}
          bind:isPresent
          allowPresent
          allRequired
          startDateLabel="Effective From"
          endDateLabel="Effective Until"
        />
      </div>
      <Dialog.Footer>
        <Dialog.Close
          disabled={isSaving}
          type="button"
          class={buttonVariants({ variant: "outline" })}
        >
          Cancel
        </Dialog.Close>
        <Button type="submit" disabled={isSaving}>
          {signatoryToUpdate ? "Update" : "Save"} Signatory
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
