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
    rotX: Math.PI * 6.0,
    rotY: Math.PI * 9.5,
    rotZ: Math.PI * 6.0,
    twistX: 400,
    twistZ: 560,
  };

  onMount(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 800px)", () => {
      const update3D = () => {
        modelPosition = [modelProps.posX, modelProps.posY, 0];
        modelScale = [modelProps.scale, modelProps.scale, modelProps.scale];
        modelRotation = [modelProps.rotX, modelProps.rotY, modelProps.rotZ];
        currentTwistX = modelProps.twistX;
        currentTwistZ = modelProps.twistZ;
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollWrapper,
          start: "top top",
          end: "+=4000",
          scrub: 2.8,
          onEnter:     () => { model3dVisible = true; },
          onEnterBack: () => { model3dVisible = true; },
        },
      });

      // Left blurs out as right clears — mirrored on scroll back
      tl.to(pLeft, {
        opacity: 0.12,
        filter: "blur(14px)",
        duration: 2,
        ease: "power1.inOut",
      }, 0);

      tl.to(pRight, {
        filter: "blur(0px)",
        duration: 2,
        ease: "power1.inOut",
      }, 0);

      // Model deforms while staying centred
      tl.fromTo(
        modelProps,
        {
          posX: 0, posY: 0, scale: 2.0,
          rotX: Math.PI * 6.0, rotY: Math.PI * 9.5, rotZ: Math.PI * 6.0,
          twistX: 400, twistZ: 560,
        },
        {
          rotX: Math.PI * 7.5,
          rotY: Math.PI * 12.0,
          rotZ: Math.PI * 7.5,
          twistX: 270,
          twistZ: 420,
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
      <p class="text-regular">L'AI analizza, stabilizza,<br>calcola e ricostruisce.</p>
      <p class="text-bold">Ma dietro ogni immagine<br>continua a esserci<br>esperienza, sensibilità<br>e presenza umana.</p>
    </div>

    <div class="voci-right" bind:this={pRight}>
      <p>Una raccolta di voci di chi <strong>vive l'evento da dietro la lente</strong>: professionisti che lavorano in condizioni estreme, in equilibrio costante tra tecnica ed emozione.</p>
    </div>

  </div>
</div>

<style>
  .voci-scroll-wrapper {
    height: 4000px;
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
    width: 26%;
    will-change: opacity, filter;
  }

  .voci-right {
    width: 26%;
    will-change: opacity, filter;
    filter: blur(12px);
  }

  .text-regular {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: clamp(14px, 1.05vw, 17px);
    line-height: 1.6;
    color: #f8f8f8;
    margin: 0 0 1.2rem;
    font-weight: 400;
  }

  .text-bold {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: clamp(15px, 1.15vw, 18px);
    font-weight: 700;
    line-height: 1.5;
    color: #f8f8f8;
    margin: 0;
  }

  .voci-right p {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: clamp(14px, 1.05vw, 17px);
    line-height: 1.6;
    color: #f8f8f8;
    margin: 0;
    font-weight: 400;
  }

  .voci-right strong {
    font-weight: 700;
  }
</style>
