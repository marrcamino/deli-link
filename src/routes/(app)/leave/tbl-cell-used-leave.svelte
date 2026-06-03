<script lang="ts">
  import { getLeaveBalance } from "$lib/services";
  import { onMount, untrack } from "svelte";
  import { getLeaveContext } from "./context.svelte";

  let { user }: { user: User } = $props();

  const ctx = getLeaveContext();

  let leaveBalance = $state(0);

  async function setLeaveApplications() {
    leaveBalance = await getLeaveBalance(user.user_pk, {
      leaveType: "WELLNESS",
      asOfDate: `${ctx.selectedYear}-12-31`,
    });
  }

  // Refresh this user's leave balance after the sheet closes
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

<div class="flex items-end place-self-center">
  <span class="text-lg">
    {leaveBalance}
  </span>
  <span class="text-muted-foreground">/</span>
  <span class="text-muted-foreground">5</span>
</div>
