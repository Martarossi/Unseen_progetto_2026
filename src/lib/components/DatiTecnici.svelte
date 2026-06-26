<script>
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import ScrollTrigger from 'gsap/dist/ScrollTrigger';

  let {
    modelPosition  = $bindable(/** @type {[number, number, number]} */ ([0, 0, 0])),
    modelScale     = $bindable(/** @type {[number, number, number]} */ ([2.0, 2.0, 2.0])),
    modelRotation  = $bindable(/** @type {[number, number, number]} */ ([0, 0, 0])),
    currentTwistX  = $bindable(80),
    currentTwistZ  = $bindable(80),
    model3dVisible  = $bindable(false),
    dotsVisible     = $bindable(false),
    dotsRingAngle   = $bindable(0),
  } = $props();

  const SECTIONS = [
    {
      id: 'guide',
      title: 'GUIDE DRONES',
      description: "Droni acrobatici FPV governati dall'Intelligenza Artificiale hanno registrato le riprese più acrobatiche. AI Drone Flight Correction permette di volare a pochi metri dagli sciatori a oltre 100 km/h, garantendo immagini stabili in condizioni climatiche estreme.",
      details: [
        { label: 'PREVISIONE',   text: "Algoritmi di Machine Learning calcolano l'impatto di una folata di vento prima che sposti il mezzo, modificando la potenza dei singoli motori mantenendo l'inquadratura perfetta." },
        { label: 'TRACCIAMENTO', text: "Il pilota si concentra sulla guida generale, mentre l'AI gestisce l'inquadratura attraverso la computer vision, agganciando l'atleta." },
        { label: 'SALVAGUARDIA', text: "Sistemi anticollisione guidati dall'AI creano una \"bolla di sicurezza\" attorno al drone, modificando la rotta in caso di emergenza senza interrompere la fluidità del video." },
      ],
    },
    {
      id: 'enhancing',
      title: 'ENHANCING',
      description: "L'AI elabora il flusso video della diretta alla velocità della luce, applicando correzioni istantanee e intelligenti prima che l'immagine arrivi sugli schermi degli spettatori di tutto il mondo.",
      details: [
        { label: 'RISOLUZIONE',    text: "L'AI ricostruisce i dettagli mancanti pixel per pixel, ripulendo l'immagine dal \"rumore\" visivo e portando la definizione a livelli straordinari." },
        { label: 'HIGH FRAME',     text: "Lo sci alpino e il bob superano anche i 130 km/h. L'AI genera fotogrammi intermedi virtuali per fluidificare l'azione, eliminando le sfocature da movimento (motion blur)." },
        { label: 'AUDIO SPAZIALE', text: "L'IA pulisce l'audio ambientale in tempo reale, attenuando il rumore del vento ad alta quota per enfatizzare il suono dei movimenti." },
      ],
    },
    {
      id: 'highlight',
      title: 'HIGHLIGHT',
      description: "AI Highlight Detection rivoluziona il montaggio delle sintesi olimpiche, ascoltando i suoni della folla per identificare istantaneamente i momenti chiave di ogni gara.",
      details: [
        { label: 'RICONOSCIMENTO', text: "L'AI impara a distinguere il rumore di fondo dal \"boato olimpico\" — il picco improvviso di decibel che si genera durante la performance di un atleta." },
        { label: 'SENTIMENTO',     text: "L'algoritmo non misura solo il volume, ma riconosce la natura del suono: un applauso ritmico nel curling o il sospiro collettivo per una caduta nello snowboard." },
        { label: 'MONTAGGIO',      text: "Non appena l'AI rileva l'emozione acustica, isola automaticamente i 15 secondi precedenti e successivi all'evento, applica le grafiche e genera un highlight pronto per il broadcast e gli smartphone dei tifosi." },
      ],
    },
  ];

  // 3 card + 2 trail = 5 sezioni da 100svh → colonna 500svh, scrolla di 400svh
  const TOTAL_PAGES = SECTIONS.length * 2 - 1; // 5

  /** @type {HTMLElement | null} */
  let scrollWrapper = null;
  /** @type {HTMLElement | null} */
  let sectionEl = null;
  /** @type {HTMLElement | null} */
  let mobileSectionEl = null;
  /** @type {HTMLElement | null} */
  let mobileColumn = null;

  const modelProps = {
    scale: 2.0,
    posY: 0,
    rotX: Math.PI * 5.5,
    rotY: Math.PI * 9.0,
    rotZ: Math.PI * 5.5,
    twistX: 155,
    twistZ: 175,
  };

  const displayState = {
    scale: 2.2,
    rotX: Math.PI * 6.0,
    rotY: Math.PI * 10.0,
    rotZ: Math.PI * 6.0,
    twistX: 72,
    twistZ: 72,
  };

  onMount(() => {
    const mm = gsap.matchMedia();

    mm.add('(min-width: 800px)', () => {
      const update3D = () => {
        modelPosition = [0, 0, 0];
        modelScale    = [modelProps.scale, modelProps.scale, modelProps.scale];
        modelRotation = [modelProps.rotX, modelProps.rotY, modelProps.rotZ];
        currentTwistX = modelProps.twistX;
        currentTwistZ = modelProps.twistZ;
      };

      const ringProps = { angle: 0 };
      const updateRing = () => { dotsRingAngle = ringProps.angle; };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollWrapper,
          start: 'top top',
          end: '+=4500',
          scrub: 0.5,
          onEnter:     () => { model3dVisible = true;  dotsVisible = true;  },
          onLeave:     () => { dotsVisible = false; },
          onEnterBack: () => { model3dVisible = true;  dotsVisible = true;  },
          onLeaveBack: () => { model3dVisible = false; dotsVisible = false; },
        },
      });

      tl.fromTo('.dt-orbit-ring', { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'none' }, 0);
      tl.fromTo('.dt-dot-group',  { opacity: 0 }, { opacity: 1, duration: 0.25, stagger: 0.07, ease: 'none' }, 0.3);
      tl.fromTo('.dt-cards-row',  { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'none' }, 0.7);

      tl.to(modelProps, { ...displayState, duration: 1.0, ease: 'none', onUpdate: update3D }, 0);
      tl.to({}, { duration: 0.5 }, 1.0);
      tl.to(ringProps, { angle: 120, duration: 1.0, ease: 'none', onUpdate: updateRing }, 1.5);
      tl.to({}, { duration: 0.5 }, 2.5);
      tl.to(ringProps, { angle: 240, duration: 1.0, ease: 'none', onUpdate: updateRing }, 3.0);
      tl.to({}, { duration: 0.5 }, 4.0);

      return () => { tl.kill(); };
    });

    mm.add('(max-width: 799px)', () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: mobileSectionEl,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
          onEnter: () => {
            model3dVisible = true;
            modelScale    = [4.5, 4.5, 4.5];
            modelPosition = [0, 0, 0];
          },
          onEnterBack: () => {
            model3dVisible = true;
            modelScale    = [4.5, 4.5, 4.5];
            modelPosition = [0, 0, 0];
          },
          onLeaveBack: () => { model3dVisible = false; },
        },
      });

      // Sposta la colonna esattamente dell'altezza eccedente (colonna - viewport)
      tl.to(mobileColumn, {
        y: () => -(mobileColumn.scrollHeight - window.innerHeight),
        ease: 'none',
        duration: 1,
        invalidateOnRefresh: true,
      });

      return () => { tl.kill(); };
    });
  });
