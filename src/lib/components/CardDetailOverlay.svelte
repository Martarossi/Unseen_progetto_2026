<script>
  import { onMount, tick } from 'svelte';

  /** @typedef {{ x: number, y: number, width: number, height: number }} CardRect */

  /** @type {{ closeOverlay: () => void, videoSrc?: string, clickRect?: CardRect | null }} */
  let { closeOverlay, videoSrc = '', clickRect = null } = $props();

  /** @type {HTMLVideoElement|null} */
  let videoEl = $state(null);
  let clipPath = $state('');
  let initialClip = '';
  let wrapper = $state(null);
  let isOpen = $state(false);
  let isClosing = $state(false);

  onMount(async () => {
    const W = window.innerWidth;
    const H = window.innerHeight;

    if (clickRect) {
      const top    = Math.max(0, clickRect.y);
      const right  = Math.max(0, W - (clickRect.x + clickRect.width));
      const bottom = Math.max(0, H - (clickRect.y + clickRect.height));
      const left   = Math.max(0, clickRect.x);
      initialClip = `inset(${top}px ${right}px ${bottom}px ${left}px round 14px)`;
      clipPath = initialClip;
    } else {
      initialClip = `inset(${H / 2}px ${W / 2}px ${H / 2}px ${W / 2}px round 0px)`;
      clipPath = initialClip;
    }

    await tick();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        clipPath = 'inset(0px 0px 0px 0px round 0px)';
        setTimeout(() => {
          isOpen = true;
          if (videoEl) videoEl.play().catch(() => {});
        }, 380);
      });
    });
  });

  async function handleClose() {
    isOpen = false;
    isClosing = true;

    if (videoEl) {
      try { videoEl.pause(); } catch (e) {}
    }

    await new Promise(r => setTimeout(r, 180));

    clipPath = initialClip;

    await new Promise((resolve) => {
      let settled = false;
      const done = () => { if (settled) return; settled = true; resolve(); };

      if (wrapper && wrapper.addEventListener) {
        const onEnd = (e) => {
          if (e.propertyName && e.propertyName.indexOf('clip-path') === -1) return;
          wrapper.removeEventListener('transitionend', onEnd);
          done();
        };
        wrapper.addEventListener('transitionend', onEnd);
      }

      setTimeout(done, 1000);
    });

    try { closeOverlay(); } catch (e) { /* ignore */ }
  }
</script>

