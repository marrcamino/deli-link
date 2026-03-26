<script lang="ts">
  import { page } from "$app/state";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { getUserPref, setUserPref } from "$lib/helper";
  import {
    formatDate,
    formatFullName,
    formatPHTime,
    NativeDateHelper,
    prettifyDates,
  } from "$lib/utils";
  import { Pencil, Printer } from "@lucide/svelte";
  import { onMount, tick, untrack } from "svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  let dialogOpen = $state(false);
  let notEmptyForm = $derived(page.params.id === "empty" ? "" : null);
  let sigAoValue = $state("");
  let sigHeadValue = $state("");

  let bindSigAoValue = $state("");
  let bindSigHeadValue = $state("");

  let waitingAfterSignatories = false;
  let todayDateFormatted = formatDate(NativeDateHelper.today(), "long");
  import { getCurrentWindow } from "@tauri-apps/api/window";

  async function onsubmit(e: SubmitEvent) {
    e.preventDefault();

    await setUserPref("leave_ao_signatory", bindSigAoValue);
    await setUserPref("leave_head_signatory", bindSigHeadValue);

    sigAoValue = bindSigAoValue;
    sigHeadValue = bindSigHeadValue;
    dialogOpen = false;
  }

  function printLeave() {
    if (page.params.id === "empty") {
      window.print();
      return;
    }
    if (!sigAoValue.trim() || !sigHeadValue.trim()) {
      waitingAfterSignatories = true;
      dialogOpen = true;
    } else window.print();
  }

  function handleKeydown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === "p") {
      if (!sigAoValue.trim() || !sigHeadValue.trim()) {
        event.preventDefault();
        dialogOpen = true;
      }
    }
  }

  async function getSignatories() {
    const aoSig = await getUserPref("leave_ao_signatory");
    const headSig = await getUserPref("leave_head_signatory");

    sigAoValue = aoSig ?? "";
    sigHeadValue = headSig ?? "";

    await tick();
    printLeave();
  }

  function getControlNumber(userLeave: LeaveApplication & User) {
    const [date, time] = userLeave.created_at.split(" ");
    return `LA${userLeave.leave_pk}-${date.replaceAll("-", "")}-${time.replaceAll(":", "")}`;
  }

  $effect(() => {
    dialogOpen;
    untrack(() => {
      if (!dialogOpen) return;
      bindSigAoValue = sigAoValue;
      bindSigHeadValue = sigHeadValue;
    });
  });

  onMount(async () => {
    if (data.days && data.userLeave) {
      await getCurrentWindow().setTitle(
        `Leave Application - ${formatFullName(data.userLeave, { abbreviateMiddle: true })} (${prettifyDates(data.days.map((d) => d.date_value))})`,
      );
    }
  });
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="w-full sticky top-0 print:hidden bg-background border-b">
  <div class="w-a4 place-self-center py-2 flex gap-2 justify-end">
    <Dialog.Root
      bind:open={dialogOpen}
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen && waitingAfterSignatories) {
          printLeave();
          waitingAfterSignatories = false;
        }
      }}
    >
      <Dialog.Trigger
        type="button"
        data-empty={notEmptyForm}
        class={buttonVariants({
          variant: "secondary",
          size: "sm",
          class: "data-empty:hidden",
        })}
      >
        Edit Signatories
        <Pencil />
      </Dialog.Trigger>
      <Dialog.Content class="sm:max-w-106.25">
        <form class="grid gap-6" autocomplete="off" {onsubmit}>
          <Dialog.Header>
            <Dialog.Title>Edit Signatories</Dialog.Title>
            <Dialog.Description>
              Update the names for the Head of Office and Administrative
              Officer/AO-Designate below.
            </Dialog.Description>
          </Dialog.Header>
          <div class="grid gap-4">
            <div class="grid gap-1">
              <Label for="signatory-ao">
                Administrative Officer/AO-Designate
              </Label>
              <Input id="signatory-ao" bind:value={bindSigAoValue} required />
            </div>

            <div class="grid gap-1">
              <Label for="signatory-head">Head of Office</Label>
              <Input
                id="signatory-head"
                bind:value={bindSigHeadValue}
                required
              />
            </div>
          </div>
          <Dialog.Footer>
            <Dialog.Close
              type="button"
              class={buttonVariants({ variant: "outline" })}
            >
              Cancel
            </Dialog.Close>
            <Button type="submit">Save changes</Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog.Root>

    <Button size="sm" onclick={printLeave}>
      <Printer />
      <span>Print</span>
    </Button>
  </div>
