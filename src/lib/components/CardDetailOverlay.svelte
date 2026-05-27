<script>
  import { onMount } from 'svelte';

  /** @type {{ closeOverlay: () => void, videoSrc?: string }} */
  let { closeOverlay, videoSrc = '' } = $props();

  let opening = $state(false);
  let closing = $state(false);
  /** @type {HTMLVideoElement|null} */
  let videoEl = $state(null);
  let activeSlide = $state(0);

  const cardType = $derived(
    videoSrc.includes('tracker') ? 'tracker' :
    (videoSrc.includes('Bullet') || videoSrc.includes('bullet')) ? 'bullet' :
    'spacetime'
  );

  /** @type {Record<string, Array<{label: string, text: string}>>} */
  const allSlides = {
    spacetime: [
      { label: 'Segmentazione', text: "L'IA identifica e ritaglia la sagoma dell'atleta in diverse fasi del salto." },
      { label: 'Scomposizione', text: "L'AI divide l'azione in \"fette temporali\" significative (ad esempio, ogni mezzo secondo di volo)." },
      { label: 'Fusione', text: "L'IA sovrappone queste fette su un unico sfondo 3D fluido, creando un'immagine dove passato e presente convivono." },
      { label: 'Performance', text: "Lo Spacetime Slices è stato utilizzato per discipline come salto con gli sci, snowboard e pattinaggio perché presentano movimenti ad alta dinamicità in cui l'occhio umano fatica a percepire i dettagli tecnici." }
    ],
    tracker: [
      { label: 'Identità in Movimento', text: "Grazie alla Computer Vision, il sistema riconosce e segue ogni singolo atleta senza bisogno di sensori fisici." },
      { label: 'Zero Ingombro', text: "Nessun chip o sensore addosso. L'AI riconosce oltre 20 punti biomeccanici del corpo umano solo attraverso le immagini video." },
      { label: 'Precisione Millimetrica', text: "L'AI monitora la velocità in tempo reale con uno scarto inferiore ai 5 cm/s e calcola l'altezza dei salti con una precisione chirurgica." },
      { label: 'Performance', text: "Il Tracker Athletes è stato utilizzato per discipline come salto con gli sci, snowboard, pattinaggio, bob, skeleton, hockey e curling trasformando gli atleti in una sorgente vivente di dati in tempo reale." }
    ],
    bullet: [
      { label: '360°', text: "L'AI permette di congelare il tempo nel momento di massima tensione sportiva e ruotare l'inquadratura a 360° attorno all'atleta per vedere ogni dettaglio." },
      { label: 'Fluidità', text: "L'IA genera fino a 50 fotogrammi sintetici tra uno scatto reale e l'altro, garantendo una fluidità visiva che l'occhio umano percepisce come perfezione assoluta." },
      { label: 'Flusso Dati', text: "Ogni sessione di Replay 360° muove una larghezza di banda che supera i 10 Gbps, gestita interamente su infrastrutture 5G dedicate." },
      { label: 'Performance', text: "Il Bullet Timing è stato implementato in 17 discipline, tra le quali sci freestyle, skating, snowboard, ski cross, bobsleigh, speed skating, skeleton, hockey e curling." }
    ]
  };

  const currentSlides = $derived(allSlides[cardType] ?? allSlides['spacetime']);

  function prevSlide() {
    activeSlide = (activeSlide - 1 + currentSlides.length) % currentSlides.length;
  }

  function nextSlide() {
    activeSlide = (activeSlide + 1) % currentSlides.length;
  }

  onMount(async () => {
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    opening = true;
    setTimeout(() => {
      if (videoEl) videoEl.play().catch(() => {});
    }, 300);
  });

  async function handleClose() {
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
              Analisi istantanea dell'azione sportiva
            {:else}
              Scansione orbitale di un istante sospeso
            {/if}
          </p>
        </div>

        {#if cardType === 'spacetime'}
          <div class="card info-card">
            <h3 class="label">L'Esercito di Lenti</h3>
            <p>Oltre 60 telecamere 4K sincronizzate al millisecondo catturano l'azione da ogni angolazione possibile.</p>
          </div>
          <div class="card info-card">
            <h3 class="label">Velocità Record</h3>
            <p>In soli 15-20 secondi, il sistema crea una ricostruzione 3D dell'azione, rendendo il replay disponibile quasi in tempo reale per il commento tecnico in diretta e per la diretta TV.</p>
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
        {:else if cardType === 'bullet'}
          <div class="card figure-card">
            <img src="/bullet_timing_figure.png" alt="3D athlete figure" class="figure-img" />
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
        <div class="card nav-card">
          <button class="nav-arrow" onclick={prevSlide} aria-label="Precedente">&#8249;</button>
          <div class="nav-content">
            <h3 class="label">{currentSlides[activeSlide].label}</h3>
            <p>{currentSlides[activeSlide].text}</p>
          </div>
          <button class="nav-arrow" onclick={nextSlide} aria-label="Successivo">&#8250;</button>
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
  align-items: center;
  height: 182px;
  overflow: hidden;
}

.nav-arrow {
  flex: 0 0 auto;
  align-self: stretch;
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 36px;
  line-height: 1;
  cursor: pointer;
  padding: 0 22px;
  transition: color 0.2s;
}

.nav-arrow:hover {
  color: rgba(255, 255, 255, 0.95);
}

.nav-content {
  flex: 1;
  padding: 24px 0;
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
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background: none;
  border: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border-radius: 0;
  padding-left: 8px;
}

.main-card h2 {
  font-family: 'Akira Expanded', 'Arial Black', sans-serif;
  font-size: clamp(28px, 3vw, 44px);
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1.1;
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
  font-size: 17px;
  line-height: 1.45;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

.info-card {
  flex: 0 0 auto;
  padding: 22px 28px;
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

.info-card p {
  font-size: 16px;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
  font-weight: 400;
}
</style>
