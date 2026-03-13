<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import { Plus } from "@lucide/svelte";
  import * as ButtonGroup from "$lib/components/ui/button-group/index.js";
  import { getLeaveContext } from "./context.svelte";

  const ctx = getLeaveContext();
  interface Props {
    user: User;
  }
  let { user }: Props = $props();
</script>

<div class="place-self-end">
  <ButtonGroup.Root>
    <Button
      variant="outline"
      size="icon-sm"
      onclick={() => {
        ctx.openLeaveDialog(user);
      }}
    >
      <Plus />
      <span class="sr-only">Add </span>
    </Button>
    <Button
      variant="outline"
      size="sm"
      onclick={() => {
        ctx.openSheet(user);
      }}>View</Button
    >
  </ButtonGroup.Root>
</div>
