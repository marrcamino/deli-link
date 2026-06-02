<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";
  import { backOut, expoIn, expoOut } from "svelte/easing";
  import type { ClassValue } from "svelte/elements";
  import { fly, slide } from "svelte/transition";

  interface Props {
    items: any[] | null;
    children: Snippet<[]>;
    class?: ClassValue;
  }
  let { items, children, class: classNames }: Props = $props();

  const transitionConfig = {
    inSlide: { duration: 200, easing: expoOut },
    inContent: {
      y: 50,
      opacity: 0,
      delay: 200,
      duration: 200,
      easing: expoOut,
    },
    outContent: { y: 16, opacity: 0, duration: 140, easing: expoIn },
    outSlide: { duration: 210, delay: 110, easing: expoIn },
  } as const;
</script>

{#if items?.length === 0}
  <div class={cn("absolute top-0 left-0 right-0", classNames)}>
    <div
      in:slide={transitionConfig.inSlide}
      out:slide={transitionConfig.outSlide}
    >
      <div
        in:fly={transitionConfig.inContent}
        out:fly={transitionConfig.outContent}
      >
        {@render children()}
      </div>
    </div>
  </div>
{/if}
