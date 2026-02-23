<script lang="ts">
  import RouteContent from "$lib/components/route-content.svelte";
  import Database from "@tauri-apps/plugin-sql";
  import { onMount } from "svelte";
  import { getCurrentWindow } from "@tauri-apps/api/window";

  onMount(async () => {
    // Set the title
    await getCurrentWindow().setTitle("Home");

    const db = await Database.load("sqlite:database.sqlite");
    const users = (await db.select("SELECT * FROM employee")) as Employee[];
    console.log(users);
  });
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>
<RouteContent>
  {#snippet header()}
    <div class="font-semibold">Home</div>
  {/snippet}

  <div>
    Lorem ipsum dolor, sit amet consectetur adipisicing elit. Deleniti maxime
    reiciendis ea nemo numquam. Temporibus repellat architecto eveniet suscipit
    repudiandae iusto aperiam deserunt commodi! In rem fuga cum repudiandae ut?
  </div>
</RouteContent>
