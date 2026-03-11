<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import { MONTHS_MAP } from "$lib/constants/months";
  import { formatTime } from "$lib/utils";
  import { formatDate } from "$lib/utils/date-utils";
  import { formatFullName } from "$lib/utils/name-formatter";
  import { FolderClock } from "@lucide/svelte";
  import { getDTRContext, type UserWithLog } from "../context.svelte";

  const ctx = getDTRContext();
</script>

<div class="rounded-xl px-3 py-2 border pb-4">
  {#if ctx.filteredUserLogs.length}
    {#if ctx.groupVal !== "none"}
      {#if ctx.groupVal === "name"}
        {#each ctx.getDistinctUsers(undefined, true) as user}
          <div class="mt-8 first:mt-4 place-self-center-safe">
            <div class="text-lg sticky top-25 pt-2 pb-0.5 bg-background z-5">
              {formatFullName(user)}
            </div>
            <div>
              {#each ctx.getSpecificUserLogs(user.user_pk) as userLog}
                {@render userRow(userLog, "name")}
              {/each}
            </div>
          </div>
        {/each}
      {:else}
        {#each ctx.getDistinctDays() as day}
          <div class="mt-8 first:mt-4 place-self-center-safe">
            <div class="text-lg sticky top-25 pt-2 pb-0.5 bg-background z-5">
              {formatDate(day, "long")}
            </div>
            <div>
              {#each ctx.filteredUserLogs as user}
                {#if user.date === day}
                  {@render userRow(user, "day")}
                {/if}
              {/each}
            </div>
          </div>
        {/each}
      {/if}
    {:else}
      {#each ctx.filteredUserLogs as user}
        {@render userRow(user)}
      {/each}
    {/if}
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
            data-withValue={ctx.selectedMonth ? null : ""}
          >
            {MONTHS_MAP[parseInt(ctx.selectedMonth)] || "month name"}
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
          onclick={async () => await ctx.importLogFile()}
        >
          Import Logs
        </Button>
      </Empty.Content>
    </Empty.Root>
  {/if}
</div>

{#snippet userRow(user: UserWithLog, hideColumn = "")}
  <div
    data-two={hideColumn !== "" ? "name" : null}
    class="grid grid-cols-3 gap-4 data-two:w-sm data-two:grid-cols-2 first:mt-1 first:data-two:mt-0 rounded-md mt-1.5 px-2 py-1 bg-accent/50"
  >
    {#if hideColumn !== "name"}
      <div>{formatFullName(user, { abbreviateMiddle: true })}</div>
    {/if}
    {#if hideColumn !== "day"}
      <div>{formatDate(user.date)}</div>
    {/if}
    <div>{formatTime(user.time)}</div>
  </div>
{/snippet}
