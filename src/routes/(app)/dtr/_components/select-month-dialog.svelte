<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Label } from "$lib/components/ui/label";
  import { getDTRContext } from "../context.svelte";
  import LogMonthSelector from "./log-month-selector.svelte";

  const context = getDTRContext();
</script>

<Dialog.Root bind:open={context.monthSelectDialog}>
  <Dialog.Content
    class="sm:max-w-62.5"
    interactOutsideBehavior="ignore"
    escapeKeydownBehavior="ignore"
    showCloseButton={false}
  
  >
    <div class="mb-2 pt-4">
      <Label for="selectMonth" class="flex flex-col w-full items-start gap-1">
        <div>Select Month</div>
        <LogMonthSelector
          id="selectMonth"
          width="w-50"
          name="selectMonth"
          required
        />
      </Label>
    </div>
    <Dialog.Footer>
      <Dialog.Close class={buttonVariants()}>Load Logs</Dialog.Close>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
