<script lang="ts">
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import { DEFAULT_SETTINGS } from "$lib/constants";
  import { onMount } from "svelte";
  import { getLeaveContext } from "./context.svelte";
  import type { UserWithLeaveStatus } from "./tbl-schema";

  let { user }: { user: UserWithLeaveStatus } = $props();

  const ctx = getLeaveContext();

  onMount(async () => {
    await ctx.refreshLeaveInfo(user.user_pk);
  });
</script>

<div class="flex justify-center gap-1">
  <!-- Wellness -->
  <Tooltip.Provider>
    <Tooltip.Root>
      <Tooltip.Trigger
        class="inline-flex items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5 text-xs"
      >
        <span>WL</span>
        <span>{user.wellnesslLeaveBal}</span>
      </Tooltip.Trigger>

      <Tooltip.Content>
        <div class="text-sm">
          <p class="font-semibold leading-6">Wellness Leave</p>
          <p class="leading-4">
            Remaining: {DEFAULT_SETTINGS.maxWellnessLeave -
              user.wellnesslLeaveBal} day&lpar;s&rpar;
          </p>
          <p class="leading-4">
            Maximum: {DEFAULT_SETTINGS.maxWellnessLeave} day&lpar;s&rpar;
          </p>
        </div>
      </Tooltip.Content>
    </Tooltip.Root>
  </Tooltip.Provider>

  <!-- Personal -->
  <Tooltip.Provider>
    <Tooltip.Root>
      <Tooltip.Trigger>
        <button
          type="button"
          class="inline-flex items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5 text-xs"
        >
          <span>PL</span>
          <span>{user.personalLeaveBal}</span>
        </button>
      </Tooltip.Trigger>

      <Tooltip.Content>
        <div class="text-sm">
          <p class="font-semibold">Personal Leave</p>
          <p>
            Remaining: {DEFAULT_SETTINGS.maxPersonalLeave -
              user.personalLeaveBal} day&lpar;s&rpar;
          </p>
          <p>Maximum: {DEFAULT_SETTINGS.maxPersonalLeave} day&lpar;s&rpar;</p>
        </div>
      </Tooltip.Content>
    </Tooltip.Root>
  </Tooltip.Provider>
</div>
