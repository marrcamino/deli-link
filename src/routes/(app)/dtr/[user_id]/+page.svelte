<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import RouteContent from "$lib/components/route-content.svelte";
  import { Button } from "$lib/components/ui/button";
  import { formatFullName } from "$lib/utils";
  import { ArrowLeft, RotateCw, UserX } from "@lucide/svelte";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import LogMonthSelector from "$lib/components/inputs/log-month-selector.svelte";

  let { data }: { data: PageData } = $props();

  onMount(async () => {
    if (data.user) {
      await getCurrentWindow().setTitle(
        `DTR - ${formatFullName(data.user, { abbreviateMiddle: true }).toUpperCase()}`,
      );
    }
  });
</script>

{#if data.user}
  <RouteContent>
    {#snippet header()}
      <div class="w-full">
        <div
          class="flex items-center w-full place-self-center md:max-w-xl md:-translate-x-2"
        >
          <Button
            class=""
            variant="ghost"
            onclick={() => {
              history.back();
            }}
          >
            <ArrowLeft />
            <span>Go Back</span>
          </Button>

          <div class="ml-auto">
            <LogMonthSelector value="2" />
          </div>
        </div>
      </div>
    {/snippet}
    {page.params.user_id}
  </RouteContent>
{:else}
  <div
    class="flex min-h-[70vh] flex-col items-center justify-center bg-background p-6 text-center"
  >
    <div class="flex flex-col items-center max-w-sm">
      <div
        class="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary shadow-sm"
      >
        <UserX class="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
      </div>

      <h1 class="text-2xl font-semibold tracking-tight text-foreground">
        Record not found
      </h1>

      <p class="mt-2 text-sm text-muted-foreground leading-relaxed">
        The user entry you are trying to access is no longer available. This may
        happen if the data was recently removed or modified in the database.
      </p>

      <div class="mt-8 flex flex-col items-center w-fit gap-2 mx-auto">
        <Button
          variant="default"
          class="w-full gap-2"
          onclick={() => {
            goto(`/dtr`, {
              replaceState: true,
              keepFocus: true,
              noScroll: true,
            });
          }}
        >
          <ArrowLeft class="h-4 w-4" />
          Goto Daily Time Record
        </Button>

        <Button
          variant="ghost"
          class="w-max gap-2"
          onclick={() => window.location.reload()}
        >
          <RotateCw />
          Refresh Data
        </Button>
      </div>
    </div>
  </div>
{/if}
