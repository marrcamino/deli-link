<script lang="ts">
  import RouteContent from "$lib/components/route-content.svelte";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { onMount } from "svelte";

  onMount(async () => {
    await getCurrentWindow().setTitle("Home");
  });
</script>

<RouteContent>
  {#snippet header()}
    <div class="font-semibold">Home</div>
  {/snippet}

  <div>
    Lorem ipsum dolor, sit amet consectetur adipisicing elit. Deleniti maxime
    reiciendis ea nemo numquam. Temporibus repellat architecto eveniet suscipit
    repudiandae iusto aperiam deserunt commodi! In rem fuga cum repudiandae ut?
  </div>
</RouteContent>
