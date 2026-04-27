<script lang="ts">
  import YearSelector from "$lib/components/inputs/year-selector.svelte";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import AddEditPassSlipDialog from "./add-edit-pass-slip-dialog.svelte";
  import { getPassSlipContext } from "./context.svelte";
  import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
  import { formatFullName } from "$lib/utils";
  import { Button } from "$lib/components/ui/button";

  const ctx = getPassSlipContext();
</script>

<Sheet.Root
  bind:open={ctx.sheetState}
  onOpenChangeComplete={(isOpen) => {
    if (!isOpen) {
      ctx.openUser = null;
    }
  }}
>
  <Sheet.Content>
    <!-- DIALOGS -->
    <AddEditPassSlipDialog />

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
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit veritatis
      officiis commodi soluta excepturi, molestias repellat, fuga quis eos pariatur
      dignissimos delectus eius cupiditate neque perferendis distinctio ad voluptate.
      Eum!
    </ScrollArea>
  </Sheet.Content>
</Sheet.Root>
