<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { page } from "$app/state";

  let {
    items,
  }: {
    items: {
      title: string;
      url: string;
      // this should be `Component` after @lucide/svelte updates types
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      icon?: any;
      items?: {
        title: string;
        url: string;
      }[];
    }[];
  } = $props();

  const isActive = (path: string) => {
    const currentPath = page.url.pathname;

    // Handle Home separately (exact match)
    if (path === "/") return currentPath === "/";

    // Check if the current path starts with the link path
    // AND is followed by a slash or the end of the string
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };
</script>

<Sidebar.Group>
  <Sidebar.GroupLabel>Main</Sidebar.GroupLabel>
  <Sidebar.Menu>
    {#each items as item (item.title)}
      <Sidebar.MenuItem>
        <Sidebar.MenuButton
          isActive={isActive(item.url)}
          tooltipContent={item.title}
          class="data-[active=true]:text-primary"
        >
          {#snippet child({ props })}
            <a href={item.url} {...props}> <item.icon />{item.title}</a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    {/each}
  </Sidebar.Menu>
</Sidebar.Group>
