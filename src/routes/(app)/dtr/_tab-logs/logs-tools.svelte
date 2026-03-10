<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
  import { ChevronDown, RotateCcw, FunnelX } from "@lucide/svelte";
  import { getDTRContext, type UserWithLog } from "../context.svelte";

  import * as Command from "$lib/components/ui/command/index.js";
  import CheckIcon from "@lucide/svelte/icons/check";
  import { tick, untrack } from "svelte";

  import { cn, formatFullName } from "$lib/utils";

  const ctx = getDTRContext();

  let groupOpen = $state(false);
  let sortOpen = $state(false);
  let dropdownUsersList: { value: string; label: string }[] = $state([]);
  let usersDropdownIsOpen = $state(false);
  let triggerRef = $state<HTMLButtonElement>(null!);

  let displayingSpecificUser = $derived(ctx.selectedUser !== "all");

  const userDropdownValue = $derived(
    dropdownUsersList.find((f) => f.value === ctx.selectedUser)?.label,
  );

  function closeAndFocusTrigger() {
    usersDropdownIsOpen = false;
    tick().then(() => {
      triggerRef.focus();
    });
  }

  // Set Dropdown User List when on any ctx.rawUserLogs changes
  $effect(() => {
    ctx.rawUserLogs;

    untrack(() => {
      dropdownUsersList = [
        { label: "All Users", value: "all" },
        ...ctx.sortByLastName(ctx.getDistinctUsers()).map((u) => ({
          value: u.user_pk.toString(),
          label: formatFullName(u, { abbreviateMiddle: true }),
        })),
      ];
    });
  });

  // When any of the sort filter changes
  $effect(() => {
    ctx.sortDateVal;
    ctx.sortNameVal;
    untrack(() => ctx.applyFilters());
  });
</script>

