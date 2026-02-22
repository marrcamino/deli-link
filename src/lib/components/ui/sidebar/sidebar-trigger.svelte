<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { cn } from "$lib/utils.js";
  import PanelLeftIcon from "@lucide/svelte/icons/panel-left";
  import type { ComponentProps } from "svelte";
  import { useSidebar } from "./context.svelte.js";

  let {
    ref = $bindable(null),
    class: className,
    onclick,
    ...restProps
  }: ComponentProps<typeof Button> & {
    onclick?: (e: MouseEvent) => void;
  } = $props();

  const sidebar = useSidebar();
</script>

<Button
  data-sidebar="trigger"
  data-slot="sidebar-trigger"
  variant="ghost"
  size="icon"
  class={cn("size-7", className)}
  type="button"
  onclick={(e) => {
    onclick?.(e);
    sidebar.toggle();
  }}
  {...restProps}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-panel-right-close-icon lucide-panel-right-close relative"
  >
    <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M15 3v18" />
    <path
      d="m8 9 3 3-3 3"
      data-open={sidebar.open}
      class="origin-center transition-transform data-[open=true]:-scale-x-100 data-[open=true]:-translate-x-1.25"
    />
  </svg>
  <span class="sr-only">Toggle Sidebar</span>
</Button>
