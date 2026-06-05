<script>
  import { Canvas } from "@threlte/core";
  import * as THREE from "three";
  import BulletCard3DScene from "./BulletCard3DScene.svelte";

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

<!-- Zona drag: stessa area del contenitore, cattura i pointer events -->
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

<!-- Canvas in un wrapper assoluto molto più grande: Threlte lo dimensiona fisicamente 2× -->
<div class="canvas-container">
  <Canvas
    createRenderer={(canvas) => new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "default",
    })}
  >
    <BulletCard3DScene {externalRotY} {isDragging} />
  </Canvas>
</div>

<style>
/* Contenitore radice: deve avere position relative perché canvas-container è absolute rispetto a questo */
:global(.bullet-scene-wrap) {
  position: relative;
  overflow: visible !important;
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
  /* 1.6× rispetto al contenitore: abbastanza da overflow visivo senza uscire dalla pagina */
  width: 160%;
  height: 160%;
  pointer-events: none;
  z-index: 100;
}

.canvas-container :global(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
