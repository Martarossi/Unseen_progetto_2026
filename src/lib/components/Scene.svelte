<script>
  import { T } from "@threlte/core";
  import { useGltf } from "@threlte/extras";
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
  /** @type {SceneProps & {
   *   onCardClick?: (rect: CardRect | null, videoSrc?: string, cardIndex?: number) => void,
   *   expandCardIndex?: number,
   *   onCardExpanded?: () => void
   * }} */
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
    expandCardIndex = -1,
    onCardExpanded = undefined,
  } = $props();

  // CARICAMENTO MODELLO GLTF
  const gltf = useGltf("/OGGETTO%20ANIMATO%20PER%20SITO%202.glb");

  // STATO PER LA TEXTURE FILTRATA PMREM
  let envMap = $state(null);

  $effect(() => {
    if (renderer) {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      pmremGenerator.compileEquirectangularShader();

      const textureLoader = new THREE.TextureLoader();
      textureLoader.load('/SFONDO.png', (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.colorSpace = THREE.SRGBColorSpace;

        const pmremRT = pmremGenerator.fromEquirectangular(texture);
        envMap = pmremRT.texture;

        texture.dispose();
        pmremGenerator.dispose();
      });
    }
  });

  const customUniforms = {
    twistXAngle: { value: (360 * Math.PI) / 180 },
    twistZAngle: { value: (200 * Math.PI) / 180 },
    bboxMin: { value: new THREE.Vector3(-1.5, -1.5, -1.5) },
    bboxMax: { value: new THREE.Vector3(1.5, 1.5, 1.5) },
    uTime: { value: 0 },
    uScrollActivity: { value: 0 },
    uSweepProgress: { value: 1.0 }
  };

  const liquidGlassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xC9D7DC,
    metalness: 0.05,
    roughness: 0.26,
    transparent: true,
    opacity: 1.0,
    transmission: 0.98,
    ior: 1.58,
    thickness: 2.8,
    specularIntensity: 1.5,
    specularColor: new THREE.Color(0xffffff),
    envMapIntensity: 4.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    iridescence: 0.45,
    iridescenceIOR: 1.38,
    side: THREE.DoubleSide,
    depthWrite: true
  });

  liquidGlassMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.twistXAngle = customUniforms.twistXAngle;
    shader.uniforms.twistZAngle = customUniforms.twistZAngle;
    shader.uniforms.bboxMin = customUniforms.bboxMin;
    shader.uniforms.bboxMax = customUniforms.bboxMax;
    shader.uniforms.uTime = customUniforms.uTime;
    shader.uniforms.uScrollActivity = customUniforms.uScrollActivity;
    shader.uniforms.uSweepProgress = customUniforms.uSweepProgress;

    shader.vertexShader = `
      varying vec3 vLocalPosition;
      uniform float twistXAngle;
      uniform float twistZAngle;
      uniform vec3 bboxMin;
      uniform vec3 bboxMax;
    ` + shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      vLocalPosition = position;

      float factorX = (position.x - bboxMin.x) / (bboxMax.x - bboxMin.x);
      factorX = clamp(factorX, 0.0, 1.0);
      float angleX = twistXAngle * factorX;

      float cosX = cos(angleX);
      float sinX = sin(angleX);

      vec3 twistedPos = transformed;
      twistedPos.y = transformed.y * cosX - transformed.z * sinX;
      twistedPos.z = transformed.y * sinX + transformed.z * cosX;

      float factorZ = (twistedPos.z - bboxMin.z) / (bboxMax.z - bboxMin.z);
      factorZ = clamp(factorZ, 0.0, 1.0);
      float angleZ = twistZAngle * factorZ;

      float cosZ = cos(angleZ);
      float sinZ = sin(angleZ);

      transformed.x = twistedPos.x * cosZ - twistedPos.y * sinZ;
      transformed.y = twistedPos.x * sinZ + twistedPos.y * cosZ;
      transformed.z = twistedPos.z;
      `
    );

    shader.fragmentShader = `
      varying vec3 vLocalPosition;
      uniform float uTime;
      uniform float uScrollActivity;
      uniform float uSweepProgress;
    ` + shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <roughnessmap_fragment>',
      `
      #include <roughnessmap_fragment>

      float envelope = sin(uSweepProgress * 3.14159265);
      float sweepCenter = 2.0 - uSweepProgress * 4.0;
      float distToCenter = vLocalPosition.x - sweepCenter;
      float sweepBlur = exp(-pow(distToCenter, 2.0) / 0.65);
      float wave = sin(vLocalPosition.z * 3.5 + uTime * 2.2) * 0.12 + 0.88;
      float dynamicBlur = sweepBlur * envelope * wave * 0.85;
      roughnessFactor = clamp(roughnessFactor + dynamicBlur, 0.26, 0.90);
      `
    );
  };

  let sweepProgress = 1.0;
  let sweepActive = false;

  $effect(() => {
    customUniforms.twistXAngle.value = (twistX * 2.8 * Math.PI) / 180;
    customUniforms.twistZAngle.value = (twistZ * 2.8 * Math.PI) / 180;
  });

  $effect(() => {
    let lastTwistX = twistX;
    let rafId;
    const animate = () => {
      customUniforms.uTime.value += 0.015;

      const activityX = Math.abs(twistX - 360) / 360.0;
      const activityZ = Math.abs(twistZ - 200) / 200.0;
      const targetActivity = Math.max(activityX, activityZ);

      customUniforms.uScrollActivity.value += (targetActivity - customUniforms.uScrollActivity.value) * 0.035;

      const delta = Math.abs(twistX - lastTwistX);
      lastTwistX = twistX;

      if (delta > 0.05) {
        if (!sweepActive) {
          sweepActive = true;
          sweepProgress = 0.0;
        }
      }

      if (sweepActive) {
        sweepProgress += 0.035;
        if (sweepProgress >= 1.0) {
          sweepProgress = 1.0;
          sweepActive = false;
        }
      } else {
        sweepProgress = 1.0;
      }

      customUniforms.uSweepProgress.value = sweepProgress;

      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafId);
    };
  });

  $effect(() => {
    if ($gltf && $gltf.scene) {
      const box = new THREE.Box3().setFromObject($gltf.scene);
      customUniforms.bboxMin.value.copy(box.min);
      customUniforms.bboxMax.value.copy(box.max);
    }
  });

  $effect(() => {
    if ($gltf && $gltf.scene && envMap) {
      $gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = liquidGlassMaterial;
          child.material.envMap = envMap;
          child.material.needsUpdate = true;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  });
</script>

<T.PerspectiveCamera makeDefault position={[0, 0, 10]}>
  <T.DirectionalLight position={[5, 10, 5]} intensity={3} />
</T.PerspectiveCamera>

<T.AmbientLight intensity={0.8} />
<T.DirectionalLight position={[-5, -5, -5]} intensity={1.5} color="#b0c4de" />
<T.PointLight position={[0, 0, 5]} intensity={2.0} distance={15} />

{#if $gltf}
  <T is={$gltf.scene} {position} {scale} {rotation} />
{/if}

<VideoCard
  {orbitProps}
  label="VIDEOAI1"
  videoSrc="/video_card/spacetime_slices.mov"
  cardTitle="SPACETIME SLICES"
  cardSubtitle="Scomposizione gesto sportivo in fotogrammi simultanei"
  isExpanding={expandCardIndex === 0}
  onCardExpanded={expandCardIndex === 0 ? onCardExpanded : undefined}
  onCardClick={(rect) => onCardClick?.(rect, '/video_card/spacetime_slices.mov', 0)}
/>
<VideoCard
  orbitProps={orbitProps2}
  label="VIDEOAI2"
  videoSrc="/video_card/tracker.mov"
  cardTitle="TRACKER ATHLETES"
  cardSubtitle="Analisi istantanea dell'azione sportiva"
  isExpanding={expandCardIndex === 1}
  onCardExpanded={expandCardIndex === 1 ? onCardExpanded : undefined}
  onCardClick={(rect) => onCardClick?.(rect, '/video_card/tracker.mov', 1)}
/>
<VideoCard
  orbitProps={orbitProps3}
  label="VIDEOAI3"
  videoSrc="/video_card/Bullet_time.mov"
  cardTitle="BULLET TIMING"
  cardSubtitle="Scansione orbitale di un istante sospeso"
  isExpanding={expandCardIndex === 2}
  onCardExpanded={expandCardIndex === 2 ? onCardExpanded : undefined}
  onCardClick={(rect) => onCardClick?.(rect, '/video_card/Bullet_time.mov', 2)}
/>
