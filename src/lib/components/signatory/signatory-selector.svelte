<script lang="ts">
  import HiddenInput from "$lib/components/hidden-input.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Command from "$lib/components/ui/command/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import { getDBConn } from "$lib/db";
  import { cn } from "$lib/utils";
  import { X } from "@lucide/svelte/icons";
  import CheckIcon from "@lucide/svelte/icons/check";
  import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
  import { onMount, tick } from "svelte";
  import type { ClassValue } from "svelte/elements";

  type SignatoryValues = {
    value: string;
    name: string;
    position: string;
  };

  interface Props {
    onselect?: () => void;
    id?: string;
    width?: ClassValue;
    name?: string;
    open?: boolean;
    value?: string;
    signatories?: SignatoryValues[];
    required?: boolean;
    placeholder?: string;
  }
  let {
    id,
    width,
    open = $bindable(false),
    value = $bindable(""),
    signatories = $bindable([]),
    placeholder,
    ...restProps
  }: Props = $props();

  const triggerContent = $derived(signatories.find((f) => f.value === value));
  let hasValue = $derived(triggerContent?.name ? "" : null);
  let triggerRef = $state<HTMLButtonElement>(null!);

  // We want to refocus the trigger button when the user selects
  // an item from the list so users can continue navigating the
  // rest of the form with the keyboard.
  function closeAndFocusTrigger() {
    open = false;
    tick().then(() => {
      triggerRef.focus();
    });
  }

  onMount(async () => {
    const db = await getDBConn();

    const res = await db.select<Signatory[]>("SELECT * FROM signatory");

    signatories = res.map((s) => ({
      value: s.signatory_pk.toString(),
      name: s.full_name,
      position: s.position_title,
    }));
  });
</script>

<Popover.Root bind:open>
  <Popover.Trigger bind:ref={triggerRef}>
    {#snippet child({ props })}
      <Button
        {...props}
        {id}
        variant="outline"
        class={cn("w-50 justify-between text-left relative gap-0", width)}
        role="combobox"
        aria-expanded={open}
      >
        <span class="w-full truncate">
          {triggerContent?.name ?? placeholder ?? "Select Signatory"}
        </span>

        <ChevronsUpDownIcon
          data-value={hasValue}
          class="opacity-50 data-value:opacity-0 transition-opacity"
        />

        <Button
          data-value={hasValue}
          variant="ghost"
          class="hover:bg-transparent absolute has-[>svg]:px-1 h-6 right-2 p-0 data-value:pointer-events-auto data-value:hover:opacity-100 data-value:opacity-50 opacity-0 pointer-events-none transition-opacity"
          aria-label="clear name"
          title="clear name"
          onclick={(e) => {
            e.stopPropagation();
            value = "";
          }}
        >
          <X />
        </Button>

        {#if restProps.name}
          <HiddenInput {value} {...restProps} />
        {/if}
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class={cn("w-50 p-0", width)}>
    <Command.Root>
      <Command.Input placeholder={placeholder ?? "Select Signatory"} />
      <Command.List>
        <Command.Empty>Signatories</Command.Empty>
        <Command.Group value="frameworks">
          {#each signatories as signatory (signatory.value)}
            <Command.Item
              value={signatory.value}
              keywords={[signatory.name]}
              onSelect={() => {
                value = signatory.value;
                closeAndFocusTrigger();
                restProps.onselect?.();
              }}
            >
              <CheckIcon
                class={cn(value !== signatory.value && "text-transparent")}
              />
              <div class="min-w-0">
                <span class="text-sm block leading-3 truncate">
                  {signatory.name}
                </span>
                <span
                  class="text-xs block leading-3 text-muted-foreground truncate"
                >
                  {signatory.position}
                </span>
              </div>
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
