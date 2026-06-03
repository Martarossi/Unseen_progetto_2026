<script>
  import { onMount } from 'svelte';

  /** @type {{ type?: string, closeOverlay: () => void }} */
  let { type = 'guide', closeOverlay } = $props();

  let opening = $state(false);
  let closing = $state(false);

  /** @type {Record<string, { title: string, subtitle: string, tag: string }>} */
  const DATA = {
    guide: {
      title: 'GUIDE',
      subtitle: 'Navigazione intuitiva attraverso le tecnologie di broadcasting',
      tag: '— SEZIONE IN ARRIVO —',
    },
    enhancing: {
      title: 'ENHANCING',
      subtitle: 'Potenziamento dell\'esperienza visiva in tempo reale',
      tag: '— SEZIONE IN ARRIVO —',
    },
    highlight: {
      title: 'HIGHLIGHT',
      subtitle: 'I momenti più significativi amplificati per il pubblico globale',
      tag: '— SEZIONE IN ARRIVO —',
    },
  };

  const info = $derived(DATA[type] ?? DATA['guide']);

  onMount(async () => {
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    opening = true;
  });

  async function handleClose() {
    closing = true;
    await new Promise(r => setTimeout(r, 870));
    closeOverlay();
  }

  /** @param {KeyboardEvent} e */
  function handleKeydown(e) {
    if (e.key === 'Escape') handleClose();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div
  class="overlay-wrapper"
  class:opening
  class:closing
  role="dialog"
  aria-modal="true"
  aria-label={info.title}
>
  <div class="card-glass-bg"></div>

  <button class="close-btn" onclick={handleClose} aria-label="Chiudi overlay">&times;</button>

  <div class="overlay-inner">
    <div class="content-card">
      <p class="card-tag">{info.tag}</p>
      <h2 class="title">{info.title}</h2>
      <div class="divider"></div>
      <p class="subtitle">{info.subtitle}</p>

      <div class="placeholder-grid">
        <div class="placeholder-block"></div>
        <div class="placeholder-block"></div>
        <div class="placeholder-block short"></div>
      </div>
    </div>
  </div>
</div>

<style>
  .overlay-wrapper {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px;
    box-sizing: border-box;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    background: url('/SFONDO.png') center / cover no-repeat;
    opacity: 0;
    transition: opacity 0.75s ease;
  }

  .overlay-wrapper.opening { opacity: 1; }

  .overlay-wrapper.closing {
    pointer-events: none;
    opacity: 0 !important;
    transition: opacity 0.65s ease 0.2s !important;
  }

  .overlay-wrapper.closing .close-btn {
    opacity: 0 !important;
    transition: opacity 0.2s ease !important;
  }

  .overlay-wrapper.closing .overlay-inner {
    opacity: 0 !important;
    transform: scale(0.97) !important;
    transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1) !important;
  }

  .overlay-wrapper.closing .card-glass-bg {
    opacity: 1 !important;
    transition: opacity 0.35s ease !important;
  }

  .card-glass-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background: linear-gradient(180deg, #07101f 0%, #0b1829 55%, #273B42 100%);
    opacity: 1;
    transition: opacity 0.5s ease;
  }

  .overlay-wrapper.opening .card-glass-bg { opacity: 0; }

  .close-btn {
    position: absolute;
    top: 50px;
    right: 50px;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.85);
    font-size: 64px;
    font-family: Arial, sans-serif;
    font-weight: 300;
    line-height: 0.7;
    cursor: pointer;
    padding: 0;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.35s ease, transform 0.2s;
  }

  .overlay-wrapper.opening .close-btn { opacity: 1; }

  .close-btn:hover {
    opacity: 0.6;
    transform: scale(1.05);
  }

  .overlay-inner {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 860px;
    opacity: 0;
    transform: scale(0.97);
    transition: opacity 0.45s ease, transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .overlay-wrapper.opening .overlay-inner {
    opacity: 1;
    transform: scale(1);
  }

  .content-card {
    background: rgba(255, 255, 255, 0.07);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 32px;
    padding: 56px 60px;
    box-sizing: border-box;
    color: #ffffff;
  }

  .card-tag {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 11px;
    letter-spacing: 0.22em;
    color: rgba(255, 255, 255, 0.38);
    text-transform: uppercase;
    margin: 0 0 28px;
  }

  .title {
    font-family: 'Akira Expanded', 'Arial Black', sans-serif;
    font-size: clamp(38px, 5.5vw, 76px);
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    line-height: 1.0;
    margin: 0 0 28px;
    color: #ffffff;
  }

  .divider {
    height: 2px;
    width: 56px;
    background: rgba(255, 255, 255, 0.22);
    margin-bottom: 28px;
  }

  .subtitle {
    font-size: clamp(15px, 1.6vw, 22px);
    line-height: 1.55;
    color: rgba(255, 255, 255, 0.72);
    margin: 0 0 48px;
    max-width: 56ch;
  }

  /* Skeleton placeholder blocks */
  .placeholder-grid {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .placeholder-block {
    height: 14px;
    border-radius: 7px;
    background: rgba(255, 255, 255, 0.08);
    animation: shimmer 2s ease-in-out infinite;
  }

  .placeholder-block.short {
    width: 55%;
  }

  @keyframes shimmer {
    0%, 100% { opacity: 0.5; }
    50%       { opacity: 0.12; }
  }

  @media (max-width: 799px) {
    .overlay-wrapper { padding: 24px; }
    .close-btn { top: 24px; right: 24px; font-size: 48px; }
    .content-card { padding: 36px 28px; }
  }
</style>
