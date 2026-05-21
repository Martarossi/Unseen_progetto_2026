<script>
  import { Canvas } from "@threlte/core";
  import Scene from "./Scene.svelte";

  /**
   * @typedef {{ opacity: number, groupRotY: number, riseY: number }} CardProps
   */

  /** @type {{
   *   position?: [number, number, number],
   *   scale?: [number, number, number],
   *   rotation?: [number, number, number],
   *   twistX?: number,
   *   twistZ?: number,
   *   cardProps?: CardProps,
   *   visible?: boolean,
   *   isClicked?: boolean
   * }} */
  let {
    position = [0, 0, 0],
    scale = [1.5, 1.5, 1.5],
    rotation = [0, 0, 0],
    twistX = 360,
    twistZ = 200,
    cardProps = { opacity: 0, groupRotY: 0, riseY: 0 },
    visible = false,
    isClicked = false,
  } = $props();
</script>

<div class="model3d-layer" class:visible>
  {#if isClicked}
    <Canvas
      rendererParameters={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      }}
    >
      <Scene
        {position}
        {scale}
        {rotation}
        {twistX}
        {twistZ}
        {cardProps}
      />
    </Canvas>
  {/if}
</div>

<style>
  .model3d-layer {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 50;
    opacity: 0;
    transition: opacity 0.5s ease;
    will-change: opacity;
  }

  .model3d-layer.visible {
    opacity: 1;
  }
</style>
