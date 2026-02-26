<script lang="ts">
  import AnimateContent from "$lib/components/animate-content.svelte";
  import Asterisk from "$lib/components/display/asterisk.svelte";
  import * as Alert from "$lib/components/ui/alert/index.js";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import Spinner from "$lib/components/ui/spinner/spinner.svelte";
  import Textarea from "$lib/components/ui/textarea/textarea.svelte";
  import { getDBConn } from "$lib/db";
  import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
  import { useDebounce } from "runed";
  import { toast } from "svelte-sonner";
  import { getUserContext } from "../context.svelte";
  import { tick, untrack } from "svelte";
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";

  const context = getUserContext();

  let idElRef: HTMLInputElement | null = $state(null);

  let id = $state("");
  let lname = $state("");
  let fname = $state("");
  let mname = $state("");
  let extension = $state("");
  let designation = $state("");

  const user = $derived(context.userToAlter);

  function resetForm() {
    context.userToAlter = null;

    id = "";
    lname = "";
    fname = "";
    mname = "";
    designation = "";
    designation = "";
    isExist = false;
  }

  let isExist = $state(false);
  let isSaving = $state(false);
  let showDiscardAlert = $state(false);
  let cancelAlert = false;

  let easyClose = $derived(id !== "" ? "ignore" : "close") as
    | "ignore"
    | "close";

  const oninput = useDebounce(async () => {
    /**
     * Won't check in edit mode.
     * This ensures the system doesn't flag the user's own ID
     * as already existing when updating their profile.
     */
    if (Number(id) === user?.user_pk) {
      // For some reason, it needs to convert the id to a number, because it will be set to null when empty or has no value.
      // I think the input component sets it.
      return;
    }

    if (id === "") {
      isExist = false;
      return;
    }

    const db = await getDBConn();

    const data = (await db.select(
      "SELECT EXISTS(SELECT 1 FROM user WHERE user_pk = ?) AS is_found",
      [id],
    )) as any;

    isExist = !!data[0]?.is_found;
  }, 500);

  async function onsubmit(e: SubmitEvent) {
    e.preventDefault();

    if (user) {
      await updateUser();
      return;
    }

    if (isExist) {
      idElRef?.focus();
      return;
    }

    try {
      isSaving = true;
      const db = await getDBConn();
      const result = await db.execute(
        "INSERT INTO user (user_pk, last_name, first_name, middle_name, extension, designation) VALUES (?, ?, ?, ?, ?, ?)",
        [id, lname, fname, mname || null, extension || null, designation],
      );

      if (!result.lastInsertId) {
        toast.error("Unable to save user");
        return;
      }

      toast.success("Added Successfully");
      context.add({
        user_pk: parseInt(id),
        last_name: lname,
        first_name: fname,
        middle_name: mname || null,
        extension: extension || null,
        designation,
      });
      context.empAddDialogState = false;
    } finally {
      isSaving = false;
    }
  }

  async function updateUser() {
    try {
      isSaving = true;
      const db = await getDBConn();

      const result = await db.execute(
        "UPDATE user SET last_name = ?, first_name = ?, middle_name = ?, extension = ?, designation = ?",
        [lname, fname, mname || null, extension || null, designation],
      );

      if (!result.rowsAffected) {
        toast.error("An error occured while updating user");
        return;
      }

      toast.success("User updated successfully");
      context.update({
        user_pk: parseInt(id),
        last_name: lname,
        first_name: fname,
        middle_name: mname || null,
        extension: extension || null,
        designation,
      });
      context.empAddDialogState = false;
    } catch (error) {
      toast.error("An error occured while updating user");
      console.error(error);
    } finally {
      isSaving = false;
    }
  }

  $effect(() => {
    context.empAddDialogState;

    untrack(() => {
      if (!context.empAddDialogState || !user) return;
      id = user.user_pk.toString();
      lname = user.last_name.toString();
      fname = user.first_name.toString();
      mname = user.middle_name?.toString() || "";
      extension = user.extension?.toString() || "";
      designation = user.designation;
    });
  });

  function handleMainAttemptClose(e: Event) {
    if (Number(id) !== 0) {
      e.preventDefault(); // Stop the Main Dialog from closing
      cancelAlert = false;
      showDiscardAlert = true; // Open the Alert instead
    }
  }
</script>

