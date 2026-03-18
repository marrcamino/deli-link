<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { getLeaveContext } from "./context.svelte";

  interface Props {
    user: User;
  }
  let { user }: Props = $props();

  let counts: number | undefined = $state();
  const ctx = getLeaveContext();

  async function setPendingLeaveCounts() {
    counts = (await ctx.getLeaveApplications(user.user_pk, "not_approve_only"))
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

{#if counts !== undefined}
  {counts}
{/if}
