<script lang="ts" module>
  import { House, Users } from "@lucide/svelte/icons";

  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: "Home",
        url: "/",
        icon: House,
      },
      {
        title: "Employees",
        url: "/employees",
        icon: Users,
      },
    ],
  };
</script>

<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import type { ComponentProps } from "svelte";
  import NavMain from "./nav-main.svelte";
  import ThemeSwitcher from "./theme-switcher.svelte";

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
    <NavMain items={data.navMain} />
  </Sidebar.Content>
  <Sidebar.Footer>
    <ThemeSwitcher type="sidebar-button" />
  </Sidebar.Footer>
</Sidebar.Root>
