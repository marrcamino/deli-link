<script lang="ts">
  import RouteContent from "$lib/components/route-content.svelte";
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
  import { MONTHS_MAP } from "$lib/constants/months";
  import { formatTime } from "$lib/utils";
  import { formatDate } from "$lib/utils/date-utils";
  import { formatFullName } from "$lib/utils/name-formatter";
  import { FolderClock, Import } from "@lucide/svelte";
  import { getCurrentWebview } from "@tauri-apps/api/webview";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { onDestroy, onMount } from "svelte";
  import LogMonthSelector from "$lib/components/inputs/log-month-selector.svelte";
  import { setLogsContext, type UserWithLog } from "./context.svelte";
  import LogsTools from "./logs-tools.svelte";
  import GroupWrapper from "./group-wrapper.svelte";

  const ctx = setLogsContext();

  let unlistenDrag: (() => void) | undefined;
  let isDragging = $state(false);

  onMount(async () => {
    await getCurrentWindow().setTitle(`LOGS`);

    unlistenDrag = await getCurrentWebview().onDragDropEvent(async (e) => {
      isDragging = e.payload.type === "over";
      if (e.payload.type === "drop") ctx.handleFileDrop(e.payload);
    });

    await ctx.fetchUserLog();
  });

  onDestroy(() => unlistenDrag?.());
</script>

<RouteContent bind:contentRef={ctx.pageContent}>
  {#snippet header()}
    <div class="w-full">
      <div
        class="flex items-center w-full place-self-center md:max-w-xl md:-translate-x-2"
      >
        <LogMonthSelector
          bind:value={ctx.selectedMonth}
          onselect={async () => {
            await ctx.fetchUserLog();
            ctx.resetAllFilters();
          }}
        />
        <Button class="ml-auto" onclick={async () => await ctx.importLogFile()}>
          <Import />
          Import Logs
        </Button>
      </div>
    </div>
  {/snippet}

  <div class="rounded-xl pb-4 md:max-w-xl w-full place-self-center">
    <LogsTools />
    <div class="px-4 md:px-1">
      {#if ctx.filteredUserLogs.length}
        {#if ctx.groupVal !== "none"}
          {#if ctx.groupVal === "name"}
            <div>
              {#each ctx.getDistinctUsers(undefined, true) as user}
                <GroupWrapper>
                  {#snippet header()}
                    {formatFullName(user)}
                  {/snippet}

                  {#each ctx.getSpecificUserLogs(user.user_pk) as userLog}
                    {@render userRow(userLog, "name")}
                  {/each}
                </GroupWrapper>
              {/each}
            </div>
          {:else}
            <div>
              {#each ctx.getDistinctDays() as day}
                <GroupWrapper>
                  {#snippet header()}
                    {formatDate(day, "long")}
                  {/snippet}

                  {#each ctx.filteredUserLogs as user}
                    {#if user.date === day}
                      {@render userRow(user, "day")}
                    {/if}
                  {/each}
                </GroupWrapper>
              {/each}
            </div>
          {/if}
        {:else}
          <div class="mt-4">
            {#each ctx.filteredUserLogs as user}
              {@render userRow(user)}
            {/each}
          </div>
        {/if}
      {:else}
        <Empty.Root
          class="border border-dashed max-w-md place-self-center my-8"
        >
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
              You can <strong>drag & drop</strong> your attendance TXT file here
              or click the button below to import from your attendance machine.
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
  </div>
</RouteContent>

{#snippet userRow(user: UserWithLog, hideColumn = "")}
  <div
    data-two={hideColumn !== "" ? "name" : null}
    class="grid grid-cols-3 gap-4 data-two:grid-cols-2 first:mt-0 first:data-two:mt-0 rounded-md mt-1.5 px-2 py-1 bg-accent/50"
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

<Dialog.Root bind:open={isDragging}>
  <Dialog.Content
    showCloseButton={false}
    interactOutsideBehavior="ignore"
    escapeKeydownBehavior="ignore"
    class="transition-none data-[state=closed]:zoom-out-100 outline-none bg-transparent data-[state=open]:zoom-in-100 border-none"
  >
    <div class="flex justify-center items-center flex-col gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="size-28 text-primary"
        ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
          d="M12 2l.117 .007a1 1 0 0 1 .876 .876l.007 .117v4l.005 .15a2 2 0 0 0 1.838 1.844l.157 .006h4l.117 .007a1 1 0 0 1 .876 .876l.007 .117v9a3 3 0 0 1 -2.824 2.995l-.176 .005h-10a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-14a3 3 0 0 1 2.824 -2.995l.176 -.005zm3 9h-6a1 1 0 0 0 -1 1v1a1 1 0 0 0 2 0h1v5a1 1 0 0 0 0 2h2a1 1 0 0 0 0 -2v-5h1a1 1 0 0 0 2 0v-1a1 1 0 0 0 -1 -1"
        /><path d="M19 7h-4l-.001 -4.001z" /></svg
      >
      <div class="font-semibold text-xl">Drop here</div>
      <div>Only .TXT files are supported</div>
    </div>
  </Dialog.Content>
</Dialog.Root>

<AlertDialog.Root
  bind:open={ctx.missingIdDialogState}
  onOpenChangeComplete={(isOpen) => {
    if (!isOpen) ctx.missingIds = [];
  }}
>
  <AlertDialog.Content class="sm:max-w-100 ">
    <AlertDialog.Header>
      <AlertDialog.Title>Missing Users Detected</AlertDialog.Title>
      <AlertDialog.Description>
        <p>The following machine IDs do not exist in the system:</p>

        <ScrollArea
          viewPortClasses="max-h-37.5"
          type="always"
          class="mt-4 mb-0.5"
        >
          <ul class="space-y-1 pr-3">
            {#each ctx.missingIds as user}
              <li
                class="flex justify-between items-center px-2 py-1 shadow-sm rounded-md bg-accent"
              >
                <span class="font-medium">Name: {user.name}</span>
                <span class="">ID: {user.user_fk}</span>
              </li>
            {/each}
          </ul>
        </ScrollArea>

        <p>Please add these users first before importing logs</p>
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Close</AlertDialog.Cancel>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
