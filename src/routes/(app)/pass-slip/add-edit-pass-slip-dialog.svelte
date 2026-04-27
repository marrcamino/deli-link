<script lang="ts">
  import Asterisk from "$lib/components/display/asterisk.svelte";
  import DatePicker from "$lib/components/inputs/date/date-picker.svelte";
  import SignatorySelector from "$lib/components/signatory/signatory-selector.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { buttonVariants } from "$lib/components/ui/button/index.js";
  import { Calendar } from "$lib/components/ui/calendar/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import Label from "$lib/components/ui/label/label.svelte";
  import { Textarea } from "$lib/components/ui/textarea";
  import {
    formatTime,
    IntlDateHelper,
    NativeDateHelper,
    prettifyDates,
  } from "$lib/utils";
  import { type DateValue } from "@internationalized/date";
  import { Calendar as CalendarIcon, CircleAlert, Clock } from "@lucide/svelte";
  import { untrack } from "svelte";
  import { quintOut } from "svelte/easing";
  import { fade, slide } from "svelte/transition";
  import PassSlipTypeSelector from "$lib/components/inputs/pass-slip-type-selector.svelte";
  import { getPassSlipContext } from "./context.svelte";
  import { invoke } from "@tauri-apps/api/core";
  import type { PassSlipTypeKey } from "$lib/constants";
  import { toast } from "svelte-sonner";

  interface Props {
    passSlipToEdit?: PassSlip;
    afterSave?: (passSlip: PassSlip) => void;
  }
  interface DbResponse {
    success: boolean;
    message: string;
    data: PassSlip & {
      dates: PassSlipDate[];
    };
  }

  let { passSlipToEdit, afterSave }: Props = $props();

  const ctx = getPassSlipContext();
  let dateValues: DateValue[] | undefined = $state([]);
  let passSlipTypeValue: PassSlipTypeKey | undefined = $state();
  let dateFile = $state(IntlDateHelper.today);
  let startTime = $state("08:00");
  let endTime = $state("17:00");
  let endTimeMaxValue = $derived.by(() => {
    if (startTime === "12:00") return "13:00";
    return "17:00";
  });
  let signatoryValue = $state("");
  let noDateSelected = $state(false);

  $effect(() => {
    dateValues;
    untrack(() => {
      if (!dateValues?.length) return;
      noDateSelected = false;
    });
  });

  async function savePassSlip(e: SubmitEvent) {
    e.preventDefault();

    if (!dateValues?.length) {
      noDateSelected = true;
      return;
    }

    try {
      const passSlipToInsert: Omit<PassSlip, "pass_slip_pk"> = {
        created_at: NativeDateHelper.currentTimestamp,
        end_time: endTime,
        filed_at: dateFile.toString(),
        is_approved: 0,
        signatory_fk: Number(signatoryValue),
        slip_type: passSlipTypeValue!,
        start_time: startTime,
        user_fk: ctx.openUser!.user_pk,
      };

      const res: DbResponse = await invoke("save_pass_slip", {
        passSlip: passSlipToInsert,
        dates: dateValues
          .map((d) => d.toString())
          .map((d) => ({ date_value: d })),
      });

      toast.success(res.message);
    } catch (error) {
      console.error(error);
      toast.error("There was an error while saving pass slip", {
        description: "Please try again",
      });
    }
  }

  async function updatePassSlip(e: SubmitEvent) {
    e.preventDefault();
  }
</script>

