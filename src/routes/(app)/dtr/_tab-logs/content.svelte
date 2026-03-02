<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import { MONTHS_MAP } from "$lib/constants/months";
  import {
    FolderClock,
    CalendarArrowDown,
    CalendarArrowUp,
  } from "@lucide/svelte";
  import { getDTRContext, type UserWithLog } from "../context.svelte";
  import { formatFullName } from "$lib/utils/name-formatter";
  import { formatDate } from "$lib/utils/date-utils";
  import { formatTime } from "$lib/utils";
  import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { untrack } from "svelte";

  const context = getDTRContext();

  let logs: UserWithLog[] = $state([]);

  $effect(() => {
    context.userLogs;
    untrack(() => {
      logs = context.userLogs;
    });
  });
</script>

<!-- ALWAYS SHOW THE LATEST FIRST -->

<!-- 
SORT
- latest 
- oldest
- A-Z
- Z-A
-->

<!-- ## GROUP -->
<!-- 
 BY DATE
 - list of employee 
 name | time
-->

<!-- 
People
- list of date
date | time
-->

<div class="rounded-xl px-3 py-2 border">
  {#each logs as userLog}
    <div
      class="grid grid-cols-3 gap-4 rounded-md mt-1.5 px-2 py-1 bg-accent/50 first:mt-1"
    >
      <div>{formatFullName(userLog, { abbreviateMiddle: true })}</div>
      <div>{formatDate(userLog.date)}</div>
      <div>{formatTime(userLog.time)}</div>
    </div>
  {:else}
    <Empty.Root class="border border-dashed max-w-md place-self-center my-8">
      <Empty.Header>
        <Empty.Media variant="icon">
          <FolderClock />
        </Empty.Media>

        <Empty.Title>No Logs Yet</Empty.Title>

        <Empty.Description>
          No logs found for
          <span
            class="data-withValue:italic"
            data-withValue={context.selectedMonth ? null : ""}
          >
            {MONTHS_MAP[parseInt(context.selectedMonth)] || "month name"}
          </span>.
          <br />
          You can <strong>drag & drop</strong> your attendance TXT file here or click
          the button below to import from your attendance machine.
        </Empty.Description>
      </Empty.Header>

      <Empty.Content>
        <Button
          variant="outline"
          size="sm"
          onclick={async () => await context.importLogFile()}
        >
          Import Logs
        </Button>
      </Empty.Content>
    </Empty.Root>
  {/each}
</div>
