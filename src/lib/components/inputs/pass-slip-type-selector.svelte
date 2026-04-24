<script lang="ts">
  import * as Select from "$lib/components/ui/select/index.js";
  import { PASS_SLIP_TYPE_MAP, type PassSlipTypeKey } from "$lib/constants";
  import { Select as SelectPrimitive } from "bits-ui";

  interface Props {
    value?: PassSlipTypeKey;
    placeholder?: string;
    size?: "sm" | "default";
    required?: boolean;
    name?: string;
  }

  let {
    value = $bindable(),
    placeholder = "Select Pass Slip Type",
    required,
    name,
    ...restProps
  }: Props &
    Omit<
      SelectPrimitive.TriggerProps,
      "children" | "child" | "value"
    > = $props();

  const triggerContent = $derived(
    Object.entries(PASS_SLIP_TYPE_MAP).find(
      ([val]) => val.toString() === value,
    )?.[1] ?? placeholder,
  );
</script>

<Select.Root type="single" bind:value {required} {name}>
  <Select.Trigger {...restProps}>
    {triggerContent}
  </Select.Trigger>
  <Select.Content class="max-h-64 overflow-y-auto">
    <Select.Group>
      {#each Object.entries(PASS_SLIP_TYPE_MAP) as [value, label] (value)}
        <Select.Item {value} {label}>
          {label}
        </Select.Item>
      {/each}
    </Select.Group>
  </Select.Content>
</Select.Root>
