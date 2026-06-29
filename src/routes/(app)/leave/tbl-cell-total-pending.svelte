<script lang="ts">
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import { type LeaveTypeKey } from "$lib/constants";
  import type { UserWithLeaveStatus } from "./tbl-schema";

  let { user }: { user: UserWithLeaveStatus } = $props();
</script>

<div class="flex justify-center gap-1">
  {@render balanceTooltip("WELLNESS")}
  {@render balanceTooltip("PERSONAL")}
</div>

{#snippet balanceTooltip(leaveType: LeaveTypeKey)}
  {@const isWellnessLeave = leaveType === "WELLNESS"}
  {@const pendingCount =
    user[isWellnessLeave ? "wellnessPending" : "personalPending"]}

  <Tooltip.Provider delayDuration={150}>
    <Tooltip.Root>
      <Tooltip.Trigger
        class="inline-flex items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5 text-xs"
      >
        <span> {isWellnessLeave ? "WL" : "PL"}</span>
        <span>{pendingCount}</span>
      </Tooltip.Trigger>

      <Tooltip.Content>
        <div class="text-sm">
          <p class="font-semibold leading-6 capitalize">
            {leaveType.toLowerCase()} Leave
          </p>

          <p class="leading-4">
            {pendingCount || "No"} pending
          </p>
        </div>
      </Tooltip.Content>
    </Tooltip.Root>
  </Tooltip.Provider>
{/snippet}
