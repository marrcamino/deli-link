<script lang="ts">
  import Badge from "$lib/components/ui/badge/badge.svelte";
  import { untrack } from "svelte";
  import { expoInOut } from "svelte/easing";
  import { slide } from "svelte/transition";

  interface Props {
    is_approved: Bit;
  }
  let { is_approved }: Props = $props();

  // svelte-ignore state_referenced_locally
  let isApproved = $state(Boolean(is_approved));

  $effect(() => {
    is_approved;
    untrack(() =>
      setTimeout(() => {
        isApproved = Boolean(is_approved);
      }, 150),
    );
  });
</script>

<Badge
  class="rounded-md duration-300"
  variant={isApproved ? "success" : "secondary"}
>
  <div class="flex">
    {#if !isApproved}
      <span
        class="block pr-1"
        transition:slide={{ axis: "x", easing: expoInOut }}>Pending</span
      >
    {/if}

    <span class="block">Approv</span>

    {#if isApproved}
      <span class="block" transition:slide={{ axis: "x", easing: expoInOut }}
        >ed</span
      >
    {/if}
    {#if !isApproved}
      <span class="block" transition:slide={{ axis: "x", easing: expoInOut }}
        >al</span
      >
    {/if}
  </div>
</Badge>
