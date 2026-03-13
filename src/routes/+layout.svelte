<script lang="ts">
  import { Toaster } from "$lib/components/ui/sonner/index.js";
  import { ModeWatcher } from "mode-watcher";
  import "./layout.css";

  const { children } = $props();
</script>

{@render children()}

<ModeWatcher defaultMode={"system"} />
<Toaster richColors position="top-left" closeButton class="z-auto"/>
