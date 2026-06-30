<script>
  import { Canvas } from "@threlte/core";
  import * as THREE from "three";
  import BulletCard3DScene from "./BulletCard3DScene.svelte";

  let isDragging = $state(false);
  let externalRotY = $state(0);
  let lastX = 0;
  let activeModel = $state(0);
  const TOTAL_MODELS = 3;

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

  /** @param {MouseEvent} e */
  function nextModel(e) {
    e.stopPropagation();
    if (activeModel < TOTAL_MODELS - 1) activeModel++;
  }

  /** @param {MouseEvent} e */
  function prevModel(e) {
    e.stopPropagation();
    if (activeModel > 0) activeModel--;
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

{#if activeModel > 0}
  <button class="arrow-btn left" onclick={prevModel} aria-label="Modello precedente">
    <svg width="5" height="9" viewBox="0 0 8 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 1L1 6.5L7 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
{/if}

{#if activeModel < TOTAL_MODELS - 1}
  <button class="arrow-btn right" onclick={nextModel} aria-label="Modello successivo">
    <svg width="5" height="9" viewBox="0 0 8 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1L7 6.5L1 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
{/if}

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

.arrow-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.75);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 22px;
  line-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  transition: background 0.2s, color 0.2s;
}

.arrow-btn:hover {
  background: rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 1);
}

.arrow-btn.right {
  right: 10px;
}

.arrow-btn.left {
  left: 10px;
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
