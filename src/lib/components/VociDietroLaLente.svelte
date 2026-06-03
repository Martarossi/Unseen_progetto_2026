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
  let pLeft = null;
  /** @type {HTMLElement|null} */
  let pRight = null;

  const modelProps = {
    posX: 0,
    posY: 0,
    scale: 2.0,
    rotX: Math.PI * 5.5,
    rotY: Math.PI * 9.0,
    rotZ: Math.PI * 5.5,
    twistX: 155,
    twistZ: 175,
  };

  onMount(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 800px)", () => {
      let triggerDone = false;

      const update3D = () => {
        if (triggerDone) return;
        modelRotation = [modelProps.rotX, modelProps.rotY, modelProps.rotZ];
        currentTwistX = modelProps.twistX;
        currentTwistZ = modelProps.twistZ;
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollWrapper,
          start: "top bottom",
          end: "+=3000",
          scrub: 3,
          onEnter:      () => { triggerDone = false; model3dVisible = true; },
          onEnterBack:  () => { triggerDone = false; model3dVisible = true; },
          onLeave:      () => { triggerDone = true; },
        },
      });

      // Hold phase at start (position 0–1.5): left stays sharp and readable
      // Then cross-fade: left blurs out, right clears in
      tl.to(pLeft, {
        opacity: 0.12,
        filter: "blur(14px)",
        duration: 2,
        ease: "power1.inOut",
      }, 1.5);

      tl.to(pRight, {
        filter: "blur(0px)",
        duration: 2,
        ease: "power1.inOut",
      }, 1.5);

      tl.fromTo(
        modelProps,
        {
          posX: 0, posY: 0, scale: 2.0,
          rotX: Math.PI * 5.5, rotY: Math.PI * 9.0, rotZ: Math.PI * 5.5,
          twistX: 155, twistZ: 175,
        },
        {
          rotX: Math.PI * 7.0,
          rotY: Math.PI * 11.5,
          rotZ: Math.PI * 7.0,
          twistX: 195,
          twistZ: 210,
          duration: 4,
          ease: "power1.inOut",
          onUpdate: update3D,
        },
        0,
      );

      return () => { tl.kill(); };
    });
  });
</script>

<div class="voci-scroll-wrapper" bind:this={scrollWrapper}>
  <div class="voci-sticky">

    <div class="voci-left" bind:this={pLeft}>
      <p class="text-regular">L’AI, però, funge solo da tecnologia <br>che analizza, stabilizza,<br>calcola e ricostruisce.</p>
      <p class="text-bold">Ma dietro ogni immagine<br>rimangono l’esperienza,<br>esperienza, sensibilità<br>la presenza e la sensibilità umana.</p>
    </div>

    <div class="voci-right" bind:this={pRight}>
      <p>Una raccolta di voci di chi <br><strong>vive l'evento da dietro la lente</strong>: professionisti che lavorano <br>in condizioni estreme, in equilibrio costante tra tecnica ed emozione.</p>
    </div>

  </div>
</div>

<style>
  .voci-scroll-wrapper {
    height: 3000px;
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

  .voci-left {
    width: 30%;
    will-change: opacity, filter;
  }

  .voci-right {
    width: 30%;
    will-change: opacity, filter;
    filter: blur(12px);
  }

  .text-regular {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: clamp(17px, 1.4vw, 22px);
    line-height: 1.6;
    color: #f8f8f8;
    margin: 0;
    font-weight: 400;
  }

  .text-bold {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: clamp(19px, 1.6vw, 26px);
    font-weight: 700;
    line-height: 1.5;
    color: #f8f8f8;
    margin: 0;
  }

  .voci-right p {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: clamp(17px, 1.4vw, 22px);
    line-height: 1.6;
    color: #f8f8f8;
    margin: 0;
    font-weight: 400;
  }

  .voci-right strong {
    font-weight: 700;
  }
</style>
