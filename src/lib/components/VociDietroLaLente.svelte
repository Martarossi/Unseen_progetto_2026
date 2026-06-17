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
  /** @type {HTMLElement|null} */
  let vociBackground = null;

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
        modelScale[0] = modelScale[1] = modelScale[2] = modelProps.scale;
        modelRotation[0] = modelProps.rotX;
        modelRotation[1] = modelProps.rotY;
        modelRotation[2] = modelProps.rotZ;
        currentTwistX = modelProps.twistX;
        currentTwistZ = modelProps.twistZ;
      };

      const letters = introTextRef?.querySelectorAll(".voci-letter") ?? [];

      // Sinistra nitida, destra sfocata; lo scroll inverterà i ruoli
      gsap.set(colLeftRef,  { filter: "blur(0px)" });
      gsap.set(colRightRef, { filter: "blur(16px)" });

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
            modelPosition[0] = 0; modelPosition[1] = 0; modelPosition[2] = 0;
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
            modelPosition[0] = 0; modelPosition[1] = 0; modelPosition[2] = 0;
            letterStarted  = false;
            letterTl.pause(0);
            gsap.set(letters,       { opacity: 0, filter: "blur(10px)", y: 20 });
            gsap.set(headingRef,    { opacity: 0, y: 20 });
            gsap.set(columnsRef,    { opacity: 0, y: 20 });
            gsap.set(colLeftRef,  { filter: "blur(0px)" });
            gsap.set(colRightRef, { filter: "blur(16px)" });
            gsap.set(vociBackground, { opacity: 0 });
          },
          onLeaveBack: () => {
            model3dVisible = false;
            letterStarted  = false;
            letterTl.pause(0);
            gsap.set(letters,       { opacity: 0 });
            gsap.set(headingRef,    { opacity: 0 });
            gsap.set(columnsRef,    { opacity: 0 });
            gsap.set(colLeftRef,  { filter: "blur(0px)" });
            gsap.set(colRightRef, { filter: "blur(16px)" });
            gsap.set(vociBackground, { opacity: 0 });
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

      shrinkTl.fromTo(vociBackground,
        { opacity: 0 },
        { opacity: 1, duration: 3.5, ease: "power1.inOut" },
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
      // Inizia a 5000 così le colonne sono visibili; finisce a 7000 che è dentro lo sticky range
      const blurTl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollWrapper,
          start: "top+=5000 top",
          end: "top+=7000 top",
          scrub: 1.5,
        }
      });

      blurTl
        // Sinistra sfoca, destra si nitidisce — in parallelo
        .fromTo(colLeftRef,
          { filter: "blur(0px)" },
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

<div class="voci-bg" bind:this={vociBackground}></div>
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
      <img src="/titolo-sez-cameraman.png" alt="Dietro ad ogni immagine rimangono l'esperienza, la presenza e la sensibilità umana." class="heading-img" />
    </div>

    <!-- Due colonne: inizialmente sfocate, si nitidiscono una alla volta con lo scroll -->
    <div class="voci-columns" bind:this={columnsRef}>
      <div class="col-text" bind:this={colLeftRef}>
        <p>L'AI funge solo da tecnologia <br>che analizza, stabilizza, calcola <br>e ricostruisce.</p>
      </div>
      <div class="col-text" bind:this={colRightRef}>
        <p>Una raccolta di voci di chi <strong>vive l'evento<br> da dietro la lente</strong>: professionisti <br>che lavorano in condizioni estreme,<br> in equilibrio costante tra tecnica ed emozione.</p>
      </div>
    </div>

  </div>
</div>

<style>
  .voci-bg {
    position: fixed;
    inset: 0;
    background-image: url('/sfondo-sez-cameraman.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    z-index: -1;
    opacity: 0;
    pointer-events: none;
  }

  .voci-white-overlay {
    position: fixed;
    inset: 0;
    background: #ffffff;
    z-index: -1;
    opacity: 0;
    pointer-events: none;
  }

  .voci-scroll-wrapper {
    height: 9000px;
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

  /* ── Titolo allineato a sinistra ── */
  .voci-heading {
    position: absolute;
    top: 38%;
    left: 8vw;
    transform: translateY(-50%);
    text-align: left;
    width: 78%;
    opacity: 0;
    will-change: opacity;
    pointer-events: none;
  }

  .heading-img {
    display: block;
    width: 90%;
    height: auto;
  }

  /* ── Due colonne in basso ── */
  .voci-columns {
    position: absolute;
    bottom: 20vh;
    left: 8vw;
    right: 8vw;
    display: flex;
    justify-content: space-between;
    gap: 8vw;
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
    font-size: clamp(18px, 1.8vw, 24px);
    line-height: 1.65;
    color: #1a2a35;
    margin: 0;
    font-weight: 400;
  }

  .col-text strong {
    font-weight: 700;
  }
</style>
