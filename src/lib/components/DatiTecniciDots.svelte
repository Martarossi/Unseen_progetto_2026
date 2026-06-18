<script>
  /** @type {{
   *   visible?: boolean,
   *   ringAngle?: number,
   *   onParticleClick?: (id: string) => void
   * }} */
  let {
    visible = false,
    ringAngle = 0,
    onParticleClick = undefined,
  } = $props();

  const SECTIONS = [
    {
      id: 'guide',
      label: 'GUIDE',
      title: 'GUIDE DRONES',
      description: "Droni acrobatici FPV governati dall'Intelligenza Artificiale hanno registrato le riprese più acrobatiche. AI Drone Flight Correction permette di volare a pochi metri dagli sciatori a oltre 100 km/h, garantendo immagini stabili in condizioni climatiche estreme.",
      base: 0,
      details: [
        { label: 'PREVISIONE',    text: "Algoritmi di Machine Learning calcolano l'impatto di una folata di vento prima che sposti il mezzo, modificando la potenza dei singoli motori mantenendo l'inquadratura perfetta." },
        { label: 'TRACCIAMENTO',  text: "Il pilota si concentra sulla guida generale, mentre l'AI gestisce l'inquadratura attraverso la computer vision, agganciando l'atleta." },
        { label: 'SALVAGUARDIA',  text: "Sistemi anticollisione guidati dall'AI creano una \"bolla di sicurezza\" attorno al drone, modificando la rotta in caso di emergenza senza interrompere la fluidità del video." },
      ],
    },
    {
      id: 'enhancing',
      label: 'ENHANCING',
      title: 'ENHANCING',
      description: "L'AI elabora il flusso video della diretta alla velocità della luce, applicando correzioni istantanee e intelligenti prima che l'immagine arrivi sugli schermi degli spettatori di tutto il mondo.",
      base: 120,
      details: [
        { label: 'RISOLUZIONE',    text: "L'AI ricostruisce i dettagli mancanti pixel per pixel, ripulendo l'immagine dal \"rumore\" visivo e portando la definizione a livelli straordinari." },
        { label: 'HIGH FRAME',     text: "Lo sci alpino e il bob superano anche i 130 km/h. L'AI genera fotogrammi intermedi virtuali per fluidificare l'azione, eliminando le sfocature da movimento (motion blur)." },
        { label: 'AUDIO SPAZIALE', text: "L'IA pulisce l'audio ambientale in tempo reale, attenuando il rumore del vento ad alta quota per enfatizzare il suono dei movimenti." },
      ],
    },
    {
      id: 'highlight',
      label: 'HIGHLIGHT',
      title: 'HIGHLIGHT',
      description: "AI Highlight Detection rivoluziona il montaggio delle sintesi olimpiche, ascoltando i suoni della folla per identificare istantaneamente i momenti chiave di ogni gara.",
      base: 240,
      details: [
        { label: 'RICONOSCIMENTO', text: "L'AI impara a distinguere il rumore di fondo dal \"boato olimpico\" — il picco improvviso di decibel che si genera durante la performance di un atleta." },
        { label: 'SENTIMENTO',     text: "L'algoritmo non misura solo il volume, ma riconosce la natura del suono: un applauso ritmico nel curling o il sospiro collettivo per una caduta nello snowboard." },
        { label: 'MONTAGGIO',      text: "Non appena l'AI rileva l'emozione acustica, isola automaticamente i 15 secondi precedenti e successivi all'evento, applica le grafiche e genera un highlight pronto per il broadcast e gli smartphone dei tifosi." },
      ],
    },
  ];

  let exiting = $state(false);
  let reenter = $state(false);
  let _wasEverVisible = false;

  $effect(() => {
    if (visible) {
      reenter = _wasEverVisible;
      _wasEverVisible = true;
      exiting = false;
    } else if (_wasEverVisible) {
      reenter = false;
      exiting = true;
      const t = setTimeout(() => { exiting = false; }, 1100);
      return () => clearTimeout(t);
    }
  });

  // Dot closest to top (0°) after rotation = active section
  const activeIndex = $derived((() => {
    let best = 0, bestDist = Infinity;
    SECTIONS.forEach((s, i) => {
      const a = ((s.base + ringAngle) % 360 + 360) % 360;
      const dist = Math.min(a, 360 - a);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    return best;
  })());
</script>

<div class="dt-overlay" class:visible class:exiting class:reenter>

  <!-- Rotating dashed ring with dots -->
  <div
    class="dt-orbit-ring"
    style:--ring-angle="{ringAngle}deg"
  >
    <svg class="dt-ring-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle
        cx="50" cy="50" r="48"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        stroke-width="0.6"
        stroke-linecap="round"
        stroke-dasharray="0.01 2.8"
      />
    </svg>
    {#each SECTIONS as s, i}
      <div class="dt-arm" style="transform: rotate({s.base}deg)">
        <div class="dt-dot-group">
          <div class="dt-dot" class:active={activeIndex === i}>
            {#if activeIndex === i}
              <div class="dt-pulse"></div>
              <div class="dt-pulse dt-pulse-2"></div>
            {/if}
          </div>
          <span class="dt-label">{s.label}</span>
        </div>
      </div>
    {/each}
  </div>

  <!-- Cards row -->
  <div class="dt-cards-row">
    {#each SECTIONS as s, i}
      <button
        class="dt-card"
        class:active={activeIndex === i}
        onclick={() => onParticleClick?.(s.id)}
        aria-label="Apri sezione {s.title}"
      >
        <div class="dt-card-front">
          <h3 class="dt-card-title">{s.title}</h3>
          <p class="dt-card-desc">{s.description}</p>
        </div>
        <div class="dt-card-hover" aria-hidden="true">
          <div class="dt-hover-inner">
            <div class="dt-hover-divider"></div>
            {#each s.details as d}
              <div class="dt-detail-item">
                <h4 class="dt-detail-label">{d.label}</h4>
                <p class="dt-detail-text">{d.text}</p>
              </div>
            {/each}
          </div>
        </div>
      </button>
    {/each}
  </div>

</div>

<style>
  .dt-overlay {
    position: fixed;
    inset: 0;
    z-index: 55;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.5s ease; /* exit fade */
  }

  .dt-overlay.visible {
    opacity: 1;
    transition: none; /* entry è gestita dai figli */
  }


  /* ── EXIT ─────────────────────────────────────── */
  .dt-overlay.exiting {
    opacity: 1;
    transition: none;
    pointer-events: none;
    animation: dt-overlay-rise 0.9s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  @keyframes dt-overlay-rise {
    0%   { transform: translateY(0);    opacity: 1; }
    88%  { transform: translateY(-36px); opacity: 1; }
    100% { transform: translateY(-40px); opacity: 0; }
  }

  /* Ring esce prima */
  .dt-overlay.exiting .dt-orbit-ring {
    animation: dt-ring-exit 0.4s ease 0s forwards;
  }

  @keyframes dt-ring-exit {
    from { opacity: 1; scale: 1;    }
    to   { opacity: 0; scale: 1.07; }
  }

  /* Le 3 card escono insieme, dopo il ring */
  .dt-overlay.exiting .dt-card:nth-child(1),
  .dt-overlay.exiting .dt-card:nth-child(2),
  .dt-overlay.exiting .dt-card:nth-child(3) {
    animation: dt-card-exit 0.5s ease 0.35s forwards;
  }

  @keyframes dt-card-exit {
    from { opacity: 1; transform: scale(1)    translateY(0);   }
    to   { opacity: 0; transform: scale(0.96) translateY(-18px); }
  }

  /* ── RING ─────────────────────────────────────── */
  .dt-orbit-ring {
    position: absolute;
    top: 53%;
    left: 50%;
    width: 82vh;
    height: 82vh;
    transform: translate(-50%, -50%) rotate(var(--ring-angle, 0deg));
    will-change: transform;
    opacity: 0;
  }

  .dt-ring-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
  }


  /* Each arm fills the ring and is offset by the section's base angle.
     The ring rotates the whole element; the arm adds per-section offset. */
  .dt-arm {
    position: absolute;
    inset: 0;
  }

  .dt-dot-group {
    position: absolute;
    top: calc(2% - 11px);
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 7px;
    opacity: 0;
  }


  .dt-dot {
    position: relative;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 1.5px solid rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.1);
    transition: background 0.45s ease, border-color 0.45s ease, box-shadow 0.45s ease;
  }

  .dt-dot.active {
    background: rgba(255, 255, 255, 0.95);
    border-color: #ffffff;
    box-shadow: 0 0 18px rgba(255, 255, 255, 0.55);
  }

  .dt-pulse {
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 1.5px solid rgba(255, 255, 255, 0.55);
    animation: dt-pulse 2.6s ease-out infinite;
    pointer-events: none;
  }

  .dt-pulse-2 {
    animation-delay: -1.3s;
  }

  @keyframes dt-pulse {
    0%   { transform: scale(1);   opacity: 0.65; }
    100% { transform: scale(2.8); opacity: 0;    }
  }

  .dt-label {
    font-family: 'Akira Expanded', 'Arial Black', sans-serif;
    font-size: clamp(9px, 0.85vw, 13px);
    font-weight: 900;
    color: #ffffff;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    white-space: nowrap;
  }

  /* ── CARDS ────────────────────────────────────── */
  .dt-cards-row {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    gap: 18px;
    width: min(88vw, 1260px);
  }

  .dt-overlay.visible .dt-cards-row {
    pointer-events: none;
  }

  .dt-overlay.visible .dt-card.active {
    pointer-events: auto;
  }


  .dt-card {
    flex: 1;
    position: relative;
    background: rgba(255, 255, 255, 0.055);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 22px;
    padding: 34px 26px;
    text-align: left;
    cursor: pointer;
    transition: filter 0.55s ease, opacity 0.55s ease, border-color 0.45s ease, transform 0.45s ease;
    filter: blur(5px);
    opacity: 0.35;
    transform: scale(0.97);
    overflow: visible;
    z-index: 0;
  }

  .dt-card.active {
    filter: blur(0px);
    opacity: 1;
    border-color: rgba(255, 255, 255, 0.26);
    transform: scale(1);
  }

  .dt-card:hover {
    filter: blur(0px);
    opacity: 1;
    transform: scale(1);
    border-color: rgba(255, 255, 255, 0.26);
    z-index: 10;
  }

  /* ── card front (always visible) ── */
  .dt-card-front {
    transition: opacity 0.25s ease;
  }

  /* ── card hover (expands inline below front) ── */
  .dt-card-hover {
    display: grid;
    grid-template-rows: 0fr;
    overflow: hidden;
    transition: grid-template-rows 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .dt-hover-inner {
    min-height: 0;
    overflow: hidden;
  }

  .dt-hover-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.14);
    margin: 18px 0;
  }

  .dt-card:hover .dt-card-hover {
    grid-template-rows: 1fr;
  }

  .dt-detail-item {
    margin-bottom: 20px;
  }

  .dt-detail-item:last-child {
    margin-bottom: 0;
  }

  .dt-detail-label {
    font-family: 'Akira Expanded', 'Arial Black', sans-serif;
    font-size: clamp(11px, 1.1vw, 16px);
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #ffffff;
    margin: 0 0 8px;
    line-height: 1.15;
  }

  .dt-detail-text {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: clamp(11px, 0.92vw, 14px);
    line-height: 1.58;
    color: rgba(255, 255, 255, 0.72);
    margin: 0;
  }

  .dt-card-title {
    font-family: 'Akira Expanded', 'Arial Black', sans-serif;
    font-size: clamp(12px, 1.35vw, 20px);
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #ffffff;
    margin: 0 0 14px;
    line-height: 1.15;
  }

  .dt-card-desc {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: clamp(12px, 1.05vw, 15px);
    line-height: 1.65;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }
</style>
