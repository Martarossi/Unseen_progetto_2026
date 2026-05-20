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
      // SINCRONIZZAZIONE STATO 3D: Aggiorna reattivamente le variabili tridimensionali di Svelte basandosi sui valori correnti dell'oggetto animato da GSAP.
      const update3D = () => {
        modelPosition = [modelProps.posX, modelProps.posY, modelProps.posZ];
        modelScale = [modelProps.scale, modelProps.scale, modelProps.scale];
        modelRotation = [modelProps.rotX, modelProps.rotY, modelProps.rotZ];
        currentTwistX = modelProps.twistX;
        currentTwistZ = modelProps.twistZ;
      };

      // TIMELINE GSAP CON PINNING: Fissa la sezione intro sullo schermo per 5000px di scorrimento, pilotando la narrazione e la rotazione del modello.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: introContainer,
          start: "top top",
          // Ridotto per diminuire la durata dello scroll complessivo della sezione
          end: "+=9000",
          scrub: 2.8,
          pin: true,
          onEnter: () => { canvasVisible = true; },
          onLeaveBack: () => { canvasVisible = false; },
        },
      });

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

      // Make the 3D model rise into view similarly to the text image
      tl.fromTo(
        modelProps,
        { posY: -2 },
        {
          posY: 1.5,
          duration: 1.5,
          ease: "power2.out",
          onUpdate: update3D,
        },
        0,
      );

      // --- FASE 2: Spostamento del modello 3D sulla destra ed avvio della rotazione orbitale tridimensionale simultanea su X, Y e Z ---
      // Accelerate model movement to the right so the first paragraph can appear earlier
      tl.to(
        modelProps,
        {
          posX: 3.2,
          posY: 0,
          scale: 2.4,
          rotX: Math.PI * 0.4, // Rotation in X
          rotY: Math.PI * 0.7, // Rotation in Y
          rotZ: Math.PI * 0.3, // Rotation in Z
          duration: 1.6,
          ease: "power2.inOut",
          onUpdate: update3D,
        },
        0.8,
      );

      // --- FASE 3: Comparsa a sinistra del primo paragrafo appena il modello raggiunge la destra ---
      // Show first paragraph earlier with a slightly quicker reveal
      tl.to(
        p1,
        {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          pointerEvents: "auto",
          duration: 1.2,
          ease: "power2.out",
        },
        1.8,
      );

      // Slightly shorten the rotation timing to match earlier p1 appearance
      tl.to(
        modelProps,
        {
          rotX: Math.PI * 0.7,
          rotY: Math.PI * 1.3,
          rotZ: Math.PI * 0.6,
          duration: 1.2,
          ease: "power1.inOut",
          onUpdate: update3D,
        },
        1.8,
      );

      // --- FASE 4: Pausa statica di lettura in cui il primo paragrafo rimane pienamente nitido e leggibile ---
      // Ridotto il tempo di pausa per accelerare la transizione verso il secondo paragrafo
      tl.to({}, { duration: 0.4 });

      // --- FASE 5: Mantieni `p1` nitido fino all'uscita simultanea con `p2`.
      // Rimosso il fade parziale anticipato per assicurare che entrambi i paragrafi
      // salgano e si dissolvano nello stesso momento più avanti nella timeline.

      // Diminuisco il gap tra p1 e p2: faccio partire p2 e la rotazione del modello prima
      tl.to(
        p2,
        {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          pointerEvents: "auto",
          duration: 1.2,
          ease: "power2.inOut",
        },
        2.6,
      );

      tl.to(
        modelProps,
        {
          rotX: Math.PI * 1.2,
          rotY: Math.PI * 2.0,
          rotZ: Math.PI * 1.1,
          duration: 1.2,
          ease: "power2.inOut",
          onUpdate: update3D,
        },
        2.6,
      );

      // --- FASE 7: Pausa finale di lettura sul secondo paragrafo prima dello sblocco definitivo dello scroll della sezione ---
      // Ridotta ulteriormente per accorciare lo scroll tra p2 nitido e la sua scomparsa
      tl.to({}, { duration: 0.3 });

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
      // Far salire e scomparire entrambi i paragrafi contemporaneamente
      // Accorcio il tempo di scroll tra p2 nitido e la sua scomparsa: anticipo le uscite dei paragrafi
      tl.to(
        p1,
        {
          opacity: 0,
          y: -80,
          filter: "blur(10px)",
          duration: 1.2,
          ease: "power2.inOut",
        },
        6.0,
      );

      tl.to(
        p2,
        {
          opacity: 0,
          y: -80,
          filter: "blur(10px)",
          duration: 1.2,
          ease: "power2.inOut",
        },
        9.1,
      );

      // Sincronizza il ritorno del modello al centro con la scomparsa dei paragrafi
      tl.to(
        modelProps,
        {
          posX: 0,
          posY: 0,
          scale: 2.0,
          rotX: Math.PI * 2.0,
          rotY: Math.PI * 3.0,
          rotZ: Math.PI * 1.8,
          duration: 0.8,
          ease: "power2.inOut",
          onUpdate: update3D,
        },
        6.0,
      );

      // --- FASE 9: Testo full-screen sale dal basso insieme allo scroll (lineare, senza easing) ---
      // Anticipato l'inizio del big text per ridurre il gap dopo la scomparsa dei paragrafi
      // Anticipa l'entrata del bigText per ridurre il gap dopo la scomparsa dei paragrafi
      tl.fromTo(
        bigText,
        { yPercent: 100, opacity: 1 },
        {
          yPercent: -50,
          opacity: 1,
          duration: 1.0,
          ease: "none",
          immediateRender: false,
        },
        6.2,
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
          duration: 1.0,
          ease: "none",
          onUpdate: update3D,
        },
        6.2,
      );

      // --- FASE 10: Pausa di lettura sul testo full-screen ---
      tl.to({}, { duration: 1.3 });

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
