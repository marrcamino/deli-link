<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { getLeaveContext } from "./context.svelte";

  let { user }: { user: User } = $props();

  let counts: number | undefined = $state();
  const ctx = getLeaveContext();

  async function setPendingLeaveCounts() {
    counts = (await ctx.getLeaveApplications(user.user_pk, "not_approved"))
      .length;
  }

  $effect(() => {
    ctx.sheetState;
    untrack(async () => {
      if (ctx.sheetState || ctx.openUser?.user_pk !== user.user_pk) return;
      await setPendingLeaveCounts();
    });
  });

  onMount(async () => {
    await setPendingLeaveCounts();
  });
</script>

<div class="place-self-center">
  {#if counts !== undefined}
    {counts}
  {/if}
</div>