<div class="overlay-wrapper" bind:this={wrapper} style="clip-path: {clipPath}">
  <div class="overlay-inner" class:is-open={isOpen} class:is-closing={isClosing}>
    <button class="close-btn" onclick={handleClose}>&times;</button>

    <div class="grid">
      <!-- Left column -->
      <div class="left-col">
        <div class="video-card glass-card">
          <video
            bind:this={videoEl}
            src={videoSrc}
            loop
            playsinline
            class="video-el"
          ></video>
        </div>

        <div class="glass-card segm-card">
          <div class="segm-inner">
            <div class="segm-text">
              <h3>SEGMENTAZIONE</h3>
              <div class="divider"></div>
              <p>L'IA identifica e ritaglia la sagoma dell'atleta in diverse fasi del salto.</p>
            </div>
            <div class="segm-accent"></div>
          </div>
        </div>
      </div>

      <!-- Right column -->
      <div class="right-col">
        <div class="glass-card main-card">
          <h2>SPACETIME<br>SLICE</h2>
          <p class="main-subtitle"><strong>Scomposizione gesto sportivo in fotogrammi simultanei</strong></p>
        </div>

        <div class="glass-card info-card">
          <h3>L'ESERCITO DI LENTI</h3>
          <p>Oltre 60 telecamere 4K sincronizzate al millisecondo catturano l'azione da ogni angolazione possibile.</p>
        </div>

        <div class="glass-card info-card">
          <h3>VELOCITÀ RECORD</h3>
          <p>In soli 15-20 secondi, il sistema crea una ricostruzione 3D dell'azione, rendendo il replay disponibile quasi in tempo reale per il commento tecnico in diretta e per la diretta TV.</p>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .overlay-wrapper {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: radial-gradient(circle at 50% 50%, #4a565e 0%, #293035 100%);
    transition: clip-path 0.95s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: clip-path;
  }

  .overlay-inner {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 28px 40px 32px;
    box-sizing: border-box;
  }

  /* Content reveal base state */
  .close-btn,
  .left-col,
  .right-col {
    opacity: 0;
    transform: translateY(22px);
    filter: blur(6px);
    pointer-events: none;
    transition:
      opacity 0.65s ease,
      transform 0.7s cubic-bezier(0.16, 1, 0.3, 1),
      filter 0.65s ease;
    will-change: opacity, transform, filter;
  }

  /* Staggered reveal on open */
  .is-open .left-col {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
    pointer-events: auto;
    transition-delay: 0.1s;
  }

  .is-open .right-col {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
    pointer-events: auto;
    transition-delay: 0.26s;
  }

  .is-open .close-btn {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
    pointer-events: auto;
    transition-delay: 0.52s;
  }

  /* Quick fade-out on close */
  .is-closing .close-btn,
  .is-closing .left-col,
  .is-closing .right-col {
    opacity: 0;
    filter: blur(5px);
    transform: translateY(10px);
    pointer-events: none;
    transition:
      opacity 0.18s ease,
      filter 0.18s ease,
      transform 0.18s ease;
    transition-delay: 0s;
  }

  .close-btn:hover {
    opacity: 0.7;
  }

  .grid {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 14px;
    height: calc(100vh - 60px);
    margin-top: 52px;
  }

  .left-col,
  .right-col {
    display: flex;
    flex-direction: column;
    gap: 14px;
    height: 100%;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.13);
    border-radius: 20px;
    color: #f0f0f0;
    box-sizing: border-box;
  }

  /* Left col: video takes most space */
  .video-card {
    flex: 1;
    padding: 0;
    overflow: hidden;
    min-height: 0;
  }

  .video-el {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 20px;
    display: block;
  }

  .segm-card {
    flex: 0 0 auto;
    padding: 0;
  }

  .segm-inner {
    display: flex;
    height: 100%;
  }

  .segm-text {
    flex: 1;
    padding: 20px 22px;
  }

  .segm-accent {
    width: 3px;
    flex: 0 0 3px;
    background: rgba(255, 255, 255, 0.12);
    border-radius: 0 20px 20px 0;
    margin: 16px 16px 16px 0;
  }

  .segm-card h3 {
    font-family: var(--font-primary), 'Helvetica Neue', Helvetica, sans-serif;
    font-size: 13px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin: 0 0 10px 0;
  }

  .divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.14);
    margin-bottom: 10px;
  }

  .segm-card p {
    font-size: 13px;
    line-height: 1.55;
    opacity: 0.82;
    margin: 0;
  }

  /* Right col */
  .main-card {
    flex: 1.2;
    padding: 28px 28px 24px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  .main-card h2 {
    font-family: var(--font-primary), 'Helvetica Neue', Helvetica, sans-serif;
    font-size: clamp(30px, 3.5vw, 54px);
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 2px;
    line-height: 1.05;
    margin: 0 0 18px 0;
  }

  .main-subtitle {
    font-size: 14px;
    line-height: 1.5;
    opacity: 0.9;
    margin: 0;
  }

  .info-card {
    flex: 1;
    padding: 20px 22px;
  }

  .info-card h3 {
    font-family: var(--font-primary), 'Helvetica Neue', Helvetica, sans-serif;
    font-size: 13px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin: 0 0 10px 0;
  }

  .info-card p {
    font-size: 13px;
    line-height: 1.6;
    opacity: 0.82;
    margin: 0;
  }
</style>
