<script lang="ts">
  import YearSelector from "$lib/components/inputs/year-selector.svelte";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import AddEditPassSlipDialog from "./add-edit-pass-slip-dialog.svelte";
  import { getPassSlipContext } from "./context.svelte";
  import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
  import { formatDate, formatFullName, prettifyDates } from "$lib/utils";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Badge } from "$lib/components/ui/badge";
  import {
    EllipsisVertical,
    Clock,
    Printer,
    Pencil,
    Trash2,
    CircleCheck,
    Undo2,
    MapPin,
  } from "@lucide/svelte";

  const ctx = getPassSlipContext();
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
      <div>
        {#each ctx.passSlips as passSlip}
          <div class="pb-2 last:pb-0">
            <Card.Root class="relative overflow-hidden rounded-lg">
              <!-- Actions Dropdown -->
              <div class="absolute top-1.5 right-1.5">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger
                    class="hover:bg-accent rounded-md p-1 transition-colors"
                  >
                    <EllipsisVertical class="text-muted-foreground size-4" />
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content align="end">
                    <DropdownMenu.Group>
                      <DropdownMenu.Item>
                        {#if passSlip.is_approved}
                          <Undo2 class="size-4 mr-2" />
                          <span>Undo Approval</span>
                        {:else}
                          <CircleCheck class="size-4 mr-2" />
                          <span>Approve</span>
                        {/if}
                      </DropdownMenu.Item>
                      <DropdownMenu.Item>
                        <Printer class="size-4 mr-2" />
                        <span>Print</span>
                      </DropdownMenu.Item>
                    </DropdownMenu.Group>

                    <DropdownMenu.Separator />

                    <DropdownMenu.Group>
                      <DropdownMenu.Item>
                        <Pencil class="size-4 mr-2" />
                        <span>Edit</span>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item variant="destructive">
                        <Trash2 class="size-4 mr-2" />
                        <span>Delete</span>
                      </DropdownMenu.Item>
                    </DropdownMenu.Group>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </div>

              <Card.Content class="px-4">
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <!-- Visual Icon Context -->
                    <div class="bg-secondary text-primary rounded-lg p-2">
                      {#if passSlip.slip_type === "OFFICIAL"}
                        <MapPin class="size-4" />
                      {:else}
                        <Clock class="size-4" />
                      {/if}
                    </div>

                    <div class="text-sm">
                      <!-- Dates Display -->
                      <p class="font-semibold">
                        {prettifyDates(passSlip.dates)}
                      </p>

                      <!-- Pass Slip Meta Info -->
                      <div
                        class="text-muted-foreground space-x-3 text-xs font-light"
                      >
                        <span>Filed: {formatDate(passSlip.filed_at)}</span>
                        <span class="font-medium text-primary/80 uppercase">
                          {passSlip.slip_type.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Status and Time Summary -->
                  <div
                    class="absolute right-2 bottom-1.5 flex flex-col items-end gap-1"
                  >
                    <div class="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        class="bg-primary/5 text-primary border-primary/10 rounded-md px-2 py-0.5 text-[10px] font-bold"
                      >
                        {passSlip.start_time} - {passSlip.end_time}
                      </Badge>

                      <!-- Component from your reference -->
                      <!-- <ApproveBadgeIndicator is_approved={passSlip.is_approved} /> -->
                      <div
                        class="size-2 rounded-full {passSlip.is_approved
                          ? 'bg-green-500'
                          : 'bg-yellow-500'}"
                      ></div>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card.Root>
          </div>
        {/each}
      </div>
    </ScrollArea>
  </Sheet.Content>
</Sheet.Root>
