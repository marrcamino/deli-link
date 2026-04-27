<script module>
  import DivWrapper from "./div-wrapper.svelte";
  import { renderComponent } from "$lib/components/ui/data-table/index.js";
  import { type ClassValue } from "svelte/elements";

  export function divWrap(content: string | number, className?: ClassValue) {
    return renderComponent(DivWrapper, { content, class: className });
  }
</script>

<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  let {
    children,
    content,
    class: ClassName,
    ...props
  }: {
    children?: Snippet;
    content?: string | number;
  } & HTMLAttributes<HTMLDivElement> = $props();
</script>

<div class={cn(ClassName)} {...props}>
  {#if content}
    {content}
  {:else}
    {@render children?.()}
  {/if}
</div>
