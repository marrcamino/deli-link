<script lang="ts">
  import RouteContent from "$lib/components/route-content.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import { FileDown } from "@lucide/svelte";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { onMount, untrack } from "svelte";
  import TabLogsContent from "./_tab-logs/content.svelte";
  import TabUsersContent from "./_tab-users/content.svelte";
  import TabUsersActions from "./_tab-users/actions.svelte";
  import TabLogsActions from "./_tab-logs/actions.svelte";

  type TabKey = "users" | "logs";

  let tab: TabKey = $state("users");

  $effect(() => {
    tab;
    untrack(async () => {
      await getCurrentWindow().setTitle(
        `Daily Time Record - ${tab.toLocaleUpperCase()}`,
      );
    });
  });

  onMount(async () => {
    await getCurrentWindow().setTitle(
      `Daily Time Record - ${tab.toLocaleUpperCase()}`,
    );
  });
</script>

<RouteContent>
  {#snippet header()}
    <div class="font-semibold">Daily Time Record</div>
    <Button class="ml-auto">
      <FileDown />
      Import Logs
    </Button>
  {/snippet}

  <div class="p-4">
    <div class="w-full">
      <Tabs.Root bind:value={tab}>
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

          <div class="ml-auto">
            {#if tab === "users"}
              <TabUsersActions />
            {:else}
              <TabLogsActions />
            {/if}
          </div>
        </div>

        <Tabs.Content
          value="users"
          class="bg-accent rounded-xl px-3 py-2 border"
        >
          <TabUsersContent />
        </Tabs.Content>
        <Tabs.Content
          value="logs"
          class="bg-accent rounded-xl px-3 py-2 border"
        >
          <TabLogsContent />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  </div>
</RouteContent>
