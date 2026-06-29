<script lang="ts">
  import Asterisk from "$lib/components/display/asterisk.svelte";
  import DatePicker from "$lib/components/inputs/date/date-picker.svelte";
  import PassSlipTypeSelector from "$lib/components/inputs/pass-slip-type-selector.svelte";
  import SignatorySelector from "$lib/components/signatory/signatory-selector.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { buttonVariants } from "$lib/components/ui/button/index.js";
  import { Calendar } from "$lib/components/ui/calendar/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import Label from "$lib/components/ui/label/label.svelte";
  import { Textarea } from "$lib/components/ui/textarea";
  import type { PassSlipTypeKey } from "$lib/constants";
  import {
    formatTime,
    IntlDateHelper,
    NativeDateHelper,
    prettifyDates,
  } from "$lib/utils";
  import { type DateValue } from "@internationalized/date";
  import { Calendar as CalendarIcon, CircleAlert, Clock } from "@lucide/svelte";
  import { invoke } from "@tauri-apps/api/core";
  import { untrack } from "svelte";
  import { toast } from "svelte-sonner";
  import { quintOut } from "svelte/easing";
  import { fade, slide } from "svelte/transition";
  import { getPassSlipContext } from "./context.svelte";

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
  let endTimeMinValue = $state("08:00");

  let startTimeInput: HTMLInputElement | null = $state(null);
  let endTimeInput: HTMLInputElement | null = $state(null);
  let formRef: HTMLFormElement | null = null;
  let startTimeError = $state("");
  let endTimeError = $state("");

  let signatoryValue = $state("");
  type TimeParts = {
    hour: number;
    minute: number;
  };
  const BTN_PRESET_LABELS = [
    "Whole Day",
    "Morning Only",
    "Afternoon Only",
    "Reset Values",
  ] as const;

  type BtnPresetLabel = (typeof BTN_PRESET_LABELS)[number];

  let noDateSelected = $state(false);

  function parseTimeString(time: string): TimeParts | null {
    const [hourText, minuteText] = time.split(":");
    const hour = Number(hourText);
    const minute = Number(minuteText);

    if (Number.isNaN(hour) || Number.isNaN(minute)) {
      return null;
    }

    return { hour, minute };
  }

  function isWholeHour(time: string) {
    const parsed = parseTimeString(time);
    if (!parsed) return false;
    return parsed.minute === 0;
  }

  function isValidStartTimeValue(time: string) {
    const parsed = parseTimeString(time);
    if (!parsed || parsed.minute !== 0) return false;
    if (parsed.hour === 12) return false;
    return (
      (parsed.hour >= 8 && parsed.hour <= 11) ||
      (parsed.hour >= 13 && parsed.hour <= 17)
    );
  }

  function isValidEndTimeValue(time: string) {
    const parsed = parseTimeString(time);
    if (!parsed || parsed.minute !== 0) return false;
    return (
      (parsed.hour >= 8 && parsed.hour <= 12) ||
      (parsed.hour >= 13 && parsed.hour <= 17)
    );
  }

  function getOfficeHoursBetween(start: string, end: string) {
    const startParsed = parseTimeString(start);
    const endParsed = parseTimeString(end);
    if (!startParsed || !endParsed) return 0;

    const startHour = startParsed.hour;
    const endHour = endParsed.hour;
    if (endHour <= startHour) return 0;

    const officeWindows = [
      { from: 8, to: 12 },
      { from: 13, to: 17 },
    ];

    return officeWindows.reduce((total, window) => {
      const overlapStart = Math.max(startHour, window.from);
      const overlapEnd = Math.min(endHour, window.to);
      return total + Math.max(0, overlapEnd - overlapStart);
    }, 0);
  }

  function getStartTimeValidationMessage(time: string) {
    if (!time.trim()) return "Start Time is required.";

    if (!isWholeHour(time)) {
      return "Start Time must be on the hour (e.g. 08:00AM or 01:00PM).";
    }

    if (time === "12:00") return "Start Time cannot be 12:00PM.";

    if (!isValidStartTimeValue(time)) {
      return "Start Time must be between 08:00AM\u201311:00AM or 01:00PM\u201304:00PM.";
    }
    return "";
  }

  function getEndTimeValidationMessage(time: string, startTimeValue: string) {
    if (!time.trim()) return "End Time is required.";

    if (!isWholeHour(time)) {
      return "End Time must be on the hour (e.g. 12:00PM or 05:00PM).";
    }

    if (!isValidEndTimeValue(time)) {
      return "End Time must be between 08:00AM\u201312:00PM or 01:00PM\u201305:00PM.";
    }

    const isStartValid = isValidStartTimeValue(startTimeValue);
    if (isStartValid) {
      if (time === startTimeValue) {
        return "End Time must be later than Start Time.";
      }

      const officeHours = getOfficeHoursBetween(startTimeValue, time);
      if (officeHours < 1) {
        return "Pass Slip must represent at least 1 office working hour.";
      }
    }

    return "";
  }

  function validateStartTime() {
    const message = getStartTimeValidationMessage(startTime);
    startTimeError = message;
    startTimeInput?.setCustomValidity(message || "");

    if (!message && endTime) {
      validateEndTime();
    }

    return !message;
  }

  function validateEndTime() {
    const message = getEndTimeValidationMessage(endTime, startTime);
    endTimeError = message;
    endTimeInput?.setCustomValidity(message || "");
    return !message;
  }

  function validateForm() {
    validateStartTime();
    validateEndTime();

    if (formRef && !formRef.checkValidity()) {
      formRef.reportValidity();
      const invalidField = formRef.querySelector(":invalid");
      if (invalidField instanceof HTMLElement) {
        invalidField.focus();
      }
      return false;
    }

    return true;
  }

  function applyPreset(action: BtnPresetLabel) {
    switch (action) {
      case "Whole Day":
        startTime = "08:00";
        endTime = "17:00";
        break;

      case "Morning Only":
        startTime = "08:00";
        endTime = "12:00";
        break;

      case "Afternoon Only":
        startTime = "13:00";
        endTime = "17:00";
        break;

      case "Reset Values":
        dateValues = [];
        startTime = "08:00";
        endTime = "17:00";
        break;
    }

    startTimeError = "";
    endTimeError = "";
  }

  async function savePassSlip(e: SubmitEvent) {
    e.preventDefault();

    if (!dateValues?.length) {
      noDateSelected = true;
      return;
    }

    if (!validateForm()) {
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

    if (!dateValues?.length) {
      noDateSelected = true;
      return;
    }

    validateForm();
  }

  // Show/hide selected date and time
  $effect(() => {
    dateValues;
    untrack(() => {
      if (!dateValues?.length) return;
      noDateSelected = false;
    });
  });

  // Keep end time min updated when start time changes
  $effect(() => {
    startTime;

    untrack(() => {
      endTimeMinValue = startTime || "08:00";
    });
  });
</script>

<Dialog.Root bind:open={ctx.addEditDialogState}>
  <Dialog.Content class="sm:w-max">
    <form
      bind:this={formRef}
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
                  onValueChange={(value) => {
                    if (value !== "PERSONAL" || !dateValues) return;
                    if (dateValues.length > 1) dateValues = [dateValues[0]];
                  }}
                />
              </Label>
            </div>
            <div class="mt-2.5">
              <div class="w-max mt-auto">
                <div class="mb-0.5 font-semibold leading-4 text-sm">
                  Select Multiple Dates <Asterisk />
                </div>
                <Calendar
                  type="multiple"
                  maxDays={passSlipTypeValue === "PERSONAL" ? 1 : undefined}
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

            <div class="flex flex-col h-full mt-2 w-full">
              <div class="pt-0.5">
                <div class="flex gap-1.5">
                  <!-- START TIME -->
                  <div class="w-full">
                    <Label class="mb-1 gap-0.5" for="start_time">
                      Start Time <Asterisk />
                    </Label>
                    <Input
                      id="start_time"
                      name="start_time"
                      required
                      type="time"
                      step="3600"
                      // Restricts the selection to whole hours
                      bind:value={startTime}
                      bind:ref={startTimeInput}
                      onblur={validateStartTime}
                      min="08:00"
                      max="16:00"
                      aria-invalid={startTimeError !== ""}
                      class="text-center bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none w-full"
                    />
                  </div>

                  <!-- END TIME -->
                  <div class="w-full">
                    <Label class="mb-1 gap-0.5" for="end_time">
                      End Time<Asterisk />
                    </Label>
                    <Input
                      id="end_time"
                      name="end_time"
                      required
                      type="time"
                      step="3600"
                      bind:value={endTime}
                      bind:ref={endTimeInput}
                      onblur={validateEndTime}
                      min={endTimeMinValue}
                      max="17:00"
                      aria-invalid={endTimeError !== ""}
                      class="text-center bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none w-full"
                    />
                  </div>
                </div>

                <div class="text-destructive text-xs flex gap-1.5 pt-1 grow">
                  {#if startTimeError || endTimeError}
                    <CircleAlert class="size-3.5 flex-none mt-0.5" />
                    <div>
                      {#if startTimeError}
                        <p>
                          {startTimeError}
                        </p>
                      {/if}
                      {#if endTimeError}
                        <p>{endTimeError}</p>
                      {/if}
                    </div>
                  {/if}
                </div>
              </div>

              <!-- BUTTONS -->
              <div class="mt-auto grid gap-1">
                {#each BTN_PRESET_LABELS as BTN_PRESET_LABEL}
                  <Button
                    size="sm"
                    variant={BTN_PRESET_LABEL === "Reset Values"
                      ? "secondary"
                      : "outline"}
                    onclick={() => applyPreset(BTN_PRESET_LABEL)}
                  >
                    {BTN_PRESET_LABEL}
                  </Button>
                {/each}
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
                class="text-destructive text-xs flex gap-1 items-center leading-7"
              >
                <CircleAlert class="size-3.5" />
                Please select date{passSlipTypeValue === "OFFICIAL" ? "s" : ""} above
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
                <span class="rounded-sm bg-accent px-1 py-0.5 text-xs ml-1">
                  {dateValues?.length}{dateValues?.length === 1 ? "d" : "dys"}
                </span>
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
