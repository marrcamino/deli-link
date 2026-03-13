<script lang="ts" module>
  import { page } from "$app/state";

  const isActive = (path: string) => {
    const currentPath = page.url.pathname;

    // Handle Home separately (exact match)
    if (path === "/") return currentPath === "/";

    // Check if the current path starts with the link path
    // AND is followed by a slash or the end of the string
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };
</script>

<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import type { ComponentProps } from "svelte";
  import ThemeSwitcher from "./theme-switcher.svelte";
  import { ROUTES } from "$lib/routes";

  let {
    ref = $bindable(null),
    collapsible = "icon",
    ...restProps
  }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root {collapsible} {...restProps}>
  <Sidebar.Header>
    <Sidebar.Menu class="px-0">
      <Sidebar.MenuItem class="flex items-center font-semibold py-1.5">
        <Sidebar.Trigger class="ml-0.5 focus-visible:ring-2 text-primary" />
        <div
          class="text-nowrap text-sm group-data-[collapsible=icon]:opacity-0 transition-opacity ease-out"
        >
          Deli-Link
        </div>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Header>
  <Sidebar.Content class="overflow-x-hidden">
    {#each ROUTES as group}
      <Sidebar.Group>
        {#if group.name}
          <Sidebar.GroupLabel class="h-6">{group.name}</Sidebar.GroupLabel>
        {/if}
        <Sidebar.Menu>
          {#each group.routes as route (route.title)}
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                isActive={isActive(route.url)}
                tooltipContent={route.title}
                class="data-[active=true]:text-primary text-nowrap"
              >
                {#snippet child({ props })}
                  <a href={route.url} {...props}>
                    <route.icon />
                    {route.title}
                  </a>
                {/snippet}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          {/each}
        </Sidebar.Menu>
      </Sidebar.Group>
    {/each}
  </Sidebar.Content>
  <Sidebar.Footer>
    <ThemeSwitcher type="sidebar-button" />
  </Sidebar.Footer>
</Sidebar.Root>
