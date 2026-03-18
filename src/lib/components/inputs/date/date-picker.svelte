<script lang="ts">
  import { buttonVariants } from "$lib/components/ui/button/index.js";
  import { Calendar } from "$lib/components/ui/calendar/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import { cn, formatDate } from "$lib/utils";
  import {
    CalendarDate,
    DateFormatter,
    type DateValue,
    getLocalTimeZone,
  } from "@internationalized/date";
  import { CalendarIcon, X } from "@lucide/svelte/icons";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import HiddenInput from "$lib/components/hidden-input.svelte";

  interface Props {
    open?: boolean;
    value?: DateValue;
    closeOnDateSelect?: boolean;
    placeholder?: DateValue;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    maxDate?: DateValue;
    minDate?: DateValue;
    onValueChange?: (value: DateValue | undefined) => void;
    onOpenChangeComplete?: (open: boolean) => void;
    onClipboardPirmissionGranted?: (granted: boolean) => void;
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
    value = $bindable(),
    maxDate = $bindable(),
    minDate = $bindable(),
    placeholder = $bindable(),
    closeOnDateSelect,
    required,
    name,
    onOpenChangeComplete,
    onClipboardPirmissionGranted,
    triggerOptions,
    onValueChange,
    disabled,
    ariaInvalid,
    ref = $bindable(null),
  }: Props = $props();

  const df = new DateFormatter("en-US", {
    dateStyle: "long",
  });

  let contentRef = $state<HTMLElement | null>(null);

  function getDateFromClipboardText(text: string): CalendarDate | undefined {
    const parsedDate = new Date(text);
    if (isNaN(parsedDate.getTime())) {
      return undefined;
    }
    return new CalendarDate(
      parsedDate.getFullYear(),
      parsedDate.getMonth() + 1,
      parsedDate.getDate(),
    );
  }

  onMount(() => {
    async function handlePasteShortcut(e: KeyboardEvent) {
      if (!open) return;
      if (!(e.ctrlKey && e.key.toLowerCase() === "v")) return;

      e.preventDefault(); // optional: block default paste if needed

      try {
        const text = await navigator.clipboard.readText();

        const parsedDate = getDateFromClipboardText(text);
        let description: string = "";

        if (!parsedDate) {
          description = "The date you copied is invalid";
          toast.error("Invalid date", { description });
          return;
        }

        if (minDate && minDate.compare(parsedDate) > 0) {
          description = `Date must be on or after ${formatDate(minDate.toString(), "short")}`;
          toast.error("Date too early", { description });
          return;
        }

        if (maxDate && maxDate.compare(parsedDate) < 0) {
          toast.error("Date too late", { description });
          description = `Date must be on or before ${formatDate(maxDate.toString(), "short")}`;
          return;
        }

        value = parsedDate;
        open = false;
        onValueChange?.(value);
        onClipboardPirmissionGranted?.(true);
      } catch (err) {
        toast.error("Clipboard access blocked", {
          description: "Enable clipboard permission in your browser.",
        });
      }
    }

    document.addEventListener("keydown", handlePasteShortcut);

    return () => {
      document.removeEventListener("keydown", handlePasteShortcut);
    };
  });
</script>

<Popover.Root
  bind:open
  onOpenChangeComplete={() => onOpenChangeComplete?.(open)}
>
  <Popover.Trigger
    tabindex={disabled ? -1 : undefined}
    bind:ref
    {disabled}
    class={cn(
      buttonVariants({
        variant: "outline",
        class: [
          "justify-start w-full min-w-10 text-left font-normal relative ",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive aria-invalid:ring-[3px] hover:group-data-present/date:text-transparent group-data-present/date:text-transparent pl-2.5!",
          triggerOptions?.class ?? null,
        ],
      }),
      !value && "text-muted-foreground",
    )}
    aria-invalid={ariaInvalid ? "true" : undefined}
  >
    {#if triggerOptions?.withIcon ?? true}
      <CalendarIcon />
    {/if}
    {value
      ? df.format(value.toDate(getLocalTimeZone()))
      : (triggerOptions?.label ?? "Pick a date")}

    <button
      {disabled}
      data-has-date={value ? "" : null}
      class="absolute right-2 data-has-date:pointer-events-auto disabled:cursor-auto pointer-events-none transition-opacity data-has-date:opacity-100 opacity-0"
      type="button"
      onclick={(e) => {
        e.stopPropagation();
        value = undefined;
      }}><X /> <span class="sr-only">clear date</span></button
    >

    {#if name}
      <HiddenInput
        bind:required
        bind:name
        {value}
        onFormReset={() => {
          value = undefined;
        }}
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
      type="single"
      class="rounded-md border shadow-sm"
      bind:value
      bind:placeholder
      maxValue={maxDate}
      minValue={minDate}
    />
  </Popover.Content>
</Popover.Root>
