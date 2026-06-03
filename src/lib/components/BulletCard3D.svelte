<script>
  import { Canvas } from "@threlte/core";
  import * as THREE from "three";
  import BulletCard3DScene from "./BulletCard3DScene.svelte";

  let isDragging = $state(false);
  let externalRotY = $state(0);
  let lastX = 0;

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
  class="bullet-3d-wrap"
  role="application"
  aria-label="Modello 3D interattivo — trascina per ruotare"
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
  onpointerup={onPointerUp}
  onpointercancel={onPointerUp}
  style="cursor: {isDragging ? 'grabbing' : 'grab'}"
>
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
.bullet-3d-wrap {
  width: 100%;
  height: 100%;
  display: block;
}

.bullet-3d-wrap :global(canvas) {
  width: 100% !important;
  height: 100% !important;
  display: block;
}
</style>
