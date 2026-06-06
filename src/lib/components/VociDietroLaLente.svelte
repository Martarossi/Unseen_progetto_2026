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
  let headingRef = null;
  /** @type {HTMLElement|null} */
  let columnsRef = null;
  /** @type {HTMLElement|null} */
  let colLeftRef = null;
  /** @type {HTMLElement|null} */
  let colRightRef = null;
  /** @type {HTMLElement|null} */
  let whiteOverlay = null;

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

      // Colonne inizialmente sfocate (il container resta opacity 0 finché letterTl non lo porta a 1)
      gsap.set([colLeftRef, colRightRef], { filter: "blur(16px)" });

      // Time-based: lettere in → out → heading + container colonne compaiono
      // Le colonne restano sfocate: letterTl anima solo opacity/y del container, non il blur dei figli
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
          headingRef,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1.0, ease: "power2.out" }
        )
        .fromTo(
          columnsRef,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
          "-=0.5"
        );

      // Scrub: modello si rimpicciolisce + sfondo si schiarisce
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
            gsap.set(letters,    { opacity: 0, filter: "blur(10px)", y: 20 });
            gsap.set(headingRef, { opacity: 0, y: 20 });
            gsap.set(columnsRef, { opacity: 0, y: 20 });
            gsap.set([colLeftRef, colRightRef], { filter: "blur(16px)" });
          },
          onLeaveBack: () => {
            model3dVisible = false;
            letterStarted  = false;
            letterTl.pause(0);
            gsap.set(letters,    { opacity: 0 });
            gsap.set(headingRef, { opacity: 0 });
            gsap.set(columnsRef, { opacity: 0 });
            gsap.set([colLeftRef, colRightRef], { filter: "blur(16px)" });
          },
        },
      });

      shrinkTl.fromTo(
        modelProps,
        { scale: 2.2, rotX: Math.PI * 6.0, rotY: Math.PI * 10.4, rotZ: Math.PI * 6.0, twistX: 72, twistZ: 72 },
        { scale: 0.0, rotX: Math.PI * 8.0, rotY: Math.PI * 13.0, rotZ: Math.PI * 8.0, twistX: 200, twistZ: 220, duration: 4, ease: "power2.in", onUpdate: update3D },
        0
      );

      shrinkTl.fromTo(".parallax-bg",
        { filter: "brightness(1)" },
        { filter: "brightness(1.5)", duration: 3.5, ease: "power1.inOut" },
        0.5);

      shrinkTl.fromTo(whiteOverlay,
        { opacity: 0 },
        { opacity: 0.4, duration: 3.5, ease: "power1.inOut" },
        0.5);

      shrinkTl.fromTo(".navbar__link",
        { color: "#ffffff" },
        { color: "#1a2a35", duration: 3.5, ease: "power1.inOut" }, 0.5);
      shrinkTl.fromTo(".navbar__brand img",
        { filter: "invert(0)" },
        { filter: "invert(1)", duration: 3.5, ease: "power1.inOut" }, 0.5);

      shrinkTl.fromTo(".footer-title, .footer-copy",
        { color: "#f8f8f8" },
        { color: "#1a2a35", duration: 3.5, ease: "power1.inOut" }, 0.5);
      shrinkTl.fromTo(".footer-logo",
        { filter: "brightness(0) invert(1)" },
        { filter: "brightness(0) invert(0)", duration: 3.5, ease: "power1.inOut" }, 0.5);

      // Scrub: colonna sinistra nitida → sinistra sfocata + destra nitida
      const blurTl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollWrapper,
          start: "top+=2800 top",
          end: "top+=4400 top",
          scrub: 1.5,
        }
      });

      blurTl
        // Fase 1: sinistra diventa nitida
        .fromTo(colLeftRef,
          { filter: "blur(16px)" },
          { filter: "blur(0px)", duration: 0.4, ease: "power1.inOut" }
        )
        // Fase 2: sinistra torna sfocata + destra diventa nitida (in parallelo)
        .to(colLeftRef,
          { filter: "blur(16px)", duration: 0.4, ease: "power1.inOut" }
        )
        .fromTo(colRightRef,
          { filter: "blur(16px)" },
          { filter: "blur(0px)", duration: 0.4, ease: "power1.inOut" },
          "<"
        );

      return () => {
        shrinkTl.kill();
        letterTl.kill();
        blurTl.kill();
      };
    });
  });
</script>

<div class="voci-white-overlay" bind:this={whiteOverlay}></div>

<div class="voci-scroll-wrapper" bind:this={scrollWrapper}>
  <div class="voci-sticky">

    <!-- Animazione lettere -->
    <div class="voci-intro-text" bind:this={introTextRef}>
      <p class="voci-intro-phrase">
        <b>{#each splitIntoLetters("Scopri") as char}<span class="voci-letter">{char}</span>{/each}</b>{#each splitIntoLetters(" le voci di chi") as char}<span class="voci-letter">{char}</span>{/each}
      </p>
      <p class="voci-intro-phrase">
        {#each splitIntoLetters("sta dietro l'") as char}<span class="voci-letter">{char}</span>{/each}<b>{#each splitIntoLetters("inquadratura") as char}<span class="voci-letter">{char}</span>{/each}</b>
      </p>
    </div>

    <!-- Titolo sempre nitido -->
    <div class="voci-heading" bind:this={headingRef}>
      <p class="heading-text">Dietro ad ogni immagine<br>rimangono l'esperienza,<br>la presenza e la<br>sensibilità umana.</p>
    </div>

    <!-- Due colonne: inizialmente sfocate, si nitidiscono una alla volta con lo scroll -->
    <div class="voci-columns" bind:this={columnsRef}>
      <div class="col-text" bind:this={colLeftRef}>
        <p>L'AI funge solo da tecnologia che analizza, stabilizza, calcola e ricostruisce.</p>
      </div>
      <div class="col-text" bind:this={colRightRef}>
        <p>Una raccolta di voci di chi <strong>vive l'evento da dietro la lente</strong>: professionisti che lavorano in condizioni estreme, in equilibrio costante tra tecnica ed emozione.</p>
      </div>
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
    height: 5600px;
    position: relative;
  }

  .voci-sticky {
    width: 100vw;
    height: 100vh;
    position: sticky;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    pointer-events: none;
  }

  /* ── Animazione lettere ── */
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

  /* ── Titolo centrato (sempre nitido) ── */
  .voci-heading {
    position: absolute;
    top: 42%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    width: 72%;
    opacity: 0;
    will-change: opacity;
    pointer-events: none;
  }

  .heading-text {
    font-family: 'Akira Expanded', 'Impact', 'Arial Black', sans-serif;
    font-size: clamp(16px, 2.2vw, 36px);
    font-weight: 900;
    line-height: 1.25;
    color: #1a2a35;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin: 0;
  }

  /* ── Due colonne in basso ── */
  .voci-columns {
    position: absolute;
    bottom: 10vh;
    left: 10vw;
    right: 10vw;
    display: flex;
    justify-content: space-between;
    gap: 6vw;
    opacity: 0;
    will-change: opacity;
    pointer-events: none;
  }

  .col-text {
    flex: 1;
    will-change: filter;
  }

  .col-text p {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: clamp(14px, 1.2vw, 18px);
    line-height: 1.65;
    color: #1a2a35;
    margin: 0;
    font-weight: 400;
  }

  .col-text strong {
    font-weight: 700;
  }
</style>
