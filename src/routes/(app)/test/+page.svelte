<script lang="ts">
  import DateMultiplePicker from "$lib/components/inputs/date/date-multiple-picker.svelte";
  import { type DateValue } from "@internationalized/date";

  let values: DateValue[] | undefined = $state([]);
</script>

<form onsubmit={(e) => e.preventDefault()}>
  <div>
    <DateMultiplePicker bind:values required/>
  </div>

  <button type="submit">sy</button>
</form>
Lorem ipsum dolor sit amet, consectetur adipisicing elit. Commodi beatae cupiditate
quas error dicta dolore aut harum nihil reprehenderit odio. Id ratione tenetur dicta,
expedita minima corrupti aperiam non dolor!
