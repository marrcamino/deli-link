<script lang="ts">
  import {
    cn,
    type WithoutChild,
    type WithoutChildrenOrChild,
    type WithoutChildren,
  } from "$lib/utils.js";
  import XIcon from "@lucide/svelte/icons/x";
  import { Dialog as DialogPrimitive } from "bits-ui";
  import type { ComponentProps, Snippet } from "svelte";
  import DialogPortal from "./dialog-portal.svelte";
  import * as Dialog from "./index.js";

  type AsChildOrChildren =
    | WithoutChild<DialogPrimitive.ContentProps>
    | WithoutChildren<DialogPrimitive.ContentProps>;

  type ChildProps = DialogPrimitive.ContentProps & {
    props: Record<string, unknown>;
  };

  let {
    ref = $bindable(null),
    class: className,
    portalProps,
    showCloseButton = true,
    disableCloseButton = false,
    children,
    ...restProps
  }: WithoutChildrenOrChild<DialogPrimitive.ContentProps> & {
    portalProps?: WithoutChildrenOrChild<ComponentProps<typeof DialogPortal>>;
    children: Snippet;
    showCloseButton?: boolean;
    disableCloseButton?: boolean;
  } = $props();

  // console.log($state.snapshot(restProps));
</script>

<DialogPortal {...portalProps}>
  <Dialog.Overlay
    class="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 overflow-auto py-14 grid place-items-center"
  >
    <DialogPrimitive.Content
      bind:ref
      data-slot="dialog-content"
      class={cn(
        "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50 grid w-full max-w-[calc(100%-2rem)] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg relative",
        className,
      )}
      {...restProps}
    >
      {@render children?.()}

      {#if showCloseButton}
        <DialogPrimitive.Close
          class="ring-offset-background focus:ring-ring absolute inset-e-4 top-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          disabled={disableCloseButton}
          data-button
        >
          <XIcon />
          <span class="sr-only">Close</span>
        </DialogPrimitive.Close>
      {/if}
    </DialogPrimitive.Content>
  </Dialog.Overlay>
</DialogPortal>
