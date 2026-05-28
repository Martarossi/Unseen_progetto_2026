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
          end: "+=1000",
          scrub: 1,
          onEnter:      () => { model3dVisible = true; },
          onEnterBack:  () => { model3dVisible = true; },
          onLeave:      () => { model3dVisible = false; },
          onLeaveBack:  () => { model3dVisible = false; },
        },
      });

      tl.fromTo(
        modelProps,
        {
          posX: 0, posY: 0, scale: 2.0,
          rotX: Math.PI * 6.0, rotY: Math.PI * 9.5, rotZ: Math.PI * 6.0,
          twistX: 400, twistZ: 560,
        },
        {
          posX: 0, posY: 0, scale: 0,
          rotX: Math.PI * 7.0, rotY: Math.PI * 12.0, rotZ: Math.PI * 6.0,
          twistX: 540, twistZ: 720,
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
    /* height = animation distance + 100vh ensures Gallery enters viewport
       exactly when scroll reaches end of animation (model fully gone) */
    height: calc(1000px + 100vh);
    position: relative;
  }
</style>
