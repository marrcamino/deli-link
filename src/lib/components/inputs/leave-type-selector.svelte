<script lang="ts">
  import * as Select from "$lib/components/ui/select/index.js";
  import { LEAVE_TYPE_MAP } from "$lib/constants";
  import { Select as SelectPrimitive } from "bits-ui";

  interface Props {
    value?: string;
    placeholder?: string;
    size?: "sm" | "default";
    required?: boolean;
    name?: string;
  }

  let {
    value = $bindable(""),
    placeholder = "Select leave type",
    required,
    name,
    ...restProps
  }: Props &
    Omit<SelectPrimitive.TriggerProps, "children" | "child"> = $props();

  const triggerContent = $derived(
    Object.entries(LEAVE_TYPE_MAP).find(
      ([val]) => val.toString() === value,
    )?.[1] ?? placeholder,
  );
</script>

<Select.Root
  type="single"
  bind:value
  scrollAlignment="center"
  {required}
  {name}
>
  <Select.Trigger {...restProps}>
    {triggerContent}
  </Select.Trigger>
  <Select.Content class="max-h-64 overflow-y-auto">
    <Select.Group>
      {#each Object.entries(LEAVE_TYPE_MAP) as [value, label] (value)}
        <Select.Item value={value.toString()} {label}>
          {label}
        </Select.Item>
      {/each}
    </Select.Group>
  </Select.Content>
</Select.Root>
