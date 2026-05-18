<script>
  import { T } from '@threlte/core';
  import { useGltf, Environment } from '@threlte/extras';
  import * as THREE from 'three';

  let {
    position = [0, 0, 0],
    scale = [1, 1, 1],
    rotation = [0, 0, 0]
  } = $props();

  // Load the model using URL-encoded path to handle spaces safely
  const gltf = useGltf('/OGGETTO%20ANIMATO%20PER%20SITO%202.glb');

  // Glass Material with premium transparency/glass settings
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.05,
    roughness: 0.05,
    transmission: 0.95, // Highly transmissive glass
    ior: 1.5, // Glass index of refraction
    thickness: 1.5,
    envMapIntensity: 2.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide
  });

  // Apply material to all meshes in the scene recursively using Svelte 5 effect
  $effect(() => {
    if ($gltf && $gltf.scene) {
      $gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.material = glassMaterial;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  });
</script>

<!-- Camera Setup - crucial for Threlte WebGL rendering! -->
<T.PerspectiveCamera makeDefault position={[0, 0, 10]}>
  <T.DirectionalLight position={[5, 10, 5]} intensity={3} />
</T.PerspectiveCamera>

<!-- Lighting & Environment for glass refraction -->
<T.AmbientLight intensity={0.8} />
<T.DirectionalLight position={[-5, -5, -5]} intensity={1.0} color="#b0c4de" />
<T.PointLight position={[0, 0, 5]} intensity={1.5} distance={15} />

<!-- Polyhaven Studio HDR Environment for beautiful glass reflections -->
<Environment path="/" files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/aerodynamics_workshop_1k.hdr" isBackground={false} />

{#if $gltf}
  <T is={$gltf.scene} 
     {position} 
     {scale} 
     {rotation} 
  />
{/if}
