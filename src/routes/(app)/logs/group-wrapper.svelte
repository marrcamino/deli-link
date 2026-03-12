<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
    header: Snippet;
  }
  let { children, header }: Props = $props();
</script>

<div
  class="border px-2 rounded-lg pb-2 w-full mt-8 first:mt-0 place-self-center-safe"
>
  <div
    class="text-xl uppercase font-semibold rounded-t-lg sticky top-28 pt-1 pb-2 bg-background z-5"
  >
    {@render header()}
  </div>

  <div>
    {@render children()}
  </div>
</div>
