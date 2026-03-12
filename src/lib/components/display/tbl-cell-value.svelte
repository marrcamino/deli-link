<!-- @component
Text will always set to center
 -->
<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";

  interface Props {
    children?: Snippet;
    value?: string | number ;
    class?: null | ClassValue;
  }

  let { children, value, class: className }: Props = $props();
</script>

<div class={cn("text-center", className)}>
  {@render children?.()}
  {value}
</div>
