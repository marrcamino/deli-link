<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
  import { ChevronDown, RotateCcw } from "@lucide/svelte";
  import { getDTRContext } from "../context.svelte";

  const ctx = getDTRContext();

  let sortOpen = $state(false);
  let groupOpen = $state(false);
</script>

<div class="w-full pt-3 sticky top-14 bg-background pb-2">
  <div class="md:w-140 w-full place-self-center flex gap-1.5 max-md:px-4">
    <!-- #region SORT -->
    <Popover.Root bind:open={sortOpen}>
      <Popover.Trigger
        class={buttonVariants({ variant: "secondary", size: "sm" })}
      >
        <span>Sort</span>
        <ChevronDown />
      </Popover.Trigger>
      <Popover.Content class="w-50">
        <div>
          <div>
            <div class="font-semibold text-sm text-muted-foreground mb-0.5">
              By Date/Time
            </div>
            <RadioGroup.Root bind:value={ctx.sortDateVal} class="flex gap-1.5">
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

          <div class="mt-2">
            <div class="font-semibold text-sm text-muted-foreground mb-0.5">
              By Name
            </div>
            <RadioGroup.Root bind:value={ctx.sortNameVal} class="flex gap-1.5">
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

              <Label
                for="r4"
                class="flex items-center gap-1.5 bg-accent rounded-md pl-2 pr-1 py-1"
              >
                <RadioGroup.Item value="za" id="r4" hidden class="peer" />

                <span>Z-A</span>
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
            onclick={() => {
              ctx.sortDateVal = "latest";
              ctx.sortNameVal = "az";
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

    <!-- #region GROUP -->
    <Popover.Root bind:open={groupOpen}>
      <Popover.Trigger
        class={buttonVariants({ variant: "secondary", size: "sm" })}
      >
        <span>Group</span>
        <ChevronDown />
      </Popover.Trigger>
      <Popover.Content class="w-46">
        <div>
          <div>
            <div class="font-semibold text-sm text-muted-foreground mb-0.5">
              Group By
            </div>

            <RadioGroup.Root bind:value={ctx.groupVal} class="grid grid-cols-2">
              <Label
                for="group-name"
                class="w-max flex items-center gap-1.5 bg-accent rounded-md pl-2 pr-1 py-1"
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

              <Label
                for="group-date"
                class="flex items-center gap-1.5 bg-accent rounded-md pl-2 pr-1 py-1 w-max"
              >
                <RadioGroup.Item
                  value="date"
                  id="group-date"
                  hidden
                  class="peer"
                />

                <span>Date</span>
                <span class="opacity-0 peer-data-[state=checked]:opacity-100">
                  {@render checkIcon()}
                </span>
              </Label>

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
            </RadioGroup.Root>
          </div>
        </div>
      </Popover.Content>
    </Popover.Root>
    <!-- #endregion -->

    <Button variant="secondary" size="sm">
      <span>People</span>
      <ChevronDown />
    </Button>

    <Button
      variant="secondary-destructive"
      size="sm"
      onclick={() => {
        ctx.sortDateVal = "latest";
        ctx.sortNameVal = "az";
        ctx.groupVal = "none";
      }}
    >
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
