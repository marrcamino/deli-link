<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";
  import { backOut, expoOut } from "svelte/easing";
  import type { ClassValue } from "svelte/elements";
  import { fly, slide } from "svelte/transition";

  interface Props {
    children: Snippet<[]>;
    innerClass?: ClassValue;
    outerClass?: ClassValue;
  }
  let { children, innerClass, outerClass }: Props = $props();

  const transitionConfig = {
    inSlide: { duration: 400, easing: backOut },
    inContent: {
      y: -28,
      opacity: 0,
      delay: 100,
      duration: 300,
      easing: backOut,
    },
    outContent: { y: -30, opacity: 0, duration: 250 },
    outSlide: { duration: 250, delay: 80, easing: expoOut },
  } as const;
</script>

<div
  in:slide={transitionConfig.inSlide}
  out:slide={transitionConfig.outSlide}
  class={cn("pb-2 last:pb-0", outerClass)}
>
  <div
    in:fly={transitionConfig.inContent}
    out:fly={transitionConfig.outContent}
    class={cn(innerClass)}
  >
    {@render children()}
  </div>
</div>
