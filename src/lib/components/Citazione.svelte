<script>
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import ScrollTrigger from 'gsap/dist/ScrollTrigger';

  let {
    modelPosition  = $bindable(/** @type {[number, number, number]} */ ([0, 0, 0])),
    modelScale     = $bindable(/** @type {[number, number, number]} */ ([2.2, 2.2, 2.2])),
    modelRotation  = $bindable(/** @type {[number, number, number]} */ ([0, 0, 0])),
    currentTwistX  = $bindable(72),
    currentTwistZ  = $bindable(72),
    model3dVisible = $bindable(false),
  } = $props();

  /** @type {HTMLElement | null} */
  let scrollWrapper = null;

  // Corrisponde allo stato finale di DatiTecnici
  const modelProps = {
    rotX: Math.PI * 6.0,
    rotY: Math.PI * 10.4,
    rotZ: Math.PI * 6.0,
    twistX: 72,
    twistZ: 72,
  };

  const midState = {
    rotX: Math.PI * 6.8,
    rotY: Math.PI * 11.5,
    rotZ: Math.PI * 6.8,
    twistX: 260,
    twistZ: 240,
  };

  const settleState = {
    rotX: Math.PI * 7.2,
    rotY: Math.PI * 12.5,
    rotZ: Math.PI * 7.2,
    twistX: 140,
    twistZ: 140,
  };

  onMount(() => {
    const mm = gsap.matchMedia();

    mm.add('(min-width: 800px)', () => {
      const update3D = () => {
        modelPosition[0] = 0; modelPosition[1] = 0; modelPosition[2] = 0;
        modelScale[0] = modelScale[1] = modelScale[2] = 2.2;
        modelRotation[0] = modelProps.rotX;
        modelRotation[1] = modelProps.rotY;
        modelRotation[2] = modelProps.rotZ;
        currentTwistX = modelProps.twistX;
        currentTwistZ = modelProps.twistZ;
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollWrapper,
          start: 'top bottom',
          end: '+=3500',
          scrub: 2,
          onEnter:     () => { model3dVisible = true; },
          onEnterBack: () => { model3dVisible = true; },
        },
      });

      tl.to(modelProps, {
        ...midState,
        duration: 1.5,
        ease: 'power2.inOut',
        onUpdate: update3D,
      });

      tl.to({}, { duration: 0.5 });

      tl.to(modelProps, {
        ...settleState,
        duration: 1.5,
        ease: 'power2.out',
        onUpdate: update3D,
      });

      return () => { tl.kill(); };
    });
  });
</script>

<div class="citazione-wrapper" bind:this={scrollWrapper}>
  <div class="citazione-sticky">
    <img src="/citazione.png" alt="citazione" class="citazione-img" />
    <p class="citazione-autore">
      <strong>Yiannis Exarchos,</strong> <em>CEO di Olympic<br />Broadcasting Services (OBS)</em>
    </p>
  </div>
</div>

<style>
  .citazione-wrapper {
    height: calc(100vh + 250px);
  }

  @media (min-width: 800px) {
    .citazione-wrapper {
      height: 4000px;
    }
  }

  .citazione-sticky {
    position: sticky;
    top: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  }

  .citazione-img {
    width: clamp(420px, 82vw, 1200px);
    height: auto;
    display: block;
  }

  .citazione-autore {
    width: clamp(420px, 82vw, 1200px);
    text-align: right;
    margin: 8vh 0 0 0;
    padding: 0;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: clamp(11px, 1vw, 14px);
    color: #ffffff;
    line-height: 1.5;
    letter-spacing: 0.02em;
  }

  .citazione-autore strong {
    font-weight: 700;
    font-style: normal;
  }

  .citazione-autore em {
    font-style: italic;
    font-weight: 400;
  }
</style>
