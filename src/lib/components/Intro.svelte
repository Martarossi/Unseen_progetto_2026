<script>
  import { onMount } from "svelte";
  import gsap from "gsap";
  import ScrollTrigger from "gsap/dist/ScrollTrigger";
  import { Canvas } from "@threlte/core";
  import Scene from "./Scene.svelte";

  let { isClicked = false } = $props();

  /** @type {HTMLElement|null} */
  let introContainer = null;
  /** @type {HTMLElement|null} */
  let textImage = null;
  /** @type {HTMLElement|null} */
  let p1 = null;
  /** @type {HTMLElement|null} */
  let p2 = null;
  /** @type {HTMLElement|null} */
  let bigText = null;

  // PROPRIETÀ TRIDIMENSIONALI: Variabili di stato reattive di Svelte 5 che controllano la posizione, la scala e la rotazione del modello 3D.
  /** @type {[number, number, number]} */
  let modelPosition = $state([0, 0, 0]);
  /** @type {[number, number, number]} */
  let modelScale = $state([1.5, 1.5, 1.5]);
  /** @type {[number, number, number]} */
  let modelRotation = $state([0, 0, 0]);
  let currentTwistX = $state(360);
  let currentTwistZ = $state(200);

  // Controlla la visibilità del canvas: diventa true solo quando l'intro entra nel viewport
  let canvasVisible = $state(false);

  // OGGETTO DI SUPPORTO GSAP: Contiene i valori intermedi che GSAP anima in modo fluido durante lo scrolling e che vengono poi mappati sullo stato 3D.
  const modelProps = {
    posX: 0,
    posY: 0,
    posZ: 0,
    scale: 1.5,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    twistX: 360,
    twistZ: 200,
  };

  // CARD ORBIT PROPS: Mutato direttamente da GSAP; Scene.svelte lo legge ogni
  // frame in useTask senza passare per la reattività Svelte (zero overhead).
  const cardProps = { opacity: 0, groupRotY: 0, riseY: 0 };

  onMount(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 800px)", () => {
      // TIMELINE GSAP CON PINNING: Fissa la sezione intro sullo schermo per 5000px di scorrimento, pilotando la narrazione e la rotazione del modello.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: introContainer,
          start: "top top",
          end: "+=20000",
          scrub: 2.8,
          pin: true,
          onEnter: () => { canvasVisible = true; },
          onLeaveBack: () => { canvasVisible = false; },
        },
      });

      // SINCRONIZZAZIONE STATO 3D: Aggiorna reattivamente le variabili tridimensionali di Svelte basandosi sui valori correnti dell'oggetto animato da GSAP.
      const update3D = () => {
        modelPosition = [modelProps.posX, modelProps.posY, modelProps.posZ];
        modelScale = [modelProps.scale, modelProps.scale, modelProps.scale];
        modelRotation = [modelProps.rotX, modelProps.rotY, modelProps.rotZ];
        currentTwistX = modelProps.twistX;
        currentTwistZ = modelProps.twistZ;

      };

      // --- FASE 1: Dissolvenza completa dell'immagine testuale centrale "non tutto ciò che conta è visibile" con traslazione e sfocatura progressiva ---
      tl.to(
        textImage,
        {
          opacity: 0,
          y: -80,
          filter: "blur(15px)",
          duration: 1.5,
          ease: "power2.inOut",
        },
        0,
      );

      tl.to(
        modelProps,
        {
          posY: 1.5,
          duration: 1.5,
          ease: "power2.inOut",
          onUpdate: update3D,
        },
        0,
      );

      // --- FASE 2: Spostamento del modello 3D sulla destra ed avvio della rotazione orbitale tridimensionale simultanea su X, Y e Z ---
      tl.to(
        modelProps,
        {
          posX: 3.2,
          posY: 0,
          scale: 2.4,
          rotX: Math.PI * 0.4, // Rotation in X
          rotY: Math.PI * 0.7, // Rotation in Y
          rotZ: Math.PI * 0.3, // Rotation in Z
          duration: 2.0,
          ease: "power2.inOut",
          onUpdate: update3D,
        },
        1.0,
      );

      // --- FASE 3: Comparsa a sinistra del primo paragrafo appena il modello raggiunge la destra ---
      tl.to(
        p1,
        {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          pointerEvents: "auto",
          duration: 1.5,
          ease: "power2.out",
        },
        2.5,
      );

      tl.to(
        modelProps,
        {
          rotX: Math.PI * 0.7,
          rotY: Math.PI * 1.3,
          rotZ: Math.PI * 0.6,
          duration: 1.5,
          ease: "power1.inOut",
          onUpdate: update3D,
        },
        2.5,
      );

      // --- FASE 4: Pausa statica di lettura in cui il primo paragrafo rimane pienamente nitido e leggibile ---
      tl.to({}, { duration: 1.0 });

      // --- FASE 5: Dissolvenza/sfocatura del primo paragrafo e contemporanea comparsa del secondo paragrafo, mentre il modello compie l'ultima rotazione ---
      tl.to(
        p1,
        {
          opacity: 0.3,
          filter: "blur(5px)",
          pointerEvents: "none",
          duration: 1.5,
          ease: "power2.inOut",
        },
        5.0,
      );

      tl.to(
        p2,
        {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          pointerEvents: "auto",
          duration: 1.5,
          ease: "power2.inOut",
        },
        5.0,
      );

      tl.to(
        modelProps,
        {
          rotX: Math.PI * 1.2,
          rotY: Math.PI * 2.0,
          rotZ: Math.PI * 1.1,
          duration: 1.5,
          ease: "power2.inOut",
          onUpdate: update3D,
        },
        5.0,
      );

      // --- FASE 7: Pausa finale di lettura sul secondo paragrafo prima dello sblocco definitivo dello scroll della sezione ---
      tl.to({}, { duration: 1.2 });

      // ANIME TWIST SCROLL: Distorsione Twist X e Z sincronizzata con lo scorrimento complessivo (durata totale 8.9s)
      tl.to(
        modelProps,
        {
          twistX: 45.9,
          twistZ: 270,
          duration: 2.197,
          ease: "power2.inOut",
          onUpdate: update3D,
        },
        0
      );

      tl.to(
        modelProps,
        {
          twistX: -360,
          twistZ: 360,
          duration: 2.607,
          ease: "power2.inOut",
          onUpdate: update3D,
        },
        2.197
      );

      tl.to(
        modelProps,
        {
          twistX: 43.7,
          twistZ: 270,
          duration: 2.234,
          ease: "power2.inOut",
          onUpdate: update3D,
        },
        4.804
      );

      tl.to(
        modelProps,
        {
          twistX: 360,
          twistZ: 200,
          duration: 1.862,
          ease: "power2.inOut",
          onUpdate: update3D,
        },
        7.038
      );

      // --- FASE 8: Uscita paragrafi verso l'alto e ritorno del modello al centro dello schermo ---
      tl.to(
        p1,
        {
          opacity: 0,
          y: -200,
          filter: "blur(22px)",
          duration: 2.0,
          ease: "power2.in",
        },
        8.9,
      );

      tl.to(
        p2,
        {
          opacity: 0,
          y: -200,
          filter: "blur(22px)",
          duration: 2.0,
          ease: "power2.in",
        },
        9.2,
      );

      tl.to(
        modelProps,
        {
          posX: 0,
          posY: 0,
          scale: 2.0,
          rotX: Math.PI * 2.0,
          rotY: Math.PI * 3.0,
          rotZ: Math.PI * 1.8,
          duration: 1.0,
          ease: "power2.inOut",
          onUpdate: update3D,
        },
        8.9,
      );

      // --- FASE 9: Testo full-screen sale dal basso insieme allo scroll (lineare, senza easing) ---
      tl.fromTo(
        bigText,
        { yPercent: 100, opacity: 1 },
        {
          yPercent: -50,
          opacity: 1,
          duration: 2.0,
          ease: "none",
          immediateRender: false,
        },
        9.9,
      );

      // MODELLO 3D DURANTE TESTO: rotazione e deformazione continua mentre il testo scorre
      tl.to(
        modelProps,
        {
          rotX: Math.PI * 2.6,
          rotY: Math.PI * 4.0,
          rotZ: Math.PI * 2.3,
          scale: 1.8,
          twistX: 120,
          twistZ: 320,
          duration: 2.0,
          ease: "none",
          onUpdate: update3D,
        },
        9.9,
      );

      // --- FASE 10: Pausa di lettura sul testo full-screen ---
      tl.to({}, { duration: 1.3 });

      // ── FASE 11: Big-text esce verso l'alto mentre il modello si stabilizza ──
      // Il testo scorre via in anticipo così la scena è pulita per le card.
      tl.to(
        bigText,
        {
          opacity: 0,
          y: -80,
          duration: 0.9,
          ease: "power2.in",
        },
        13.0,
      );

      tl.to(
        modelProps,
        {
          twistX: 0,
          twistZ: 0,
          rotX: 0,
          rotZ: 0,
          rotY: Math.PI * 5.2,
          scale: 2.2,
          duration: 1.8,
          ease: "power2.inOut",
          onUpdate: update3D,
        },
        13.0,
      );

      // ── FASE 12: Card model entra in scena (fade-in + scale) ──
      tl.to(
        cardProps,
        {
          opacity: 1,
          duration: 1.5,
          ease: "power2.out",
        },
        14.2,
      );

      // ── FASE 13: Orbita completa → stop al centro frontale ──
      // groupRotY: 0 → 2π = un giro completo, decelera fino a fermarsi
      // frontalmente al modello 3D centrale (power2.out = partenza veloce, stop morbido).
      tl.to(
        cardProps,
        {
          groupRotY: Math.PI * 2,
          duration: 4.5,
          ease: "power2.out",
        },
        15.2,
      );

      // Modello 3D continua a distorcersi durante l'orbita
      tl.to(
        modelProps,
        {
          twistX: -210,
          twistZ: 430,
          duration: 2.2,
          ease: "power2.inOut",
          onUpdate: update3D,
        },
        15.2,
      );

      tl.to(
        modelProps,
        {
          twistX: 170,
          twistZ: -260,
          duration: 2.3,
          ease: "power2.inOut",
          onUpdate: update3D,
        },
        17.4,
      );

      // Pausa finale
      tl.to({}, { duration: 0.5 });

      return () => {
        tl.kill();
      };
    });
  });
