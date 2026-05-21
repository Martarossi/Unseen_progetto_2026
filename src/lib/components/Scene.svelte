<script>
  import { T } from "@threlte/core";
  import { useGltf } from "@threlte/extras";
  import * as THREE from "three";
  import { useRenderer } from "@threlte/core";

  const { renderer } = useRenderer();

  $effect(() => {
    if (renderer) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35; // Regola la brillantezza delle riflessioni sul vetro
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

  // CARICAMENTO MODELLO GLTF
  const gltf = useGltf("/OGGETTO%20ANIMATO%20PER%20SITO%202.glb");

  // STATO PER LA TEXTURE FILTRATA PMREM
  let envMap = $state(null);

  // GENERATORE PMREM:
  // Converte la texture standard /SFONDO.png in una mappa di radianza mipmappata (PMREM).
  // Questo consente a Three.js di sfocare fisicamente le riflessioni in base alla roughness dello shader!
  $effect(() => {
    if (renderer) {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      pmremGenerator.compileEquirectangularShader();

      const textureLoader = new THREE.TextureLoader();
      textureLoader.load('/SFONDO.png', (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        
        // Genera il target di rendering PMREM pre-filtrato
        const pmremRT = pmremGenerator.fromEquirectangular(texture);
        envMap = pmremRT.texture;

        // Pulizia risorse per prevenire perdite di memoria
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
    uSweepProgress: { value: 1.0 } // 1.0 significa a riposo (completamente nitido)
  };

  // MATERIALE "LIQUID GLASS" DI LUSSO:
  // Vetro liquido con trasmissione della luce, superficie a specchio, iridescenza spettrale sui contorni
  // e riflessione dello sfondo reale del sito per una coerenza visiva e un'integrazione perfetta.
  const liquidGlassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xC9D7DC,           // Elegante colorazione Silver-Grey cristallina
    metalness: 0.05,
    roughness: 0.26,           // Vetro satinato/smerigliato per una sfocatura di base permanente ed elegante
    transparent: true,
    opacity: 1.0,
    transmission: 0.98,        // Massima trasmissione della luce per trasparenza cristallina
    ior: 1.58,                 // Forte rifrazione per distorcere e piegare lo sfondo del sito
    thickness: 2.8,            // Spessore del vetro per creare splendide rifrazioni curve sui bordi
    specularIntensity: 1.5,
    specularColor: new THREE.Color(0xffffff),
    envMapIntensity: 4.0,      // Eleva la brillantezza e l'intensità delle riflessioni dello sfondo del sito
    clearcoat: 1.0,            // Strato lucido trasparente protettivo
    clearcoatRoughness: 0.02,
    iridescence: 0.45,         // Delicata rifrazione iridescente ad olio/arcobaleno sui contorni
    iridescenceIOR: 1.38,
    side: THREE.DoubleSide,    // Calcola facce esterne e interne (doppia rifrazione)
    depthWrite: true
  });

  // MODIFICA SHADER: Inietta la deformazione Twist X + Z sul materiale fisico in tempo reale
  liquidGlassMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.twistXAngle = customUniforms.twistXAngle;
    shader.uniforms.twistZAngle = customUniforms.twistZAngle;
    shader.uniforms.bboxMin = customUniforms.bboxMin;
    shader.uniforms.bboxMax = customUniforms.bboxMax;
    shader.uniforms.uTime = customUniforms.uTime;
    shader.uniforms.uScrollActivity = customUniforms.uScrollActivity;
    shader.uniforms.uSweepProgress = customUniforms.uSweepProgress;

    // Vertex Shader: Definisce le uniform e la coordinata locale da passare al Fragment Shader
    shader.vertexShader = `
      varying vec3 vLocalPosition;
      uniform float twistXAngle;
      uniform float twistZAngle;
      uniform vec3 bboxMin;
      uniform vec3 bboxMax;
    ` + shader.vertexShader;

    // Applica la distorsione Twist geometrica sui vertici reali prima del rendering fisico
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      vLocalPosition = position; // Salva la posizione originale sulla mesh per calcoli di sfocatura locali coerenti
      
      // TWIST X
      float factorX = (position.x - bboxMin.x) / (bboxMax.x - bboxMin.x);
      factorX = clamp(factorX, 0.0, 1.0);
      float angleX = twistXAngle * factorX;
      
      float cosX = cos(angleX);
      float sinX = sin(angleX);
      
      vec3 twistedPos = transformed;
      twistedPos.y = transformed.y * cosX - transformed.z * sinX;
      twistedPos.z = transformed.y * sinX + transformed.z * cosX;
      
      // TWIST Z
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

    // Fragment Shader: Riceve la coordinata locale e modula la roughness per creare l'effetto sweep evanescente da destra a sinistra
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
      
      // 1. Inviluppo temporale dello sweep (curva a campana sinusoidale che parte a 0, picca a 1 in mezzo e torna a 0 a fine corsa)
      float envelope = sin(uSweepProgress * 3.14159265);
      
      // 2. Il centro dello sweep si sposta dall'estremo destro (x = 2.0) all'estremo sinistro (x = -2.0)
      float sweepCenter = 2.0 - uSweepProgress * 4.0;
      
      // 3. Calcola la distanza del pixel corrente rispetto al centro dello sweep corrente
      float distToCenter = vLocalPosition.x - sweepCenter;
      
      // 4. Campana Gaussiana per localizzare la sfocatura in una banda mobile morbida
      float sweepBlur = exp(-pow(distToCenter, 2.0) / 0.65); // 0.65 definisce la larghezza visiva della sfocatura
      
      // Fluttuazione organica della nebbia per una resa liquida fantastica
      float wave = sin(vLocalPosition.z * 3.5 + uTime * 2.2) * 0.12 + 0.88;
      
      // Calcola l'intensità finale della sfocatura
      float dynamicBlur = sweepBlur * envelope * wave * 0.85;
      
      // Applica la sfocatura progressiva (roughness) sul cristallo.
      // A fine sweep (uSweepProgress = 1.0), l'involucro si annulla e l'auto torna al suo elegantissimo vetro satinato di base!
      roughnessFactor = clamp(roughnessFactor + dynamicBlur, 0.26, 0.90);
      `
    );
  };

  // Tracciamento per il rilevamento del movimento di scroll in JS
  let sweepProgress = 1.0;
  let sweepActive = false;

  // Aggiorna gli angoli del twist in base ai prop reattivi passati da GSAP
  $effect(() => {
    customUniforms.twistXAngle.value = (twistX * 2.8 * Math.PI) / 180;
    customUniforms.twistZAngle.value = (twistZ * 2.8 * Math.PI) / 180;
  });

  // ANIMAZIONE UNIFORMS: Incrementa uTime e gestisce lo sweep progressivo da destra a sinistra ad ogni scroll
  $effect(() => {
    let lastTwistX = twistX;
    let rafId;
    const animate = () => {
      customUniforms.uTime.value += 0.015;

      const activityX = Math.abs(twistX - 360) / 360.0;
      const activityZ = Math.abs(twistZ - 200) / 200.0;
      const targetActivity = Math.max(activityX, activityZ);

      customUniforms.uScrollActivity.value += (targetActivity - customUniforms.uScrollActivity.value) * 0.035;

      // RILEVAZIONE SCROLL ATTIVO:
      // Calcola la variazione di rotazione X introdotta dallo scroll.
      const delta = Math.abs(twistX - lastTwistX);
      lastTwistX = twistX;

      // Se viene rilevato uno scroll marcato e lo sweep non è già attivo (o è quasi concluso), avviamo la transizione da destra
      if (delta > 0.05) {
        if (!sweepActive) {
          sweepActive = true;
          sweepProgress = 0.0; // Inizia istantaneamente dall'estrema destra!
        }
      }

      if (sweepActive) {
        sweepProgress += 0.035; // Velocità di scorrimento dello sweep (circa 0.45 secondi per coprire l'intera auto)
        if (sweepProgress >= 1.0) {
          sweepProgress = 1.0;
          sweepActive = false; // Sweep completato, l'auto torna nitida
        }
      } else {
        sweepProgress = 1.0; // Forza lo stato nitido a riposo
      }

      customUniforms.uSweepProgress.value = sweepProgress;

      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafId);
    };
  });

  // Calcola il bounding box dinamico dell'oggetto GLTF per calcolare correttamente i fattori del Twist
  $effect(() => {
    if ($gltf && $gltf.scene) {
      const box = new THREE.Box3().setFromObject($gltf.scene);
      customUniforms.bboxMin.value.copy(box.min);
      customUniforms.bboxMax.value.copy(box.max);
    }
  });

  // APPLICAZIONE DEL MATERIALE E DELLE RIFLESSIONI DELLO SFONDO SU OGNI PARTE DEL MODELLO GLTF
  $effect(() => {
    if ($gltf && $gltf.scene && envMap) {
      $gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = liquidGlassMaterial;
          
          // Associa la texture PMREM pre-filtrata per abilitare la sfocatura reale!
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
