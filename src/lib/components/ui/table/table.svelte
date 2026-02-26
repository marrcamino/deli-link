<script lang="ts">
  import type { HTMLTableAttributes } from "svelte/elements";
  import { cn, type WithElementRef } from "$lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    children,
    noWrapper,
    ...restProps
  }: WithElementRef<HTMLTableAttributes> & {
    noWrapper?: boolean;
  } = $props();
</script>

{#if noWrapper}
  {@render table()}
{:else}
  <div data-slot="table-container" class="relative w-full overflow-x-auto">
    {@render table()}
  </div>
{/if}

{#snippet table()}
  <table
    bind:this={ref}
    data-slot="table"
    class={cn("w-full caption-bottom text-sm", className)}
    {...restProps}
  >
    {@render children?.()}
  </table>
{/snippet}
