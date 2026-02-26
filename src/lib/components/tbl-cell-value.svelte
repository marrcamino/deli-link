<!-- @component
Text will always set to center
 -->
<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";

  interface Props {
    children?: Snippet;
    value?: any;
    class?: null | ClassValue;
  }

  let { children, value, class: className }: Props = $props();
</script>

<div class={cn("text-center text-wrap", className)}>
  {@render children?.()}
  {value}
</div>
