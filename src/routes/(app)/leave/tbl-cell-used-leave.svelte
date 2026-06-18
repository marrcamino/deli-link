<script lang="ts">
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import { DEFAULT_SETTINGS, type LeaveTypeKey } from "$lib/constants";
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
  {@render balanceTooltip("WELLNESS")}
  {@render balanceTooltip("PERSONAL")}
</div>

{#snippet balanceTooltip(leaveType: LeaveTypeKey)}
  {@const dataKey =
    leaveType === "WELLNESS" ? "wellnesslLeaveBal" : "personalLeaveBal"}
  {@const settingKey =
    leaveType === "WELLNESS" ? "maxWellnessLeave" : "maxPersonalLeave"}
  {@const remaining = user[dataKey]}
  
  <Tooltip.Provider delayDuration={150}>
    <Tooltip.Root>
      <Tooltip.Trigger
        class="inline-flex items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5 text-xs"
      >
        <span> {leaveType === "WELLNESS" ? "WL" : "PL"}</span>
        <span>{remaining}</span>
      </Tooltip.Trigger>

      <Tooltip.Content>
        <div class="text-sm">
          <p class="font-semibold leading-6 capitalize">
            {leaveType.toLowerCase()} Leave
          </p>
          <p class="leading-4">
            Remaining: {remaining} day&lpar;s&rpar;
          </p>
          <p class="leading-4">
            Maximum: {DEFAULT_SETTINGS[settingKey]} day&lpar;s&rpar;
          </p>
        </div>
      </Tooltip.Content>
    </Tooltip.Root>
  </Tooltip.Provider>
{/snippet}
