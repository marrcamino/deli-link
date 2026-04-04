<script lang="ts">
  import RouteContent from "$lib/components/route-content.svelte";
  import type { PageData } from "./$types";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { onMount } from "svelte";

  let { data }: { data: PageData } = $props();

  onMount(async () => {
    await getCurrentWindow().setTitle(`Deli Link - Pass Slip`);
  });
</script>

<RouteContent>
  <!-- {#snippet header()}{/snippet} -->

  <div class="px-4 pt-4">
    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Placeat eum natus
    enim ullam consequatur non iure necessitatibus, sequi eveniet debitis! Nihil
    velit deleniti veniam excepturi non laboriosam! Ratione, minima eligendi!
  </div>
</RouteContent>
