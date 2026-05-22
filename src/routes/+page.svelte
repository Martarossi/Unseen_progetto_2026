<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import gsap from "gsap";
  import ScrollTrigger from "gsap/dist/ScrollTrigger";
  import Hero from "$lib/components/Hero.svelte";
  import Intro from "$lib/components/Intro.svelte";
  import Gallery from "$lib/components/Gallery.svelte";
  import Stats from "$lib/components/Stats.svelte";
  import Modello3D from "$lib/components/Modello3D.svelte";

  if (browser) {
    gsap.registerPlugin(ScrollTrigger);
  }

  let hasBeenClicked = $state(false);

  // Stato del modello 3D condiviso tra Intro (lo anima via GSAP) e Modello3D (lo renderizza)
  /** @type {[number, number, number]} */
  let modelPosition = $state([0, 0, 0]);
  /** @type {[number, number, number]} */
  let modelScale = $state([1.5, 1.5, 1.5]);
  /** @type {[number, number, number]} */
  let modelRotation = $state([0, 0, 0]);
  let currentTwistX = $state(360);
  let currentTwistZ = $state(200);
  // Oggetto plain mutato direttamente da GSAP in Intro, letto ogni frame da Scene via useTask
  const cardProps = { opacity: 0, groupRotY: 0, riseY: 0 };
  // Orbit props per le card VIDEOAI: GSAP muta le proprietà, VideoCard le legge via useTask ogni frame
  const orbitProps  = { angle: 0, y: -3, opacity: 0, centerX: 0, centerY: 0 };
  const orbitProps2 = { angle: 0, y: -3, opacity: 0, centerX: 0, centerY: 0 };
  const orbitProps3 = { angle: 0, y: -3, opacity: 0, centerX: 0, centerY: 0 };
  let model3dVisible = $state(false);

  onMount(() => {
    if (browser) {
      // Parallax: background scrolls up at ~50% of page speed (100vh travel over full scroll range)
      gsap.to(".parallax-bg", {
        yPercent: -50,
        ease: "none",
        scrollTrigger: {
          start: 0,
          end: "max",
          scrub: true,
        }
      });
    }
  });
</script>

<svelte:head>
  <title>Web Design Lab - Politecnico di Milano</title>
  <meta
    name="description"
    content="Archive of the best outcomes from the Web Design Laboratory in Communication Design at Politecnico di Milano"
  />
</svelte:head>

<!-- LAYER 1 (z-index -2): Sfondo parallax globale -->
<div class="parallax-bg" class:visible={hasBeenClicked} style="background-image: url('/SFONDO.png');"></div>

<!-- LAYER 3 (z-index 50): Modello 3D fisso su tutta la pagina, pointer-events disabilitati -->
<Modello3D
  position={modelPosition}
  scale={modelScale}
  rotation={modelRotation}
  twistX={currentTwistX}
  twistZ={currentTwistZ}
  {cardProps}
  {orbitProps}
  {orbitProps2}
  {orbitProps3}
  visible={model3dVisible}
  isClicked={hasBeenClicked}
/>

<!-- LAYER 2 (z-index 1): Contenuti e testi delle sezioni -->
<div class="page" class:clicked={hasBeenClicked}>
  <!--
    SEZIONE HERO (Schermata Iniziale):
    Gestisce l'ingresso delle scritte in dissolvenza su sfondo bianco solido, il blocco temporaneo dello scorrimento,
    la maschera radiale interattiva che svela il logo "UNSEEN" e lo sfondo al movimento del mouse, e la transizione
    di sblocco globale (click dell'utente) che avvia la dissolvenza incrociata dello sfondo e della top bar.
  -->
  <Hero onClicked={() => hasBeenClicked = true} />

  <!--
    SEZIONE INTRO (Sezione Narrativa):
    Fissa la schermata e accompagna l'utente in un'esperienza interattiva dove, attraverso lo scroll della pagina:
    1. L'immagine centrale scompare.
    2. Il modello 3D in vetro (renderizzato nel LAYER 3) ruota su tutti e tre gli assi e si sposta a destra.
    3. I paragrafi descrittivi compaiono uno dopo l'altro sfocandosi e mettendosi a fuoco in modo alternato.
  -->
  <Intro
    bind:modelPosition
    bind:modelScale
    bind:modelRotation
    bind:currentTwistX
    bind:currentTwistZ
    {cardProps}
    {orbitProps}
    {orbitProps2}
    {orbitProps3}
    bind:model3dVisible
  />

  {#if hasBeenClicked}
    <Stats />

    <!--
      SEZIONE GALLERY (Sezione Finale):
      Un mazzo di card tridimensionali prospettiche che scorrono verticalmente a imbuto (wheel),
      sincronizzate con la lista dei titoli dei progetti sulla sinistra e con i dettagli descrittivi.
    -->
    <Gallery />
  {/if}
</div>

<style>
  /* LAYER 1: Sfondo parallax */
  .parallax-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 200vh; /* Extra height for 100vh of parallax travel (yPercent -50 × 200vh = -100vh) */
    z-index: -2;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    pointer-events: none;
    will-change: transform;
    opacity: 0;
    transition: opacity 1.5s cubic-bezier(0.25, 1, 0.5, 1);
  }

  .parallax-bg.visible {
    opacity: 0.9;
  }

  /* LAYER 2: Contenuti e testi */
  .page {
    background: #ffffff;
    min-height: 100vh;
    position: relative;
    width: 100%;
    overflow-x: clip;
    z-index: 1;
    transition: background-color 1.5s cubic-bezier(0.25, 1, 0.5, 1);
  }

  .page.clicked {
    background: transparent;
  }
</style>
