<script>
  import { onMount } from "svelte";
  import gsap from "gsap";
  import ScrollTrigger from "gsap/dist/ScrollTrigger";
  import { Canvas } from "@threlte/core";
  import Scene from "./Scene.svelte";

  /** @type {HTMLElement|null} */
  let introContainer = null;
  /** @type {HTMLElement|null} */
  let textImage = null;
  /** @type {HTMLElement|null} */
  let p1 = null;
  /** @type {HTMLElement|null} */
  let p2 = null;

  // PROPRIETÀ TRIDIMENSIONALI: Variabili di stato reattive di Svelte 5 che controllano la posizione, la scala e la rotazione del modello 3D.
  /** @type {[number, number, number]} */
  let modelPosition = $state([0, 0, 0]);
  /** @type {[number, number, number]} */
  let modelScale = $state([2.3, 2.3, 2.3]);
  /** @type {[number, number, number]} */
  let modelRotation = $state([0, 0, 0]);

  // OGGETTO DI SUPPORTO GSAP: Contiene i valori intermedi che GSAP anima in modo fluido durante lo scrolling e che vengono poi mappati sullo stato 3D.
  const modelProps = {
    posX: 0,
    posY: 0,
    posZ: 0,
    scale: 2.3,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
  };

  onMount(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 800px)", () => {
      // TIMELINE GSAP CON PINNING: Fissa la sezione intro sullo schermo per 5000px di scorrimento, pilotando la narrazione e la rotazione del modello.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: introContainer,
          start: "top top",
          end: "+=5000", // Ampio range di scorrimento per una sensazione di spaziosità e respiro grafico
          scrub: 1,
          pin: true,
        },
      });

      // SINCRONIZZAZIONE STATO 3D: Aggiorna reattivamente le variabili tridimensionali di Svelte basandosi sui valori correnti dell'oggetto animato da GSAP.
      const update3D = () => {
        modelPosition = [modelProps.posX, modelProps.posY, modelProps.posZ];
        modelScale = [modelProps.scale, modelProps.scale, modelProps.scale];
        modelRotation = [modelProps.rotX, modelProps.rotY, modelProps.rotZ];
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

      // --- FASE 2: Spostamento del modello 3D sulla destra ed avvio della rotazione orbitale tridimensionale simultanea su X, Y e Z ---
      tl.to(
        modelProps,
        {
          posX: 3.2,
          scale: 3.8,
          rotX: Math.PI * 0.4, // Rotation in X
          rotY: Math.PI * 0.7, // Rotation in Y
          rotZ: Math.PI * 0.3, // Rotation in Z
          duration: 2.0,
          ease: "power2.inOut",
          onUpdate: update3D,
        },
        1.0,
      );

      // --- FASE 3: Pausa di stasi controllata per dare respiro visivo prima dell'ingresso dei successivi blocchi di testo ---
      tl.to({}, { duration: 0.8 });

      // --- FASE 4: Comparsa a sinistra del primo paragrafo descrittivo (messa a fuoco e dissolvenza) accompagnata da un'ulteriore rotazione del modello ---
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
        3.8,
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
        3.8,
      );

      // --- FASE 5: Pausa statica di lettura in cui il primo paragrafo rimane pienamente nitido e leggibile ---
      tl.to({}, { duration: 1.0 });

      // --- FASE 6: Dissolvenza/sfocatura del primo paragrafo e contemporanea comparsa del secondo paragrafo, mentre il modello compie l'ultima rotazione ---
      tl.to(
        p1,
        {
          opacity: 0.3,
          filter: "blur(5px)",
          pointerEvents: "none",
          duration: 1.5,
          ease: "power2.inOut",
        },
        6.2,
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
        6.2,
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
        6.2,
      );

      // --- FASE 7: Pausa finale di lettura sul secondo paragrafo prima dello sblocco definitivo dello scroll della sezione ---
      tl.to({}, { duration: 1.2 });

      return () => {
        tl.kill();
      };
    });
  });
</script>

<div class="intro-container" bind:this={introContainer}>
  <!-- CANVAS 3D DI THRELTE: Rendering in background dell'ambiente WebGL contenente la camera, le luci e il modello 3D interattivo -->
  <div class="canvas-wrapper">
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
      />
    </Canvas>
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
    z-index: 1; /* Behind text */
    pointer-events: none;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2; /* Above canvas */
    box-sizing: border-box;
    padding: var(--spacing-9, 40px) var(--spacing-11, 80px);
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
    transition:
      filter 0.5s ease,
      opacity 0.5s ease;
    opacity: 0; /* Fully hidden initially! */
    transform: translateY(30px);
    filter: blur(10px); /* Slightly stronger blur initially */
    pointer-events: none; /* No pointer events until faded in */
  }

  .paragraph-wrapper p {
    margin: 0;
  }

  .highlight {
    color: #436d80; /* Elegant blue/grey highlight color matching the storyboard */
    font-weight: 500;
  }
</style>
