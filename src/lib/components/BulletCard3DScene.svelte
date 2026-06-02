<script>
  import { T } from "@threlte/core";
  import { useGltf } from "@threlte/extras";
  import * as THREE from "three";
  import { useTask } from "@threlte/core";

  const gltf = useGltf("/CARD%20FINALE%20X%20SITO%20(1).glb");

  /** @type {THREE.Group|undefined} */
  let sceneRef = $state(undefined);

  const particleMaterial = new THREE.PointsMaterial({
    color: 0xC9D7DC,
    size: 0.06,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.88,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  particleMaterial.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `#include <color_fragment>
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      if (dist > 0.5) discard;
      float intensity = smoothstep(0.5, 0.0, dist);
      diffuseColor.a *= intensity;`
    );
  };

  /** @param {THREE.BufferGeometry} geometry @param {number} count */
  function samplePoints(geometry, count) {
    const posAttr = geometry.attributes.position;
    const idxAttr = geometry.index;
    const arr = new Float32Array(count * 3);
    const vA = new THREE.Vector3(), vB = new THREE.Vector3(), vC = new THREE.Vector3(), p = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
      if (idxAttr) {
        const tri = Math.floor(Math.random() * (idxAttr.count / 3)) * 3;
        vA.fromBufferAttribute(posAttr, idxAttr.getX(tri));
        vB.fromBufferAttribute(posAttr, idxAttr.getY(tri));
        vC.fromBufferAttribute(posAttr, idxAttr.getZ(tri));
      } else {
        const tri = Math.floor(Math.random() * (posAttr.count / 3)) * 3;
        vA.fromBufferAttribute(posAttr, tri);
        vB.fromBufferAttribute(posAttr, tri + 1);
        vC.fromBufferAttribute(posAttr, tri + 2);
      }
      const r1 = Math.sqrt(Math.random()), r2 = Math.random();
      p.set(0,0,0).addScaledVector(vA, 1-r1).addScaledVector(vB, r1*(1-r2)).addScaledVector(vC, r1*r2);
      arr[i*3] = p.x; arr[i*3+1] = p.y; arr[i*3+2] = p.z;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return geom;
  }

  let converted = false;
  let rotY = 0;

  useTask((dt) => {
    rotY += dt * 0.4;
    if (sceneRef) sceneRef.rotation.y = rotY;

    if ($gltf && $gltf.scene && !converted) {
      converted = true;
      $gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.visible = false;
          const points = new THREE.Points(samplePoints(child.geometry, 12000), particleMaterial);
          points.position.copy(child.position);
          points.rotation.copy(child.rotation);
          points.scale.copy(child.scale);
          child.parent?.add(points);
        }
      });
    }
  });
</script>

<T.PerspectiveCamera makeDefault position={[0, 0, 6]} />
<T.AmbientLight intensity={0.9} />
<T.DirectionalLight position={[3, 5, 3]} intensity={2} />

{#if $gltf}
  <T is={$gltf.scene} bind:ref={sceneRef} scale={[1.8, 1.8, 1.8]} position={[0, 0, 0]} />
{/if}
