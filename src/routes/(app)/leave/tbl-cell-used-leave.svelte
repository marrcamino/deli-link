<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { getLeaveContext } from "./context.svelte";

  interface Props {
    user: User;
  }
  let { user }: Props = $props();

  const ctx = getLeaveContext();

  let leaveApplications: LeaveApplication[] = $state([]);

  // When the sheet is close
  $effect(() => {
    ctx.sheetState;
    untrack(async () => {
      if (ctx.sheetState || ctx.openUser?.user_pk !== user.user_pk) return;
      leaveApplications = await ctx.getLeaveApplications(user.user_pk);
    });
  });

  onMount(async () => {
    leaveApplications = await ctx.getLeaveApplications(user.user_pk);
  });
</script>

<div class="flex items-end">
  {#if leaveApplications}
    <span class="text-lg">{ctx.countTotalLeaveDays(leaveApplications)}</span>
    <span class="text-muted-foreground">/</span>
    <span class="text-muted-foreground">5</span>
  {/if}
</div>
