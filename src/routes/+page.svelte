<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import gsap from "gsap";
  import ScrollTrigger from "gsap/dist/ScrollTrigger";
  import Hero from "$lib/components/Hero.svelte";
  import Intro from "$lib/components/Intro.svelte";
  import Gallery from "$lib/components/Gallery.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Stats from "$lib/components/Stats.svelte";
  import Citazione from "$lib/components/Citazione.svelte";
  import VociDietroLaLente from "$lib/components/VociDietroLaLente.svelte";
  import Modello3D from "$lib/components/Modello3D.svelte";
  import ModelShrink from "$lib/components/ModelShrink.svelte";
  import CardDetailOverlay from "$lib/components/CardDetailOverlay.svelte";

  if (browser) {
    gsap.registerPlugin(ScrollTrigger);
    if ('scrollRestoration' in history) {
      // Prefer manual so we can control programmatic scroll, but
      // avoid forcing a scroll on back/forward navigation below.
      history.scrollRestoration = 'manual';
    }

    // Only force scroll-to-top on a fresh navigation, not when the user
    // returned via back/forward (which should preserve position).
    try {
      const navEntries = performance.getEntriesByType?.('navigation') || [];
      const navType = navEntries[0]?.type;
      if (navType !== 'back_forward') {
        window.scrollTo(0, 0);
      }
    } catch (e) {
      // If performance API is unavailable, don't force scroll to avoid
      // breaking history restoration on some browsers.
    }
  }

  let hasBeenClicked = $state(false);
  let showCardOverlay = $state(false);

  // Stato dinamico per passare il video corretto all'overlay separato
  let activeVideoSrc = $state("");

  // Indice della card 3D in espansione (-1 = nessuna)
  let expandCardIndex = $state(-1);

  // Stato del modello 3D condiviso tra Intro (lo anima via GSAP) e Modello3D (lo renderizza)
  /** @type {[number, number, number]} */
  let modelPosition = $state([0, 0, 0]);
  /** @type {[number, number, number]} */
  let modelScale = $state([0, 0, 0]);
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

  /**
   * @param {{ x: number, y: number, width: number, height: number } | null} rect
   * @param {string} videoSrc
   * @param {number} cardIndex
   */
  async function handleCardClick(rect, videoSrc = '', cardIndex = 0) {
    if (showCardOverlay) return;
    // 1. Scroll per centrare la card
    if (rect) {
      const vh = window.innerHeight;
      const screenDy = (rect.y + rect.height / 2) - vh / 2;
      if (Math.abs(screenDy) > 80) {
        window.scrollBy({ top: screenDy * 11, behavior: 'smooth' });
        await new Promise(r => setTimeout(r, 460));
      }
    }
    // Salva il video per l'overlay (aperto dopo l'espansione 3D)
    activeVideoSrc = videoSrc || "/video_card/spacetime_slices.mov";
    // 2. Avvia l'espansione della card 3D reale
    expandCardIndex = cardIndex;
  }

  // Chiamato da VideoCard quando la card 3D ha raggiunto schermo pieno
  function onCardExpanded() {
    showCardOverlay = true;
  }

  function closeOverlay() {
    showCardOverlay = false;
    expandCardIndex = -1;
  }

  onMount(() => {
    if (browser) {
      // Parallax: background scrolls up at ~50% of page speed (100vh travel over full scroll range)
      gsap.to(".parallax-bg", {
        yPercent: -70,
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

<div class="parallax-bg" class:visible={hasBeenClicked} style="background-image: url('/SFONDO.png');"></div>

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
  onCardClick={(rect, videoSrc, cardIndex) => handleCardClick(rect, videoSrc, cardIndex)}
  {expandCardIndex}
  {onCardExpanded}
/>

{#if showCardOverlay}
  <CardDetailOverlay
    {closeOverlay}
    videoSrc={activeVideoSrc}
  />
{/if}

<div class="page" class:clicked={hasBeenClicked}>
  <Hero onClicked={() => hasBeenClicked = true} />

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
    <Stats
      bind:modelPosition
      bind:modelScale
      bind:modelRotation
      bind:currentTwistX
      bind:currentTwistZ
      bind:model3dVisible
    />

    <Citazione />
    <VociDietroLaLente
      bind:modelPosition
      bind:modelScale
      bind:modelRotation
      bind:currentTwistX
      bind:currentTwistZ
      bind:model3dVisible
    />

    <ModelShrink
      bind:modelPosition
      bind:modelScale
      bind:modelRotation
      bind:currentTwistX
      bind:currentTwistZ
      bind:model3dVisible
    />

    <Gallery />
    <div class="footer-spacer"></div>
    <Footer />
  {/if}
</div>

<style>
  /* LAYER 1: Sfondo parallax */
  .parallax-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 340vh; /* Must satisfy: height × (1 - |yPercent|/100) ≥ 100vh → 340 × 0.3 = 102vh */
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

  .footer-spacer {
    height: 48px;
  }
</style>