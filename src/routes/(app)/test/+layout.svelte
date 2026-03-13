<script lang="ts">
  import { onMount, type Snippet } from "svelte";
  import RouteContent from "$lib/components/route-content.svelte";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  let { children }: { children: Snippet } = $props();

  onMount(async () => {
    await getCurrentWindow().setTitle(`Deli Link - Test`);
  });
</script>

<RouteContent {children} />
