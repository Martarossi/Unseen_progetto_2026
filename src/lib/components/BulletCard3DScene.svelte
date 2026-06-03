<script>
  import { T, useTask, useThrelte } from "@threlte/core";
  import { useGltf } from "@threlte/extras";
  import * as THREE from "three";

  /** @type {{ externalRotY?: number, isDragging?: boolean }} */
  let { externalRotY = 0, isDragging = false } = $props();

  const gltf = useGltf("/modello_bullettime.glb");
  const { renderer } = useThrelte();

  /** @type {THREE.Group|undefined} */
  let sceneRef = $state(undefined);
  /** @type {THREE.PerspectiveCamera|undefined} */
  let cameraRef = $state(undefined);

  let centered = false;
  let offsetX = $state(0);
  let offsetY = $state(0);
  let offsetZ = $state(0);
  let cameraZ = $state(12);

  let autoRotY = 0;

  useTask((dt) => {
    // Centramento e calcolo distanza camera (una sola volta, dopo che sceneRef è pronto)
    if (!centered && sceneRef) {
      centered = true;

      // Centro geometrico dell'intera scena (XZ)
      const sceneBox0 = new THREE.Box3().setFromObject(sceneRef);
      const sceneCenter0 = sceneBox0.getCenter(new THREE.Vector3());

      const humanKeywords = ['human', 'person', 'figure', 'body', 'atleta', 'uomo', 'corpo', 'character'];
      let humanMesh = /** @type {THREE.Mesh|null} */ (null);
      let bestScore = -Infinity;

      sceneRef.traverse((child) => {
        if (!(child instanceof THREE.Mesh || child instanceof THREE.SkinnedMesh)) return;

        // Priorità per nome
        const name = child.name.toLowerCase();
        if (humanKeywords.some(k => name.includes(k))) { humanMesh = /** @type {THREE.Mesh} */ (child); bestScore = Infinity; return; }
        if (bestScore === Infinity) return;

        const box = new THREE.Box3().setFromObject(child);
        const meshCenter = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // La figura umana è vicina al centro XZ del rig E ha forma verticale
        const distXZ = Math.sqrt((meshCenter.x - sceneCenter0.x) ** 2 + (meshCenter.z - sceneCenter0.z) ** 2);
        const centrality = 1 / (distXZ + 0.01);
        const tallness = size.y / Math.max(size.x, size.z, 0.001);
        const score = centrality * tallness;

        if (score > bestScore) { bestScore = score; humanMesh = /** @type {THREE.Mesh} */ (child); }
      });

      const humanTarget = humanMesh ?? sceneRef;
      const humanBox = new THREE.Box3().setFromObject(humanTarget);
      const center = humanBox.getCenter(new THREE.Vector3());
      offsetX = -center.x;
      offsetY = -center.y;
      offsetZ = -center.z;

      // Distanza camera basata sull'intero modello
      const fullBox = new THREE.Box3().setFromObject(sceneRef);
      const fullSize = fullBox.getSize(new THREE.Vector3());
      const fovRad = 60 * (Math.PI / 180);
      const canvas = renderer.domElement;
      const aspect = canvas.clientWidth / Math.max(canvas.clientHeight, 1);
      const fovH = 2 * Math.atan(Math.tan(fovRad / 2) * aspect);
      const distV = (fullSize.y / 2) / Math.tan(fovRad / 2);
      const distH = (fullSize.x / 2) / Math.tan(fovH / 2);
      cameraZ = Math.max(distV, distH) * 0.75 + fullSize.z / 2;

      if (cameraRef) cameraRef.position.set(0, 0, cameraZ);
    }

    // Rotazione: auto-rotate quando non si trascina
    if (!isDragging) autoRotY += dt * 0.5;
    if (sceneRef) sceneRef.rotation.y = autoRotY + externalRotY;
  });
</script>

<T.PerspectiveCamera makeDefault fov={60} position={[0, 0, 9]} bind:ref={cameraRef} />

<T.AmbientLight intensity={1.2} />
<T.DirectionalLight position={[5, 8, 5]} intensity={2.5} />
<T.DirectionalLight position={[-4, -2, -3]} intensity={0.6} color="#60aacc" />

{#if $gltf}
  <T
    is={$gltf.scene}
    bind:ref={sceneRef}
    scale={[8.0, 8.0, 8.0]}
    position={[offsetX, offsetY, offsetZ]}
  />
{/if}
