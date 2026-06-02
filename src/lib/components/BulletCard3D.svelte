<script>
  import { Canvas } from "@threlte/core";
  import * as THREE from "three";
  import BulletCard3DScene from "./BulletCard3DScene.svelte";
</script>

<div class="bullet-3d-wrap">
  <Canvas
    createRenderer={(canvas) => new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "default",
    })}
  >
    <BulletCard3DScene />
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
