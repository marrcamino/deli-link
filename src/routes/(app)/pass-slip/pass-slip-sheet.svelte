<script lang="ts">
  import AnimationWrapper from "$lib/components/display/animation-wrapper.svelte";
  import EmptyStateWrapper from "$lib/components/display/empty-state-wrapper.svelte";
  import YearSelector from "$lib/components/inputs/year-selector.svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import { formatFullName } from "$lib/utils";
  import { FileX, Plus } from "@lucide/svelte";
  import { untrack } from "svelte";
  import AddEditPassSlipDialog from "./add-edit-pass-slip-dialog.svelte";
  import { getPassSlipContext } from "./context.svelte";
  import DeletePassSlipDialog from "./delete-pass-slip-dialog.svelte";
  import PassSlipCard from "./pass-slip-card.svelte";

  const ctx = getPassSlipContext();
  let disableTransition = $state(false);

  $effect(() => {
    ctx.sheetState;
    untrack(() => {
      if (!ctx.sheetState) return (disableTransition = true);
      setTimeout(() => {
        disableTransition = false;
      }, 300);
    });
  });
</script>

<Sheet.Root
  bind:open={ctx.sheetState}
  onOpenChangeComplete={(isOpen) => {
    if (!isOpen) {
      ctx.openUser = null;
      ctx.passSlips = [];
    }
  }}
>
  <Sheet.Content>
    <!-- DIALOGS -->
    <AddEditPassSlipDialog />
    <DeletePassSlipDialog />

    <ScrollArea viewPortClasses="max-h-dvh" class="px-4">
      <Sheet.Header class="sticky top-0 z-1 bg-background px-0">
        <div class="font-semibold text-lg grid">
          {#if ctx.openUser}
            <p>{formatFullName(ctx.openUser)}</p>
            <p class="text-sm text-muted-foreground">
              {ctx.openUser.designation}
            </p>
          {/if}
        </div>

        <div class="flex mt-1">
          <div class="ml-auto flex gap-2">
            <YearSelector
              size="sm"
              class="w-19"
              bind:value={ctx.selectedYear}
            />
            <Button size="sm" onclick={() => (ctx.addEditDialogState = true)}>
              Add Pass Slip
            </Button>
          </div>
        </div>
      </Sheet.Header>

      <div class="relative" style="height: calc(100dvh - 130px);">
        <EmptyStateWrapper items={ctx.passSlips} {disableTransition}>
          <Empty.Root class="border">
            <Empty.Header>
              <Empty.Media variant="icon">
                <FileX />
              </Empty.Media>
              <Empty.Title>No Pass Slips</Empty.Title>
              <Empty.Description>
                No pass slip records found for the year {ctx.selectedYear}.
              </Empty.Description>
            </Empty.Header>
            <Empty.Content>
              <Button
                variant="outline"
                size="sm"
                onclick={() => (ctx.addEditDialogState = true)}
              >
                <Plus />
                Add New Pass Slip
              </Button>
            </Empty.Content>
          </Empty.Root>
        </EmptyStateWrapper>

        <div class="pb-15">
          {#each ctx.passSlips as passSlip (passSlip.pass_slip_pk)}
            <AnimationWrapper {disableTransition}>
              <PassSlipCard {passSlip} />
            </AnimationWrapper>
          {/each}
        </div>
      </div>
    </ScrollArea>
  </Sheet.Content>
</Sheet.Root>
