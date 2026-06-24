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

  // Stato iniziale: corrisponde esattamente a dove Stats termina (wakeState)
  const modelProps = {
    scale: 2.0,
    rotX: Math.PI * 5.5,
    rotY: Math.PI * 9.0,
    rotZ: Math.PI * 5.5,
    twistX: 155,
    twistZ: 175,
  };

  const displayState = {
    scale: 2.2,
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
        modelScale    = [modelProps.scale, modelProps.scale, modelProps.scale];
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
          scrub: 0.5,          // 1:1 con scroll, zero lag autonomo
          onEnter:     () => { model3dVisible = true;  dotsVisible = true;  },
          onLeave:     () => { dotsVisible = false; },
          onEnterBack: () => { model3dVisible = true;  dotsVisible = true;  },
          onLeaveBack: () => { model3dVisible = false; dotsVisible = false; },
        },
      });

      // Reveals: ring → dots → cards
      tl.fromTo('.dt-orbit-ring', { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'none' }, 0);
      tl.fromTo('.dt-dot-group',  { opacity: 0 }, { opacity: 1, duration: 0.25, stagger: 0.07, ease: 'none' }, 0.3);
      tl.fromTo('.dt-cards-row',  { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'none' }, 0.7);

      // Phase 1: modello si stabilizza (0→1.0) — lineare, segue lo scroll
      tl.to(modelProps, { ...displayState, duration: 1.0, ease: 'none', onUpdate: update3D }, 0);
      // Buffer GUIDE: l'utente può leggere senza che nulla si muova (1.0→1.5)
      tl.to({}, { duration: 0.5 }, 1.0);
      // Phase 2: anello ruota verso ENHANCING (1.5→2.5)
      tl.to(ringProps, { angle: 120, duration: 1.0, ease: 'none', onUpdate: updateRing }, 1.5);
      // Buffer ENHANCING (2.5→3.0)
      tl.to({}, { duration: 0.5 }, 2.5);
      // Phase 3: anello ruota verso HIGHLIGHT (3.0→4.0)
      tl.to(ringProps, { angle: 240, duration: 1.0, ease: 'none', onUpdate: updateRing }, 3.0);
      // Buffer HIGHLIGHT (4.0→4.5)
      tl.to({}, { duration: 0.5 }, 4.0);

      return () => { tl.kill(); };
    });

    mm.add('(max-width: 799px)', () => {
      const update3D = () => {
        modelPosition = [0, 0, 0];
        modelScale    = [modelProps.scale, modelProps.scale, modelProps.scale];
        modelRotation = [modelProps.rotX, modelProps.rotY, modelProps.rotZ];
        currentTwistX = modelProps.twistX;
        currentTwistZ = modelProps.twistZ;
      };

      // Set starting scale slightly smaller for mobile
      modelProps.scale = 1.35;
      displayState.scale = 1.35;

      const mobileTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionEl,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5,
          onEnter:     () => { model3dVisible = true;  dotsVisible = true;  },
          onLeave:     () => { dotsVisible = false; },
          onEnterBack: () => { model3dVisible = true;  dotsVisible = true;  },
          onLeaveBack: () => { model3dVisible = false; dotsVisible = false; },
        }
      });

      mobileTl.to(modelProps, { ...displayState, duration: 1.0, ease: 'none', onUpdate: update3D });

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
      height: 5500px;
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
