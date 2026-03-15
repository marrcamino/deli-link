<script lang="ts">
  import type { Snippet } from "svelte";

  import {} from "svelte/reactivity";

  let { children }: { children: Snippet } = $props();
</script>

{@render children()}
