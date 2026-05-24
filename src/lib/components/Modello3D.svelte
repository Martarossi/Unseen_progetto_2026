<script>
  import { Canvas } from "@threlte/core";
  import Scene from "./Scene.svelte";
  import * as THREE from "three";

  /**
   * @typedef {{ opacity: number, groupRotY: number, riseY: number }} CardProps
   */

  /** @typedef {{ angle: number, y: number, opacity: number, centerX: number, centerY: number }} OrbitProps */

  /** @type {{
   *   position?: [number, number, number],
   *   scale?: [number, number, number],
   *   rotation?: [number, number, number],
   *   twistX?: number,
   *   twistZ?: number,
   *   cardProps?: CardProps,
   *   orbitProps?: OrbitProps,
   *   orbitProps2?: OrbitProps,
   *   orbitProps3?: OrbitProps,
   *   visible?: boolean,
   *   isClicked?: boolean,
   *   onCardClick?: () => void
   * }} */
  let {
    position = [0, 0, 0],
    scale = [1.5, 1.5, 1.5],
    rotation = [0, 0, 0],
    twistX = 360,
    twistZ = 200,
    cardProps: _cardProps = { opacity: 0, groupRotY: 0, riseY: 0 },
    orbitProps  = /** @type {OrbitProps} */ ({ angle: 0, y: -3, opacity: 0, centerX: 0, centerY: 0 }),
    orbitProps2 = /** @type {OrbitProps} */ ({ angle: 0, y: -3, opacity: 0, centerX: 0, centerY: 0 }),
    orbitProps3 = /** @type {OrbitProps} */ ({ angle: 0, y: -3, opacity: 0, centerX: 0, centerY: 0 }),
    visible = false,
    isClicked = false,
    onCardClick = undefined,
  } = $props();
</script>

<div class="model3d-layer" class:visible>
  {#if isClicked}
    <Canvas
      createRenderer={(canvas) => new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      })}
    >
      <Scene
        {position}
        {scale}
        {rotation}
        {twistX}
        {twistZ}
        {orbitProps}
        {orbitProps2}
        {orbitProps3}
        {onCardClick}
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
  }

  .model3d-layer.visible {
    opacity: 1;
  }
</style>
