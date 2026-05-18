<script>
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import ScrollTrigger from 'gsap/dist/ScrollTrigger';
  import { Canvas } from '@threlte/core';
  import Scene from './Scene.svelte';

  let introContainer;
  let textImage;
  let p1;
  let p2;

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
    rotX: 0,
    rotY: 0,
    rotZ: 0
  };

  onMount(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 800px)", () => {
      // Create a long, spacious pin timeline to prevent overlap and increase distances
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: introContainer,
          start: "top top",
          end: "+=5000", // Increased scroll range for spacious feel
          scrub: 1,
          pin: true,
        }
      });

      // Synchronize GSAP animations with 3D state update
      const update3D = () => {
        modelPosition = [modelProps.posX, modelProps.posY, modelProps.posZ];
        modelScale = [modelProps.scale, modelProps.scale, modelProps.scale];
        modelRotation = [modelProps.rotX, modelProps.rotY, modelProps.rotZ];
      };

      // --- PHASE 1 (0.0 to 1.5): Center image fades out completely ---
      tl.to(textImage, {
        opacity: 0,
        y: -80,
        filter: "blur(15px)",
        duration: 1.5,
        ease: "power2.inOut"
      }, 0);

      // --- PHASE 2 (1.5 to 3.0): Model shifts right & spins in 3D (X, Y, Z) ---
      tl.to(modelProps, {
        posX: 3.2, 
        scale: 3.8, 
        rotX: Math.PI * 0.4, // Rotation in X
        rotY: Math.PI * 0.7, // Rotation in Y
        rotZ: Math.PI * 0.3, // Rotation in Z
        duration: 2.0,
        ease: "power2.inOut",
        onUpdate: update3D
      }, 1.0);

      // --- PHASE 3 (3.0 to 3.8): Rest hold before text starts entering ---
      tl.to({}, { duration: 0.8 });

      // --- PHASE 4 (3.8 to 5.2): Paragraph 1 focuses/fades in & model rotates further ---
      tl.to(p1, {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        pointerEvents: "auto",
        duration: 1.5,
        ease: "power2.out"
      }, 3.8);

      tl.to(modelProps, {
        rotX: Math.PI * 0.7,
        rotY: Math.PI * 1.3,
        rotZ: Math.PI * 0.6,
        duration: 1.5,
        ease: "power1.inOut",
        onUpdate: update3D
      }, 3.8);

      // --- PHASE 5 (5.2 to 6.2): Hold with Paragraph 1 fully active ---
      tl.to({}, { duration: 1.0 });

      // --- PHASE 6 (6.2 to 7.8): Paragraph 1 blurs out & Paragraph 2 focuses in & model rotates to final state ---
      tl.to(p1, {
        opacity: 0.3,
        filter: "blur(5px)",
        pointerEvents: "none",
        duration: 1.5,
        ease: "power2.inOut"
      }, 6.2);

      tl.to(p2, {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        pointerEvents: "auto",
        duration: 1.5,
        ease: "power2.inOut"
      }, 6.2);

      tl.to(modelProps, {
        rotX: Math.PI * 1.2,
        rotY: Math.PI * 2.0,
        rotZ: Math.PI * 1.1,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: update3D
      }, 6.2);

      // --- PHASE 7 (7.8 to 9.0): Final hold for paragraph 2 ---
      tl.to({}, { duration: 1.2 });

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

      <div class="paragraph-wrapper" bind:this={p2}>
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
