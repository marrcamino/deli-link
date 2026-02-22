<script lang="ts">
  import { buttonVariants } from "$lib/components/ui/button/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import {
    Menu,
    MenuButton,
    MenuItem,
  } from "$lib/components/ui/sidebar/index.js";
  import { Moon, Sun } from "@lucide/svelte";
  import { mode, setMode, toggleMode } from "mode-watcher";
  import { Button } from "$lib/components/ui/button/index.js";

  interface Props {
    type?: "switch" | "toggle" | "sidebar-button" | "dropdown";
  }

  let { type = "switch" }: Props = $props();
</script>

{#if type === "switch"}
  <button
    onclick={toggleMode}
    class="flex w-11 items-center [&_svg]:size-4 rounded-full border bg-muted p-0.5 cursor-auto transition-colors duration-300"
    aria-label="Toggle theme"
  >
    <div
      class="relative flex h-5 w-5 transform items-center justify-center rounded-full bg-background p-1 shadow transition-transform duration-300
  		{mode.current == undefined ? 'translate-x-[0.6rem] bg-transparent' : ''}"
      class:translate-x-[1.20rem]={mode.current === "dark"}
    >
      {@render sunIcon()}
      {@render moonIcon()}
      <span class="sr-only">Toggle theme</span>
    </div>
  </button>
{:else if type === "dropdown"}
  <DropdownMenu.Root>
    <DropdownMenu.Trigger
      class={buttonVariants({
        className: "cursor-auto",
        variant: "outline",
        size: "icon",
      })}
    >
      {@render sunIcon()}
      {@render moonIcon()}
      <span class="sr-only">Toggle theme</span>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content class="w-56" side="right" align="start">
      <DropdownMenu.Group>
        <DropdownMenu.Item onclick={() => setMode("light")}>
          <Sun class="h-full w-full text-foreground" />
          <span>Light</span>
        </DropdownMenu.Item>
        <DropdownMenu.Item onclick={() => setMode("dark")}>
          <Moon class="h-full w-full text-foreground" />
          <span>Dark</span>
        </DropdownMenu.Item>
      </DropdownMenu.Group>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
{:else if type === "sidebar-button"}
  <Menu>
    <MenuItem>
      <MenuButton
        class="flex items-center transition-colors duration-300 [&_svg]:size-4 cursor-auto"
        onclick={toggleMode}
        aria-label="Toggle theme"
      >
        <div class="size-4 relative inline-flex">
          {@render sunIcon()}
          {@render moonIcon()}
        </div>
        <div class="font-medium capitalize overflow-hidden text-nowrap">
          {mode.current} Theme
        </div>
      </MenuButton>
    </MenuItem>
  </Menu>
{:else}
  <Button onclick={toggleMode} variant="outline" size="icon">
    {@render sunIcon()}
    {@render moonIcon()}
    <span class="sr-only">Toggle theme</span>
  </Button>
{/if}

{#snippet moonIcon()}
  <Moon
    class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all! dark:rotate-0 dark:scale-100"
  />
{/snippet}

{#snippet sunIcon()}
  <Sun
    class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all! dark:-rotate-90 dark:scale-0"
  />
{/snippet}
