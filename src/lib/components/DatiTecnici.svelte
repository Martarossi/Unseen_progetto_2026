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

  /** @type {HTMLElement | null} */
  let scrollWrapper = null;
  /** @type {HTMLElement | null} */
  let sectionEl = null;
  /** @type {HTMLElement | null} */
  let mobileSectionEl = null;
  /** @type {(HTMLElement | null)[]} */
  let mobileCardEls = [];

  let expandedIndex = $state(-1);

  const modelProps = {
    scale: 2.0,
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
      modelProps.scale = 4.5; // continua da dove Stats/Intro ha lasciato il modello

      const validMobileCards = /** @type {HTMLElement[]} */ (mobileCardEls.filter(Boolean));
      gsap.set(validMobileCards, { opacity: 0, y: 30 });

      // Scale-down del modello mentre la sezione entra nel viewport
      const scaleTl = gsap.timeline({
        scrollTrigger: {
          trigger: mobileSectionEl,
          start: 'top 90%',
          end: 'top 40%',
          scrub: 0.8,
          onEnter:     () => { model3dVisible = true; },
          onEnterBack: () => { model3dVisible = true; },
          onLeaveBack: () => { model3dVisible = false; },
        },
      });

      scaleTl.to(modelProps, {
        scale: 2.0,
        duration: 1.0,
        ease: 'none',
        onUpdate: () => {
          modelScale = [modelProps.scale, modelProps.scale, modelProps.scale];
        },
      });

      // Reveal delle card con dissolvenza + movimento Y
      const cardReveal = ScrollTrigger.create({
        trigger: mobileSectionEl,
        start: 'top 65%',
        onEnter: () => {
          gsap.to(validMobileCards, {
            opacity: 1, y: 0,
            duration: 0.7, stagger: 0.2, ease: 'power2.out',
          });
        },
        onLeaveBack: () => {
          gsap.set(validMobileCards, { opacity: 0, y: 30 });
        },
      });

      return () => {
        scaleTl.kill();
        cardReveal.kill();
        gsap.set(validMobileCards, { clearProps: 'all' });
      };
    });
  });
</script>

<!-- Desktop: scroll wrapper con sezione sticky -->
<div class="dt-scroll-wrapper" bind:this={scrollWrapper}>
  <section class="dt-section" bind:this={sectionEl}></section>
</div>

<!-- Mobile: 3 card verticali con accordion -->
<div class="dt-mobile-section" bind:this={mobileSectionEl}>
  {#each SECTIONS as section, i}
    <div class="dt-mobile-card" bind:this={mobileCardEls[i]}>
      <h3 class="dt-mobile-title">{section.title}</h3>
      <p class="dt-mobile-desc">{section.description}</p>
      <div class="dt-mobile-expand-area" class:open={expandedIndex === i}>
        <div class="dt-mobile-expand-inner">
          <div class="dt-mobile-divider"></div>
          {#each section.details as d}
            <div class="dt-mobile-detail">
              <h4 class="dt-mobile-detail-label">{d.label}</h4>
              <p class="dt-mobile-detail-text">{d.text}</p>
            </div>
          {/each}
        </div>
      </div>
      <button
        class="dt-mobile-expand-btn"
        onclick={() => { expandedIndex = expandedIndex === i ? -1 : i; }}
      >
        {expandedIndex === i ? 'CHIUDI ↑' : 'CLICK TO EXPAND ↓'}
      </button>
    </div>
  {/each}
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

  /* ── MOBILE CARDS ─────────────────────────────── */
  .dt-mobile-section {
    display: none;
  }

  @media (max-width: 799px) {
    .dt-mobile-section {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 0 16px 40px;
      width: 100%;
      box-sizing: border-box;
    }

    .dt-mobile-card {
      background: rgba(255, 255, 255, 0.07);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      padding: 26px 20px 0;
      color: #ffffff;
    }

    .dt-mobile-title {
      font-family: 'Akira Expanded', 'Arial Black', sans-serif;
      font-size: 15px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #ffffff;
      margin: 0 0 12px;
      line-height: 1.2;
    }

    .dt-mobile-desc {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 13px;
      line-height: 1.65;
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
    }

    .dt-mobile-expand-area {
      display: grid;
      grid-template-rows: 0fr;
      overflow: hidden;
      transition: grid-template-rows 0.45s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .dt-mobile-expand-area.open {
      grid-template-rows: 1fr;
    }

    .dt-mobile-expand-inner {
      min-height: 0;
      overflow: hidden;
    }

    .dt-mobile-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.14);
      margin: 18px 0;
    }

    .dt-mobile-detail {
      margin-bottom: 16px;
    }

    .dt-mobile-detail:last-child {
      margin-bottom: 0;
    }

    .dt-mobile-detail-label {
      font-family: 'Akira Expanded', 'Arial Black', sans-serif;
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #ffffff;
      margin: 0 0 6px;
      line-height: 1.2;
    }

    .dt-mobile-detail-text {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.65);
      margin: 0;
    }

    .dt-mobile-expand-btn {
      display: block;
      width: 100%;
      margin-top: 18px;
      padding: 12px 0;
      background: none;
      border: none;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
      color: rgba(255, 255, 255, 0.45);
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 10px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      cursor: pointer;
      text-align: center;
    }
  }
</style>
