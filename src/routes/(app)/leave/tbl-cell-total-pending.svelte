<script lang="ts">
  import type { UserWithLeaveStatus } from "./tbl-schema";

  let { user }: { user: UserWithLeaveStatus } = $props();

  // Fetching total pending is at the tbl-cell-used-leave component
</script>

<div class="place-self-center">
  {user.pending}
</div>
