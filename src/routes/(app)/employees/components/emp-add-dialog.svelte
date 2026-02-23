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
  import { getDbConn } from "$lib/db";
  import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
  import { useDebounce } from "runed";
  import { getEmployeeContext } from "../context.svelte";
  import { toast } from "svelte-sonner";

  const context = getEmployeeContext();

  let idElRef: HTMLInputElement | null = $state(null);

  let id = $state("");
  let lname = $state("");
  let fname = $state("");
  let mname = $state("");
  let designation = $state("");

  function resetForm() {
    id = "";
    lname = "";
    fname = "";
    mname = "";
    designation = "";
    isExist = false;
  }

  let isExist = $state(false);
  let isSaving = $state(false);

  const oninput = useDebounce(async () => {
    if (id === "") {
      isExist = false;
      return;
    }
    const db = await getDbConn();

    const data = (await db.select(
      "SELECT EXISTS(SELECT 1 FROM employee WHERE employee_pk = ?) AS is_found",
      [id],
    )) as any;

    isExist = !!data[0]?.is_found;
  }, 500);

  async function onsubmit(e: SubmitEvent) {
    e.preventDefault();
    if (isExist) {
      idElRef?.focus();
      return;
    }
    
    try {
      isSaving = true;
      const db = await getDbConn();
      const result = await db.execute(
        "INSERT into employee (employee_pk, last_name, first_name, middle_name, designation) VALUES (?, ?, ?, ?, ?)",
        [id, lname, fname, mname || null, designation],
      );

      if (!result.lastInsertId) {
        toast.error("Unable to save employee");
        return;
      }

      toast.success("Added Successfully");
      context.empAddDialog = false;
    } finally {
      isSaving = false;
    }
  }
</script>

<Dialog.Root
  bind:open={context.empAddDialog}
  onOpenChangeComplete={(isOpen) => !isOpen && resetForm()}
>
  <Dialog.Content class="sm:max-w-106.25" escapeKeydownBehavior="ignore">
    <form class="grid gap-4" {onsubmit} autocomplete="off">
      <Dialog.Header>
        <Dialog.Title>Add New Employee</Dialog.Title>
        <Dialog.Description
          >All fields marked with <Asterisk withParentheses /> are required</Dialog.Description
        >
      </Dialog.Header>
      <div class="grid gap-4 *:[&_label]:gap-0.5">
        <div>
          <div>
            <Label for="employee_pk" class="gap-0.5">
              User Identification <Asterisk />
            </Label>
            <Input
              bind:ref={idElRef}
              id="employee_pk"
              name="employee_pk"
              type="number"
              bind:value={id}
              min={0}
              aria-invalid={isExist}
              class="mt-1"
              required
              {oninput}
            />
          </div>

          {#if isExist}
            <AnimateContent>
              <div class="pt-2 pb-3">
                <Alert.Root variant="danger">
                  <AlertCircleIcon />
                  <Alert.Title>Employee ID Already Exists</Alert.Title>
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
          <Input id="lname" name="lname" required bind:value={lname} />
        </div>
        <div class="grid gap-1">
          <Label for="fname">First Name<Asterisk /></Label>
          <Input id="fname" name="fname" required bind:value={fname} />
        </div>
        <div class="grid gap-1">
          <Label for="mname">Middle Name</Label>
          <Input id="mname" name="mname" bind:value={mname} />
        </div>
        <div class="grid gap-1">
          <Label for="designation">Designation<Asterisk /></Label>
          <Textarea
            id="designation"
            name="designation"
            required
            autoHeight
            autoTrim
            bind:value={designation}
          />
        </div>
      </div>

      <Dialog.Footer>
        <Dialog.Close
          type="button"
          class={buttonVariants({ variant: "outline" })}
        >
          Cancel
        </Dialog.Close>
        <Button type="submit" disabled={isSaving}>
          {#if isSaving}
            <Spinner />
          {/if}

          <span>Add Employee</span>
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
