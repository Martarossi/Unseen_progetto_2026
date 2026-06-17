<script>
  import { T, useTask } from "@threlte/core";
  import { useGltf } from "@threlte/extras";
  import * as THREE from "three";

  /** @type {{ externalRotY?: number, isDragging?: boolean, activeModel?: number }} */
  let { externalRotY = 0, isDragging = false, activeModel = 0 } = $props();

  const PARTICLE_COUNT = 7000;
  const MORPH_DURATION = 1.8; // seconds

  const gltf0 = useGltf("/modello_bullettime.glb");
  const gltf1 = useGltf("/modello_3d_sciatore.glb");

  // Single shared geometry — interpolated every frame during morph
  const currentPos = new Float32Array(PARTICLE_COUNT * 3);
  const morphGeo   = new THREE.BufferGeometry();
  const posAttr    = new THREE.BufferAttribute(currentPos, 3);
  morphGeo.setAttribute('position', posAttr);

  /** @type {Float32Array|null} */
  let posA = null;
  /** @type {Float32Array|null} */
  let posB = null;

  // Morph state — plain vars updated in useTask every frame
  let morphT    = 0;   // current lerp (0 = model A, 1 = model B)
  let targetT   = 0;
  let morphElapsed = 0;
  let isMorphing   = false;

  let autoRotY = 0;
  const uTime = { value: 0 };

  /** @type {THREE.Group|undefined} */
  let groupRef = $state(undefined);

  // ── Particle material (with wave + soft circle shader) ────────────────────
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

  const morphPoints = new THREE.Points(morphGeo, particleMaterial);

  // ── Geometry sampler ──────────────────────────────────────────────────────
  /**
   * Sample PARTICLE_COUNT points from a GLTF scene, normalize to height 4,
   * then sort by Y descending so head↔head and feet↔feet during morph.
   * @param {THREE.Group} scene
   * @returns {Float32Array}
   */
  function sampleScene(scene) {
    /** @type {THREE.Mesh[]} */
    const meshes = [];
    scene.updateMatrixWorld(true);
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry?.attributes.position) {
        meshes.push(child);
      }
    });
    if (!meshes.length) return new Float32Array(PARTICLE_COUNT * 3);

    const raw = new Float32Array(PARTICLE_COUNT * 3);
    const vA = new THREE.Vector3();
    const vB = new THREE.Vector3();
    const vC = new THREE.Vector3();
    const p  = new THREE.Vector3();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const mesh = meshes[Math.floor(Math.random() * meshes.length)];
      const geo  = mesh.geometry;
      const attr = geo.attributes.position;
      const idx  = geo.index;

      if (idx && idx.count >= 3) {
        const t = Math.floor(Math.random() * (idx.count / 3)) * 3;
        vA.fromBufferAttribute(attr, idx.getX(t))  .applyMatrix4(mesh.matrixWorld);
        vB.fromBufferAttribute(attr, idx.getX(t+1)).applyMatrix4(mesh.matrixWorld);
        vC.fromBufferAttribute(attr, idx.getX(t+2)).applyMatrix4(mesh.matrixWorld);
        const r1 = Math.sqrt(Math.random()), r2 = Math.random();
        p.set(0,0,0)
          .addScaledVector(vA, 1 - r1)
          .addScaledVector(vB, r1 * (1 - r2))
          .addScaledVector(vC, r1 * r2);
      } else {
        p.fromBufferAttribute(attr, Math.floor(Math.random() * attr.count))
         .applyMatrix4(mesh.matrixWorld);
      }

      raw[i*3]   = p.x;
      raw[i*3+1] = p.y;
      raw[i*3+2] = p.z;
    }

    // Bounding box → center + scale to height 4
    let minX=Infinity, maxX=-Infinity;
    let minY=Infinity, maxY=-Infinity;
    let minZ=Infinity, maxZ=-Infinity;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x=raw[i*3], y=raw[i*3+1], z=raw[i*3+2];
      if(x<minX) minX=x; if(x>maxX) maxX=x;
      if(y<minY) minY=y; if(y>maxY) maxY=y;
      if(z<minZ) minZ=z; if(z>maxZ) maxZ=z;
    }
    const cx=(minX+maxX)/2, cy=(minY+maxY)/2, cz=(minZ+maxZ)/2;
    const sc = (maxY - minY) > 0 ? 4.0 / (maxY - minY) : 1;

    // Sort by Y descending: index 0 = topmost particle
    const indices = Array.from({ length: PARTICLE_COUNT }, (_, i) => i);
    indices.sort((a, b) => raw[b*3+1] - raw[a*3+1]);

    const sorted = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const s = indices[i];
      sorted[i*3]   = (raw[s*3]   - cx) * sc;
      sorted[i*3+1] = (raw[s*3+1] - cy) * sc;
      sorted[i*3+2] = (raw[s*3+2] - cz) * sc;
    }
    return sorted;
  }

  // ── Load models ───────────────────────────────────────────────────────────
  $effect(() => {
    if ($gltf0?.scene) {
      posA = sampleScene($gltf0.scene);
      currentPos.set(posA);
      posAttr.needsUpdate = true;
    }
  });

  $effect(() => {
    if ($gltf1?.scene) {
      posB = sampleScene($gltf1.scene);
    }
  });

  // ── Trigger morph on model change ─────────────────────────────────────────
  let _mounted = false;
  $effect(() => {
    const _dep = activeModel; // reactive dependency
    if (!_mounted) { _mounted = true; return; }
    if (activeModel === 1 && !posB) return; // B not loaded yet
    targetT   = activeModel; // 0 or 1
    morphElapsed = 0;
    isMorphing   = true;
  });

  // ── Cubic ease in-out ─────────────────────────────────────────────────────
  /** @param {number} t */
  function easeInOut(t) {
    return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
  }

  // ── Per-frame update ──────────────────────────────────────────────────────
  useTask((dt) => {
    uTime.value += 0.015;
    if (!isDragging) autoRotY += dt * 0.5;
    if (groupRef) groupRef.rotation.y = autoRotY + externalRotY;

    if (isMorphing && posA && posB) {
      morphElapsed += dt;
      const rawT  = Math.min(morphElapsed / MORPH_DURATION, 1);
      const eased = easeInOut(rawT);
      morphT = targetT === 1 ? eased : 1 - eased;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        currentPos[i3]   = posA[i3]   + (posB[i3]   - posA[i3])   * morphT;
        currentPos[i3+1] = posA[i3+1] + (posB[i3+1] - posA[i3+1]) * morphT;
        currentPos[i3+2] = posA[i3+2] + (posB[i3+2] - posA[i3+2]) * morphT;
      }
      posAttr.needsUpdate = true;

      if (rawT >= 1) isMorphing = false;
    }
  });
</script>

<T.PerspectiveCamera makeDefault fov={60} position={[0, 0, 6]} />
<T.AmbientLight intensity={0.4} />
<T.PointLight position={[0, 0, 5]} intensity={1.0} distance={20} />

<T.Group bind:ref={groupRef}>
  <T is={morphPoints} />
</T.Group>