<Dialog.Root bind:open={ctx.addEditDialogState}>
  <Dialog.Content class=" sm:w-max">
    <form
      autocomplete="off"
      onsubmit={passSlipToEdit ? updatePassSlip : savePassSlip}
      class="grid gap-4"
    >
      <Dialog.Header>
        <Dialog.Title>Add New Pass Slip</Dialog.Title>
        <Dialog.Description>
          Fields marked with asterisk <Asterisk withParentheses /> are required.
        </Dialog.Description>
      </Dialog.Header>
      <div>
        <div class="flex gap-2">
          <div>
            <div class="pb-4 flex w-full">
              <Label for="pass_slip_type" class="grid gap-1 w-full">
                <div>Pass Slip Type <Asterisk /></div>
                <PassSlipTypeSelector
                  required
                  bind:value={passSlipTypeValue}
                  name="pass_slip_type"
                  class="w-full"
                />
              </Label>
            </div>
            <div class="mt-2">
              <div class="w-max mt-auto">
                <div class="mb-1 font-semibold leading-4">
                  Select multiple dates <Asterisk />
                </div>
                <Calendar
                  type="multiple"
                  bind:value={dateValues}
                  class="border rounded-md"
                />
              </div>
            </div>
          </div>

          <div class="flex flex-col w-52">
            <div class="pb-4 flex">
              <Label for="date_file" class="grid gap-1 w-52 ml-auto">
                <div>Date File <Asterisk /></div>
                <DatePicker
                  required
                  name="date_file"
                  closeOnDateSelect
                  bind:value={dateFile}
                />
              </Label>
            </div>

            <div class="flex flex-col h-full mt-2">
              <div class="flex gap-2 mx-auto pt-0.5">
                <!-- START TIME -->
                <div>
                  <Label class="mb-1 gap-0.5" for="start_time">
                    Start Time <Asterisk />
                  </Label>
                  <Input
                    id="start_time"
                    name="start_time"
                    required
                    type="time"
                    step="1800"
                    bind:value={startTime}
                    min="08:00"
                    max="17:00"
                    class="text-center bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none w-max"
                  />
                </div>

                <!-- END TIME -->
                <div>
                  <Label class="mb-1 gap-0.5" for="end_time">
                    End Time<Asterisk />
                  </Label>
                  <Input
                    id="end_time"
                    name="end_time"
                    required
                    type="time"
                    step="1800"
                    bind:value={endTime}
                    min={endTimeMaxValue}
                    max="17:00"
                    class="text-center bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none w-max"
                  />
                </div>
              </div>

              <!-- BUTTONS -->
              <div class="mt-auto grid gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onclick={() => {
                    startTime = "08:00";
                    endTime = "17:00";
                  }}>Whole Day</Button
                >
                <Button
                  size="sm"
                  variant="outline"
                  onclick={() => {
                    startTime = "08:00";
                    endTime = "12:00";
                  }}>Morning Only</Button
                >
                <Button
                  size="sm"
                  variant="outline"
                  onclick={() => {
                    startTime = "13:00";
                    endTime = "17:00";
                  }}>Afternoon Only</Button
                >
                <Button
                  size="sm"
                  variant="secondary"
                  onclick={() => {
                    dateValues = [];
                    startTime = "08:00";
                    endTime = "17:00";
                  }}>Reset Values</Button
                >
              </div>
            </div>
          </div>
        </div>

        {#if noDateSelected}
          <div
            in:slide={{ easing: quintOut }}
            out:slide={{ delay: 200, easing: quintOut }}
          >
            <div
              in:fade={{ delay: 200, duration: 200 }}
              out:fade={{ duration: 200 }}
            >
              <p
                class="text-destructive text-sm flex gap-1 items-center leading-7"
              >
                <CircleAlert class="size-3.5" /> Please select dates above
              </p>
            </div>
          </div>
        {/if}

        {#if dateValues?.length && startTime && endTime}
          <div
            in:slide={{ easing: quintOut, delay: noDateSelected ? 200 : 0 }}
            out:slide={{ delay: 200, easing: quintOut }}
          >
            <div
              class="pb-0.5 pt-2"
              in:fade={{ delay: noDateSelected ? 400 : 200, duration: 200 }}
              out:fade={{ duration: 200 }}
            >
              <p class="text-xs text-muted-foreground">Selected Datetime:</p>
              <p class="flex items-center">
                <CalendarIcon
                  class="text-muted-foreground size-3.5 translate-y-px"
                />
                <span class="ml-1">{prettifyDates(dateValues)}</span>
                <span class="rounded-sm bg-accent px-1 py-0.5 text-xs ml-1"
                  >{dateValues?.length}{dateValues?.length === 1
                    ? "dy"
                    : "dys"}</span
                >
                <Clock
                  class="text-muted-foreground size-3.5 ml-4 mr-1 translate-y-px"
                />
                <span>{formatTime(startTime)} - {formatTime(endTime)}</span>
              </p>
            </div>
          </div>
        {/if}

        <div class="pt-4 space-y-1">
          <Label for="reason" class="gap-1">Reason <Asterisk /></Label>
          <Textarea
            id="reason"
            autoHeight
            autoTrim
            required
            placeholder="Type reason"
          />
        </div>

        <div class="pt-4">
          <Label class="gap-1 grid">
            <span>Signatory <Asterisk /></span>
            <SignatorySelector required bind:value={signatoryValue} />
          </Label>
        </div>
      </div>

      <Dialog.Footer class="mt-2">
        <Dialog.Close
          type="button"
          class={buttonVariants({ variant: "outline" })}
        >
          Cancel
        </Dialog.Close>
        <Button type="submit">Save Pass Slip</Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
