<script lang="ts">
  import HiddenInput from "$lib/components/hidden-input.svelte";
  import { buttonVariants } from "$lib/components/ui/button/index.js";
  import { Calendar } from "$lib/components/ui/calendar/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import { cn, prettifyDates } from "$lib/utils";
  import { type DateValue } from "@internationalized/date";
  import { CalendarIcon, X } from "@lucide/svelte/icons";
  import { fade, slide } from "svelte/transition";

  interface Props {
    open?: boolean;
    values?: DateValue[];
    closeOnDateSelect?: boolean;
    placeholder?: DateValue;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    maxDate?: DateValue;
    minDate?: DateValue;
    onValueChange?: (value: DateValue[]) => void;
    onOpenChangeComplete?: (open: boolean) => void;
    triggerOptions?: {
      class?: string | null;
      withIcon?: boolean;
      label?: string | null;
    };
    ariaInvalid?: boolean;
    ref?: HTMLButtonElement | null;
  }

  let {
    open = $bindable(false),
    values = $bindable([]),
    maxDate = $bindable(),
    minDate = $bindable(),
    placeholder = $bindable(),
    closeOnDateSelect,
    required,
    name,
    onOpenChangeComplete,
    triggerOptions,
    onValueChange,
    disabled,
    ariaInvalid,
    ref = $bindable(null),
  }: Props = $props();

  let contentRef = $state<HTMLElement | null>(null);
  let container = $state<HTMLElement>();
  let divWidth = $state(0); // We bind this just to trigger the derived check on resize
  let haveValues = $derived(values && values.length);

  // This will re-calculate whenever the div resizes or the container reference is set
  let isTruncated = $derived.by(() => {
    if (!container) return false;
    divWidth; // Accessing this creates a dependency on resize
    return container.scrollWidth > container.clientWidth;
  });
</script>

<div>
  <Popover.Root
    bind:open
    onOpenChangeComplete={() => onOpenChangeComplete?.(open)}
  >
    <Popover.Trigger
      tabindex={disabled ? -1 : undefined}
      data-no-value={!haveValues ? "" : null}
      bind:ref
      {disabled}
      class={cn(
        buttonVariants({
          variant: "outline",
          class: [
            "data-no-value:text-muted-foreground justify-start w-full min-w-10 text-left font-normal relative ",
            "aria-invalid:ring-destructive/20 min-w-53.75 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive aria-invalid:ring-[3px] hover:group-data-present/date:text-transparent group-data-present/date:text-transparent pl-2.5! pr-6! ",
            triggerOptions?.class ?? null,
          ],
        }),
      )}
      aria-invalid={ariaInvalid ? "true" : undefined}
    >
      {#if triggerOptions?.withIcon ?? true}
        <CalendarIcon />
      {/if}
      <div class="truncate" bind:this={container} bind:clientWidth={divWidth}>
        {#if haveValues}
          {prettifyDates(values)}
        {:else}
          Select Multiple Dates
        {/if}
      </div>

      <button
        {disabled}
        data-has-date={haveValues ? "" : null}
        class="absolute right-2 data-has-date:pointer-events-auto disabled:cursor-auto pointer-events-none transition-opacity data-has-date:opacity-100 opacity-0"
        type="button"
        onclick={(e) => {
          e.stopPropagation();
          values = [];
        }}><X /> <span class="sr-only">clear date</span></button
      >

      {#if name}
        <HiddenInput
          bind:required
          bind:name
          value={haveValues ? values.join() : ""}
          onFormReset={() => (values = [])}
        />
      {/if}
    </Popover.Trigger>

    <Popover.Content bind:ref={contentRef} class="w-auto p-0">
      <!-- <div class="text-right pt-2 pr-2"><Button variant="outline" size="sm">To present</Button></div> -->
      <Calendar
        onValueChange={(value) => {
          onValueChange?.(value);
          if (closeOnDateSelect && value) open = false;
        }}
        {disabled}
        type="multiple"
        maxDays={5}
        class="rounded-md border shadow-sm"
        bind:value={values}
        bind:placeholder
        maxValue={maxDate}
        minValue={minDate}
      />
    </Popover.Content>
  </Popover.Root>
  {#if isTruncated}
    <div
      in:slide
      out:slide={{ delay: 200 }}
      class="text-xs text-muted-foreground text-center"
    >
      {#if values && values.length}
        <div in:fade={{ delay: 300 }} out:fade class="h-4">
          {prettifyDates(values)}
        </div>
      {/if}
    </div>
  {/if}
</div>
