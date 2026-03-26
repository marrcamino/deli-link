<script lang="ts">
  import * as Select from "$lib/components/ui/select/index.js";
  import { Select as SelectPrimitive } from "bits-ui";

  interface Props {
    value?: string;
    placeholder?: string;
    size?: "sm" | "default";
    yearsBack?: number; // Default for leave history
    yearsForward?: number; // Added buffer for future planning
  }

  let {
    value = $bindable(""),
    placeholder = "Select year",
    yearsBack = 100,
    yearsForward = 5,
    ...restProps
  }: Props &
    Omit<SelectPrimitive.TriggerProps, "children" | "child"> = $props();

  const currentYear = new Date().getFullYear();

  // Generate years from current down to (current - range)
  const years = $derived.by(() => {
    const startYear = currentYear + yearsForward;
    const endYear = currentYear - yearsBack;
    const length = startYear - endYear + 1;

    return Array.from({ length }, (_, i) => {
      const year = (startYear - i).toString();
      return { value: year, label: year };
    });
  });
  const triggerContent = $derived(
    years.find((y) => y.value === value)?.label ?? placeholder,
  );
</script>

<Select.Root type="single" bind:value scrollAlignment="center">
  <Select.Trigger {...restProps}>
    {triggerContent}
  </Select.Trigger>
  <Select.Content class="max-h-64 overflow-y-auto">
    <Select.Group>
      {#each years as year (year.value)}
        <Select.Item value={year.value} label={year.label}>
          {year.label}
        </Select.Item>
      {/each}
    </Select.Group>
  </Select.Content>
</Select.Root>
