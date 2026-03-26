<script lang="ts">
  import DateMultiplePicker from "$lib/components/inputs/date/date-multiple-picker.svelte";
  import LeaveTypeSelector from "$lib/components/inputs/leave-type-selector.svelte";
  import { type DateValue } from "@internationalized/date";

  let values: DateValue[] | undefined = $state([]);
</script>

<form onsubmit={(e) => e.preventDefault()} class="p-8">
  <!-- <div>
    <DateMultiplePicker bind:values required />
  </div> -->

  <LeaveTypeSelector required name="dfgdfg" />

  <button type="submit" class="border rounded-md px-2 bg-accent my-4">
    Save
  </button>
</form>

Lorem ipsum dolor sit amet, consectetur adipisicing elit. Commodi beatae cupiditate
quas error dicta dolore aut harum nihil reprehenderit odio. Id ratione tenetur dicta,
expedita minima corrupti aperiam non dolor!
