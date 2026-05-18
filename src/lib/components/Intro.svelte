<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import gsap from 'gsap';
  import ScrollTrigger from 'gsap/dist/ScrollTrigger';
  import { Canvas } from '@threlte/core';
  import Scene from './Scene.svelte';
  import About from './About.svelte';

  if (browser) {
    gsap.registerPlugin(ScrollTrigger);
  }

  let introContainer;
  let textImage;
  let p1;
  let p2;
  let showAboutOverlay = $state(false);

  // Model properties we will animate with GSAP
  let modelPosition = $state([0, 0, 0]);
  let modelScale = $state([2.3, 2.3, 2.3]);
  let modelRotation = $state([0, 0, 0]);

  // Object used by GSAP to animate these properties, then sync to state
  const modelProps = {
    posX: 0,
    posY: 0,
    posZ: 0,
    scale: 2.3,
    rotY: 0
  };

  function toggleAbout() {
    showAboutOverlay = !showAboutOverlay;
  }

  onMount(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 800px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: introContainer,
          start: "top top",
          end: "+=3000",
          scrub: 1,
          pin: true,
        }
      });

      // --- STEP 1: Fade out centered image & Move model to the right ---
      tl.to(textImage, {
        opacity: 0,
        y: -100,
        filter: "blur(15px)",
        duration: 1.5,
        ease: "power2.inOut"
      }, 0);

      // Model moves right and enlarges
      tl.to(modelProps, {
        posX: 3.2, 
        scale: 3.8, 
        rotY: Math.PI * 0.4, 
        duration: 2.0,
        ease: "power2.inOut",
        onUpdate: () => {
          modelPosition = [modelProps.posX, modelProps.posY, modelProps.posZ];
          modelScale = [modelProps.scale, modelProps.scale, modelProps.scale];
          modelRotation = [0, modelProps.rotY, 0];
        }
      }, 0);

      // --- STEP 2: Show Paragraph 1 sharp, Paragraph 2 blurred ---
      tl.to(p1, {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        duration: 1.5,
        ease: "power2.out"
      }, 1.2);

      // Add a slight hold
      tl.to({}, { duration: 1 });

      // --- STEP 3: Paragraph 1 blurs, Paragraph 2 becomes sharp ---
      tl.to(p1, {
        opacity: 0.3,
        filter: "blur(5px)",
        duration: 1.5,
        ease: "power2.inOut"
      });

      tl.to(p2, {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        duration: 1.5,
        ease: "power2.inOut"
      }, "-=1.2");

      // Hold at the end
      tl.to({}, { duration: 1 });

      return () => {
        tl.kill();
      };
    });
  });
</script>

<div class="intro-container" bind:this={introContainer}>
  <!-- 3D Canvas Background -->
  <div class="canvas-wrapper">
    <Canvas>
      <Scene 
        position={modelPosition} 
        scale={modelScale}
        rotation={modelRotation}
      />
    </Canvas>
  </div>

  <!-- HTML Overlays -->
  <div class="overlay">
    
    <!-- Top Bar with ABOUT button on the top right (No UNSEEN logo) -->
    <div class="top-bar">
      <button class="about-btn" onclick={toggleAbout}>ABOUT</button>
    </div>

    <!-- Initial Centered Text Image -->
    <div class="initial-text-wrapper" bind:this={textImage}>
      <img src="/nontuttociòcheconta.png" alt="Non tutto ciò che conta è visibile" />
    </div>

    <!-- Stacked Text Paragraphs (matches Storyboard exactly) -->
    <div class="texts-container">
      <div class="paragraph-wrapper" bind:this={p1}>
        <p>
          Per la prima volta nella storia, le <span class="highlight">Olimpiadi di Milano-Cortina 2026</span> 
          ridefiniscono l'esperienza olimpica attraverso un'<span class="highlight">anima digitale</span> 
          che trasforma la visione in immersione.
        </p>
      </div>

      <div class="paragraph-wrapper blurred-init" bind:this={p2}>
        <p>
          Ogni evento olimpico è costruito su ciò che vediamo:<br>
          <span class="highlight">velocità, performance, emozione.</span><br>
          Ma dietro ogni immagine esiste un <span class="highlight">sistema invisibile</span><br>
          fatto di <span class="highlight">dati, connessioni e tecnologia.</span>
        </p>
      </div>
    </div>
    
  </div>
</div>

{#if showAboutOverlay}
  <About closeOverlay={toggleAbout} />
{/if}

<style>
  .intro-container {
    width: 100vw;
    height: 100vh;
    position: relative;
    background-color: transparent; /* Transparent so the home parallax background shows */
    overflow: hidden;
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

  /* Top Bar Header Layout */
  .top-bar {
    position: absolute;
    top: var(--spacing-9, 36px);
    right: var(--spacing-11, 80px);
    z-index: 30;
  }

  .about-btn {
    background: #f4f4f4;
    border: none;
    color: #000;
    padding: 10px 32px;
    text-decoration: none;
    border-radius: 50px;
    font-family: "Helvetica", sans-serif;
    font-weight: bold;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.2s ease;
  }

  .about-btn:hover {
    background: #e0e0e0;
    transform: scale(1.03);
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
    font-family: 'Helvetica', 'Arial', sans-serif;
    font-size: 1.7rem;
    line-height: 1.45;
    color: #1a1a1a;
    transition: filter 0.5s ease, opacity 0.5s ease;
    opacity: 0; /* Starts hidden until model shifts */
    transform: translateY(30px);
    filter: blur(8px);
  }

  /* p2 starts blurred & low opacity */
  .blurred-init {
    opacity: 0.25;
    filter: blur(5px);
    transform: translateY(0);
  }

  .paragraph-wrapper p {
    margin: 0;
  }

  .highlight {
    color: #436d80; /* Elegant blue/grey highlight color matching the storyboard */
    font-weight: 500;
  }
</style>
