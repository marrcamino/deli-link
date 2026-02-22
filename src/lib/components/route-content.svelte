<script lang="ts">
  import {
    SidebarTrigger,
    useSidebar,
  } from "$lib/components/ui/sidebar/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import type { Snippet } from "svelte";

  interface Props {
    header?: Snippet;
    children: Snippet<[]>;
    noHeader?: boolean;
  }

  let { header, noHeader, children }: Props = $props();

  let isOpen = useSidebar();
</script>

<div class="absolute inset-0 overflow-auto">
  {#if !noHeader}
    <header
      class="h-14 sticky left-0 top-0 bg-background border-b right-0 overflow-hidden"
    >
      <div
        class="md:data-[open=true]:w-[calc(100dvw-var(--sidebar-width))] flex items-center gap-2 px-4 py-2 h-14 absolute top-0 z-1 md:w-[calc(100dwv-(--sidebar-width-icon))] md:transition-[left,right,width] md:duration-200 ease-linear w-dvw duration-0 transition-none"
        data-open={isOpen}
      >
        <SidebarTrigger
          class="-ms-1 md:hidden text-primary focus-visible:ring-2"
        />
        {#if header}
          <Separator
            orientation="vertical"
            class="me-2 data-[orientation=vertical]:h-4 md:hidden"
          />
        {/if}
        {@render header?.()}
      </div>
    </header>
  {/if}
  <div>
    {@render children()}
  </div>
</div>
