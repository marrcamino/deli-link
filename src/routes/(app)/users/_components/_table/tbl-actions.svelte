<script lang="ts">
  import { buttonVariants } from "$lib/components/ui/button";
  import * as ButtonGroup from "$lib/components/ui/button-group/index.js";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import { Pencil, Trash2 } from "@lucide/svelte";
  import { getUserContext } from "../../context.svelte";

  interface Props {
    user: User;
  }
  let { user }: Props = $props();

  const context = getUserContext();
</script>

<ButtonGroup.Root class="place-self-end">
  <Tooltip.Provider>
    <Tooltip.Root>
      <Tooltip.Trigger
        class={buttonVariants({
          variant: "outline",
          size: "icon-sm",
        })}
        onclick={() => {
          context.userToAlter = user;

          context.empAddDialogState = true;
        }}
      >
        <Pencil />
      </Tooltip.Trigger>
      <Tooltip.Content>
        <p>Edit</p>
      </Tooltip.Content>
    </Tooltip.Root>
  </Tooltip.Provider>

  <Tooltip.Provider>
    <Tooltip.Root>
      <Tooltip.Trigger
        class={buttonVariants({
          variant: "outline-destructive",
          size: "icon-sm",
        })}
        onclick={() => {
          context.userToAlter = user;
          context.delAlertDialogState = true;
        }}
      >
        <Trash2 />
      </Tooltip.Trigger>
      <Tooltip.Content>
        <p>Remove</p>
      </Tooltip.Content>
    </Tooltip.Root>
  </Tooltip.Provider>
</ButtonGroup.Root>
