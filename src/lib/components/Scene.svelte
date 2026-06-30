<script>
  import { T, useThrelte } from "@threlte/core";
  import { useGltf, useMeshopt } from "@threlte/extras";
  import * as THREE from "three";
  import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
  import { useRenderer } from "@threlte/core";
  import VideoCard from "./VideoCard.svelte";

  const { renderer } = useRenderer();
  const { scene } = useThrelte();

  $effect(() => {
    if (renderer) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
    }
  });

  $effect(() => {
    if (!renderer || !scene) return;
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const loader = new HDRLoader();
    loader.load(
      "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_garden_1k.hdr",
      (texture) => {
        const envMap = pmrem.fromEquirectangular(texture).texture;
        scene.environment = envMap;
        texture.dispose();
        pmrem.dispose();
      }
    );
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
   *   visible?: boolean,
   *   showGlass?: boolean,
   *   isMobile?: boolean,
   *   onCardClick?: (rect: CardRect | null, videoSrc?: string, cardIndex?: number) => void,
   *   expandCardIndex?: number,
   *   onCardExpanded?: () => void,
   *   dotsVisible?: boolean,
   *   onPositionsUpdate?: (positions: {x: number, y: number}[]) => void
   * }} */
  let {
    position = [0, 0, 0],
    scale = [1, 1, 1],
    rotation = [0, 0, 0],
    twistX = 360,
    twistZ = 200,
    visible = false,
    orbitProps  = /** @type {OrbitProps} */ ({ angle: 0, y: -3, opacity: 0, centerX: 0, centerY: 0 }),
    orbitProps2 = /** @type {OrbitProps} */ ({ angle: 0, y: -3, opacity: 0, centerX: 0, centerY: 0 }),
    orbitProps3 = /** @type {OrbitProps} */ ({ angle: 0, y: -3, opacity: 0, centerX: 0, centerY: 0 }),
    onCardClick = undefined,
    expandCardIndex = -1,
    onCardExpanded = undefined,
    dotsVisible = false,
    showGlass = true,
    isMobile = false,
  } = $props();

  // CARICAMENTO MODELLO GLTF
  const meshoptDecoder = useMeshopt();
  const gltf = useGltf("/OGGETTO%20ANIMATO%20PER%20SITO%202.glb", { meshoptDecoder });

  const customUniforms = {
    twistXAngle: { value: (360 * Math.PI) / 180 },
    twistZAngle: { value: (200 * Math.PI) / 180 },
    bboxMin: { value: new THREE.Vector3(-1.5, -1.5, -1.5) },
    bboxMax: { value: new THREE.Vector3(1.5, 1.5, 1.5) },
    uTime: { value: 0 },
    uScrollActivity: { value: 0 }
  };


  // MATERIALE PARTICELLARE "VISION" GLOWING: Crea un materiale particellare ad alte prestazioni con blending additivo per un effetto olografico neon.
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xC9D7DC,          // Elegante colore Silver-Blue/Grey richiesto (invece di neon cyan)
    size: 0.09,               // Dimensione ideale delle particelle (aumentata per una silhouette solida e ben definita)
    sizeAttenuation: true,    // Le particelle rimpiccioliscono in base alla distanza per creare profondità
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending, // Sovrapposizione additiva per creare hotspot luminosi sui contorni
    depthWrite: false,        // Impedisce il clipping trasparente delle particelle
  });

  // MODIFICA SHADER (DEFORMER TWIST ALLO SCROLL + FLUID TURBULENCE PER PARTICELLE)
  particleMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.twistXAngle = customUniforms.twistXAngle;
    shader.uniforms.twistZAngle = customUniforms.twistZAngle;
    shader.uniforms.bboxMin = customUniforms.bboxMin;
    shader.uniforms.bboxMax = customUniforms.bboxMax;
    shader.uniforms.uTime = customUniforms.uTime;
    shader.uniforms.uScrollActivity = customUniforms.uScrollActivity;

    shader.vertexShader = `
      uniform float twistXAngle;
      uniform float twistZAngle;
      uniform vec3 bboxMin;
      uniform vec3 bboxMax;
      uniform float uTime;
      uniform float uScrollActivity;
    ` + shader.vertexShader;

    // Distorsione Twist X + Z sulle posizioni delle particelle in begin_vertex
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

      // DISLOCAMENTO ORGANICO WAVE/TURBULLENCE (FLUIDO):
      // Crea onde tridimensionali fluide combinate per dare un movimento organico continuo
      vec3 wave;
      wave.x = sin(transformed.y * 3.5 + uTime * 2.2) * cos(transformed.z * 3.0 + uTime * 1.7);
      wave.y = cos(transformed.x * 3.0 + uTime * 2.0) * sin(transformed.z * 3.5 + uTime * 2.2);
      wave.z = sin(transformed.x * 3.5 + uTime * 1.7) * cos(transformed.y * 3.0 + uTime * 2.5);

      // Micro-shimmer continuo a riposo (0.045) + forte turbolenza allo scroll (fino a 0.38)
      float noiseScale = 0.045 + uScrollActivity * 0.34;
      transformed += wave * noiseScale;
      `
    );

    // Modifica del fragment shader per disegnare particelle circolari sfocate e brillanti
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>
      
      // Disegna un cerchio sfocato con decadimento radiale morbido
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      if (dist > 0.5) discard;
      float intensity = smoothstep(0.5, 0.0, dist);
      diffuseColor.a *= intensity;
      `
    );
  };

  // --- SISTEMA DI EMISSIONE PARTICELLE GPU (DALLA SUPERFICIE DELL'OGGETTO 3D) ---
  const ambientParticleCount = 180;
  
  const positions = new Float32Array(ambientParticleCount * 3);
  const driftDirs = new Float32Array(ambientParticleCount * 3);
  const driftSpeeds = new Float32Array(ambientParticleCount);
  const driftPhases = new Float32Array(ambientParticleCount);
  const driftMaxLifes = new Float32Array(ambientParticleCount);

  for (let i = 0; i < ambientParticleCount; i++) {
    // Direzione casuale tridimensionale (preferenza verso l'alto e l'esterno)
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.45; // spinge all'insù e in fuori
    
    const dx = Math.sin(phi) * Math.cos(theta);
    const dy = Math.cos(phi) * 0.7 + 0.6; // deriva verticale marcata
    const dz = Math.sin(phi) * Math.sin(theta);
    
    const len = Math.sqrt(dx*dx + dy*dy + dz*dz) || 1;
    driftDirs[i * 3] = dx / len;
    driftDirs[i * 3 + 1] = dy / len;
    driftDirs[i * 3 + 2] = dz / len;

    driftSpeeds[i] = 0.35 + Math.random() * 0.45;  // velocità della particella
    driftPhases[i] = Math.random() * 50.0;         // fase temporale casuale per sfasare gli avvii
    driftMaxLifes[i] = 2.0 + Math.random() * 3.5;  // vita massima della particella (2s a 5.5s)
  }

  const ambientGeometry = new THREE.BufferGeometry();
  ambientGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  ambientGeometry.setAttribute('aDriftDir', new THREE.BufferAttribute(driftDirs, 3));
  ambientGeometry.setAttribute('aDriftSpeed', new THREE.BufferAttribute(driftSpeeds, 1));
  ambientGeometry.setAttribute('aDriftPhase', new THREE.BufferAttribute(driftPhases, 1));
  ambientGeometry.setAttribute('aDriftMaxLife', new THREE.BufferAttribute(driftMaxLifes, 1));

  const ambientMaterial = new THREE.PointsMaterial({
    color: 0xC9D7DC,          // Stesso elegante colore silver-grey richiesto delle particelle dense
    size: 0.22,               // Notevolmente ingrandito per renderle luminose e super visibili!
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.95,            // Quasi completamente opache per massimizzare il contrasto e il brio
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  ambientMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.twistXAngle = customUniforms.twistXAngle;
    shader.uniforms.twistZAngle = customUniforms.twistZAngle;
    shader.uniforms.bboxMin = customUniforms.bboxMin;
    shader.uniforms.bboxMax = customUniforms.bboxMax;
    shader.uniforms.uTime = customUniforms.uTime;
    shader.uniforms.uScrollActivity = customUniforms.uScrollActivity;

    shader.vertexShader = `
      attribute vec3 aDriftDir;
      attribute float aDriftSpeed;
      attribute float aDriftPhase;
      attribute float aDriftMaxLife;

      uniform float twistXAngle;
      uniform float twistZAngle;
      uniform vec3 bboxMin;
      uniform vec3 bboxMax;
      uniform float uTime;
      uniform float uScrollActivity;
    ` + shader.vertexShader;

    // Distorsione Twist X + Z sulle posizioni delle particelle ambientali in begin_vertex (così si avvitano in sincrono con la macchina)
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      
      // 1. Calcola il twist sulla posizione ORIGINALE della particella (che si trova sulla vettura)
      vec3 twistedPos = transformed;
      
      // TWIST X
      float factorX_p = (position.x - bboxMin.x) / (bboxMax.x - bboxMin.x);
      factorX_p = clamp(factorX_p, 0.0, 1.0);
      float angleX_p = twistXAngle * factorX_p;
      
      float cosX_p = cos(angleX_p);
      float sinX_p = sin(angleX_p);
      
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

      // 2. Calcola il drift progressivo su GPU AFTER TWIST!
      // In questo modo le particelle si staccano e seguono perfettamente la deformazione dell'auto!
      float life = mod(uTime * aDriftSpeed + aDriftPhase, aDriftMaxLife);
      float progress = life / aDriftMaxLife; // da 0 a 1
      
      // Moltiplicatore di velocità basato sull'attività cinetica reale dello scorrimento
      float speedMult = 1.0 + uScrollActivity * 5.5;
      
      // Calcola direzione di allontanamento radiale dal centro del modello già deformato
      vec3 radialDir = normalize(transformed);
      
      // Combina la direzione radiale di distacco con la deriva predefinita
      vec3 finalDriftDir = normalize(aDriftDir + radialDir * uScrollActivity * 0.85);
      
      // La distanza aumenta nel tempo, accelerata dallo scroll
      vec3 driftOffset = finalDriftDir * (progress * 1.5 * speedMult);
      
      // Aggiungi una fluttuazione sinusoidale fine
      driftOffset.x += sin(uTime * 1.2 + aDriftPhase) * 0.05;
      driftOffset.y += cos(uTime * 0.8 + aDriftPhase) * 0.04;
      driftOffset.z += sin(uTime * 1.5 + aDriftPhase) * 0.05;

      // Applica il dislocamento finale al vertice già deformato!
      transformed += driftOffset;
      `
    );

    // Fragment shader per particelle rotonde e sfocate ai bordi
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

  /**
   * Calcola la matrice di trasformazione di un nodo rispetto a un root di riferimento.
   * @param {THREE.Object3D} node
   * @param {THREE.Object3D} root
   * @returns {THREE.Matrix4}
   */
  function getRelativeMatrix(node, root) {
    const relativeMatrix = new THREE.Matrix4();
    let current = /** @type {import('three').Object3D | null} */ (node);
    const ancestors = [];
    while (current && current !== root) {
      ancestors.push(current);
      current = current.parent;
    }
    for (let i = ancestors.length - 1; i >= 0; i--) {
      relativeMatrix.multiply(ancestors[i].matrix);
    }
    return relativeMatrix;
  }

  // Funzione ultra-rapida per campionare punti in modo uniforme sulla superficie dei triangoli (Barycentric Sampling)
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
      const indexCount = indexAttr.count;
      const triangleCount = indexCount / 3;

      for (let i = 0; i < count; i++) {
        const triIndex = Math.floor(Math.random() * triangleCount) * 3;
        const idxA = indexAttr.getX(triIndex);
        const idxB = indexAttr.getY(triIndex);
        const idxC = indexAttr.getZ(triIndex);

        vA.fromBufferAttribute(positionAttr, idxA);
        vB.fromBufferAttribute(positionAttr, idxB);
        vC.fromBufferAttribute(positionAttr, idxC);

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

        sampledPositions[i * 3] = point.x;
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

        sampledPositions[i * 3] = point.x;
        sampledPositions[i * 3 + 1] = point.y;
        sampledPositions[i * 3 + 2] = point.z;
      }
    }

    const sampledGeom = new THREE.BufferGeometry();
    sampledGeom.setAttribute('position', new THREE.BufferAttribute(sampledPositions, 3));
    return sampledGeom;
  }

  $effect(() => {
    if (!visible) return;
    customUniforms.twistXAngle.value = (twistX * 2.8 * Math.PI) / 180;
    customUniforms.twistZAngle.value = (twistZ * 2.8 * Math.PI) / 180;
  });

  // ANIMAZIONE UNIFORMS: Loop continuo per uTime e interpolazione morbida dell'attività di scorrimento.
  // Si avvia solo quando il modello è visibile per non stressare la GPU inutilmente.
  $effect(() => {
    if (!visible) return;
    /** @type {number} */
    let rafId;
    const animate = () => {
      customUniforms.uTime.value += 0.015;

      const activityX = Math.abs(twistX - 360) / 360.0;
      const activityZ = Math.abs(twistZ - 200) / 200.0;
      const targetActivity = Math.max(activityX, activityZ);

      customUniforms.uScrollActivity.value += (targetActivity - customUniforms.uScrollActivity.value) * 0.035;

      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafId);
    };
  });

  $effect(() => {
    if ($gltf && $gltf.scene) {
      const localBox = new THREE.Box3();
      $gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const geom = child.geometry;
          if (geom) {
            geom.computeBoundingBox();
            if (geom.boundingBox) {
              const relativeMatrix = getRelativeMatrix(child, $gltf.scene);
              const meshBox = geom.boundingBox.clone().applyMatrix4(relativeMatrix);
              localBox.union(meshBox);
            }
          }
        }
      });
      if (!localBox.isEmpty()) {
        customUniforms.bboxMin.value.copy(localBox.min);
        customUniforms.bboxMax.value.copy(localBox.max);
      }
    }
  });

  // CONVERSIONE MESH -> POINTS PARTICELLE DENSE: Nasconde le mesh solide originali del modello e le sostituisce con un sistema ad alta densità.
  $effect(() => {
    if ($gltf && $gltf.scene) {
      /** @type {THREE.Mesh[]} */
      const meshesToConvert = [];
      $gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh && !child.userData.isParticleConverted) {
          meshesToConvert.push(child);
        }
      });

      if (meshesToConvert.length > 0 && !ambientGeometry.userData.hasOrigins) {
        const posAttr = ambientGeometry.attributes.position;
        const posArr = posAttr.array;

        // Campioniamo 800 punti di origine direttamente sulla superficie reale della vettura
        let sampledCount = 0;
        while (sampledCount < ambientParticleCount) {
          const randomMesh = meshesToConvert[Math.floor(Math.random() * meshesToConvert.length)];
          const geom = randomMesh.geometry;

          // Campiona un punto singolo
          const sampledGeom = samplePointsFromGeometry(geom, 1);
          const pos = sampledGeom.attributes.position.array;

          // Trasforma il punto nel sistema di coordinate del root ($gltf.scene)
          const localPoint = new THREE.Vector3(pos[0], pos[1], pos[2]);
          const relativeMatrix = getRelativeMatrix(randomMesh, $gltf.scene);
          localPoint.applyMatrix4(relativeMatrix);

          posArr[sampledCount * 3] = localPoint.x;
          posArr[sampledCount * 3 + 1] = localPoint.y;
          posArr[sampledCount * 3 + 2] = localPoint.z;

          sampledCount++;
        }

        posAttr.needsUpdate = true;
        ambientGeometry.userData.hasOrigins = true; // Segnala all'effetto di animazione che le origini sono pronte!

        // Aggiungiamo le particelle ambientali emesse direttamente all'interno dello scene-group del modello GLTF
        // In questo modo ereditano automaticamente posizionamento, scala, rotazione ed easing di scorrimento dell'auto!
        const ambientPoints = new THREE.Points(ambientGeometry, ambientMaterial);
        $gltf.scene.add(ambientPoints);

      }

      meshesToConvert.forEach((mesh) => {
        mesh.visible = false; // Nascondi la mesh originale
        mesh.userData.isParticleConverted = true;

        // Campiona 20000 particelle distribuite uniformemente per ogni mesh (super denso!)
        const denseGeometry = samplePointsFromGeometry(mesh.geometry, 20000);
        
        // Trasforma la geometria nel sistema di coordinate del root ($gltf.scene)
        const relativeMatrix = getRelativeMatrix(mesh, $gltf.scene);
        denseGeometry.applyMatrix4(relativeMatrix);

        const points = new THREE.Points(denseGeometry, particleMaterial);
        points.name = mesh.name;
        // Aggiungi direttamente al root, dato che i punti sono già nel sistema di coordinate del root
        $gltf.scene.add(points);
      });
    }
  });

  // Mostra o nasconde la scocca principale (fotocamera "Glass") in base alla prop showGlass
  $effect(() => {
    if ($gltf && $gltf.scene) {
      $gltf.scene.traverse((child) => {
        if (child instanceof THREE.Points && child.name === "Glass") {
          child.visible = showGlass;
        }
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


{#if $gltf}
  <T is={$gltf.scene} {position} {scale} {rotation} visible={visible} />
{/if}

<VideoCard
  {orbitProps}
  {isMobile}
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
  {isMobile}
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
  {isMobile}
  label="VIDEOAI3"
  videoSrc="/video_card/Bullet_time.mov"
  cardTitle="BULLET TIMING"
  cardSubtitle="Scansione orbitale di un istante sospeso"
  isExpanding={expandCardIndex === 2}
  onCardExpanded={expandCardIndex === 2 ? onCardExpanded : undefined}
  onCardClick={(rect) => onCardClick?.(rect, '/video_card/Bullet_time.mov', 2)}
/>