<div class="w-full pt-3 sticky top-14 bg-background pb-2 z-10">
  <div class="md:w-140 w-full place-self-center flex gap-1.5 max-md:px-4">
    <!-- #region USERS -->
    <Popover.Root bind:open={usersDropdownIsOpen}>
      <Popover.Trigger bind:ref={triggerRef}>
        {#snippet child({ props })}
          <Button
            {...props}
            variant="secondary"
            class="w-50 justify-between"
            role="combobox"
            size="sm"
            aria-expanded={usersDropdownIsOpen}
          >
            <div class="truncate">
              {userDropdownValue || "Select users"}
            </div>
            <ChevronDown class="opacity-50" />

            {#if ctx.selectedUser !== "all"}
              {@render indicator()}
            {/if}
          </Button>
        {/snippet}
      </Popover.Trigger>
      <Popover.Content class="w-50 p-0">
        <Command.Root>
          <Command.Input placeholder="Search framework..." />
          <Command.List>
            <Command.Empty>No user found.</Command.Empty>
            <Command.Group>
              {#each dropdownUsersList as user (user.value)}
                <Command.Item
                  value={user.value}
                  onSelect={() => {
                    ctx.selectedUser = user.value;
                    closeAndFocusTrigger();
                    ctx.applyFilters();
                  }}
                >
                  <CheckIcon
                    class={cn(
                      ctx.selectedUser !== user.value && "text-transparent",
                    )}
                  />
                  {user.label}
                </Command.Item>
              {/each}
            </Command.Group>
          </Command.List>
        </Command.Root>
      </Popover.Content>
    </Popover.Root>
    <!-- #endregion -->

    <!-- #region GROUP -->
    <Popover.Root bind:open={groupOpen}>
      <Popover.Trigger
        class={buttonVariants({ variant: "secondary", size: "sm" })}
      >
        <span>Group</span>
        <ChevronDown />

        {#if ctx.groupVal !== "none"}
          {@render indicator()}
        {/if}
      </Popover.Trigger>
      <Popover.Content class="w-46">
        <div>
          <div>
            <div class="font-semibold text-sm text-muted-foreground mb-0.5">
              Group By
            </div>

            <RadioGroup.Root
              bind:value={ctx.groupVal}
              class="flex flex-wrap gap-1.5"
              onValueChange={async () => {
                groupOpen = false;
                await tick();
                ctx.scrollUpContent();
              }}
            >
              <div
                aria-disabled={displayingSpecificUser}
                class="aria-disabled:cursor-not-allowed"
              >
                <Label
                  aria-disabled={displayingSpecificUser}
                  for="group-name"
                  class="flex aria-disabled:opacity-50 aria-disabled:pointer-events-none items-center gap-1.5 bg-accent rounded-md pl-2 pr-1 py-1"
                >
                  <RadioGroup.Item
                    value="name"
                    id="group-name"
                    hidden
                    class="peer"
                  />

                  <span>Name</span>
                  <span class="opacity-0 peer-data-[state=checked]:opacity-100">
                    {@render checkIcon()}
                  </span>
                </Label>
              </div>

              <div>
                <Label
                  for="group-date"
                  class="flex items-center gap-1.5 bg-accent rounded-md pl-2 pr-1 py-1"
                >
                  <RadioGroup.Item
                    value="day"
                    id="group-date"
                    hidden
                    class="peer"
                  />

                  <span>Day</span>
                  <span class="opacity-0 peer-data-[state=checked]:opacity-100">
                    {@render checkIcon()}
                  </span>
                </Label>
              </div>

              <div class="basis-full">
                <Label
                  for="group-none"
                  class="flex items-center gap-1.5 bg-accent rounded-md pl-2 pr-1 py-1 w-max"
                >
                  <RadioGroup.Item
                    value="none"
                    id="group-none"
                    hidden
                    class="peer"
                  />

                  <span>None</span>
                  <span class="opacity-0 peer-data-[state=checked]:opacity-100">
                    {@render checkIcon()}
                  </span>
                </Label>
              </div>
            </RadioGroup.Root>
          </div>
        </div>
      </Popover.Content>
    </Popover.Root>
    <!-- #endregion -->

    <!-- #region SORT -->
    <Popover.Root bind:open={sortOpen}>
      <Popover.Trigger
        class={buttonVariants({ variant: "secondary", size: "sm" })}
      >
        <span>Sort</span>
        {#if ctx.sortDateVal !== "latest" || ctx.sortNameVal !== "none"}
          {@render indicator()}
        {/if}
        <ChevronDown />
      </Popover.Trigger>
      <Popover.Content class="w-50">
        <div>
          <div
            aria-disabled={displayingSpecificUser}
            class="aria-disabled:cursor-not-allowed"
          >
            <div class="font-semibold text-sm text-muted-foreground mb-0.5">
              By Name
            </div>

            <RadioGroup.Root
              disabled={displayingSpecificUser}
              bind:value={ctx.sortNameVal}
              class="flex flex-wrap gap-1.5 aria-disabled:pointer-events-none aria-disabled:opacity-50"
              onValueChange={() => {
                sortOpen = false;
              }}
            >
              <div>
                <Label
                  for="r3"
                  class="flex items-center gap-1.5 bg-accent rounded-md pl-2 pr-1 py-1"
                >
                  <RadioGroup.Item value="az" id="r3" hidden class="peer" />

                  <span>A-Z</span>
                  <span class="opacity-0 peer-data-[state=checked]:opacity-100">
                    {@render checkIcon()}
                  </span>
                </Label>
              </div>

              <div>
                <Label
                  for="r4"
                  class="flex items-center gap-1.5 bg-accent rounded-md pl-2 pr-1 py-1 "
                >
                  <RadioGroup.Item value="za" id="r4" hidden class="peer" />

                  <span>Z-A</span>
                  <span class="opacity-0 peer-data-[state=checked]:opacity-100">
                    {@render checkIcon()}
                  </span>
                </Label>
              </div>

              <div class="basis-full">
                <Label
                  for="r5"
                  class="flex items-center gap-1.5 bg-accent rounded-md pl-2 pr-1 py-1 w-max"
                >
                  <RadioGroup.Item value="none" id="r5" hidden class="peer" />

                  <span>None</span>
                  <span class="opacity-0 peer-data-[state=checked]:opacity-100">
                    {@render checkIcon()}
                  </span>
                </Label>
              </div>
            </RadioGroup.Root>
          </div>

          <div class="mt-2">
            <div class="font-semibold text-sm text-muted-foreground mb-0.5">
              By Date/Time
            </div>
            <RadioGroup.Root
              bind:value={ctx.sortDateVal}
              class="flex gap-1.5"
              onValueChange={() => (sortOpen = false)}
            >
              <Label
                for="r1"
                class="flex items-center gap-1.5 bg-accent rounded-md pl-2 pr-1 py-1"
              >
                <RadioGroup.Item value="latest" id="r1" hidden class="peer" />

                <span>Lastest</span>
                <span class="opacity-0 peer-data-[state=checked]:opacity-100">
                  {@render checkIcon()}
                </span>
              </Label>

              <Label
                for="r2"
                class="flex items-center gap-1.5 bg-accent rounded-md pl-2 pr-1 py-1"
              >
                <RadioGroup.Item value="oldest" id="r2" hidden class="peer" />

                <span>Oldest</span>
                <span class="opacity-0 peer-data-[state=checked]:opacity-100">
                  {@render checkIcon()}
                </span>
              </Label>
            </RadioGroup.Root>
          </div>
        </div>

        <div class="flex justify-end mt-4">
          <Button
            variant="ghost-destructive"
            size="sm"
            onclick={async () => {
              ctx.resetSortFilters();
              sortOpen = false;
            }}
          >
            <RotateCcw />
            <span>Reset</span>
          </Button>
        </div>
      </Popover.Content>
    </Popover.Root>
    <!-- #endregion -->

    <Button
      variant="secondary-destructive"
      size="sm"
      onclick={async () => {
        ctx.resetAllFilters();
        await tick();
        ctx.scrollUpContent();
      }}
    >
      <FunnelX />
      <span>Reset Filters</span>
    </Button>
  </div>
</div>

{#snippet checkIcon()}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    class="text-primary"
    ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
      d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z"
    /></svg
  >
{/snippet}

{#snippet indicator()}
  <span class="size-2.5 rounded-full bg-primary absolute -top-0.5 -right-0.5">
  </span>
{/snippet}