</div>

<div
  data-empty={notEmptyForm}
  class="group size-a4 border bg-white text-black! flex flex-col place-self-center shadow-2xl print:shadow-none print:m-0 my-8 px-15 py-10 font-sans!"
>
  <div class="flex items-center justify-between">
    <p class="text-xs font-bold border border-black px-2 py-1">
      PHRMDO Form No.
      <span class="underline">04</span>
    </p>
    <span class="text-[12px] font-semibold">Annex A</span>
  </div>

  <div class="flex flex-col items-center text-center mb-6 mt-8">
    <div class="flex gap-4">
      <img
        src="/provincial-logo.png"
        alt="Provincial Logo"
        class="h-20 w-20 mb-2"
        onload={getSignatories}
      />
      <div class="text-[10px] uppercase leading-tight">
        Republic of the Philippines<br />
        Region XIII (Caraga)<br />
        Province of Dinagat Islands<br />
        <span class="font-bold">Provincial Human Resource Management</span><br
        />
        <span class="font-bold text-[11px]">and Development Office</span><br />
        <span class="lowercase">phrmdo.dinagatislands@gmail.com</span>
      </div>
    </div>
    <h1 class="mt-4 text-xl font-bold uppercase tracking-wide">
      Application for  {data.leaveType} {data.leaveType === "wl" ? "Wellness" : "Office"}
      Leave
    </h1>
    <p class="text-sm italic">(for JOCOS)</p>
  </div>

  <div class="border-2 border-black">
    <div class="border-b-2 border-black p-1">
      <p class="block text-[13px] font-bold uppercase">Name:</p>
      <div class="h-4 leading-3.5 text-sm">
        {data.userLeave && formatFullName(data.userLeave)}
      </div>
    </div>

    <div class="grid grid-cols-2 border-b-2 border-black">
      <div class="border-r-2 border-black p-1">
        <p class="block text-[13px] font-bold uppercase">Office:</p>
        <div class="min-h-7 leading-3.5 text-sm group-data-empty:hidden">
          Provincial Human Resource Management and Development Office
        </div>
      </div>
      <div class="p-1">
        <p class="block text-[13px] font-bold uppercase">Position:</p>
        <div class="min-h-7 leading-3.5 text-sm">
          {data.userLeave && data.userLeave.designation}
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 border-b-2 border-black">
      <div class="border-r-2 border-black">
        <div class="p-1">
          <p class="block text-[13px] font-bold uppercase">Date of Filing:</p>
          <div
            class="flex h-6 border-b border-black items-end justify-center text-sm"
          >
            {data.userLeave && formatDate(data.userLeave.date_file)}
          </div>
        </div>
        <div class="p-1">
          <p class="block text-[13px] font-bold uppercase">
            Number of Working Days Applied For:
          </p>
          <div
            class="h-8 flex border-b border-black items-end justify-center text-sm"
          >
            {#if data.days?.length}
              {@const counts = data.days.length}
              {counts} Day{counts > 1 ? "s" : ""}
            {/if}
          </div>
        </div>
        <div class="p-1 pb-2">
          <p class="block text-[13px] font-bold uppercase">Inclusive Dates:</p>
          <div
            class="h-8 flex border-b gap-1 border-black items-end justify-center text-sm"
          >
            {#if data.days}
              {prettifyDates(data.days.map((d) => d.date_value))}
            {/if}
          </div>
        </div>
      </div>
      <div class="flex flex-col justify-end items-center p-2">
        <span class="text-sm">
          {data.userLeave &&
            formatFullName(data.userLeave, {
              order: "normal",
              abbreviateMiddle: true,
            })}
        </span>
        <div class="w-full border-t border-black mb-1"></div>
        <span class="text-[11px] uppercase font-bold">
          Signature of Applicant</span
        >
      </div>
    </div>

    <div class="grid grid-cols-2 min-h-64">
      <div class="border-r-2 border-black p-2 flex flex-col justify-between">
        <div>
          <h2 class="text-[13px] font-bold uppercase mb-2">
            Certification/Recommendation:
          </h2>
          <p class="text-[10px] mb-2 font-semibold">
            As of
            <span class="group-data-empty:hidden">{todayDateFormatted}</span>
            <span
              class="hidden border-b border-black w-45 group-data-empty:inline-block"
            ></span>
          </p>

          <table
            class="w-full border-collapse border border-black text-center text-[10px]"
          >
            <thead>
              <tr class="border-b border-black">
                <th class="border-r border-black p-1 font-semibold"
                  >Total No. of Leave</th
                >
                <th class="border-r border-black p-1 font-semibold">Used</th>
                <th class="border-last p-1 font-semibold">Unused</th>
              </tr>
            </thead>
            <tbody>
              <tr class="h-6.5 font-semibold text-sm">
                <td class="border-r border-black">
                  <span class="group-data-empty:hidden">5</span>
                </td>
                <td class="border-r border-black p-0.5">
                  {data.allApproveLeaveDates
                    ? data.allApproveLeaveDates.length
                    : ""}
                </td>
                <td class="p-0.5">
                  {data.allApproveLeaveDates
                    ? 5 - data.allApproveLeaveDates.length
                    : ""}
                </td>
              </tr>
            </tbody>
          </table>

          <div class="mt-4 space-y-0.5 text-[11px]">
            <div class="flex items-start gap-2">
              <div class="size-3.5 border border-black shrink-0"></div>
              <span>For approval</span>
            </div>
            <div class="flex items-start gap-2">
              <div class="size-3.5 border border-black shrink-0"></div>
              <div class="flex-1">
                <span>For disapproval due to</span>
                <div class="border-b border-black w-full mt-4"></div>
                <div class="border-b border-black w-full mt-4"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center mt-20 mb-1">
          <p class="font-bold text-[13px] uppercase group-data-empty:opacity-0">
            {#if sigAoValue}
              {sigAoValue}
            {:else}
              <span class="opacity-50 print:opacity-0">No Singatory Name</span>
            {/if}
          </p>
          <p
            class="text-[12px] font-semibold leading-3.5 -translate-y-0.5 border-t border-black"
          >
            Administrative Officer/AO-Designate
          </p>
        </div>
      </div>

      <div class="p-2 flex flex-col justify-between">
        <h2 class="text-[13px] font-bold uppercase">Approved:</h2>

        <div class="text-center mb-1">
          <p class="font-bold text-[13px] uppercase group-data-empty:opacity-0">
            {#if sigHeadValue}
              {sigHeadValue}
            {:else}
              <span class="opacity-50 print:opacity-0">No Singatory Name</span>
            {/if}
          </p>
          <p
            class="text-[12px] font-semibold leading-3.5 -translate-y-0.5 border-t border-black"
          >
            Head of Office
          </p>
        </div>
      </div>
    </div>
  </div>

  <div class="text-xs mt-auto place-self-end text-end group-data-empty:hidden">
    {#if data.userLeave}
      <div>Control: {getControlNumber(data.userLeave)}</div>
    {/if}
    <div>This is system generated document</div>
    <div>Date Printed: {todayDateFormatted} {formatPHTime()}</div>
  </div>
</div>

<style>
  @media print {
    @page {
      size: A4;
      margin: 0;
    }
  }
</style>
