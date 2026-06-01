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

  const modelProps = {
    posX: 0,
    posY: 0,
    scale: 2.0,
    rotX: Math.PI * 7.0,
    rotY: Math.PI * 11.5,
    rotZ: Math.PI * 7.0,
    twistX: 195,
    twistZ: 210,
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
          start: "top bottom",
          end: "+=2000",
          scrub: true,
          onEnter:     () => { model3dVisible = true; },
          onEnterBack: () => { model3dVisible = true; },
          onLeave:     () => { model3dVisible = false; },
          onLeaveBack: () => { model3dVisible = true; },
        },
      });

      tl.fromTo(
        modelProps,
        {
          posX: 0, posY: 0, scale: 2.0,
          rotX: Math.PI * 7.0, rotY: Math.PI * 11.5, rotZ: Math.PI * 7.0,
          twistX: 195, twistZ: 210,
        },
        {
          posX: 0, posY: 0, scale: 0.01,
          rotX: Math.PI * 5.5, rotY: Math.PI * 9.5, rotZ: Math.PI * 5.5,
          twistX: 150, twistZ: 165,
          duration: 4.0,
          ease: "power2.in",
          onUpdate: update3D,
        },
        0,
      );

      return () => {
        tl.kill();
      };
    });
  });
</script>

<div class="model-shrink-wrapper" bind:this={scrollWrapper}></div>

<style>
  .model-shrink-wrapper {
    /* start="top bottom": trigger begins when this element's top hits viewport bottom,
       which is exactly when VociDietroLaLente's trigger ends (no gap).
       height=2000px: Gallery enters viewport precisely when shrink completes. */
    height: 2000px;
    position: relative;
  }
</style>
