<script>
  import { Canvas } from "@threlte/core";
  import * as THREE from "three";
  import BulletCard3DScene from "./BulletCard3DScene.svelte";

  /** @type {{ activeModel?: number }} */
  let { activeModel = 0 } = $props();

  let isDragging = $state(false);
  let externalRotY = $state(0);
  let lastX = 0;

  /** @type {HTMLDivElement | undefined} */
  let dragZone = $state(undefined);

  /** @param {PointerEvent} e */
  function onPointerDown(e) {
    isDragging = true;
    lastX = e.clientX;
    /** @type {HTMLElement} */ (e.currentTarget).setPointerCapture(e.pointerId);
  }

  /** @param {PointerEvent} e */
  function onPointerMove(e) {
    if (!isDragging) return;
    externalRotY += (e.clientX - lastX) * 0.01;
    lastX = e.clientX;
  }

  function onPointerUp() {
    isDragging = false;
  }
</script>

<div
  bind:this={dragZone}
  class="drag-zone"
  role="application"
  aria-label="Modello 3D interattivo — trascina per ruotare"
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
  onpointerup={onPointerUp}
  onpointercancel={onPointerUp}
  style="cursor: {isDragging ? 'grabbing' : 'grab'}"
></div>

<div class="canvas-container">
  <Canvas
    createRenderer={(canvas) => {
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      return renderer;
    }}
  >
    <BulletCard3DScene {externalRotY} {isDragging} {activeModel} />
  </Canvas>
</div>

<style>
:global(.bullet-scene-wrap) {
  position: relative;
  overflow: visible; /* senza !important: mobile può sovrascrivere con overflow: hidden */
}

.drag-zone {
  position: absolute;
  inset: 0;
  z-index: 2;
}

.canvas-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 160%;
  height: 160%;
  pointer-events: none;
  z-index: 100;
}

@media (max-width: 799px) {
  .canvas-container {
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    /* translate3d(0,0,0) promuove il canvas su un layer GPU separato:
       su iOS Safari evita che il renderer WebGL venga scartato
       quando il contenitore parent è uno scroll container. */
    transform: translate3d(0, 0, 0);
  }
}

.canvas-container :global(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
