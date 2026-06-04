<script>
  import { onMount } from 'svelte';
  import gsap from 'gsap';

  let {
    modelPosition  = $bindable(/** @type {[number, number, number]} */ ([0, 0, 0])),
    modelScale     = $bindable(/** @type {[number, number, number]} */ ([2.0, 2.0, 2.0])),
    modelRotation  = $bindable(/** @type {[number, number, number]} */ ([0, 0, 0])),
    currentTwistX  = $bindable(80),
    currentTwistZ  = $bindable(80),
    model3dVisible  = $bindable(false),
    dotsVisible     = $bindable(false),
    dotsRingVisible = $bindable(false),
    dotsRingAngle   = $bindable(0),
  } = $props();

  /** @type {HTMLElement | null} */
  let scrollWrapper = null;
  /** @type {HTMLElement | null} */
  let sectionEl = null;

  const modelProps = {
    rotX: Math.PI * 5.5,
    rotY: Math.PI * 9.0,
    rotZ: Math.PI * 5.5,
    twistX: 155,
    twistZ: 175,
  };

  const displayState = {
    rotX: Math.PI * 6.0,
    rotY: Math.PI * 10.0,
    rotZ: Math.PI * 6.0,
    twistX: 72,
    twistZ: 72,
  };

  onMount(() => {
    const mm = gsap.matchMedia();

    mm.add('(min-width: 800px)', () => {
      const update3D = () => {
        modelPosition = [0, 0, 0];
        modelScale    = [2.2, 2.2, 2.2];
        modelRotation = [modelProps.rotX, modelProps.rotY, modelProps.rotZ];
        currentTwistX = modelProps.twistX;
        currentTwistZ = modelProps.twistZ;
      };

      const ringProps = { angle: 0 };
      const updateRing = () => { dotsRingAngle = ringProps.angle; };

      // Cerchio appare prima che la sezione si pinni
      const earlyRingTl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollWrapper,
          start: 'top 85%',
          end: 'top top',
          onEnter:     () => { dotsRingVisible = true; },
          onLeaveBack: () => { dotsRingVisible = false; dotsRingAngle = 0; },
        }
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollWrapper,
          start: 'top top',
          end: '+=4500',
          scrub: 2,
          onEnter:     () => { model3dVisible = true;  dotsVisible = true;                       },
          onLeave:     () => {                          dotsVisible = false; dotsRingVisible = false; },
          onEnterBack: () => { model3dVisible = true;  dotsVisible = true;  dotsRingVisible = true;  },
          onLeaveBack: () => { model3dVisible = false; dotsVisible = false; dotsRingVisible = false; ringProps.angle = 0; dotsRingAngle = 0; },
        },
      });

      // Phase 1 (~750px): model calms into display state
      tl.to(modelProps, { ...displayState, duration: 1.0, ease: 'power2.out', onUpdate: update3D });

      // Phase 2 (~750px): GUIDE active — hold
      tl.to({}, { duration: 1.0 });

      // Phase 3 (~750px): ring rotates to ENHANCING
      tl.to(ringProps, { angle: 120, duration: 1.0, ease: 'sine.inOut', onUpdate: updateRing });

      // Phase 4 (~750px): ENHANCING active — hold
      tl.to({}, { duration: 1.0 });

      // Phase 5 (~750px): ring rotates to HIGHLIGHT
      tl.to(ringProps, { angle: 240, duration: 1.0, ease: 'sine.inOut', onUpdate: updateRing });

      // Phase 6 (~750px): HIGHLIGHT active + subtle model drift
      tl.to(modelProps, {
        rotY: displayState.rotY + Math.PI * 0.4,
        duration: 1.0,
        ease: 'sine.inOut',
        onUpdate: update3D,
      });

      return () => { tl.kill(); earlyRingTl.kill(); };
    });

    mm.add('(max-width: 799px)', () => {
      const mobileTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionEl,
          start: 'top 75%',
          end: 'bottom 25%',
          onEnter:     () => { dotsVisible = true;  },
          onLeave:     () => { dotsVisible = false; },
          onEnterBack: () => { dotsVisible = true;  },
          onLeaveBack: () => { dotsVisible = false; },
        }
      });
      return () => { mobileTl.kill(); };
    });
  });
</script>

<div class="dt-scroll-wrapper" bind:this={scrollWrapper}>
  <section class="dt-section" bind:this={sectionEl}></section>
</div>

<style>
  .dt-scroll-wrapper {
    position: relative;
  }

  @media (min-width: 800px) {
    .dt-scroll-wrapper {
      height: 5250px;
    }

    .dt-section {
      position: sticky;
      top: 0;
      height: 100vh;
      width: 100%;
    }
  }

  @media (max-width: 799px) {
    .dt-section {
      height: 100vh;
      width: 100%;
    }
  }
</style>
