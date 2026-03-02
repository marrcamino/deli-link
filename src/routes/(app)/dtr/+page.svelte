<script lang="ts">
  import { goto } from "$app/navigation";
  import RouteContent from "$lib/components/route-content.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import { setUserPref } from "$lib/helper";
  import { ArrowUpDown, Import, LayoutGrid, Users } from "@lucide/svelte";
  import { getCurrentWebview } from "@tauri-apps/api/webview";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { onDestroy, onMount, untrack } from "svelte";
  import type { PageProps } from "./$types";
  import SelectMonthDialog from "./_components/select-month-dialog.svelte";
  import TabLogsActions from "./_tab-logs/actions.svelte";
  import TabLogsContent from "./_tab-logs/content.svelte";
  import TabUsersActions from "./_tab-users/actions.svelte";
  import TabUsersContent from "./_tab-users/content.svelte";
  import { setDTRContext } from "./context.svelte";
  import LogsTools from "./_tab-logs/logs-tools.svelte";

  type TabKey = "users" | "logs";

  let tab: string = $state("");
  let { data }: PageProps = $props();

  const context = setDTRContext();

  async function setTab(tab: TabKey) {
    goto(`/dtr?tab=${tab}`, {
      replaceState: true,
      keepFocus: true,
      noScroll: true,
    });

    await setUserPref("dtr_open_tab", tab);
  }

  $effect(() => {
    tab;
    untrack(async () => {
      await getCurrentWindow().setTitle(
        `Daily Time Record - ${tab.toLocaleUpperCase()}`,
      );
    });
  });

  let unlistenDrag: (() => void) | undefined;
  let isDragging = $state(false);

  onMount(async () => {
    tab = data.tab;

    await getCurrentWindow().setTitle(
      `Daily Time Record - ${tab.toLocaleUpperCase()}`,
    );

    unlistenDrag = await getCurrentWebview().onDragDropEvent(async (e) => {
      isDragging = e.payload.type === "over";
      if (e.payload.type === "drop") {
        if (tab === "users") {
          // This makes sure user knows of what month of logs will be parse
          context.openMonthSelector(e.payload);
          return;
        }
        context.handleFileDrop(e.payload);
      }
    });

    context.fetchUserLog();
  });

  onDestroy(() => unlistenDrag?.());
</script>

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

<SelectMonthDialog />

<RouteContent>
  {#snippet header()}
    <!-- <div class="font-semibold">Daily Time Record</div> -->

    <Tabs.Root
      bind:value={tab}
      onValueChange={async (value) => await setTab(value as TabKey)}
    >
      <div class="flex items-center">
        <Tabs.List>
          <Tabs.Trigger
            value="users"
            class="dark:data-[state=active]:text-primary data-[state=active]:text-primary border-none"
          >
            Users
          </Tabs.Trigger>
          <Tabs.Trigger
            value="logs"
            class="dark:data-[state=active]:text-primary data-[state=active]:text-primary border-none"
          >
            Logs
          </Tabs.Trigger>
        </Tabs.List>
      </div>
    </Tabs.Root>

    <div class="ml-auto flex items-center gap-1">
      {#if tab === "users"}
        <TabUsersActions />
      {:else}
        <TabLogsActions />
      {/if}
      <Button
        class="ml-auto"
        onclick={async () => await context.importLogFile()}
      >
        <Import />
        Import Logs
      </Button>
    </div>
  {/snippet}

  {#if tab === "logs"}<LogsTools />{/if}

  <div class="p-4">
    <div class="w-full">
      <Tabs.Root bind:value={tab}>
        <Tabs.Content value="users" class="rounded-xl px-3 py-2 border">
          <TabUsersContent />
        </Tabs.Content>
        <Tabs.Content value="logs" class="place-self-center md:w-140 w-full">
          <TabLogsContent />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  </div>
</RouteContent>
