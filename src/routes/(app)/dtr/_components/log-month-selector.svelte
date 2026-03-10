<script lang="ts">
  import HiddenInput from "$lib/components/hidden-input.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Command from "$lib/components/ui/command/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import { MONTHS_MAP } from "$lib/constants/months";
  import { cn, mapToOptions } from "$lib/utils";
  import CheckIcon from "@lucide/svelte/icons/check";
  import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
  import { tick } from "svelte";
  import type { ClassValue } from "svelte/elements";
  import { getDTRContext } from "../context.svelte";

  interface Props {
    id?: string;
    width?: ClassValue;
    required?: boolean;
    name?: string;
    value?: any;
  }
  let { id, width, ...restProps }: Props = $props();

  const ctx = getDTRContext();
  const frameworks = mapToOptions(MONTHS_MAP);

  let open = $state(false);

  let triggerRef = $state<HTMLButtonElement>(null!);

  const selectedValue = $derived(
    frameworks.find((f) => f.value === ctx.selectedMonth)?.label,
  );

  function closeAndFocusTrigger() {
    open = false;
    tick().then(() => {
      triggerRef.focus();
    });
  }
</script>

<Popover.Root
  bind:open
  onOpenChangeComplete={(isOpen) => {
    if (isOpen) return;

    if (ctx.selectedMonth === "") {
      ctx.selectedMonth = ctx.current_month.toString() as any;
    }
  }}
>
  <Popover.Trigger bind:ref={triggerRef}>
    {#snippet child({ props })}
      <Button
        {...props}
        {id}
        variant="secondary"
        class={cn("w-40 justify-between relative", width)}
        role="combobox"
        aria-expanded={open}
      >
        {selectedValue || "Select Month..."}
        <ChevronsUpDownIcon class="opacity-50" />

        {#if restProps.name}
          <HiddenInput {...restProps} />
        {/if}
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class={cn("w-40 p-0", width)}>
    <Command.Root bind:value={ctx.selectedMonth} disablePointerSelection>
      <Command.Input placeholder="Select Month..." />
      <Command.List>
        <Command.Empty>No month found.</Command.Empty>
        <Command.Group value="frameworks">
          {#each frameworks as framework (framework.value)}
            <Command.Item
              class="hover:bg-accent mb-1"
              disabled={parseInt(framework.value) > ctx.current_month}
              value={framework.value}
              keywords={[framework.label]}
              onSelect={async () => {
                ctx.selectedMonth = framework.value as any;
                closeAndFocusTrigger();
                await ctx.fetchUserLog();
              }}
            >
              <CheckIcon
                class={cn(
                  ctx.selectedMonth !== framework.value && "text-transparent",
                )}
              />
              {framework.label}
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
