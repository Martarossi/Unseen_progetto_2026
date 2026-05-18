<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import gsap from "gsap";
  import ScrollTrigger from "gsap/dist/ScrollTrigger";
  import Hero from "$lib/components/Hero.svelte";
  import Intro from "$lib/components/Intro.svelte";

  if (browser) {
    gsap.registerPlugin(ScrollTrigger);
  }

  let selectedYear = $state(2026);
  let hasBeenClicked = $state(false);

  function handleYearChange(year) {
    selectedYear = year;
  }

  onMount(() => {
    if (browser) {
      // Create a smooth parallax scrolling effect on the background image
      gsap.to(".parallax-bg", {
        y: "-15%", // move the background up slightly faster than page scroll
        ease: "none",
        scrollTrigger: {
          trigger: ".page",
          start: "top top",
          end: "bottom bottom",
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
<div class="parallax-bg" class:visible={hasBeenClicked} style="background-image: url('/sfondo-About.png');"></div>

<div class="page" class:clicked={hasBeenClicked}>
  <Hero onClicked={() => hasBeenClicked = true} />
  <Intro />
  <!-- <TopBar /> -->
  <!-- <Filters {selectedYear} onYearChange={handleYearChange} /> -->
  <!-- <ProjectGrid {projects} {selectedYear} /> -->
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
