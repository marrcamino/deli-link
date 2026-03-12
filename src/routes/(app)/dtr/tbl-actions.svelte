<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import * as ButtonGroup from "$lib/components/ui/button-group/index.js";
  import { CalendarClock } from "@lucide/svelte";

  interface Props {
    user: User;
  }
  let { user }: Props = $props();
</script>

<div class="place-self-end">
  <ButtonGroup.Root>
    <!-- <Button size="xs" variant="outline">Archive</Button> -->
    <Button size="sm" variant="outline" href="/dtr/{user.user_pk}">
      <CalendarClock class="text-muted-foreground"/>
      <span>DTR</span>
    </Button>
  </ButtonGroup.Root>
</div>
