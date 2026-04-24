<script lang="ts">
  import AddEditPassSlip from "../pass-slip/add-edit-pass-slip.svelte";
  
  let open = $state(false);
</script>

<button onclick={() => (open = true)}>open</button>
<AddEditPassSlip bind:open />
<form onsubmit={(e) => e.preventDefault()} class="p-8">
  <button type="submit" class="border rounded-md px-2 bg-accent my-4">
    Save
  </button>
</form>
