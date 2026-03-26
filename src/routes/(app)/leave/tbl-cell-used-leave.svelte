<script lang="ts">
  import { countTotalLeaveDays } from "$lib/helper";
  import { onMount, untrack } from "svelte";
  import { getLeaveContext } from "./context.svelte";
  import type { LeaveApplicationWithDate } from "$lib/types";
  interface Props {
    user: User;
  }
  let { user }: Props = $props();

  const ctx = getLeaveContext();

  let leaveApplications: LeaveApplicationWithDate[] = $state([]);

  async function setLeaveApplications() {
    leaveApplications = await ctx.getLeaveApplications(
      user.user_pk,
      "approve_only",
    );
  }

  // When the sheet is close
  $effect(() => {
    ctx.sheetState;
    untrack(async () => {
      if (ctx.sheetState || ctx.openUser?.user_pk !== user.user_pk) return;
      await setLeaveApplications();
    });
  });

  onMount(async () => {
    await setLeaveApplications();
  });
</script>

<div class="flex items-end">
  {#if leaveApplications}
    <span class="text-lg">
      {#if leaveApplications.length}
        {countTotalLeaveDays($state.snapshot(leaveApplications))}
      {:else}
        0
      {/if}
    </span>
    <span class="text-muted-foreground">/</span>
    <span class="text-muted-foreground">5</span>
  {/if}
</div>
