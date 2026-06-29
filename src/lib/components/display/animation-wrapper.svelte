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
    disableTransition?: boolean;
  }
  let { children, innerClass, outerClass, disableTransition }: Props = $props();

  const off = { duration: 0, delay: 0 };

  const t = $derived(
    disableTransition
      ? {
          inSlide: off,
          inContent: { ...off, y: 0 },
          outContent: { ...off, y: 0 },
          outSlide: off,
        }
      : {
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
        },
  );
</script>

<div
  in:slide={t.inSlide}
  out:slide={t.outSlide}
  class={cn("pb-2 last:pb-0", outerClass)}
>
  <div in:fly={t.inContent} out:fly={t.outContent} class={cn(innerClass)}>
    {@render children()}
  </div>
</div>
