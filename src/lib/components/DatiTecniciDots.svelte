<script>
  /** @type {{
   *   visible?: boolean,
   *   positions?: {x: number, y: number}[],
   *   onParticleClick?: (id: string) => void
   * }} */
  let {
    visible = false,
    positions = [],
    onParticleClick = undefined,
  } = $props();

  const DOTS = [
    { id: 'guide',     label: 'GUIDE',     pulseDelay: '0s',    appearDelay: '0s' },
    { id: 'enhancing', label: 'ENHANCING', pulseDelay: '-0.9s', appearDelay: '0.18s' },
    { id: 'highlight', label: 'HIGHLIGHT', pulseDelay: '-1.8s', appearDelay: '0.34s' },
  ];
</script>

{#each DOTS as dot, i}
  {@const pos = positions[i] ?? { x: 50, y: 50 }}
  <button
    class="dt-particle"
    class:visible
    style="transform: translate({pos.x}vw, {pos.y}vh) translate(-50%, -50%); --pulse-delay: {dot.pulseDelay}; --appear-delay: {dot.appearDelay}"
    onclick={() => onParticleClick?.(dot.id)}
    aria-label="Apri sezione {dot.label}"
  >
    <div class="dt-ring-wrap">
      <div class="dt-ring"></div>
    </div>
    <span class="dt-label">{dot.label}</span>
  </button>
{/each}

<style>
  .dt-particle {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 55;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    /* transform comes entirely from inline style: translate(Xvw, Yvh) translate(-50%,-50%) */
    background: none;
    border: none;
    cursor: pointer;
    padding: 14px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.8s ease var(--appear-delay, 0s);
  }

  .dt-particle.visible {
    opacity: 1;
    pointer-events: all;
  }

  /* ── RING ───────────────────────────────────────── */
  .dt-ring-wrap {
    position: relative;
    width: 30px;
    height: 30px;
    flex-shrink: 0;
  }

  .dt-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1.5px solid rgba(78, 119, 133, 0.75);
    animation: dt-pulse 2.8s ease-out infinite;
    animation-delay: var(--pulse-delay, 0s);
  }

  .dt-ring::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1px solid rgba(180, 215, 225, 0.38);
    animation: dt-pulse 2.8s ease-out infinite;
    animation-delay: calc(var(--pulse-delay, 0s) + 1.4s);
  }

  /* ── LABEL ───────────────────────────────────────── */
  .dt-label {
    font-family: 'Akira Expanded', 'Arial Black', sans-serif;
    font-size: clamp(10px, 0.95vw, 15px);
    font-weight: 900;
    color: rgba(255, 255, 255, 0.82);
    text-transform: uppercase;
    letter-spacing: 0.16em;
    white-space: nowrap;
    pointer-events: none;
  }

  /* ── HOVER ───────────────────────────────────────── */
  .dt-particle:hover .dt-ring {
    border-color: rgba(110, 175, 200, 1.0);
  }

  .dt-particle:hover .dt-label {
    color: #ffffff;
  }

  /* ── ANIMATIONS ─────────────────────────────────── */
  @keyframes dt-pulse {
    0%   { transform: scale(1);   opacity: 0.75; }
    100% { transform: scale(2.8); opacity: 0; }
  }
</style>
