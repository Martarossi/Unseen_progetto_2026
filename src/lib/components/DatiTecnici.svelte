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

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollWrapper,
          start: 'top top',
          end: '+=4500',
          scrub: 2,
          onEnter:     () => { model3dVisible = true;  dotsVisible = true;  },
          onLeave:     () => { dotsVisible = false; },
          onEnterBack: () => { model3dVisible = true;  dotsVisible = true;  },
          onLeaveBack: () => { model3dVisible = false; dotsVisible = false; ringProps.angle = 0; dotsRingAngle = 0; },
        },
      });

      // Scroll-driven reveals: ring → dots → cards (concurrent con Phase 1)
      tl.fromTo('.dt-orbit-ring', { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0);
      tl.fromTo('.dt-dot-group',  { opacity: 0 }, { opacity: 1, duration: 0.25, stagger: 0.07, ease: 'power2.out' }, 0.3);
      tl.fromTo('.dt-cards-row',  { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' }, 0.7);

      // Phase 1 (~750px): model calms into display state
      tl.to(modelProps, { ...displayState, duration: 1.0, ease: 'power2.out', onUpdate: update3D }, 0);
      // Phase 2 (~750px): GUIDE active — hold
      tl.to({}, { duration: 1.0 }, 1.0);
      // Phase 3 (~750px): ring rotates to ENHANCING
      tl.to(ringProps, { angle: 120, duration: 1.0, ease: 'sine.inOut', onUpdate: updateRing }, 2.0);
      // Phase 4 (~750px): ENHANCING active — hold
      tl.to({}, { duration: 1.0 }, 3.0);
      // Phase 5 (~750px): ring rotates to HIGHLIGHT
      tl.to(ringProps, { angle: 240, duration: 1.0, ease: 'sine.inOut', onUpdate: updateRing }, 4.0);
      // Phase 6 (~750px): HIGHLIGHT active + subtle model drift
      tl.to(modelProps, { rotY: displayState.rotY + Math.PI * 0.4, duration: 1.0, ease: 'sine.inOut', onUpdate: update3D }, 5.0);

      return () => { tl.kill(); };
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
