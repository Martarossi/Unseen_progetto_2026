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
  let readyFrames = 0;
  let offsetX = $state(0);
  let offsetY = $state(0);
  let offsetZ = $state(0);
  let cameraZ = $state(12);

  let autoRotY = 0;

  // Materiale particellare identico a Scene.svelte
  const uTime = { value: 0 };

  const particleMaterial = new THREE.PointsMaterial({
    color: 0xC9D7DC,
    size: 2.0,
    sizeAttenuation: false,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  particleMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime;

    shader.vertexShader = `uniform float uTime;\n` + shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>

      vec3 wave;
      wave.x = sin(transformed.y * 3.5 + uTime * 2.2) * cos(transformed.z * 3.0 + uTime * 1.7);
      wave.y = cos(transformed.x * 3.0 + uTime * 2.0) * sin(transformed.z * 3.5 + uTime * 2.2);
      wave.z = sin(transformed.x * 3.5 + uTime * 1.7) * cos(transformed.y * 3.0 + uTime * 2.5);

      transformed += wave * 0.008;
      `
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      if (dist > 0.5) discard;
      float intensity = smoothstep(0.5, 0.0, dist);
      diffuseColor.a *= intensity;
      `
    );
  };

  // Campionamento uniforme sulla superficie dei triangoli (identico a Scene.svelte)
  /** @param {THREE.BufferGeometry} geometry @param {number} count */
  function samplePointsFromGeometry(geometry, count) {
    const positionAttr = geometry.attributes.position;
    if (!positionAttr) return geometry;

    const indexAttr = geometry.index;
    const vertexCount = positionAttr.count;
    const sampledPositions = new Float32Array(count * 3);

    const vA = new THREE.Vector3();
    const vB = new THREE.Vector3();
    const vC = new THREE.Vector3();
    const point = new THREE.Vector3();

    if (indexAttr) {
      const triangleCount = indexAttr.count / 3;
      for (let i = 0; i < count; i++) {
        const triIndex = Math.floor(Math.random() * triangleCount) * 3;
        vA.fromBufferAttribute(positionAttr, indexAttr.getX(triIndex));
        vB.fromBufferAttribute(positionAttr, indexAttr.getY(triIndex));
        vC.fromBufferAttribute(positionAttr, indexAttr.getZ(triIndex));

        const sqrtR1 = Math.sqrt(Math.random());
        const r2 = Math.random();
        const u = 1 - sqrtR1;
        const v = r2 * sqrtR1;

        point.set(0, 0, 0).addScaledVector(vA, u).addScaledVector(vB, v).addScaledVector(vC, 1 - u - v);
        sampledPositions[i * 3]     = point.x;
        sampledPositions[i * 3 + 1] = point.y;
        sampledPositions[i * 3 + 2] = point.z;
      }
    } else {
      const triangleCount = vertexCount / 3;
      for (let i = 0; i < count; i++) {
        const triIndex = Math.floor(Math.random() * triangleCount) * 3;
        vA.fromBufferAttribute(positionAttr, triIndex);
        vB.fromBufferAttribute(positionAttr, triIndex + 1);
        vC.fromBufferAttribute(positionAttr, triIndex + 2);

        const sqrtR1 = Math.sqrt(Math.random());
        const r2 = Math.random();
        const u = 1 - sqrtR1;
        const v = r2 * sqrtR1;

        point.set(0, 0, 0).addScaledVector(vA, u).addScaledVector(vB, v).addScaledVector(vC, 1 - u - v);
        sampledPositions[i * 3]     = point.x;
        sampledPositions[i * 3 + 1] = point.y;
        sampledPositions[i * 3 + 2] = point.z;
      }
    }

    const sampledGeom = new THREE.BufferGeometry();
    sampledGeom.setAttribute('position', new THREE.BufferAttribute(sampledPositions, 3));
    return sampledGeom;
  }

  // Conversione mesh → particelle (identica a Scene.svelte)
  $effect(() => {
    if (!$gltf?.scene) return;

    /** @type {THREE.Mesh[]} */
    const meshesToConvert = [];
    $gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && !child.userData.isParticleConverted) {
        meshesToConvert.push(child);
      }
    });

    meshesToConvert.forEach((mesh) => {
      mesh.visible = false;
      mesh.userData.isParticleConverted = true;

      const denseGeometry = samplePointsFromGeometry(mesh.geometry, 35000);
      const points = new THREE.Points(denseGeometry, particleMaterial);
      points.position.copy(mesh.position);
      points.rotation.copy(mesh.rotation);
      points.scale.copy(mesh.scale);
      mesh.parent?.add(points);
    });
  });

  // Animazione uTime
  $effect(() => {
    let rafId = requestAnimationFrame(function loop() {
      uTime.value += 0.015;
      rafId = requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(rafId);
  });

  useTask((dt) => {
    if (!centered && sceneRef) {
      const canvas = renderer.domElement;
      if (canvas.clientWidth === 0 || canvas.clientHeight === 0) { readyFrames = 0; return; }
      if (++readyFrames < 5) return;
      centered = true;

      const sceneBox0 = new THREE.Box3().setFromObject(sceneRef);
      const sceneCenter0 = sceneBox0.getCenter(new THREE.Vector3());

      const humanKeywords = ['human', 'person', 'figure', 'body', 'atleta', 'uomo', 'corpo', 'character'];
      let humanMesh = /** @type {THREE.Mesh|null} */ (null);
      let bestScore = -Infinity;

      sceneRef.traverse((child) => {
        if (!(child instanceof THREE.Mesh || child instanceof THREE.SkinnedMesh)) return;

        const name = child.name.toLowerCase();
        if (humanKeywords.some(k => name.includes(k))) { humanMesh = /** @type {THREE.Mesh} */ (child); bestScore = Infinity; return; }
        if (bestScore === Infinity) return;

        const box = new THREE.Box3().setFromObject(child);
        const meshCenter = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

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

      const fullBox = new THREE.Box3().setFromObject(sceneRef);
      const fullSize = fullBox.getSize(new THREE.Vector3());
      const fovRad = 60 * (Math.PI / 180);
      const aspect = canvas.clientWidth / Math.max(canvas.clientHeight, 1);
      const fovH = 2 * Math.atan(Math.tan(fovRad / 2) * aspect);
      const distV = (fullSize.y / 2) / Math.tan(fovRad / 2);
      const distH = (fullSize.x / 2) / Math.tan(fovH / 2);
      cameraZ = Math.max(distV, distH) * 1.0 + fullSize.z / 2;

      if (cameraRef) cameraRef.position.set(0, 0, cameraZ);
    }

    if (!isDragging) autoRotY += dt * 0.5;
    if (sceneRef) sceneRef.rotation.y = autoRotY + externalRotY;
  });
</script>

<T.PerspectiveCamera makeDefault fov={70} position={[0, 0, 9]} bind:ref={cameraRef} />

<T.AmbientLight intensity={0.4} />
<T.PointLight position={[0, 0, 5]} intensity={1.0} distance={20} />

{#if $gltf}
  <T
    is={$gltf.scene}
    bind:ref={sceneRef}
    scale={[8.5, 8.5, 8.5]}
    position={[offsetX - 50.0, offsetY, offsetZ]}
  />
{/if}
