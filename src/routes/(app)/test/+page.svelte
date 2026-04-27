<script lang="ts">
  import SampleList from "$lib/components/display/sample-list.svelte";
</script>

<form onsubmit={(e) => e.preventDefault()} class="p-8">
  <button type="submit" class="border rounded-md px-2 bg-accent my-4">
    Save
  </button>
</form>

<SampleList />