</script>

<!-- Desktop: scroll wrapper con sezione sticky -->
<div class="dt-scroll-wrapper" bind:this={scrollWrapper}>
  <section class="dt-section" bind:this={sectionEl}></section>
</div>

<!-- Mobile: colonna unica (card → trail → card → trail → card) animata da GSAP -->
<div class="dt-mobile-wrapper" bind:this={mobileSectionEl}>
  <div class="dt-mobile-sticky">
    <div class="dt-mobile-column" bind:this={mobileColumn}>
      {#each SECTIONS as section, i}
        <!-- Sezione card: filler con dot sopra + contenuto + filler con dot sotto -->
        <div class="dt-mobile-unit">
          <!-- Filler sopra: dot solo per card non-prima -->
          <div class="dt-unit-filler">
            {#if i > 0}
              {#each Array(5) as _}
                <div class="dt-unit-trail-dot"></div>
              {/each}
            {/if}
          </div>

          <!-- Contenuto centrato: pallino + etichetta + card -->
          <div class="dt-unit-content">
            <div class="dt-unit-node">
              <div class="dt-unit-dot">
                <div class="dt-mobile-pulse"></div>
                <div class="dt-mobile-pulse dt-mobile-pulse-2"></div>
              </div>
              <span class="dt-unit-label">{section.id.toUpperCase()}</span>
            </div>
            <div class="dt-mobile-card">
              <h3 class="dt-mobile-title">{section.title}</h3>
              <p class="dt-mobile-desc">{section.description}</p>
            </div>
          </div>

          <!-- Filler sotto: dot solo per card non-ultima -->
          <div class="dt-unit-filler">
            {#if i < SECTIONS.length - 1}
              {#each Array(5) as _}
                <div class="dt-unit-trail-dot"></div>
              {/each}
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .dt-scroll-wrapper {
    position: relative;
  }

  @media (min-width: 800px) {
    .dt-scroll-wrapper {
      height: 5500px;
    }

    .dt-section {
      position: sticky;
      top: 0;
      height: 100vh;
      width: 100%;
    }
  }

  @media (max-width: 799px) {
    .dt-scroll-wrapper {
      display: none;
    }
  }

  /* ── MOBILE ─────────────────────────────── */
  .dt-mobile-wrapper {
    display: none;
  }

  @media (max-width: 799px) {
    /* 3 card (70svh) = 210svh */
    .dt-mobile-wrapper {
      display: block;
      position: relative;
      height: 210svh;
    }

    .dt-mobile-sticky {
      position: sticky;
      top: 0;
      height: 100svh;
      width: 100%;
      overflow: hidden;
    }

    /* Colonna verticale: GSAP la anima verso l'alto */
    .dt-mobile-column {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      will-change: transform;
    }

    /* ── Sezione card: filler (dot) — contenuto — filler (dot) ── */
    .dt-mobile-unit {
      height: 70svh;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 20px;
      box-sizing: border-box;
      flex-shrink: 0;
    }

    /* Filler flex:1 — distribuisce i dot con space-between dal bordo al contenuto */
    .dt-unit-filler {
      flex: 1;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 10px 0;
      box-sizing: border-box;
    }

    /* Wrapper del contenuto centrato (pallino + etichetta + card) */
    .dt-unit-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      width: 100%;
    }

    .dt-unit-node {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .dt-unit-dot {
      position: relative;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.95);
      border: 1.5px solid #ffffff;
      box-shadow: 0 0 18px rgba(255, 255, 255, 0.55);
      flex-shrink: 0;
    }

    .dt-unit-label {
      font-family: 'Akira Expanded', 'Arial Black', sans-serif;
      font-size: 14px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: 0.12em;
      white-space: nowrap;
    }

    /* Pulse rings */
    .dt-mobile-pulse {
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 1.5px solid rgba(255, 255, 255, 0.55);
      animation: dt-mobile-pulse-anim 2.6s ease-out infinite;
      pointer-events: none;
    }

    .dt-mobile-pulse-2 {
      animation-delay: -1.3s;
    }

    @keyframes dt-mobile-pulse-anim {
      0%   { transform: scale(1);   opacity: 0.65; }
      100% { transform: scale(2.8); opacity: 0;    }
    }

    /* ── Card ── */
    .dt-mobile-card {
      width: 100%;
      background: rgba(255, 255, 255, 0.07);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      padding: 24px 22px;
      box-sizing: border-box;
      text-align: left;
    }

    .dt-mobile-title {
      font-family: 'Akira Expanded', 'Arial Black', sans-serif;
      font-size: 18px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #ffffff;
      margin: 0 0 14px;
      line-height: 1.2;
    }

    .dt-mobile-desc {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 16px;
      line-height: 1.65;
      color: rgba(255, 255, 255, 0.75);
      margin: 0;
    }

    .dt-unit-trail-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.35);
      flex-shrink: 0;
    }
  }
</style>
