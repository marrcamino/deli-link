<script lang="ts">
  import { cn } from "$lib/utils";
  import Loader from "@lucide/svelte/icons/loader";
  import type { ComponentProps } from "svelte";

  type Props = ComponentProps<typeof Loader>;

  let { class: className, ...restProps }: Props = $props();
</script>

<Loader
  role="status"
  aria-label="Loading"
  class={cn("size-4 animate-spin", className)}
  {...restProps}
/>
