<script lang="ts">
  import Asterisk from "$lib/components/display/asterisk.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import Textarea from "$lib/components/ui/textarea/textarea.svelte";
  import { getDBConn } from "$lib/db";
  import { NativeDateHelper } from "$lib/utils";
  import { untrack } from "svelte";
  import { toast } from "svelte-sonner";

  interface Props {
    open?: boolean;
    afterSave?: (signatory: Signatory) => void;
    signatoryToUpdate?: Signatory;
  }

  let { open = $bindable(), afterSave, signatoryToUpdate }: Props = $props();

  let isSaving = $state(false);
  let name = $state("");
  let position = $state("");

  async function saveNewSignatory(e: SubmitEvent) {
    e.preventDefault();

    try {
      isSaving = false;
      const db = await getDBConn();
      const currentTimestamp = NativeDateHelper.currentTimestamp;
      const res = await db.execute(
        "INSERT INTO signatory (name, position, created_at) VALUES (?, ?, ?)",
        [name, position, currentTimestamp],
      );

      if (!res.lastInsertId) {
        toast.error("There was an error while saving signatory", {
          description: "Please try again",
        });
        return;
      }

      const newInsertedId = res.lastInsertId as number;

      afterSave?.({
        signatory_pk: newInsertedId,
        name,
        position,
        created_at: currentTimestamp,
      });
      toast.success("Signatory saved successfully");
      open = false;
    } catch (error) {
      console.error(error);
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

      const res = await db.execute(
        "UPDATE signatory SET name = ?, position = ? WHERE signatory_pk = ?",
        [name, position, signatoryToUpdate.signatory_pk],
      );

      if (res.rowsAffected === 0) {
        toast.error("There was an error while updating signatory", {
          description: "Please try again",
        });
        return;
      }

      afterSave?.({
        signatory_pk: signatoryToUpdate.signatory_pk,
        name: signatoryToUpdate.name,
        position: signatoryToUpdate.position,
        created_at: signatoryToUpdate.created_at,
      });

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
      name = signatoryToUpdate.name;
      position = signatoryToUpdate.position;
    });
  });
</script>

<Dialog.Root
  bind:open
  onOpenChangeComplete={(open) => {
    if (!open) {
      name = "";
      position = "";
    }
  }}
>
  <Dialog.Content class="sm:max-w-100">
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
          <Label for="name" class="gap-0.5">
            Name <Asterisk />
          </Label>
          <Input id="name" name="name" required bind:value={name} />
        </div>
        <div class="grid gap-1">
          <Label for="signatory-position" class="gap-0.5">
            Position <Asterisk />
          </Label>
          <Textarea
            id="signatory-position"
            name="signatory-position"
            required
            bind:value={position}
            autoHeight
            autoTrim
          />
        </div>
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
