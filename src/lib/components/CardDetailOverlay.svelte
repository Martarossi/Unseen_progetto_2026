<script>
  import { onMount } from 'svelte';

  /** @type {{ closeOverlay: () => void, videoSrc?: string }} */
  let { closeOverlay, videoSrc = '' } = $props();

  let opening = $state(false);
  let closing = $state(false);
  /** @type {HTMLVideoElement|null} */
  let videoEl = $state(null);

  const cardType = $derived(
    videoSrc.includes('tracker') ? 'tracker' :
    (videoSrc.includes('Bullet') || videoSrc.includes('bullet')) ? 'bullet' :
    'spacetime'
  );

  // La card 3D ha già riempito lo schermo: l'overlay monta a schermo pieno e fa il dissolve
  onMount(async () => {
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    opening = true;
    setTimeout(() => {
      if (videoEl) videoEl.play().catch(() => {});
    }, 300);
  });

  async function handleClose() {
    closing = true;
    // Fase 1: contenuto sparisce + card-glass-bg torna (0.35s)
    // Fase 2: wrapper si dissolve (0.65s con 0.2s delay) → totale ~870ms
    await new Promise(r => setTimeout(r, 870));
    closeOverlay();
  }
</script>

<div
  class="overlay-wrapper"
  class:opening
  class:closing
>
  <!-- Layer scuro che corrisponde alla card 3D: si dissolve quando il contenuto appare -->
  <div class="card-glass-bg"></div>

  <button class="close-btn" onclick={handleClose} aria-label="Chiudi overlay">&times;</button>

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

    background: rgba(7, 14, 22, 0.82);
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
    opacity: 0;
    transition: opacity 0.75s ease;
  }

  .overlay-wrapper.opening {
    opacity: 1;
  }

  /* Chiusura: specchio inverso dell'apertura */
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

  /* Layer che replica l'aspetto della card 3D glass durante l'espansione, poi si dissolve */
  .card-glass-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background: linear-gradient(180deg, #07101f 0%, #0b1829 55%, #273B42 100%);
    opacity: 1;
    transition: opacity 0.5s ease;
  }

  .overlay-wrapper.opening .card-glass-bg {
    opacity: 0;
  }

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

  .overlay-wrapper.opening .close-btn {
    opacity: 1;
  }

  .close-btn:hover {
    opacity: 0.6;
    transform: scale(1.05);
  }

  .overlay-inner {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 1360px;
    height: 100%;
    max-height: 680px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    opacity: 0;
    transform: scale(0.97);
    /* Nessun delay: il dissolve parte subito quando opening diventa true */
    transition: opacity 0.45s ease, transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .overlay-wrapper.opening .overlay-inner {
    opacity: 1;
    transform: scale(1);
  }

  .grid {
    display: grid;
    grid-template-columns: 1.25fr 0.75fr;
    gap: 24px;
    width: 100%;
    height: 100%;
  }

  .col {
    display: flex;
    flex-direction: column;
    gap: 24px;
    height: 100%;
  }

  .card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 32px;
    color: #ffffff;
    box-sizing: border-box;
  }

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

  .info-card {
    flex: 0 0 auto;
    padding: 28px 32px;
  }

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
