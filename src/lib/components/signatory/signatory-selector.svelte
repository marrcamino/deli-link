<script lang="ts">
  import * as Select from "$lib/components/ui/select/index.js";
  import { getDBConn } from "$lib/db";
  import { onMount } from "svelte";

  type SignatoryValues = {
    value: string;
    name: string;
    position: string;
  };

  interface Props {
    value?: string;
    required?: boolean;
    placeholder?: string;
  }
  let { value = $bindable(""), required, placeholder }: Props = $props();

  let signatories = $state<SignatoryValues[]>([]);

  const triggerContent = $derived(signatories.find((f) => f.value === value));

  onMount(async () => {
    const db = await getDBConn();

    const res = await db.select<Signatory[]>("SELECT * FROM signatory");

    signatories = res.map((s) => ({
      value: s.signatory_pk.toString(),
      name: s.name,
      position: s.position,
    }));
  });
</script>

<Select.Root type="single" name="signatory" bind:value {required}>
  <Select.Trigger class="w-full text-left">
    {#if triggerContent}
      <div class="min-w-0">
        <span class="text-sm block leading-3 truncate">{triggerContent.name}</span>
        <span class="text-xs block leading-3 text-muted-foreground truncate">{triggerContent.position}</span>
      </div>
    {:else}
      {placeholder ?? "Select Signatory"}
    {/if}
  </Select.Trigger>
  <Select.Content>
    <Select.Group>
      <Select.Label>Signatories</Select.Label>
      {#each signatories as signatory (signatory.value)}
        <Select.Item value={signatory.value} label={signatory.name}>
          {signatory.name}
        </Select.Item>
      {/each}
    </Select.Group>
  </Select.Content>
</Select.Root>
