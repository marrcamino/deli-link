<script lang="ts">
  import { slide, fly } from "svelte/transition";
  import { expoOut, expoIn, backOut } from "svelte/easing";
  import AnimationWrapper from "./animation-wrapper.svelte";
  import EmptyState from "./empty-state-wrapper.svelte";
  // ─── Types ────────────────────────────────────────────────────────────────

  type Tag =
    | "urgent"
    | "backend"
    | "design"
    | "review"
    | "bug"
    | "feature"
    | "docs"
    | "infra";

  interface Item {
    id: string;
    name: string;
    ini: string;
    task: string;
    tag: Tag;
    bg: string;
    time: string;
  }

  // ─── Data ─────────────────────────────────────────────────────────────────

  const first = [
    "Alex",
    "Sam",
    "Jordan",
    "Taylor",
    "Morgan",
    "Casey",
    "Riley",
    "Drew",
    "Quinn",
    "Avery",
    "Blair",
    "Skyler",
  ];
  const last = [
    "Rivera",
    "Chen",
    "Blake",
    "Park",
    "Walsh",
    "Patel",
    "Moore",
    "Santos",
    "Lee",
    "Kim",
    "Nguyen",
    "Torres",
  ];
  const tasks = [
    "Review authentication pull request",
    "Fix critical bug in payment flow",
    "Update API documentation",
    "Design new onboarding screens",
    "Migrate database to new schema",
    "Write end-to-end test coverage",
    "Optimize Lighthouse performance score",
    "Deploy hotfix to production",
    "Conduct quarterly user interviews",
    "Refactor legacy authentication module",
    "Set up error monitoring alerts",
    "Schedule team retrospective session",
    "Audit accessibility compliance",
    "Implement dark mode toggle",
  ];
  const tags: Tag[] = [
    "urgent",
    "backend",
    "design",
    "review",
    "bug",
    "feature",
    "docs",
    "infra",
  ];
  const avatars = [
    "#D4B896",
    "#96B4D4",
    "#B496D4",
    "#96D4B4",
    "#D496B4",
    "#B4D496",
    "#D4C896",
    "#96C8D4",
  ];

  const tagStyle: Record<Tag, { bg: string; color: string }> = {
    urgent: { bg: "#3a1a14", color: "#d4735a" },
    bug: { bg: "#3a1a1a", color: "#d45a5a" },
    feature: { bg: "#143a2e", color: "#5ab49a" },
    design: { bg: "#251a3a", color: "#9a7ad4" },
    backend: { bg: "#14253a", color: "#5a96d4" },
    review: { bg: "#3a2e14", color: "#c9a96e" },
    docs: { bg: "#1a2e1a", color: "#78b478" },
    infra: { bg: "#282624", color: "#7a7672" },
  };

  function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  function initials(name: string): string {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("");
  }

  function makeItem(): Item {
    const name = `${pick(first)} ${pick(last)}`;
    return {
      id: crypto.randomUUID(),
      name,
      ini: initials(name),
      task: pick(tasks),
      tag: pick(tags),
      bg: pick(avatars),
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }

  let items = $state<Item[]>([makeItem(), makeItem(), makeItem()]);

  function add(): void {
    items = [makeItem(), ...items];
  }
  function remove(id: string): void {
    items = items.filter((i) => i.id !== id);
  }

  function vibrationIn(node: HTMLElement) {
    return {
      easing: backOut,
      duration: 500,
      css: (t: number) => {
        // t is the linear progress (0 to 1)

        // 1. Apply backOut ONLY to the movement
        const easedThreshold = backOut(t);
        const yMovement = -30 * (1 - easedThreshold); // Flies down from -30px

        // 2. Linear scale (not affected by backOut)
        const scale = 0.9 + 0.1 * t;

        return `
                transform: translateY(${yMovement}px) scale(${scale});
                opacity: ${t};
            `;
      },
    };
  }
</script>

<div class="page">
  <!-- header -->
  <header class="header">
    <div class="header-left">
      <span class="logo">✦</span>
      <h1 class="title">Inbox</h1>
      <span class="badge">{items.length}</span>
    </div>
    <button class="btn-add" onclick={add}>
      <span class="btn-icon">+</span>
      Add task
    </button>
  </header>

  <!-- list -->
  <div class="list relative">
    <EmptyState {items}>
      <div class="empty-card">
        <div class="empty-icon">◎</div>
        <p class="empty-title">All clear</p>
        <p class="empty-sub">
          No tasks in your inbox. Hit <strong>Add task</strong> to create one.
        </p>
      </div>
    </EmptyState>

    <!-- items -->

    <div>
      {#each items as item (item.id)}
        <AnimationWrapper>
          <div class="card">
            <!-- avatar -->
            <div class="avatar" style="background:{item.bg}">{item.ini}</div>

            <!-- body -->
            <div class="card-body">
              <div class="card-top">
                <span class="name">{item.name}</span>
                <span
                  class="tag"
                  style="background:{tagStyle[item.tag].bg};color:{tagStyle[
                    item.tag
                  ].color}">{item.tag}</span
                >
              </div>
              <p class="task">{item.task}</p>
              <span class="time">{item.time}</span>
            </div>

            <!-- remove -->
            <button
              class="btn-remove"
              onclick={() => remove(item.id)}
              aria-label="Remove task"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M1 1l10 10M11 1L1 11"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
        </AnimationWrapper>
      {/each}
    </div>
  </div>
