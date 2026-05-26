<script>
  import { T } from "@threlte/core";
  import { useGltf, Environment } from "@threlte/extras";
  import * as THREE from "three";
  import { useRenderer } from "@threlte/core";
  import VideoCard from "./VideoCard.svelte";

  const { renderer } = useRenderer();

  $effect(() => {
    if (renderer) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;
    }
  });

  /**
   * @typedef {Object} SceneProps
   * @property {[number, number, number]} [position]
   * @property {[number, number, number]} [scale]
   * @property {[number, number, number]} [rotation]
   * @property {number} [twistX]
   * @property {number} [twistZ]
   * @property {{ angle: number, y: number, opacity: number, centerX: number, centerY: number }} [orbitProps]
   * @property {{ angle: number, y: number, opacity: number, centerX: number, centerY: number }} [orbitProps2]
   * @property {{ angle: number, y: number, opacity: number, centerX: number, centerY: number }} [orbitProps3]
   */

  /** @typedef {{ angle: number, y: number, opacity: number, centerX: number, centerY: number }} OrbitProps */
  /** @typedef {{ x: number, y: number, width: number, height: number }} CardRect */
  /** @type {SceneProps & { onCardClick?: (rect: CardRect | null, videoSrc?: string) => void }} */
  let {
    position = [0, 0, 0],
    scale = [1, 1, 1],
    rotation = [0, 0, 0],
    twistX = 360,
    twistZ = 200,
    orbitProps  = /** @type {OrbitProps} */ ({ angle: 0, y: -3, opacity: 0, centerX: 0, centerY: 0 }),
    orbitProps2 = /** @type {OrbitProps} */ ({ angle: 0, y: -3, opacity: 0, centerX: 0, centerY: 0 }),
    orbitProps3 = /** @type {OrbitProps} */ ({ angle: 0, y: -3, opacity: 0, centerX: 0, centerY: 0 }),
    onCardClick = undefined,
  } = $props();

  const gltf = useGltf("/OGGETTO%20ANIMATO%20PER%20SITO%202.glb");

  // Uniforms condivisi tra particelle dense e ambientali
  const customUniforms = {
    twistXAngle:     { value: (360 * Math.PI) / 180 },
    twistZAngle:     { value: (200 * Math.PI) / 180 },
    bboxMin:         { value: new THREE.Vector3(-1.5, -1.5, -1.5) },
    bboxMax:         { value: new THREE.Vector3(1.5, 1.5, 1.5) },
    uTime:           { value: 0 },
    uScrollActivity: { value: 0 },
    uSweepProgress:  { value: 1.0 },  // 1.0 = a riposo (nessuno sweep visibile)
  };

  // ─── MATERIALE PARTICELLE DENSE CON EFFETTO LIQUID GLASS ─────────────────
  // Struttura: nuvola di punti sulla superficie dell'oggetto (da 3Dparticellare).
  // Effetto visivo: iridescenza cristallina + sweep di rifrazione luce (da 3Dfluidglass),
  // ma espressi come modulazione colore/opacità sui punti invece che come roughness su mesh.
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xC9D7DC,
    size: 0.09,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  particleMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.twistXAngle     = customUniforms.twistXAngle;
    shader.uniforms.twistZAngle     = customUniforms.twistZAngle;
    shader.uniforms.bboxMin         = customUniforms.bboxMin;
    shader.uniforms.bboxMax         = customUniforms.bboxMax;
    shader.uniforms.uTime           = customUniforms.uTime;
    shader.uniforms.uScrollActivity = customUniforms.uScrollActivity;
    shader.uniforms.uSweepProgress  = customUniforms.uSweepProgress;

    shader.vertexShader = `
      varying vec3 vLocalPosition;
      uniform float twistXAngle;
      uniform float twistZAngle;
      uniform vec3 bboxMin;
      uniform vec3 bboxMax;
      uniform float uTime;
      uniform float uScrollActivity;
    ` + shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      vLocalPosition = position;

      // TWIST X
      float factorX_p = (position.x - bboxMin.x) / (bboxMax.x - bboxMin.x);
      factorX_p = clamp(factorX_p, 0.0, 1.0);
      float angleX_p = twistXAngle * factorX_p;
      float cosX_p = cos(angleX_p);
      float sinX_p = sin(angleX_p);
      vec3 twistedPos = transformed;
      twistedPos.y = transformed.y * cosX_p - transformed.z * sinX_p;
      twistedPos.z = transformed.y * sinX_p + transformed.z * cosX_p;

      // TWIST Z
      float factorZ_p = (twistedPos.z - bboxMin.z) / (bboxMax.z - bboxMin.z);
      factorZ_p = clamp(factorZ_p, 0.0, 1.0);
      float angleZ_p = twistZAngle * factorZ_p;
      float cosZ_p = cos(angleZ_p);
      float sinZ_p = sin(angleZ_p);
      transformed.x = twistedPos.x * cosZ_p - twistedPos.y * sinZ_p;
      transformed.y = twistedPos.x * sinZ_p + twistedPos.y * cosZ_p;
      transformed.z = twistedPos.z;

      // TURBOLENZA FLUIDA (da 3Dparticellare)
      vec3 wave;
      wave.x = sin(transformed.y * 3.5 + uTime * 2.2) * cos(transformed.z * 3.0 + uTime * 1.7);
      wave.y = cos(transformed.x * 3.0 + uTime * 2.0) * sin(transformed.z * 3.5 + uTime * 2.2);
      wave.z = sin(transformed.x * 3.5 + uTime * 1.7) * cos(transformed.y * 3.0 + uTime * 2.5);
      float noiseScale = 0.045 + uScrollActivity * 0.34;
      transformed += wave * noiseScale;
      `
    );

    shader.fragmentShader = `
      varying vec3 vLocalPosition;
      uniform float uTime;
      uniform float uScrollActivity;
      uniform float uSweepProgress;
    ` + shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>

      // FORMA: cerchio morbido con decadimento radiale (da 3Dparticellare)
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      if (dist > 0.5) discard;
      float intensity = smoothstep(0.5, 0.0, dist);

      // IRIDESCENZA CRISTALLINA (da liquid glass):
      // Shift di colore basato sulla posizione locale + tempo, simula la rifrazione
      // spettrale che il vetro fisico produce sui contorni (iridescenceIOR).
      float iridPhase = vLocalPosition.x * 2.5 + vLocalPosition.y * 2.0 + uTime * 0.7;
      vec3 iridescent = vec3(
        0.788 + 0.13 * sin(iridPhase),
        0.843 + 0.09 * sin(iridPhase + 2.094),
        0.863 + 0.11 * sin(iridPhase + 4.188)
      );

      // SWEEP DI RIFRAZIONE LUCE (da liquid glass, adattato alle particelle):
      // Simula la banda di blur/luce che nel vetro fisico attraversa la superficie
      // durante lo scroll. Qui diventa un'onda di colore blue-cristallino che spazza
      // la nuvola di punti da destra a sinistra.
      float envelope    = sin(uSweepProgress * 3.14159265);
      float sweepCenter = 2.0 - uSweepProgress * 4.0;
      float distToSweep = vLocalPosition.x - sweepCenter;
      float sweepBlur   = exp(-pow(distToSweep, 2.0) / 0.65);
      float waveOrg     = sin(vLocalPosition.z * 3.5 + uTime * 2.2) * 0.12 + 0.88;
      float sweepEffect = sweepBlur * envelope * waveOrg * 0.85;

      // Nella zona sweep: le particelle virano verso il blue-bianco cristallino (come
      // la luce che attraversa il vetro), poi tornano al silver-grey iridescente.
      vec3 glassHighlight = vec3(0.90, 0.95, 1.0);
      vec3 finalColor = mix(iridescent, glassHighlight, sweepEffect * 0.75);
      diffuseColor.rgb = finalColor;

      // Lo sweep aumenta leggermente la trasparenza (simula la zona "mossa" del vetro)
      diffuseColor.a *= intensity * (1.0 - sweepEffect * 0.30);
      `
    );
  };

  // ─── MATERIALE PARTICELLE AMBIENTALI FLOTTANTI ────────────────────────────
  // Stesse particelle di 3Dparticellare ma con iridescenza applicata.
  const ambientParticleCount = 180;
  const positions    = new Float32Array(ambientParticleCount * 3);
  const driftDirs    = new Float32Array(ambientParticleCount * 3);
  const driftSpeeds  = new Float32Array(ambientParticleCount);
  const driftPhases  = new Float32Array(ambientParticleCount);
  const driftMaxLifes = new Float32Array(ambientParticleCount);

  for (let i = 0; i < ambientParticleCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.random() * Math.PI * 0.45;
    const dx = Math.sin(phi) * Math.cos(theta);
    const dy = Math.cos(phi) * 0.7 + 0.6;
    const dz = Math.sin(phi) * Math.sin(theta);
    const len = Math.sqrt(dx*dx + dy*dy + dz*dz) || 1;
    driftDirs[i * 3]     = dx / len;
    driftDirs[i * 3 + 1] = dy / len;
    driftDirs[i * 3 + 2] = dz / len;
    driftSpeeds[i]    = 0.35 + Math.random() * 0.45;
    driftPhases[i]    = Math.random() * 50.0;
    driftMaxLifes[i]  = 2.0 + Math.random() * 3.5;
  }

  const ambientGeometry = new THREE.BufferGeometry();
  ambientGeometry.setAttribute('position',      new THREE.BufferAttribute(positions, 3));
  ambientGeometry.setAttribute('aDriftDir',     new THREE.BufferAttribute(driftDirs, 3));
  ambientGeometry.setAttribute('aDriftSpeed',   new THREE.BufferAttribute(driftSpeeds, 1));
  ambientGeometry.setAttribute('aDriftPhase',   new THREE.BufferAttribute(driftPhases, 1));
  ambientGeometry.setAttribute('aDriftMaxLife', new THREE.BufferAttribute(driftMaxLifes, 1));

  const ambientMaterial = new THREE.PointsMaterial({
    color: 0xC9D7DC,
    size: 0.22,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  ambientMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.twistXAngle     = customUniforms.twistXAngle;
    shader.uniforms.twistZAngle     = customUniforms.twistZAngle;
    shader.uniforms.bboxMin         = customUniforms.bboxMin;
    shader.uniforms.bboxMax         = customUniforms.bboxMax;
    shader.uniforms.uTime           = customUniforms.uTime;
    shader.uniforms.uScrollActivity = customUniforms.uScrollActivity;
    shader.uniforms.uSweepProgress  = customUniforms.uSweepProgress;

    shader.vertexShader = `
      attribute vec3 aDriftDir;
      attribute float aDriftSpeed;
      attribute float aDriftPhase;
      attribute float aDriftMaxLife;
      varying vec3 vLocalPosition;
      uniform float twistXAngle;
      uniform float twistZAngle;
      uniform vec3 bboxMin;
      uniform vec3 bboxMax;
      uniform float uTime;
      uniform float uScrollActivity;
    ` + shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      vLocalPosition = position;

      // TWIST X + Z (sincronizzato con le particelle dense)
      vec3 twistedPos = transformed;
      float factorX_p = (position.x - bboxMin.x) / (bboxMax.x - bboxMin.x);
      factorX_p = clamp(factorX_p, 0.0, 1.0);
      float angleX_p = twistXAngle * factorX_p;
      float cosX_p = cos(angleX_p);
      float sinX_p = sin(angleX_p);
      twistedPos.y = transformed.y * cosX_p - transformed.z * sinX_p;
      twistedPos.z = transformed.y * sinX_p + transformed.z * cosX_p;

      float factorZ_p = (twistedPos.z - bboxMin.z) / (bboxMax.z - bboxMin.z);
      factorZ_p = clamp(factorZ_p, 0.0, 1.0);
      float angleZ_p = twistZAngle * factorZ_p;
      float cosZ_p = cos(angleZ_p);
      float sinZ_p = sin(angleZ_p);
      transformed.x = twistedPos.x * cosZ_p - twistedPos.y * sinZ_p;
      transformed.y = twistedPos.x * sinZ_p + twistedPos.y * cosZ_p;
      transformed.z = twistedPos.z;

      // DRIFT PROGRESSIVO (da 3Dparticellare)
      float life = mod(uTime * aDriftSpeed + aDriftPhase, aDriftMaxLife);
      float progress = life / aDriftMaxLife;
      float speedMult = 1.0 + uScrollActivity * 5.5;
      vec3 radialDir = normalize(transformed);
      vec3 finalDriftDir = normalize(aDriftDir + radialDir * uScrollActivity * 0.85);
      vec3 driftOffset = finalDriftDir * (progress * 1.5 * speedMult);
      driftOffset.x += sin(uTime * 1.2 + aDriftPhase) * 0.05;
      driftOffset.y += cos(uTime * 0.8 + aDriftPhase) * 0.04;
      driftOffset.z += sin(uTime * 1.5 + aDriftPhase) * 0.05;
      transformed += driftOffset;
      `
    );

    shader.fragmentShader = `
      varying vec3 vLocalPosition;
      uniform float uTime;
      uniform float uScrollActivity;
      uniform float uSweepProgress;
    ` + shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      if (dist > 0.5) discard;
      float intensity = smoothstep(0.5, 0.0, dist);

      // Iridescenza ridotta per le particelle ambientali (più sottili, più lontane)
      float iridPhase = vLocalPosition.x * 2.0 + uTime * 0.5;
      vec3 iridescent = vec3(
        0.788 + 0.10 * sin(iridPhase),
        0.843 + 0.07 * sin(iridPhase + 2.094),
        0.863 + 0.09 * sin(iridPhase + 4.188)
      );

      float envelope    = sin(uSweepProgress * 3.14159265);
      float sweepCenter = 2.0 - uSweepProgress * 4.0;
      float sweepEffect = exp(-pow(vLocalPosition.x - sweepCenter, 2.0) / 0.65) * envelope * 0.6;
      vec3 finalColor = mix(iridescent, vec3(0.92, 0.96, 1.0), sweepEffect);
      diffuseColor.rgb = finalColor;
      diffuseColor.a *= intensity;
      `
    );
  };

  // ─── UTILITY: campionamento baricentrico superficie ───────────────────────
  function samplePointsFromGeometry(geometry, count) {
    const positionAttr = geometry.attributes.position;
    if (!positionAttr) return geometry;

    const indexAttr   = geometry.index;
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
        const r1 = Math.random();
        const r2 = Math.random();
        const sqrtR1 = Math.sqrt(r1);
        const u = 1 - sqrtR1;
        const v = r2 * sqrtR1;
        const w = 1 - u - v;
        point.set(0, 0, 0)
          .addScaledVector(vA, u)
          .addScaledVector(vB, v)
          .addScaledVector(vC, w);
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
        const r1 = Math.random();
        const r2 = Math.random();
        const sqrtR1 = Math.sqrt(r1);
        const u = 1 - sqrtR1;
        const v = r2 * sqrtR1;
        const w = 1 - u - v;
        point.set(0, 0, 0)
          .addScaledVector(vA, u)
          .addScaledVector(vB, v)
          .addScaledVector(vC, w);
        sampledPositions[i * 3]     = point.x;
        sampledPositions[i * 3 + 1] = point.y;
        sampledPositions[i * 3 + 2] = point.z;
      }
    }

    const sampledGeom = new THREE.BufferGeometry();
    sampledGeom.setAttribute('position', new THREE.BufferAttribute(sampledPositions, 3));
    return sampledGeom;
  }

  // ─── Sync twist uniforms ──────────────────────────────────────────────────
  $effect(() => {
    customUniforms.twistXAngle.value = (twistX * 2.8 * Math.PI) / 180;
    customUniforms.twistZAngle.value = (twistZ * 2.8 * Math.PI) / 180;
  });

  // ─── Animation loop: uTime + scroll activity + sweep di luce (da glass) ──
  let sweepProgress = 1.0;
  let sweepActive   = false;

  $effect(() => {
    let lastTwistX = twistX;
    let rafId;
    const animate = () => {
      customUniforms.uTime.value += 0.015;

      const activityX = Math.abs(twistX - 360) / 360.0;
      const activityZ = Math.abs(twistZ - 200) / 200.0;
      const targetActivity = Math.max(activityX, activityZ);
      customUniforms.uScrollActivity.value +=
        (targetActivity - customUniforms.uScrollActivity.value) * 0.035;

      // Rilevazione scroll → avvio sweep di rifrazione luce (da 3Dfluidglass)
      const delta = Math.abs(twistX - lastTwistX);
      lastTwistX = twistX;
      if (delta > 0.05 && !sweepActive) {
        sweepActive   = true;
        sweepProgress = 0.0;
      }
      if (sweepActive) {
        sweepProgress += 0.035;
        if (sweepProgress >= 1.0) { sweepProgress = 1.0; sweepActive = false; }
      } else {
        sweepProgress = 1.0;
      }
      customUniforms.uSweepProgress.value = sweepProgress;

      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  });

  // ─── Bounding box dinamico ────────────────────────────────────────────────
  $effect(() => {
    if ($gltf && $gltf.scene) {
      const box = new THREE.Box3().setFromObject($gltf.scene);
      customUniforms.bboxMin.value.copy(box.min);
      customUniforms.bboxMax.value.copy(box.max);
    }
  });

  // ─── Conversione mesh → particelle + ambient (da 3Dparticellare) ──────────
  // La mesh originale viene nascosta; al suo posto dense nuvole di punti
  // con effetto liquid glass negli shader.
  $effect(() => {
    if ($gltf && $gltf.scene) {
      const meshesToConvert = [];
      $gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh && !child.userData.isParticleConverted) {
          meshesToConvert.push(child);
        }
      });

      if (meshesToConvert.length > 0 && !ambientGeometry.userData.hasOrigins) {
        const posAttr = ambientGeometry.attributes.position;
        const posArr  = /** @type {Float32Array} */ (posAttr.array);
        let sampledCount = 0;
        while (sampledCount < ambientParticleCount) {
          const randomMesh = meshesToConvert[Math.floor(Math.random() * meshesToConvert.length)];
          const sampledGeom = samplePointsFromGeometry(randomMesh.geometry, 1);
          const pos = sampledGeom.attributes.position.array;
          const localPoint = new THREE.Vector3(pos[0], pos[1], pos[2]);
          localPoint.applyMatrix4(randomMesh.matrix);
          posArr[sampledCount * 3]     = localPoint.x;
          posArr[sampledCount * 3 + 1] = localPoint.y;
          posArr[sampledCount * 3 + 2] = localPoint.z;
          sampledCount++;
        }
        posAttr.needsUpdate = true;
        ambientGeometry.userData.hasOrigins = true;
        $gltf.scene.add(new THREE.Points(ambientGeometry, ambientMaterial));
      }

      meshesToConvert.forEach((mesh) => {
        mesh.visible = false;
        mesh.userData.isParticleConverted = true;

        const denseGeometry = samplePointsFromGeometry(mesh.geometry, 20000);
        const points = new THREE.Points(denseGeometry, particleMaterial);
        points.position.copy(mesh.position);
        points.rotation.copy(mesh.rotation);
        points.scale.copy(mesh.scale);
        mesh.parent.add(points);
      });
    }
  });
