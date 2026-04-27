<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import { Plus } from "@lucide/svelte";
  import * as ButtonGroup from "$lib/components/ui/button-group/index.js";
  import { getPassSlipContext } from "./context.svelte";
  import { tick } from "svelte";

  interface Props {
    user: User;
  }

  let { user }: Props = $props();

  const ctx = getPassSlipContext();
</script>

<div class="place-self-end">
  <ButtonGroup.Root>
    <Button
      variant="outline"
      size="icon-sm"
      onclick={async () => {
        ctx.openUser = user;
        ctx.sheetState = true;
        await tick();
        setTimeout(() => {
          ctx.addEditDialogState = true;
        }, 300);
      }}
    >
      <Plus />
      <span class="sr-only">Add </span>
    </Button>
    <Button
      variant="outline"
      size="sm"
      onclick={() => {
        ctx.openUser = user;
        ctx.sheetState = true;
      }}>View</Button
    >
  </ButtonGroup.Root>
</div>
