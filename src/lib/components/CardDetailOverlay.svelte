<script>
  import { onMount, onDestroy } from 'svelte';
  import BulletCard3D from './BulletCard3D.svelte';

  /** @type {{ closeOverlay: () => void, videoSrc?: string }} */
  let { closeOverlay, videoSrc = '' } = $props();

  let opening = $state(false);
  let closing = $state(false);
  /** @type {HTMLVideoElement|null} */
  let videoEl = $state(null);
  let activeSlide = $state(0);
  let barProgress = $state(0); // 0 → 1, riempimento barra corrente

  const cardType = $derived(
    videoSrc.includes('tracker') ? 'tracker' :
    (videoSrc.includes('Bullet') || videoSrc.includes('bullet')) ? 'bullet' :
    'spacetime'
  );

  /** @type {Record<string, Array<{label: string, text: string}>>} */
  const allSlides = {
    spacetime: [
      { label: 'Isolamento', text: "Un algoritmo di IA mappa l'ambiente e separa l'atleta dallo sfondo complesso e ultra-riflettente della neve o del ghiaccio." },
      { label: 'Scomposizione', text: "L'AI divide l'azione in \"fette temporali\" significative (ad esempio, ogni mezzo secondo di volo)." },
      { label: 'Fusione', text: "Successivamente, l'AI unisce le diverse fasi del movimento sequenziale all'interno di un'unica immagine composita e fluida, in un ambiente 3D." },
      { label: 'Performance', text: "Lo Spacetime Slices è stato utilizzato per discipline come salto con gli sci e snowboard, dove l'occhio umano fatica a percepire i dettagli tecnici di movimenti così dinamici." }
    ],
    tracker: [
      { label: 'Prevenzione', text: "Incrociando i dati storici dell'atleta con il tracciamento live di movimento e fatica, gli algoritmi segnalano anomalie di carico o postura prima che si trasformino in infortuni." },
      { label: 'Zero Ingombro', text: "L'AI rileva oltre 20 punti biomeccanici del corpo solo attraverso le immagini video. Grazie alla Computer Vision, il sistema traccia ogni atleta senza bisogno di sensori fisici." },
      { label: 'Precisione Millimetrica', text: "L'AI monitora la velocità in tempo reale con uno scarto inferiore ai 5 cm/s e calcola al millimetro l'altezza dei salti, individuando dove l'atleta perde centesimi per ottimizzare le linee di discesa." },
      { label: 'Performance', text: "Il Tracker Athletes è stato utilizzato per discipline come salto con gli sci, snowboard, pattinaggio, bob, skeleton, hockey e curling, trasformando gli atleti in una sorgente vivente di dati in tempo reale." }
    ],
    bullet: [
      { label: '360°', text: "L'AI sceglie il momento di massima tensione sportiva permettendo di ruotare l'inquadratura a 360° attorno all'atleta per vedere ogni dettaglio." },
      { label: 'Fluidità', text: "L'IA genera fino a 50 fotogrammi sintetici tra uno scatto reale e l'altro, garantendo una fluidità visiva che l'occhio umano percepisce come perfezione assoluta." },
      { label: 'Flusso Dati', text: "Ogni sessione di Replay 360° richiede oltre 10 Gbps di banda su reti 5G dedicate, testimoniando l'invisibile infrastruttura tecnologica che c'è dietro." },
      { label: 'Performance', text: "Il Bullet Timing è stato implementato in 17 discipline, tra le quali sci freestyle, skating, snowboard, ski cross, bobsleigh, speed skating, skeleton, hockey e curling." }
    ]
  };

  const currentSlides = $derived(allSlides[cardType] ?? allSlides['spacetime']);

  const SLIDE_DURATION_MS = 10000;

  /** @type {number|null} */
  let rafId = null;
  let lastTimestamp = 0;

  function startRAF() {
    if (rafId !== null) cancelAnimationFrame(rafId);
    lastTimestamp = performance.now();

    /** @param {number} now */
    function tick(now) {
      const delta = now - lastTimestamp;
      lastTimestamp = now;
      barProgress = barProgress + delta / SLIDE_DURATION_MS;
      if (barProgress >= 1) {
        barProgress = 0;
        activeSlide = (activeSlide + 1) % currentSlides.length;
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
  }

  function stopRAF() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function prevSlide() {
    barProgress = 0;
    activeSlide = (activeSlide - 1 + currentSlides.length) % currentSlides.length;
    startRAF();
  }

  function nextSlide() {
    barProgress = 0;
    activeSlide = (activeSlide + 1) % currentSlides.length;
    startRAF();
  }

  /** @param {MouseEvent} e */
  function handleNavClick(e) {
    const rect = /** @type {HTMLElement} */ (e.currentTarget).getBoundingClientRect();
    if (e.clientX - rect.left < rect.width / 2) {
      prevSlide();
    } else {
      nextSlide();
    }
  }

  onMount(async () => {
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    opening = true;
    setTimeout(() => {
      if (videoEl) videoEl.play().catch(() => {});
    }, 300);
    startRAF();
  });

  onDestroy(() => {
    stopRAF();
  });

  async function handleClose() {
    stopRAF();
    closing = true;
    await new Promise(r => setTimeout(r, 870));
    closeOverlay();
  }
</script>

<div
  class="overlay-wrapper"
  class:opening
  class:closing
>
  <div class="card-glass-bg"></div>

  <button class="close-btn" onclick={handleClose} aria-label="Chiudi overlay">&times;</button>

  <div class="overlay-inner">
    <div class="grid">

      <!-- Colonna sinistra: titolo (senza riquadro) + info cards -->
      <div class="col left-col">
        <div class="main-card">
          {#if cardType === 'spacetime'}
            <h2>Spacetime<br>Slice</h2>
          {:else if cardType === 'tracker'}
            <h2>Tracker<br>Athletes</h2>
          {:else}
            <h2>Bullet<br>Timing</h2>
          {/if}
          <div class="divider"></div>
          <p class="subtitle">
            {#if cardType === 'spacetime'}
              Scomposizione gesto sportivo in fotogrammi simultanei
            {:else if cardType === 'tracker'}
              Analisi istantanea dell'azione sportiva con feedback di dati
            {:else}
              Scansione orbitale di un istante sospeso
            {/if}
          </p>
        </div>

        {#if cardType === 'spacetime'}
          <div class="card info-card info-card-double">
            <h3 class="label">Fotogrammi</h3>
            <p>In soli 15-20 secondi, il sistema crea una ricostruzione 3D dell'azione che "moltiplica" l'atleta sullo schermo: lo spettatore può così osservare stacco, rotazione e atterraggio contemporaneamente nello stesso fotogramma.</p>
            <div class="info-sep"></div>
            <h3 class="label">Esercito di Lenti</h3>
            <p>Oltre 60 telecamere senza operatore e sincronizzate al millisecondo catturano l'azione da ogni angolazione possibile.</p>
          </div>
        {:else if cardType === 'tracker'}
          <div class="card info-card info-card-double">
            <h3 class="label">X-Ray delle Performance</h3>
            <p>Velocità di punta, altezza dei salti, accelerazione e traiettorie vengono proiettate direttamente sullo schermo mentre l'azione si compie.</p>
            <div class="info-sep"></div>
            <h3 class="label">Big Data</h3>
            <p>L'AI elabora oltre 30 data-point al secondo per ogni atleta, trasformando la fatica in grafiche interattive istantanee.</p>
          </div>
        {:else if cardType === 'bullet'}
          <div class="card info-card info-card-double info-card-3d">
            <BulletCard3D />
          </div>
        {/if}
      </div>

      <!-- Colonna destra: video + nav card con slide -->
      <div class="col right-col">
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
        <div class="card nav-card" onclick={handleNavClick} role="button" tabindex="0"
          onkeydown={(e) => { if (e.key === 'ArrowLeft') prevSlide(); if (e.key === 'ArrowRight') nextSlide(); }}>
          <div class="nav-progress">
            {#each currentSlides as _, i}
              <div class="progress-line">
                <div
                  class="progress-fill"
                  style="width: {i < activeSlide ? 100 : i === activeSlide ? barProgress * 100 : 0}%"
                ></div>
              </div>
            {/each}
          </div>
          <div class="nav-content">
            <h3 class="label">{currentSlides[activeSlide].label}</h3>
            <p>{currentSlides[activeSlide].text}</p>
          </div>
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

.overlay-wrapper.opening {
  opacity: 1;
}

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
  max-height: 645px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  opacity: 0;
  transform: scale(0.97);
  transition: opacity 0.45s ease, transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.overlay-wrapper.opening .overlay-inner {
  opacity: 1;
  transform: scale(1);
}

.grid {
  display: grid;
  grid-template-columns: 0.75fr 1.25fr;
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
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.18);
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

/* Navigation card */
.nav-card {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  height: 182px;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
}

.nav-progress {
  display: flex;
  gap: 8px;
  padding: 20px 24px 0;
  flex-shrink: 0;
  margin-bottom: 6px;
}

.progress-line {
  flex: 1;
  height: 2px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 1px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  position: absolute;
  inset: 0 auto 0 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1px;
}

.nav-content {
  flex: 1;
  padding: 14px 24px 20px;
  overflow: hidden;
}

.nav-content p {
  font-size: 15px;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
  font-weight: 400;
}

/* Titolo senza riquadro */
.main-card {
  flex: 1;
  padding: 0 30px 30px 8px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background: none;
  border: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border-radius: 0;
}

.main-card h2 {
  font-family: 'Akira Expanded', 'Arial Black', sans-serif;
  font-size: clamp(40px, 5vw, 72px);
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1.05;
  margin: 0 0 20px 0;
  color: #ffffff;
}

.main-card .divider {
  height: 2px;
  background: rgba(255, 255, 255, 0.2);
  width: 60px;
  margin-bottom: 20px;
}

.subtitle {
  font-size: clamp(18px, 2vw, 28px);
  line-height: 1.45;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

.info-card {
  flex: 0 0 auto;
  padding: 22px 28px;
}


.label {
  font-family: 'Akira Expanded', 'Arial Black', sans-serif;
  font-size: 20px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #ffffff;
  margin: 0 0 12px 0;
}

.info-card p {
  font-size: 16px;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
  font-weight: 400;
}

.info-card-double {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info-sep {
  height: 1px;
  background: rgba(255, 255, 255, 0.15);
  margin: 20px 0;
}

.info-card-3d {
  padding: 0;
  overflow: hidden;
}
</style>
