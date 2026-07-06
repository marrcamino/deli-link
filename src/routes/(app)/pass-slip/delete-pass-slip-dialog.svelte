<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import { buttonVariants } from "$lib/components/ui/button";
  import { deletePassSlip } from "$lib/services";
  import { toast } from "svelte-sonner";
  import { getPassSlipContext } from "./context.svelte";

  const ctx = getPassSlipContext();
  let alterDialogContinueButton: HTMLButtonElement = $state(null!);

  async function deleteSlip() {
    if (!ctx.openSlip) return;

    const result = await deletePassSlip(ctx.openSlip.pass_slip_pk);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Pass slip deleted successfully");
    ctx.removePassSlip(result.pass_slip_pk);
    ctx.deleteDialogState = false;
  }
</script>

<AlertDialog.Root
  bind:open={ctx.deleteDialogState}
  onOpenChangeComplete={(isOpen) => {
    if (!isOpen) ctx.openSlip = null;
  }}
>
  <AlertDialog.Content
    class="sm:max-w-sm"
    onOpenAutoFocus={ (e) => {
      e.preventDefault();

      alterDialogContinueButton?.focus();
    }}
  >
    <AlertDialog.Header>
      <AlertDialog.Title>Delete Pass Slip?</AlertDialog.Title>
      <AlertDialog.Description>
        This will permanently delete pass slip. This action is irreversible.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action
        class={buttonVariants({ variant: "destructive" })}
        onclick={deleteSlip}
        bind:ref={alterDialogContinueButton}
      >
        Delete
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