</div>

<style lang="postcss">
  @reference "../../../routes/layout.css";

  .page {
    @apply max-w-xl mx-auto px-5 pt-14 pb-20;
  }

  .header {
    @apply flex items-center justify-between mb-9;
  }
  .header-left {
    @apply flex items-center gap-2.5;
  }

  .logo {
    font-size: 18px;
    color: #c9a96e;
    line-height: 1;
    margin-top: 1px;
  }
  .title {
    font-family: "Instrument Serif", Georgia, serif;
    @apply text-2xl font-normal tracking-tight;
    color: #f0ece6;
  }

  .badge {
    @apply inline-flex items-center justify-center min-w-5.5 h-5.5 px-1.5
           rounded-full text-[11px] font-medium;
    background: #1e1c1a;
    border: 1px solid #2e2c29;
    color: #7a7672;
    transition:
      background 0.2s,
      color 0.2s;
  }

  .btn-add {
    @apply flex items-center gap-1.5 pl-3 pr-4 py-2.25
           rounded-[10px] text-[13px] font-medium cursor-pointer border-none;
    background: #c9a96e;
    color: #1a1509;
    font-family: "DM Sans", sans-serif;
    letter-spacing: 0.01em;
    transition:
      background 0.15s,
      transform 0.1s;
  }
  .btn-add:hover {
    background: #d6ba82;
  }
  .btn-add:active {
    transform: scale(0.97);
  }
  .btn-icon {
    font-size: 17px;
    line-height: 1;
    margin-top: -1px;
  }

  .list {
    @apply flex flex-col;
  }

  /* slot: transparent spacer — no visual styles, just padding for gap */
  .slot {
    @apply pb-2.5;
  }

  /* empty card */
  .empty-card {
    @apply flex flex-col items-center justify-center gap-2.5 py-13 px-6
           rounded-2xl text-center;
    background: #141310;
    border: 1px dashed #2a2824;
  }
  .empty-icon {
    font-size: 28px;
    color: #3a3733;
    margin-bottom: 4px;
  }
  .empty-title {
    font-family: "Instrument Serif", Georgia, serif;
    @apply text-lg;
    color: #5a5652;
  }
  .empty-sub {
    @apply text-[13px] leading-relaxed max-w-65;
    color: #3e3c39;
  }
  .empty-sub :global(strong) {
    color: #5a5450;
    font-weight: 500;
  }

  /* card */
  .card {
    @apply flex items-start gap-3 pl-4 pr-3.75 py-3.75 rounded-2xl relative;
    background: #161412;
    border: 1px solid #232018;
    transition:
      border-color 0.2s,
      background 0.2s;
  }
  .card:hover {
    background: #1a1814;
    border-color: #2c2920;
  }

  .avatar {
    @apply w-9 h-9 rounded-full flex items-center justify-center
           text-xs font-medium shrink-0 mt-px;
    color: #1a1309;
    letter-spacing: 0.02em;
  }

  .card-body {
    @apply flex-1 min-w-0;
  }

  .card-top {
    @apply flex items-center gap-2 mb-1.25 flex-wrap;
  }
  .name {
    @apply text-[13.5px] font-medium;
    color: #d8d2c8;
    letter-spacing: 0.01em;
  }

  .tag {
    @apply text-[10px] font-medium px-2 py-0.5 rounded-full;
    letter-spacing: 0.04em;
    text-transform: lowercase;
  }

  .task {
    @apply text-[13px] leading-relaxed mb-1.75 pr-7;
    color: #6e6a64;
  }
  .time {
    @apply text-[11px];
    color: #3a3835;
    font-variant-numeric: tabular-nums;
  }

  .btn-remove {
    @apply absolute top-3.25 right-3 w-6.5 h-6.5
           flex items-center justify-center rounded-md
           border-none bg-transparent cursor-pointer p-0;
    color: #38342f;
    transition:
      background 0.15s,
      color 0.15s;
  }
  .btn-remove:hover {
    background: #2a2520;
    color: #c9a96e;
  }
  .btn-remove:active {
    transform: scale(0.93);
  }
</style>
