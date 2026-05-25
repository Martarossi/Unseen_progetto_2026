<script>
  import { onMount, tick } from 'svelte';

  /** @typedef {{ x: number, y: number, width: number, height: number } | null} CardRect */

  /** @type {{ closeOverlay: () => void, videoSrc?: string, clickRect?: CardRect }} */
  let { closeOverlay, videoSrc = '', clickRect = null } = $props();

  const initialTransform = (() => {
    if (!clickRect || typeof window === 'undefined') return '';
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const sx = clickRect.width / vw;
    const sy = clickRect.height / vh;
    const dx = clickRect.x + clickRect.width / 2 - vw / 2;
    const dy = clickRect.y + clickRect.height / 2 - vh / 2;
    return `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
  })();

  let opening = $state(false);
  /** @type {HTMLVideoElement|null} */
  let videoEl = $state(null);

  const cardType = $derived(
    videoSrc.includes('tracker') ? 'tracker' :
    (videoSrc.includes('Bullet') || videoSrc.includes('bullet')) ? 'bullet' :
    'spacetime'
  );

  onMount(async () => {
    await tick();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        opening = true;
        if (videoEl) {
          videoEl.play().catch(() => {});
        }
      });
    });
  });
</script>

<div
  class="overlay-wrapper"
  class:opening
  style:transform={opening ? 'none' : (initialTransform || 'scale(0.08)')}
  style:border-radius={opening ? '0px' : '32px'}
>
  <button class="close-btn" onclick={closeOverlay} aria-label="Chiudi overlay">&times;</button>

  <div class="overlay-inner">
    <div class="grid">

      <div class="col left-col">
        <div class="card video-card">
          <video
            bind:this={videoEl}
            src={videoSrc}
            loop
            muted
            playsinline
            class="video-el"
          ></video>
        </div>

        <div class="card segm-card">
          <div class="segm-body">
            <div class="segm-text">
              {#if cardType === 'tracker'}
                <h3 class="label">Identità in Movimento</h3>
                <p>Grazie alla Computer Vision, il sistema riconosce e segue ogni singolo atleta senza bisogno di sensori fisici.</p>
              {:else if cardType === 'bullet'}
                <h3 class="label">360°</h3>
                <p>L'AI permette di congelare il tempo nel momento di massima tensione sportiva e ruotare l'inquadratura a 360° attorno all'atleta per vedere ogni dettaglio.</p>
              {:else}
                <h3 class="label">Segmentazione</h3>
                <p>L'IA identifica e ritaglia la sagoma dell'atleta in diverse fasi del salto.</p>
              {/if}
            </div>
            <div class="segm-rule">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <div class="col right-col">
        <div class="card main-card" class:main-card--compact={cardType === 'bullet'}>
          {#if cardType === 'tracker'}
            <h2>Tracker<br>Athletes</h2>
          {:else if cardType === 'bullet'}
            <h2>Bullet<br>Timing</h2>
          {:else}
            <h2>Spacetime<br>Slice</h2>
          {/if}
          <div class="divider"></div>
          <p class="subtitle">
            {#if cardType === 'tracker'}
              Analisi istantanea dell'azione sportiva
            {:else if cardType === 'bullet'}
              Scansione orbitale di un istante sospeso
            {:else}
              Scomposizione gesto sportivo in fotogrammi simultanei
            {/if}
          </p>
        </div>

        {#if cardType === 'bullet'}
          <div class="card figure-card">
            <img src="/bullet_timing_figure.png" alt="3D athlete figure" class="figure-img" />
          </div>
        {:else if cardType === 'tracker'}
          <div class="card info-card">
            <h3 class="label">X-Ray delle Performance</h3>
            <p>Velocità di punta, altezza dei salti, accelerazione e traiettorie vengono proiettate direttamente sullo schermo mentre l'azione si compie.</p>
          </div>
          <div class="card info-card">
            <h3 class="label">Big Data</h3>
            <p>L'AI elabora oltre 30 data-point al secondo per ogni atleta, trasformando la fatica in grafiche interattive istantanee.</p>
          </div>
        {:else}
          <div class="card info-card">
            <h3 class="label">L'Esercito di Lenti</h3>
            <p>Oltre 60 telecamere 4K sincronizzate al millisecondo catturano l'azione da ogni angolazione possibile.</p>
          </div>
          <div class="card info-card">
            <h3 class="label">Velocità Record</h3>
            <p>In soli 15-20 secondi, il sistema crea una ricostruzione 3D dell'azione, rendendo il replay disponibile quasi in tempo reale per il commento tecnico in diretta e per la diretta TV.</p>
          </div>
        {/if}
      </div>

    </div>
  </div>
</div>

<style>
  /* ── Wrapper con effetto Sfocatura Sfondo ── */
  .overlay-wrapper {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(10, 20, 28, 0.4);
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px;
    box-sizing: border-box;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    transition:
      transform 0.65s cubic-bezier(0.4, 0, 0.2, 1),
      border-radius 0.65s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* ── Bottone chiudi ── */
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
    transition: opacity 0.2s, transform 0.2s;
  }
  .close-btn:hover {
    opacity: 0.6;
    transform: scale(1.05);
  }

  /* ── Inner ── */
  .overlay-inner {
    position: relative;
    width: 100%;
    max-width: 1360px;
    height: 100%;
    max-height: 680px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }

  /* ── Griglia ── */
  .grid {
    display: grid;
    grid-template-columns: 1.25fr 0.75fr;
    gap: 24px;
    width: 100%;
    height: 100%;
  }

  /* ── Colonne ── */
  .col {
    display: flex;
    flex-direction: column;
    gap: 24px;
    height: 100%;
  }

  /* ── Card base ── */
  .card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 32px;
    color: #ffffff;
    box-sizing: border-box;
  }

  /* ── Video ── */
  .video-card {
    flex: 1;
    overflow: hidden;
  }

  .video-el {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* ── Segmentazione ── */
  .segm-card {
    flex: 0 0 auto;
  }

  .segm-body {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28px 32px;
  }

  .segm-text {
    flex: 1;
    padding-right: 28px;
  }

  .segm-rule {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .segm-rule span {
    width: 3px;
    height: 12px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 1.5px;
  }
  .segm-rule span:first-child {
    background: #ffffff;
  }

  /* ── Main card ── */
  .main-card {
    flex: 1;
    padding: 36px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  .main-card--compact {
    flex: 0 0 auto;
  }

  .main-card h2 {
    font-family: 'Akira Expanded', 'Arial Black', sans-serif;
    font-size: clamp(28px, 3vw, 44px);
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    line-height: 1.1;
    margin: 0 0 20px 0;
  }

  .main-card .divider {
    height: 2px;
    background: rgba(255, 255, 255, 0.2);
    width: 60px;
    margin-bottom: 20px;
  }

  .subtitle {
    font-size: 17px;
    line-height: 1.45;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.85);
    margin: 0;
  }

  /* ── Info cards ── */
  .info-card {
    flex: 0 0 auto;
    padding: 28px 32px;
  }

  /* ── Figure card (Bullet Timing) ── */
  .figure-card {
    flex: 1;
    overflow: hidden;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 0;
  }

  .figure-img {
    max-height: 100%;
    max-width: 85%;
    object-fit: contain;
    display: block;
  }

  .label {
    font-family: 'Akira Expanded', 'Arial Black', sans-serif;
    font-size: 14px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #ffffff;
    margin: 0 0 12px 0;
  }

  .segm-text p,
  .info-card p {
    font-size: 16px;
    line-height: 1.55;
    color: rgba(255, 255, 255, 0.75);
    margin: 0;
    font-weight: 400;
  }
</style>