</script>

<T.PerspectiveCamera makeDefault position={[0, 0, 10]}>
  <T.DirectionalLight position={[5, 10, 5]} intensity={3} />
</T.PerspectiveCamera>

<T.AmbientLight intensity={0.8} />
<T.DirectionalLight position={[-5, -5, -5]} intensity={1.0} color="#b0c4de" />
<T.PointLight position={[0, 0, 5]} intensity={1.5} distance={15} />

<Environment
  url="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_garden_1k.hdr"
  isBackground={false}
/>

{#if $gltf}
  <T is={$gltf.scene} {position} {scale} {rotation} />
{/if}

<VideoCard
  {orbitProps}
  label="VIDEOAI1"
  videoSrc="/video_card/spacetime_slices.mov"
  cardTitle="SPACETIME SLICES"
  cardSubtitle="Scomposizione gesto sportivo in fotogrammi simultanei"
  onCardClick={(rect) => onCardClick?.(rect, '/video_card/spacetime_slices.mov')}
/>
<VideoCard
  orbitProps={orbitProps2}
  label="VIDEOAI2"
  videoSrc="/video_card/tracker.mov"
  cardTitle="TRACKER ATHLETES"
  cardSubtitle="Analisi istantanea dell'azione sportiva"
  onCardClick={(rect) => onCardClick?.(rect, '/video_card/tracker.mov')}
/>
<VideoCard
  orbitProps={orbitProps3}
  label="VIDEOAI3"
  videoSrc="/video_card/Bullet_time.mov"
  cardTitle="BULLET TIMING"
  cardSubtitle="Scansione orbitale di un istante sospeso"
  onCardClick={(rect) => onCardClick?.(rect, '/video_card/Bullet_time.mov')}
/>
