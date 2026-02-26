<script lang="ts">
  import RouteContent from "$lib/components/route-content.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { UserPlus } from "@lucide/svelte";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { onMount } from "svelte";
  import DeleteUserAlertDialog from "./components/delete-user-alert-dialog.svelte";
  import Tbl from "./components/table/tbl.svelte";
  import UserAddEditDialog from "./components/user-add-edit-dialog.svelte";
  import { setUserContext } from "./context.svelte";

  const context = setUserContext();

  onMount(async () => {
    await getCurrentWindow().setTitle("Users");
    await context.init();
  });
</script>

<RouteContent>
  {#snippet header()}
    <div class="font-semibold">List of Users</div>
    <Button class="ml-auto" onclick={() => (context.empAddDialogState = true)}>
      <UserPlus />
      Add User
    </Button>
  {/snippet}

  <div class="p-4">
    <Tbl />
  </div>
</RouteContent>

<UserAddEditDialog />
<DeleteUserAlertDialog />
