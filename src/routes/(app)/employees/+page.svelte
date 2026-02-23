<script lang="ts">
  import RouteContent from "$lib/components/route-content.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { UserPlus } from "@lucide/svelte";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { onMount } from "svelte";
  import { setEmployeeContext } from "./context.svelte";
  import EmpAddDialog from "./components/emp-add-dialog.svelte";

  onMount(async () => await getCurrentWindow().setTitle("Employees"));

  const context = setEmployeeContext();
</script>

<RouteContent>
  {#snippet header()}
    <div class="font-semibold">Employees</div>
    <Button
      class="ml-auto"
      onclick={() => {
        context.empAddDialog = true;
      }}
    >
      <UserPlus />
      Add Employee
    </Button>
  {/snippet}

  <div>
    Lorem ipsum dolor, sit amet consectetur adipisicing elit. Deleniti maxime
    reiciendis ea nemo numquam. Temporibus repellat architecto eveniet suscipit
    repudiandae iusto aperiam deserunt commodi! In rem fuga cum repudiandae ut?
  </div>
</RouteContent>

<EmpAddDialog />
