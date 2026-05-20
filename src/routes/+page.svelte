<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import gsap from "gsap";
  import ScrollTrigger from "gsap/dist/ScrollTrigger";
  import Hero from "$lib/components/Hero.svelte";
  import Intro from "$lib/components/Intro.svelte";
  import Gallery from "$lib/components/Gallery.svelte";
  
  if (browser) {
    gsap.registerPlugin(ScrollTrigger);
  }

  let selectedYear = $state(2026);
  let hasBeenClicked = $state(false);

  /** @param {number} year */
  function handleYearChange(year) {
    selectedYear = year;
  }

  onMount(() => {
    if (browser) {
      // Create a highly pronounced, viewport-wide parallax scrolling effect
      gsap.to(".parallax-bg", {
        yPercent: -20, // Translate up by 20% of its own height
        ease: "none",
        scrollTrigger: {
          start: 0,
          end: "max", // Covers the entire scroll range including all pinned containers
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

<!-- Global Parallax Background - starts hidden (white screen) and fades in smoothly on click -->
<div class="parallax-bg" class:visible={hasBeenClicked} style="background-image: url('/SFONDO.png');"></div>

<div class="page" class:clicked={hasBeenClicked}>
  <!-- 
    SEZIONE HERO (Schermata Iniziale):
    Gestisce l'ingresso delle scritte in dissolvenza su sfondo bianco solido, il blocco temporaneo dello scorrimento, 
    la maschera radiale interattiva che svela il logo "UNSEEN" e lo sfondo al movimento del mouse, e la transizione 
    di sblocco globale (click dell'utente) che avvia la dissolvenza incrociata dello sfondo e della top bar.
  -->
  <Hero onClicked={() => hasBeenClicked = true} />

  <!-- 
    SEZIONE INTRO (Sezione Narrativa / Modello 3D):
    Fissa la schermata e accompagna l'utente in un'esperienza interattiva dove, attraverso lo scroll della pagina:
    1. L'immagine centrale scompare.
    2. Il modello 3D in vetro ruota su tutti e tre gli assi (X, Y, Z) e si sposta a destra.
    3. I paragrafi descrittivi compaiono uno dopo l'altro sfocandosi e mettendosi a fuoco in modo alternato.
  -->
  <Intro isClicked={hasBeenClicked} />

  {#if hasBeenClicked}
    <!-- 
      SEZIONE GALLERY (Sezione Finale):
      Un mazzo di card tridimensionali prospettiche che scorrono verticalmente a imbuto (wheel), 
      sincronizzate con la lista dei titoli dei progetti sulla sinistra e con i dettagli descrittivi.
    -->
    <Gallery />
  {/if}
</div>

<style>
  .parallax-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 120vh; /* Taller to allow scrolling movement without showing borders */
    z-index: -2; /* Stays fully in the background */
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    pointer-events: none;
    will-change: transform;
    opacity: 0; /* Hidden initially (starts with pure white background) */
    transition: opacity 1.5s cubic-bezier(0.25, 1, 0.5, 1); /* Smooth fading transition */
  }

  .parallax-bg.visible {
    opacity: 0.9; /* Fades in once Hero is clicked */
  }

  .page {
    background: #ffffff; /* Starts with clean solid white background for the text diffusion */
    min-height: 100vh;
    position: relative;
    width: 100%;
    overflow-x: hidden;
    transition: background-color 1.5s cubic-bezier(0.25, 1, 0.5, 1); /* Match the parallax fade timing */
  }

  .page.clicked {
    background: transparent; /* Smoothly transitions to transparent to let parallax background shine */
  }
  
  
                
</style>
