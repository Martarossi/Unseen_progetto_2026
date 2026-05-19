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
   */

  /** @type {SceneProps} */
  let {
    position = [0, 0, 0],
    scale = [1, 1, 1],
    rotation = [0, 0, 0],
  } = $props();

  // CARICAMENTO MODELLO GLTF: Carica il modello 3D in formato GLB con URL codificato per gestire gli spazi in sicurezza.
  const gltf = useGltf("/OGGETTO%20ANIMATO%20PER%20SITO%202.glb");

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
