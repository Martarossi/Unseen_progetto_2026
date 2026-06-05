<script>
  import { onMount } from "svelte";
  import gsap from "gsap";
  import ScrollTrigger from "gsap/dist/ScrollTrigger";

  let {
    modelPosition = $bindable(/** @type {[number, number, number]} */ ([0, 0, 0])),
    modelScale = $bindable(/** @type {[number, number, number]} */ ([1.5, 1.5, 1.5])),
    modelRotation = $bindable(/** @type {[number, number, number]} */ ([0, 0, 0])),
    currentTwistX = $bindable(360),
    currentTwistZ = $bindable(200),
    model3dVisible = $bindable(false),
  } = $props();

  /** @type {HTMLElement|null} */
  let scrollWrapper = null;
  /** @type {HTMLElement|null} */
  let introTextRef = null;
  /** @type {HTMLElement|null} */
  let pLeft = null;
  /** @type {HTMLElement|null} */
  let whiteOverlay = null;
  /** @type {HTMLElement|null} */
  let pRight = null;

  // Starting state matching DatiTecnici display state
  const modelProps = {
    scale: 2.2,
    rotX: Math.PI * 6.0,
    rotY: Math.PI * 10.4,
    rotZ: Math.PI * 6.0,
    twistX: 72,
    twistZ: 72,
  };

  /** @param {string} str */
  function splitIntoLetters(str) {
    return str.split('').map(c => c === ' ' ? ' ' : c);
  }

  onMount(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 800px)", () => {
      let letterStarted = false;

      const update3D = () => {
        modelScale    = [modelProps.scale, modelProps.scale, modelProps.scale];
        modelRotation = [modelProps.rotX, modelProps.rotY, modelProps.rotZ];
        currentTwistX = modelProps.twistX;
        currentTwistZ = modelProps.twistZ;
      };

      const letters = introTextRef?.querySelectorAll(".voci-letter") ?? [];

      // Hero-style letter animation (time-based, triggered at end of shrink phase)
      const letterTl = gsap.timeline({ paused: true })
        .fromTo(
          letters,
          { opacity: 0, filter: "blur(10px)", y: 20 },
          { opacity: 1, filter: "blur(0px)", y: 0, duration: 1.2, stagger: 0.03, ease: "power2.out" }
        )
        .to(
          letters,
          { opacity: 0, filter: "blur(10px)", y: -20, duration: 0.8, stagger: 0.02, ease: "power2.in" },
          "+=1.5"
        )
        .fromTo(
          [pLeft, pRight],
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 1.0, stagger: 0.25, ease: "power2.out" }
        );

      // Scrub timeline: model shrinks + background lightens
      // Background is restored automatically when scrub reverses
      const shrinkTl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollWrapper,
          start: "top top",
          end: "+=2200",
          scrub: 2,
          onEnter: () => {
            model3dVisible = true;
            modelPosition  = [0, 0, 0];
          },
          onLeave: () => {
            model3dVisible = false;
            if (!letterStarted) {
              letterStarted = true;
              letterTl.play(0);
            }
          },
          onEnterBack: () => {
            model3dVisible = true;
            modelPosition  = [0, 0, 0];
            letterStarted  = false;
            letterTl.pause(0);
            gsap.set(letters,        { opacity: 0, filter: "blur(10px)", y: 20 });
            gsap.set([pLeft, pRight], { opacity: 0, y: 24 });
          },
          onLeaveBack: () => {
            model3dVisible = false;
            letterStarted  = false;
            letterTl.pause(0);
            gsap.set(letters,        { opacity: 0 });
            gsap.set([pLeft, pRight], { opacity: 0 });
          },
        },
      });

      shrinkTl.fromTo(
        modelProps,
        { scale: 2.2, rotX: Math.PI * 6.0, rotY: Math.PI * 10.4, rotZ: Math.PI * 6.0, twistX: 72, twistZ: 72 },
        { scale: 0.0, rotX: Math.PI * 8.0, rotY: Math.PI * 13.0, rotZ: Math.PI * 8.0, twistX: 200, twistZ: 220, duration: 4, ease: "power2.in", onUpdate: update3D },
        0
      );

      // Lighten background by boosting brightness of the same parallax image (scrub reverses)
      shrinkTl.fromTo(".parallax-bg",
        { filter: "brightness(1)" },
        { filter: "brightness(1.5)", duration: 3.5, ease: "power1.inOut" },
        0.5);

      // Thin white wash over the background
      shrinkTl.fromTo(whiteOverlay,
        { opacity: 0 },
        { opacity: 0.28, duration: 3.5, ease: "power1.inOut" },
        0.5);

      // Navbar text and logo switch to dark on light background
      shrinkTl.fromTo(".navbar__link",
        { color: "#ffffff" },
        { color: "#1a2a35", duration: 3.5, ease: "power1.inOut" }, 0.5);
      shrinkTl.fromTo(".navbar__brand img",
        { filter: "invert(0)" },
        { filter: "invert(1)", duration: 3.5, ease: "power1.inOut" }, 0.5);

      // Footer text and logo switch to dark on light background
      shrinkTl.fromTo(".footer-title, .footer-copy",
        { color: "#f8f8f8" },
        { color: "#1a2a35", duration: 3.5, ease: "power1.inOut" }, 0.5);
      shrinkTl.fromTo(".footer-logo",
        { filter: "brightness(0) invert(1)" },
        { filter: "brightness(0) invert(0)", duration: 3.5, ease: "power1.inOut" }, 0.5);

      return () => {
        shrinkTl.kill();
        letterTl.kill();
      };
    });
  });
