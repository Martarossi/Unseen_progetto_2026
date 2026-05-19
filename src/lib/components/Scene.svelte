<script>
  import { T } from "@threlte/core";
  import { useGltf, Environment } from "@threlte/extras";
  import * as THREE from "three";

  import { useRenderer } from "@threlte/core";

  const { renderer } = useRenderer();

  $effect(() => {
    if (renderer) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
    }
  });

  /**
   * @typedef {Object} SceneProps
   * @property {[number, number, number]} [position]
   * @property {[number, number, number]} [scale]
   * @property {[number, number, number]} [rotation]
   * @property {number} [twistX]
   * @property {number} [twistZ]
   */

  /** @type {SceneProps} */
  let {
    position = [0, 0, 0],
    scale = [1, 1, 1],
    rotation = [0, 0, 0],
    twistX = 360,
    twistZ = 200,
  } = $props();

  // CARICAMENTO MODELLO GLTF: Carica il modello 3D in formato GLB con URL codificato per gestire gli spazi in sicurezza.
  const gltf = useGltf("/OGGETTO%20ANIMATO%20PER%20SITO%202.glb");

  // UNIFORMS PERSONALIZZATI: Definisce i parametri passati alla GPU per controllare la distorsione Twist X e Z e il bounding box
  const customUniforms = {
    twistXAngle: { value: (360 * Math.PI) / 180 },
    twistZAngle: { value: (200 * Math.PI) / 180 },
    bboxMin: { value: new THREE.Vector3(-1.5, -1.5, -1.5) },
    bboxMax: { value: new THREE.Vector3(1.5, 1.5, 1.5) }
  };

  // MATERIALE IN VETRO FISICO: Crea un materiale fisico con trasmissione e rifrazione elevate per riprodurre un effetto vetro ad alta fedeltà.
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.0,
    roughness: 0.0,
    transmission: 1.0,
    ior: 1.8, // ← più alto = più distorsione (default 1.5, max ~2.5)
    thickness: 2.0, // ← più alto = più distorsione cromatica in profondità
    dispersion: 0.3, // ← separa i colori RGB come un prisma (se supportato)
    envMapIntensity: 1.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    transparent: true,
    opacity: 1.0,
    depthWrite: false,
    side: THREE.FrontSide,
  });

  // MODIFICA SHADER (DEFORMER TWIST): Hook nella compilazione del materiale per iniettare i calcoli di deformazione sul vertex shader (posizione e normali)
  glassMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.twistXAngle = customUniforms.twistXAngle;
    shader.uniforms.twistZAngle = customUniforms.twistZAngle;
    shader.uniforms.bboxMin = customUniforms.bboxMin;
    shader.uniforms.bboxMax = customUniforms.bboxMax;

    shader.vertexShader = `
      uniform float twistXAngle;
      uniform float twistZAngle;
      uniform vec3 bboxMin;
      uniform vec3 bboxMax;
      varying float vRoughnessFactor;
    ` + shader.vertexShader;

    // Distorsione Twist X + Z sulle Normali in beginnormal_vertex
    shader.vertexShader = shader.vertexShader.replace(
      '#include <beginnormal_vertex>',
      `
      #include <beginnormal_vertex>
      
      // TWIST X
      float factorX = (position.x - bboxMin.x) / (bboxMax.x - bboxMin.x);
      factorX = clamp(factorX, 0.0, 1.0);
      float angleX = twistXAngle * factorX;
      
      float cosX = cos(angleX);
      float sinX = sin(angleX);
      
      vec3 twistedNormal = objectNormal;
      twistedNormal.y = objectNormal.y * cosX - objectNormal.z * sinX;
      twistedNormal.z = objectNormal.y * sinX + objectNormal.z * cosX;
      
      // TWIST Z (calcolato sulla coordinata Z ruotata per coerenza dell'ordine dei modificatori di Blender)
      float twistedPosZ = position.y * sinX + position.z * cosX;
      float factorZ = (twistedPosZ - bboxMin.z) / (bboxMax.z - bboxMin.z);
      factorZ = clamp(factorZ, 0.0, 1.0);
      float angleZ = twistZAngle * factorZ;
      
      float cosZ = cos(angleZ);
      float sinZ = sin(angleZ);
      
      objectNormal.x = twistedNormal.x * cosZ - twistedNormal.y * sinZ;
      objectNormal.y = twistedNormal.x * sinZ + twistedNormal.y * cosZ;
      objectNormal.z = twistedNormal.z;
      
      // CALCOLO SFOCATURA FISICA (VETRO SATINATO DINAMICO SU ALCUNE ZONE CON LO SCROLL)
      float spatialPattern = 0.5 + 0.5 * sin(position.x * 3.5 + position.y * 3.5);
      float twistIntensity = clamp((abs(twistXAngle) + abs(twistZAngle)) / 30.0, 0.0, 1.0);
      vRoughnessFactor = twistIntensity * spatialPattern * 0.95;
      `
    );

    // Distorsione Twist X + Z sulle Posizioni in begin_vertex
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      
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
      `
    );

    // Iniettiamo la variabile nel fragment shader per influenzare la rugosità fisica del materiale in tempo reale
    shader.fragmentShader = `
      varying float vRoughnessFactor;
    ` + shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      'float roughnessFactor = roughness;',
      'float roughnessFactor = roughness + vRoughnessFactor;'
    );
  };

  // AGGIORNAMENTO REATTIVO UNIFORMS: Aggiorna i valori nella GPU quando cambiano gli angoli passati come prop, impostando un coefficiente bilanciato di distorsione
  $effect(() => {
    customUniforms.twistXAngle.value = (twistX * 2.8 * Math.PI) / 180;
    customUniforms.twistZAngle.value = (twistZ * 2.8 * Math.PI) / 180;
  });

  // AGGIORNAMENTO BOUNDING BOX: Calcola dinamicamente le dimensioni del modello per scalare correttamente la deformazione Twist
  $effect(() => {
    if ($gltf && $gltf.scene) {
      const box = new THREE.Box3().setFromObject($gltf.scene);
      customUniforms.bboxMin.value.copy(box.min);
      customUniforms.bboxMax.value.copy(box.max);
    }
  });

  // APPLICAZIONE MATERIALE RICORSIVA: Attraversa tutti i nodi del modello caricato e applica il materiale vetro a ogni mesh trovata tramite reattività Svelte 5.
  $effect(() => {
    if ($gltf && $gltf.scene) {
      $gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = glassMaterial;
          child.castShadow = false; // era true → le ombre opache rompono l'illusione
          child.receiveShadow = false; // era true → idem
        }
      });
    }
  });
</script>

<!-- CONFIGURAZIONE DELLA CAMERA: Imposta la camera prospettica principale e vi associa una luce direzionale frontale -->
<T.PerspectiveCamera makeDefault position={[0, 0, 10]}>
  <T.DirectionalLight position={[5, 10, 5]} intensity={3} />
</T.PerspectiveCamera>

<!-- SISTEMA DI ILLUMINAZIONE: Dispone le luci ambientali, direzionali e puntiformi necessarie per esaltare le trasparenze e le ombre del vetro -->
<T.AmbientLight intensity={0.8} />
<T.DirectionalLight position={[-5, -5, -5]} intensity={1.0} color="#b0c4de" />
<T.PointLight position={[0, 0, 5]} intensity={1.5} distance={15} />

<!-- AMBIENTE HDR STUDIO (REFLECTIONS): Carica una mappa HDR da Polyhaven per fornire riflessioni fisicamente accurate sulla superficie vetrosa -->
<Environment
  url="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/aerodynamics_workshop_1k.hdr"
  isBackground={false}
/>

{#if $gltf}
  <T is={$gltf.scene} {position} {scale} {rotation} />
{/if}
