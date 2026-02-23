<script lang="ts">
  import { cn, type WithElementRef, type WithoutChildren } from "$lib/utils";
  import { onMount } from "svelte";
  import type { HTMLTextareaAttributes } from "svelte/elements";

  let {
    ref = $bindable(null),
    value = $bindable(),
    class: className,
    "data-slot": dataSlot = "textarea",
    autoTrim,
    autoHeight,
    ...restProps
  }: WithoutChildren<WithElementRef<HTMLTextareaAttributes>> & {
    /**
     * Trim and remove duplicate white space
     *
     * @defaultValue `false`
     */
    autoTrim?: boolean;

    /**
     * Whether the textarea should automatically adjust its height based on content.
     * @defaultValue `false`
     */
    autoHeight?: boolean;
  } = $props();

  function onfocusout(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    value = target.value.trim().replace(/\s+/g, " ");
  }

  function autoResize(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = "auto"; // reset height
    target.style.height = target.scrollHeight + 2 + "px"; // set new height
  }

  onMount(() => {
    if (!ref) return;

    // Add the event listener separately instead of binding directly,
    // so that any onfocusout event passed to this component is not ignored.
    if (autoTrim) ref.addEventListener("focusout", onfocusout);

    if (autoHeight) ref.addEventListener("input", autoResize);

    return () => {
      ref?.removeEventListener("focusout", onfocusout);
      ref?.removeEventListener("input", autoResize);
    };
  });
</script>

<textarea
  bind:this={ref}
  data-slot={dataSlot}
  class={cn(
    "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 field-sizing-content shadow-xs flex min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    className
  )}
  bind:value
  {...restProps}
></textarea>