</script>

<div class="voci-white-overlay" bind:this={whiteOverlay}></div>

<div class="voci-scroll-wrapper" bind:this={scrollWrapper}>
  <div class="voci-sticky">

    <!-- "Scopri le voci di chi sta dietro l’inquadratura" — hero-style letter animation -->
    <div class="voci-intro-text" bind:this={introTextRef}>
      <p class="voci-intro-phrase">
        <b>{#each splitIntoLetters("Scopri") as char}<span class="voci-letter">{char}</span>{/each}</b>{#each splitIntoLetters(" le voci di chi") as char}<span class="voci-letter">{char}</span>{/each}
      </p>
      <p class="voci-intro-phrase">
        {#each splitIntoLetters("sta dietro l’") as char}<span class="voci-letter">{char}</span>{/each}<b>{#each splitIntoLetters("inquadratura") as char}<span class="voci-letter">{char}</span>{/each}</b>
      </p>
    </div>

    <!-- Paragraphs that reappear on the light background -->
    <div class="voci-left" bind:this={pLeft}>
      <p class="text-regular">L'AI, però, funge solo da tecnologia <br>che analizza, stabilizza,<br>calcola e ricostruisce.</p>
      <p class="text-bold">Ma dietro ogni immagine<br>rimangono l'esperienza,<br>la sensibilità<br>e la presenza umana.</p>
    </div>

    <div class="voci-right" bind:this={pRight}>
      <p>Una raccolta di voci di chi <br><strong>vive l'evento da dietro la lente</strong>: professionisti che lavorano <br>in condizioni estreme, in equilibrio costante tra tecnica ed emozione.</p>
    </div>

  </div>
</div>

<style>
  .voci-white-overlay {
    position: fixed;
    inset: 0;
    background: #ffffff;
    z-index: -1;
    opacity: 0;
    pointer-events: none;
  }

  .voci-scroll-wrapper {
    height: 4500px;
    position: relative;
  }

  .voci-sticky {
    width: 100vw;
    height: 100vh;
    position: sticky;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10%;
    box-sizing: border-box;
    pointer-events: none;
  }

  /* ── Intro text (hero-style) ── */
  .voci-intro-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    pointer-events: none;
    white-space: nowrap;
  }

  .voci-intro-phrase {
    font-family: "Helvetica", sans-serif;
    font-size: clamp(22px, 4vh, 52px);
    line-height: 1.4;
    color: #1a2a35;
    margin: 0 0 0.15em;
    font-weight: 400;
  }

  .voci-letter {
    display: inline-block;
    opacity: 0;
  }

  /* ── Paragraphs (on light background) ── */
  .voci-left {
    width: 30%;
    opacity: 0;
    will-change: opacity, transform;
  }

  .voci-right {
    width: 30%;
    opacity: 0;
    will-change: opacity, transform;
  }

  .text-regular {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: clamp(17px, 1.4vw, 22px);
    line-height: 1.6;
    color: #1a2a35;
    margin: 0 0 1.2rem;
    font-weight: 400;
  }

  .text-bold {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: clamp(19px, 1.6vw, 26px);
    font-weight: 700;
    line-height: 1.5;
    color: #1a2a35;
    margin: 0;
  }

  .voci-right p {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: clamp(17px, 1.4vw, 22px);
    line-height: 1.6;
    color: #1a2a35;
    margin: 0;
    font-weight: 400;
  }

  .voci-right strong {
    font-weight: 700;
  }
</style>
