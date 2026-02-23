<!-- @component Used for adding indicator to a input where is required-->
<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  let {
    class: className = "text-destructive",
    withParentheses = false,
    ...restProps
  }: HTMLAttributes<HTMLSpanElement> & { withParentheses?: boolean } = $props();
</script>

{#if withParentheses}
  &lpar;{@render theSpan()}&rpar;
{:else}
  {@render theSpan()}
{/if}

{#snippet theSpan()}
  <span class={className} {...restProps}>*</span>
{/snippet}
