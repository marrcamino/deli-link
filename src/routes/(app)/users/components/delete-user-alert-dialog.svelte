<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import { buttonVariants } from "$lib/components/ui/button";
  import Spinner from "$lib/components/ui/spinner/spinner.svelte";
  import { getDBConn } from "$lib/db";
  import { toast } from "svelte-sonner";
  import { getUserContext } from "../context.svelte";

  const context = getUserContext();
  let isDeleting = $state(false);

  async function deleteUser() {
    try {
      isDeleting = true;
      if (!context.userToAlter) return;
      const db = await getDBConn();

      const result = await db.execute("DELETE FROM user WHERE user_pk = ?", [
        context.userToAlter.user_pk,
      ]);

      if (result.rowsAffected === 1) {
        toast.success("User Deleted");
        context.remove(context.userToAlter.user_pk)
        context.delAlertDialogState = false;
        return;
      }

      toast.error("An while deleting user");
    } finally {
      isDeleting = false;
    }
  }
</script>

<AlertDialog.Root
  bind:open={context.delAlertDialogState}
  onOpenChangeComplete={(isOpen) => {
    if (!isOpen) context.userToAlter = null;
  }}
>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Confirm User Deletion</AlertDialog.Title>
      <AlertDialog.Description>
        You are about to permanently delete this user. All associated records
        and access will be removed. This action cannot be reversed.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action
        class={buttonVariants({
          variant: "destructive",
        })}
        disabled={isDeleting}
        onclick={deleteUser}
      >
        {#if isDeleting}
          <Spinner />
        {/if}
        <span>Continue</span>
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