<Dialog.Root
  bind:open={context.empAddDialogState}
  onOpenChangeComplete={(isOpen) => !isOpen && resetForm()}
>
  <Dialog.Content
    data-alert-dialog={showDiscardAlert}
    class="sm:max-w-106.25 data-[alert-dialog=true]:scale-95"
    escapeKeydownBehavior="defer-otherwise-close"
    interactOutsideBehavior="defer-otherwise-close"
    onEscapeKeydown={handleMainAttemptClose}
    onInteractOutside={handleMainAttemptClose}
  >
    <form class="grid gap-4" {onsubmit} autocomplete="off">
      <Dialog.Header>
        <Dialog.Title>
          {context.userToAlter ? "Update" : "Add New"} User
        </Dialog.Title>
        <Dialog.Description>
          All fields marked with <Asterisk withParentheses /> are required
        </Dialog.Description>
      </Dialog.Header>
      <div class="grid gap-4 *:[&_label]:gap-0.5">
        <div>
          <div>
            <Label for="user_pk" class="gap-0.5">
              User Identification <Asterisk />
            </Label>
            <Input
              bind:ref={idElRef}
              bind:value={id}
              {oninput}
              class="mt-1"
              id="user_pk"
              name="user_pk"
              type="number"
              min={1}
              required
              placeholder="1"
              aria-invalid={isExist}
            />
          </div>

          {#if isExist}
            <AnimateContent>
              <div class="pt-2 pb-3">
                <Alert.Root variant="danger">
                  <AlertCircleIcon />
                  <Alert.Title>User ID Already Exists</Alert.Title>
                  <Alert.Description>
                    This ID is already registered in the system. Duplicate IDs
                    are not allowed because the ID is manually assigned from the
                    attendance machine.
                  </Alert.Description>
                </Alert.Root>
              </div>
            </AnimateContent>
          {/if}
        </div>
        <div class="grid gap-1">
          <Label for="lname">Last Name<Asterisk /></Label>
          <Input
            id="lname"
            name="lname"
            required
            bind:value={lname}
            placeholder="Dela Cruz"
          />
        </div>
        <div class="grid gap-1">
          <Label for="fname">First Name<Asterisk /></Label>
          <Input
            id="fname"
            name="fname"
            required
            bind:value={fname}
            placeholder="Juan"
          />
        </div>
        <div class="grid gap-1">
          <Label for="mname">Middle Name</Label>
          <Input
            id="mname"
            name="mname"
            bind:value={mname}
            placeholder="Sanchez"
          />
        </div>
        <div class="grid gap-1">
          <Label for="extension">Extension</Label>
          <Input
            id="extension"
            name="extension"
            bind:value={extension}
            placeholder="Jr"
            pattern="^(Jr|Sr|I|II|III|IV|V)$"
            title="Enter a valid name extension only: Jr, Sr, I, II, III, IV, or V. No spaces or periods allowed."
            onfocusout={() => {
              extension = extension.replaceAll(".", "");
            }}
          />
        </div>
        <div class="grid gap-1">
          <Label for="designation">Designation<Asterisk /></Label>
          <Textarea
            id="designation"
            name="designation"
            required
            autoHeight
            autoTrim
            placeholder="Suport Staff"
            bind:value={designation}
          />
        </div>
      </div>

      <Dialog.Footer>
        <Dialog.Close
          type="button"
          class={buttonVariants({ variant: "outline" })}
          onclick={handleMainAttemptClose}
        >
          Cancel
        </Dialog.Close>
        <Button type="submit" disabled={isSaving}>
          {#if isSaving}
            <Spinner />
          {/if}

          <span>{context.userToAlter ? "Update" : "Add"} User</span>
        </Button>
      </Dialog.Footer>
    </form>

    <AlertDialog.Root
      bind:open={showDiscardAlert}
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen && !cancelAlert && Number(id) !== 0) {
          context.empAddDialogState = false;
        }
      }}
    >
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>Discard Changes?</AlertDialog.Title>
          <AlertDialog.Description>
            If you close this dialog now, all the information you've entered
            will be lost. Do you want to discard your changes?
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel onclick={() => (cancelAlert = true)}
            >Cancel</AlertDialog.Cancel
          >
          <AlertDialog.Action
            onclick={async () => {
              showDiscardAlert = false;
              await tick();
            }}>Continue</AlertDialog.Action
          >
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Root>
  </Dialog.Content>
</Dialog.Root>
