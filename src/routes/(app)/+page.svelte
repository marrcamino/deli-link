<script lang="ts">
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { onMount } from "svelte";
  import RouteContent from "$lib/components/route-content.svelte";
  import { Window } from "@tauri-apps/api/window";
  import { Webview } from "@tauri-apps/api/webview";
  import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

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
