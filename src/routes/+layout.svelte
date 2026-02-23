<script lang="ts">
  import { ModeWatcher } from "mode-watcher";
  import "./layout.css";
  import { setContext } from "svelte";
  import { Toaster } from "$lib/components/ui/sonner/index.js";

  const { children } = $props();
</script>

{@render children()}

<ModeWatcher defaultMode={"system"} />
<Toaster richColors position="top-left" />
