<script lang="ts">
  import { flip } from 'svelte/animate';
  import { fly } from 'svelte/transition';
  import { cubicOut, backOut, expoOut } from 'svelte/easing';
  import type { TransitionConfig } from 'svelte/transition';

  // ─── Types ────────────────────────────────────────────────────────────────

  type Tag = 'urgent' | 'backend' | 'design' | 'review' | 'bug' | 'feature' | 'docs' | 'infra';

  interface Item {
    id:   string;
    name: string;
    ini:  string;
    task: string;
    tag:  Tag;
    bg:   string;
    time: string;
  }

  interface Pool {
    first:   string[];
    last:    string[];
    tasks:   string[];
    tags:    Tag[];
    avatars: string[];
  }

  // ─── Data ─────────────────────────────────────────────────────────────────

  const pool: Pool = {
    first:  ['Alex','Sam','Jordan','Taylor','Morgan','Casey','Riley','Drew','Quinn','Avery','Blair','Skyler'],
    last:   ['Rivera','Chen','Blake','Park','Walsh','Patel','Moore','Santos','Lee','Kim','Nguyen','Torres'],
    tasks:  [
      'Review authentication pull request',
      'Fix critical bug in payment flow',
      'Update API documentation',
      'Design new onboarding screens',
      'Migrate database to new schema',
      'Write end-to-end test coverage',
      'Optimize Lighthouse performance score',
      'Deploy hotfix to production',
      'Conduct quarterly user interviews',
      'Refactor legacy authentication module',
      'Set up error monitoring alerts',
      'Schedule team retrospective session',
      'Audit accessibility compliance',
      'Implement dark mode toggle',
    ],
    tags:   ['urgent','backend','design','review','bug','feature','docs','infra'],
    avatars:['#D4B896','#96B4D4','#B496D4','#96D4B4','#D496B4','#B4D496','#D4C896','#96C8D4'],
  };

  function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function initials(name: string): string {
    return name.split(' ').map(w => w[0]).join('');
  }

  function makeItem(): Item {
    const name = `${pick(pool.first)} ${pick(pool.last)}`;
    return {
      id:   crypto.randomUUID(),
      name,
      ini:  initials(name),
      task: pick(pool.tasks),
      tag:  pick(pool.tags),
      bg:   pick(pool.avatars),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  }

  // ─── Pre-flight helper ────────────────────────────────────────────────────
  // WHY: Svelte's out: transition css() callback generates CSS @keyframes.
  // Keyframe animations are purely visual — they do NOT affect document flow.
  // So writing "position: absolute" inside css() is a cosmetic lie: the element
  // still occupies flex space and pushes siblings the entire time.
  //
  // FIX: Call floatEl() BEFORE the state change. This sets position:absolute
  // directly on node.style (which DOES affect layout immediately), capturing
  // the element's current visual position. By the time Svelte runs its DOM
  // update and calls the transition functions, siblings already see correct
  // layout. The transition functions then only animate opacity + transform.

  function floatEl(el: HTMLElement): void {
    const { top: nTop, left: nLeft, width } = el.getBoundingClientRect();
    const { top: pTop, left: pLeft }        = el.parentElement!.getBoundingClientRect();
    Object.assign(el.style, {
      position:      'absolute',
      top:           `${nTop - pTop}px`,
      left:          `${nLeft - pLeft}px`,
      width:         `${width}px`,
      margin:        '0',
      pointerEvents: 'none',
      zIndex:        '1',
    });
  }

  // ─── Custom exit transitions ───────────────────────────────────────────────
  // The element is already position:absolute by the time these are called,
  // so we only need to animate opacity and transform.

  function cardOut(node: HTMLElement): TransitionConfig {
    if (node.style.position !== 'absolute') floatEl(node); // defensive fallback
    return {
      duration: 190,
      easing: expoOut,
      css: (t: number, u: number): string => `
        opacity: ${t};
        transform: translateY(${-28 * u}px);
      `,
    };
  }

  function emptyOut(node: HTMLElement): TransitionConfig {
    if (node.style.position !== 'absolute') floatEl(node); // defensive fallback
    return {
      duration: 160,
      easing: cubicOut,
      css: (t: number, u: number): string => `
        opacity: ${t};
        transform: translateY(${-16 * u}px);
      `,
    };
  }

  // ─── State ────────────────────────────────────────────────────────────────

  let items = $state<Item[]>([makeItem(), makeItem(), makeItem()]);

  function add(): void {
    // Float the empty state out of flow BEFORE the state change triggers
    // Svelte's DOM update — so the new card enters at the top unobstructed.
    const emptyEl = document.querySelector<HTMLElement>('.empty-card');
    if (emptyEl) floatEl(emptyEl);
    items = [makeItem(), ...items];
  }

  function remove(id: string): void {
    // Float the departing card out of flow BEFORE the state change triggers
    // Svelte's DOM update — so the empty state enters without being pushed down.
    const cardEl = document.querySelector<HTMLElement>(`[data-id="${id}"]`);
    if (cardEl) floatEl(cardEl);
    items = items.filter(i => i.id !== id);
  }
</script>

<!-- ─── PAGE ─── -->
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
  <div class="list-wrap">

    <!-- empty state -->
    {#if items.length === 0}
      <div
        class="empty-card"
        in:fly={{ y: 20, duration: 240, easing: backOut }}
        out:emptyOut
      >
        <div class="empty-icon">◎</div>
        <p class="empty-title">All clear</p>
        <p class="empty-sub">No tasks in your inbox. Hit <strong>Add task</strong> to create one.</p>
      </div>
    {/if}

    <!-- items -->
    {#each items as item (item.id)}
      <div
        class="card"
        animate:flip={{ duration: 320, easing: cubicOut }}
        in:fly={{ y: -56, duration: 280, easing: backOut }}
        out:cardOut
      >
        <!-- avatar -->
        <div class="avatar" style="background:{item.bg}">{item.ini}</div>

        <!-- body -->
        <div class="card-body">
          <div class="card-top">
            <span class="name">{item.name}</span>
            <span class="tag tag--{item.tag}">{item.tag}</span>
          </div>
          <p class="task">{item.task}</p>
          <span class="time">{item.time}</span>
        </div>

        <!-- remove -->
        <button class="btn-remove" onclick={() => remove(item.id)} aria-label="Remove task">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    {/each}

  </div>
</div>

<style>


  /* ── page ── */
  .page {
    max-width: 580px;
    margin: 0 auto;
    padding: 56px 20px 80px;
  }

  /* ── header ── */
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 36px;
  }
  .header-left { display: flex; align-items: center; gap: 10px; }

  .logo {
    font-size: 18px;
    color: #c9a96e;
    line-height: 1;
    margin-top: 1px;
  }
  .title {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 26px;
    font-weight: 400;
    letter-spacing: -0.3px;
    color: #f0ece6;
  }
  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 22px;
    padding: 0 6px;
    background: #1e1c1a;
    border: 1px solid #2e2c29;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 500;
    color: #7a7672;
    transition: background 0.2s, color 0.2s;
  }

  .btn-add {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 9px 16px 9px 12px;
    background: #c9a96e;
    color: #1a1509;
    border: none;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
    letter-spacing: 0.01em;
  }
  .btn-add:hover  { background: #d6ba82; }
  .btn-add:active { transform: scale(0.97); }
  .btn-icon { font-size: 16px; line-height: 1; margin-top: -1px; }

  /* ── list wrap ── */
  .list-wrap {
    position: relative; /* required: exiting elements use position:absolute relative to this */
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* ── empty card ── */
  .empty-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 52px 24px;
    background: #141310;
    border: 1px dashed #2a2824;
    border-radius: 16px;
    text-align: center;
  }
  .empty-icon {
    font-size: 28px;
    color: #3a3733;
    margin-bottom: 4px;
  }
  .empty-title {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 18px;
    color: #5a5652;
  }
  .empty-sub {
    font-size: 13px;
    color: #3e3c39;
    line-height: 1.6;
    max-width: 260px;
  }
  .empty-sub strong { color: #5a5450; font-weight: 500; }

  /* ── card ── */
  .card {
    display: flex;
    align-items: flex-start;
    gap: 13px;
    padding: 15px 15px 15px 16px;
    background: #161412;
    border: 1px solid #232018;
    border-radius: 14px;
    position: relative;
    transition: border-color 0.2s, background 0.2s;
    will-change: transform;
  }
  .card:hover {
    background: #1a1814;
    border-color: #2c2920;
  }

  /* ── avatar ── */
  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 500;
    color: #1a1309;
    flex-shrink: 0;
    margin-top: 1px;
    letter-spacing: 0.02em;
  }

  /* ── card body ── */
  .card-body { flex: 1; min-width: 0; }

  .card-top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 5px;
    flex-wrap: wrap;
  }
  .name {
    font-size: 13.5px;
    font-weight: 500;
    color: #d8d2c8;
    letter-spacing: 0.01em;
  }

  /* tags */
  .tag {
    font-size: 10px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 999px;
    letter-spacing: 0.04em;
    text-transform: lowercase;
  }
  .tag--urgent  { background:#3a1a14; color:#d4735a; }
  .tag--bug     { background:#3a1a1a; color:#d45a5a; }
  .tag--feature { background:#143a2e; color:#5ab49a; }
  .tag--design  { background:#251a3a; color:#9a7ad4; }
  .tag--backend { background:#14253a; color:#5a96d4; }
  .tag--review  { background:#3a2e14; color:#c9a96e; }
  .tag--docs    { background:#1a2e1a; color:#78b478; }
  .tag--infra   { background:#282624; color:#7a7672; }

  .task {
    font-size: 13px;
    color: #6e6a64;
    line-height: 1.5;
    margin-bottom: 7px;
    padding-right: 28px;
  }
  .time {
    font-size: 11px;
    color: #3a3835;
    font-variant-numeric: tabular-nums;
  }

  /* ── remove button ── */
  .btn-remove {
    position: absolute;
    top: 14px;
    right: 13px;
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: #38342f;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    padding: 0;
  }
  .btn-remove:hover {
    background: #2a2520;
    color: #c9a96e;
  }
  .btn-remove:active { transform: scale(0.93); }
</style>