</script>

<div class="intro-container" bind:this={introContainer}>
  <!-- CANVAS 3D DI THRELTE: Rendering in background dell'ambiente WebGL contenente la camera, le luci e il modello 3D interattivo -->
  <div class="canvas-wrapper" class:visible={canvasVisible}>
    {#if isClicked}
      <Canvas
        rendererParameters={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        <Scene
          position={modelPosition}
          scale={modelScale}
          rotation={modelRotation}
          twistX={currentTwistX}
          twistZ={currentTwistZ}
          {cardProps}
        />
      </Canvas>
    {/if}
  </div>

  <!-- ELEMENTI TESTUALI E INFOGRAFICA (OVERLAY HTML): Gestisce l'immagine di benvenuto e i testi narrativi disposti a cascata sulla sinistra -->
  <div class="overlay">
    <!-- IMMAGINE TESTUALE DI TAGLINE: L'immagine iniziale centrata che esprime il concetto cardine del progetto -->
    <div class="initial-text-wrapper" bind:this={textImage}>
      <img
        src="/nontuttociòcheconta.png"
        alt="Non tutto ciò che conta è visibile"
      />
    </div>

    <!-- PARAGRAFI IMPILATI A SINISTRA: Contenitore verticale per i blocchi di testo sequenziali che compaiono con transizioni sfocate alternate -->
    <div class="texts-container">
      <div class="paragraph-wrapper" bind:this={p1}>
        <p>
          Per la prima volta nella storia, le <span class="highlight"
            >Olimpiadi di Milano-Cortina 2026</span
          >
          ridefiniscono l'esperienza olimpica attraverso un'<span
            class="highlight">anima digitale</span
          >
          che trasforma la visione in immersione.
        </p>
      </div>

      <div class="paragraph-wrapper" bind:this={p2}>
        <p>
          Ogni evento olimpico è costruito su ciò che vediamo:<br />
          <span class="highlight">velocità, performance, emozione.</span><br />
          Ma dietro ogni immagine esiste un
          <span class="highlight">sistema invisibile</span><br />
          fatto di
          <span class="highlight">dati, connessioni e tecnologia.</span>
        </p>
      </div>
    </div>

    <!-- TESTO FULL-SCREEN: Comparsa grande dopo l'uscita dei paragrafi -->
    <div class="big-text" bind:this={bigText}>
      Scopri la tecnologia che sta scrivendo il futuro dello sport
    </div>
  </div>
</div>

<style>
  .intro-container {
    width: 100vw;
    height: 100vh;
    position: relative;
    background-color: transparent; /* Transparent so the home parallax background shows */
    overflow: hidden;
    margin-top: -35vh; /* Shift Intro up to bring sections closer on scroll */
    pointer-events: none; /* Allow clicks to pass through to Hero underneath */
  }

  .canvas-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 3;
    pointer-events: none;
    opacity: 0;
  }

  .canvas-wrapper.visible {
    opacity: 1;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    box-sizing: border-box;
    padding: var(--spacing-9, 40px) var(--spacing-11, 80px);
  }

  /* Testo full-screen finale */
  .big-text {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    box-sizing: border-box;
    padding: 0 80px;
    font-family: "Akira Expanded", sans-serif;
    font-weight: 900;
    font-size: 10vw;
    text-transform: uppercase;
    line-height: 0.88;
    letter-spacing: -0.03em;
    color: #1a1a1a;
    opacity: 0;
    pointer-events: none;
    z-index: 1;
    will-change: opacity, transform;
  }

  /* Centered Text Image in first slide */
  .initial-text-wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60%;
    max-width: 800px;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
  }

  .initial-text-wrapper img {
    width: 100%;
    height: auto;
    object-fit: contain;
  }

  /* Vertical Stack layout for subsequent paragraphs */
  .texts-container {
    position: absolute;
    top: 50%;
    left: 10%;
    transform: translateY(-50%);
    width: 45%;
    display: flex;
    flex-direction: column;
    gap: 3.5rem; /* Gap between stacked paragraphs */
    z-index: 20;
    pointer-events: auto; /* enable interactions if needed */
  }

  .paragraph-wrapper {
    font-family: "Helvetica", "Arial", sans-serif;
    font-size: 1.7rem;
    line-height: 1.45;
    color: #1a1a1a;
    will-change: opacity, filter, transform;
    opacity: 0;
    transform: translateY(30px);
    filter: blur(10px);
    pointer-events: none;
  }

  .paragraph-wrapper p {
    margin: 0;
  }

  .highlight {
    color: #436d80; /* Elegant blue/grey highlight color matching the storyboard */
    font-weight: 500;
  }
</style>
