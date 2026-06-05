<script>
  import { T, useTask, useThrelte } from '@threlte/core';
  import * as THREE from 'three';
  import gsap from 'gsap';

  /** @typedef {{ x: number, y: number, width: number, height: number }} CardRect */

  /** @type {{
   *   orbitProps?: { angle: number, y: number, opacity: number, centerX: number, centerY: number },
   *   label?: string,
   *   videoSrc?: string,
   *   cardTitle?: string,
   *   cardSubtitle?: string,
   *   onCardClick?: (rect: CardRect | null) => void,
   *   isExpanding?: boolean,
   *   onCardExpanded?: () => void
   * }} */
  let {
    orbitProps = { angle: 0, y: -3, opacity: 0, centerX: 0, centerY: 0 },
    label = 'VIDEOAI1',
    videoSrc = '',
    cardTitle = '',
    cardSubtitle = '',
    onCardClick = undefined,
    isExpanding = false,
    onCardExpanded = undefined,
  } = $props();

  const { camera } = useThrelte();

  const ORBIT_RADIUS = 3.5;
  const CARD_W = 4.1;
  const CARD_H = 2.306; // 16:9
  const CARD_DEPTH = 0.03;
  const CORNER_R = 0.22; // raggio angoli fronte – non clampato dalla depth con ExtrudeGeometry

  // Forma arrotondata: angoli esatti anche sullo spessore
  const hw = CARD_W / 2;
  const hh = CARD_H / 2;
  const cardShape = new THREE.Shape();
  cardShape.moveTo(-hw + CORNER_R, -hh);
  cardShape.lineTo( hw - CORNER_R, -hh);
  cardShape.quadraticCurveTo( hw, -hh,  hw, -hh + CORNER_R);
  cardShape.lineTo( hw,  hh - CORNER_R);
  cardShape.quadraticCurveTo( hw,  hh,  hw - CORNER_R,  hh);
  cardShape.lineTo(-hw + CORNER_R,  hh);
  cardShape.quadraticCurveTo(-hw,  hh, -hw,  hh - CORNER_R);
  cardShape.lineTo(-hw, -hh + CORNER_R);
  cardShape.quadraticCurveTo(-hw, -hh, -hw + CORNER_R, -hh);
  cardShape.closePath();

  const cardGeom = new THREE.ExtrudeGeometry(cardShape, { depth: CARD_DEPTH, bevelEnabled: false });
  // Centra sull'asse Z
  cardGeom.translate(0, 0, -CARD_DEPTH / 2);
  // Normalizza UV dal coord world-space [-hw,hw]×[-hh,hh] → [0,1]×[0,1]
  const _uv = cardGeom.attributes.uv;
  for (let i = 0; i < _uv.count; i++) {
    _uv.setX(i, (_uv.getX(i) + hw) / CARD_W);
    _uv.setY(i, (_uv.getY(i) + hh) / CARD_H);
  }
  _uv.needsUpdate = true;

  const cvs = document.createElement('canvas');
  cvs.width = 640;
  cvs.height = 360;

  const cardTexture = new THREE.CanvasTexture(cvs);

  const cardMatFront = new THREE.MeshBasicMaterial({
    map: cardTexture,
    transparent: true,
    side: THREE.FrontSide,
    depthWrite: false,
  });

  // Stesso canvas del fronte: il back cap di ExtrudeGeometry ha UV invertiti per
  // winding order, quindi appare automaticamente specchiato quando il retro è verso la camera.
  const cardMatBack = new THREE.MeshBasicMaterial({
    map: cardTexture,
    transparent: true,
    side: THREE.BackSide,
    depthWrite: false,
  });

  // Materiale vetro fisico sui lati: IOR elevato e transmission per rifrazione visibile sullo spessore della card.
  const cardGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xA7CED8,
    metalness: 0.0,
    roughness: 0.0,
    transmission: 0.7,
    ior: 2.0,
    thickness: CARD_DEPTH * 6,
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    envMapIntensity: 3.5,
  });

  // Video element per le card con video
  /** @type {HTMLVideoElement | null} */
  let videoEl = $state(null);

  $effect(() => {
    if (!videoSrc) return;
    const el = document.createElement('video');
    el.src = videoSrc;
    el.muted = true;
    el.loop = true;
    el.playsInline = true;
    el.play().catch(() => {});
    videoEl = el;
    return () => {
      el.pause();
      el.src = '';
      videoEl = null;
    };
  });

  // Disegno statico - saltato se la card ha un video
  $effect(() => {
    if (videoSrc) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    const bg = ctx.createLinearGradient(0, 0, 0, 360);
    bg.addColorStop(0, '#07101f');
    bg.addColorStop(1, '#0b1829');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 640, 360);

    ctx.shadowColor = '#A7CED8';
    ctx.shadowBlur = 14;
    ctx.strokeStyle = '#A7CED8';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, 632, 352);
    ctx.shadowBlur = 0;

    /** @param {number} x @param {number} y @param {number} dx @param {number} dy */
    const corner = (x, y, dx, dy) => {
      ctx.beginPath();
      ctx.moveTo(x + dx * 22, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + dy * 22);
      ctx.stroke();
    };
    ctx.strokeStyle = '#A7CED8';
    ctx.lineWidth = 2.5;
    corner(4,   4,   1,  1);
    corner(636, 4,  -1,  1);
    corner(4,   356, 1, -1);
    corner(636, 356,-1, -1);

    ctx.fillStyle = '#A7CED8';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(label, 22, 40);

    ctx.strokeStyle = 'rgba(167, 206, 216, 0.22)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(22, 54);
    ctx.lineTo(618, 54);
    ctx.stroke();

    ctx.fillStyle = 'rgba(167, 206, 216, 0.04)';
    ctx.fillRect(22, 66, 596, 266);

    ctx.beginPath();
    ctx.arc(320, 202, 46, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(167, 206, 216, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = 'rgba(167, 206, 216, 0.75)';
    ctx.beginPath();
    ctx.moveTo(308, 182);
    ctx.lineTo(308, 222);
    ctx.lineTo(346, 202);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(167, 206, 216, 0.42)';
    ctx.font = '13px monospace';
    ctx.fillText('● IN ARRIVO', 22, 346);

    cardTexture.needsUpdate = true;
  });

  /** @type {THREE.Group | undefined} */
  let cardGroup = $state(undefined);
  /** @type {THREE.Mesh | undefined} */
  let cardMesh = $state(undefined);

  // Flag non-reattivo: evita di avviare l'animazione GSAP più di una volta
  let _expandStarted = false;

  // Quando isExpanding diventa true: anima cardGroup in Three.js fino a riempire lo schermo
  $effect(() => {
    if (!isExpanding) {
      _expandStarted = false;
      return;
    }
    const group = cardGroup;
    if (!group || _expandStarted) return;
    _expandStarted = true;

    const cam = /** @type {THREE.PerspectiveCamera} */ (camera.current);
    if (!cam) { onCardExpanded?.(); return; }

    // Calcola scala target: la card deve coprire l'intero viewport
    const z_dist = cam.position.z - group.position.z;
    const fov_rad = (cam.fov * Math.PI) / 180;
    const focalLength = 1 / Math.tan(fov_rad / 2);
    const aspect = window.innerWidth / window.innerHeight;
    const scaleH = z_dist / ((CARD_H / 2) * focalLength);
    const scaleW = (z_dist * aspect) / ((CARD_W / 2) * focalLength);
    const targetScale = Math.max(scaleH, scaleW) * 1.08;

    // GSAP anima la card 3D reale: posizione → centro, rotazione → frontale, scala → schermo pieno
    const t1 = gsap.to(group.position, { x: 0, y: 0, duration: 0.9, ease: 'power3.inOut' });
    const t2 = gsap.to(group.rotation, { y: 0, duration: 0.9, ease: 'power3.inOut' });
    const t3 = gsap.to(group.scale, {
      x: targetScale, y: targetScale, z: targetScale,
      duration: 0.9,
      ease: 'power3.inOut',
    });
    // Avvia il dissolve overlay al 60% dell'animazione: la dissolvenza si sovrappone alla fine dell'espansione
    const expandTimer = gsap.delayedCall(0.42, () => onCardExpanded?.());

    return () => { t1.kill(); t2.kill(); t3.kill(); expandTimer.kill(); };
  });

  const raycaster = new THREE.Raycaster();
  const mouseNDC = new THREE.Vector2(-9999, -9999);
  let hoverProgress = 0;
  let clickPulse = 0;

  // ── Floating label: piano trasparente che flotta sotto/davanti alla card ──
  const labelCvs = document.createElement('canvas');
  labelCvs.width = 640;
  labelCvs.height = 100;
  const labelTexture = new THREE.CanvasTexture(labelCvs);
  const LABEL_H = CARD_W * (100 / 640);
  const labelMat = new THREE.MeshBasicMaterial({
    map: labelTexture,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const labelPlaneGeom = new THREE.PlaneGeometry(CARD_W, LABEL_H);
  let labelGroup = $state(/** @type {THREE.Group | undefined} */ (undefined));
  let labelPosX = 0, labelPosY = 0, labelPosZ = 0, labelRotY = 0;

  $effect(() => {
    const ctx = labelCvs.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 640, 100);
    if (cardTitle) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px "Akira Expanded", Arial, sans-serif';
      ctx.fillText(cardTitle, 52, 44);
    }
    if (cardSubtitle) {
      ctx.fillStyle = 'rgba(255,255,255,0.82)';
      ctx.font = '15px Arial, Helvetica, sans-serif';
      ctx.fillText(cardSubtitle, 52, 70);
    }
    labelTexture.needsUpdate = true;
  });

  $effect(() => {
    /** @param {MouseEvent} e */
    function onMouseMove(e) {
      mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }
    document.addEventListener('mousemove', onMouseMove);
    return () => document.removeEventListener('mousemove', onMouseMove);
  });

  /** @returns {CardRect | null} */
  function computeCardScreenRect() {
    if (!cardGroup || !camera.current) return null;
    const cam = camera.current;
    const halfW = CARD_W / 2;
    const halfH = CARD_H / 2;
    const corners = [
      new THREE.Vector3(-halfW, -halfH, 0),
      new THREE.Vector3( halfW, -halfH, 0),
      new THREE.Vector3( halfW,  halfH, 0),
      new THREE.Vector3(-halfW,  halfH, 0),
    ];
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const c of corners) {
      c.applyMatrix4(cardGroup.matrixWorld);
      c.project(cam);
      const sx = (c.x + 1) / 2 * window.innerWidth;
      const sy = (-c.y + 1) / 2 * window.innerHeight;
      if (sx < minX) minX = sx;
      if (sx > maxX) maxX = sx;
      if (sy < minY) minY = sy;
      if (sy > maxY) maxY = sy;
    }
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  // Click detection per aprire l'overlay
  $effect(() => {
    if (!onCardClick) return;

    const clickNDC = new THREE.Vector2();
    const clickRaycaster = new THREE.Raycaster();

    /** @param {MouseEvent} e */
    function onClick(e) {
      if (!cardMesh || !camera.current) return;
      const clamped = Math.max(0, Math.min(1, orbitProps.opacity));
      if (clamped <= 0.01) return;
      if (ORBIT_RADIUS * Math.sin(orbitProps.angle) <= 0.5) return;

      clickNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
      clickNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
      clickRaycaster.setFromCamera(clickNDC, camera.current);

      if (clickRaycaster.intersectObject(cardMesh).length > 0) {
        clickPulse = 1;
        onCardClick?.(computeCardScreenRect());
      }
    }

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  });

  useTask((delta) => {
    if (!cardGroup) return;
    // GSAP gestisce position/rotation/scale durante l'espansione — non sovrascrivere
    if (isExpanding) {
      if (labelGroup) labelGroup.visible = false;
      return;
    }

    const { angle, y, opacity, centerX, centerY } = orbitProps;

    const baseZ = ORBIT_RADIUS * Math.sin(angle);
    cardGroup.position.set(
      centerX + ORBIT_RADIUS * Math.cos(angle),
      centerY + y,
      baseZ
    );

    // Primo piano (davanti al modello) quando baseZ > 0, secondo piano (dietro) quando baseZ < 0
    cardGroup.renderOrder = baseZ > 0 ? 1 : -1;

    let selfRot;
    if (angle <= 3 * Math.PI / 2) {
      selfRot = 3 * Math.PI / 4 + Math.PI / 8 * (1 - Math.cos(2 * (angle - Math.PI)));
    } else if (angle <= 5 * Math.PI / 2) {
      selfRot = Math.PI / 2 * (1 + Math.cos(angle - 3 * Math.PI / 2));
    } else if (angle <= 3 * Math.PI) {
      selfRot = -3 * Math.PI / 4 * (1 - Math.cos(2 * (angle - 5 * Math.PI / 2))) / 2;
    } else if (angle <= 7 * Math.PI / 2) {
      selfRot = -3 * Math.PI / 4 - Math.PI / 8 * (1 - Math.cos(2 * (angle - 3 * Math.PI)));
    } else {
      selfRot = -Math.PI + Math.PI / 8 * (1 - Math.cos(2 * (angle - 7 * Math.PI / 2)));
    }
    cardGroup.rotation.y = selfRot;

    const clamped = Math.max(0, Math.min(1, opacity));
    cardGroup.visible = clamped > 0.01;

    let hovered = false;
    if (cardMesh && clamped > 0.01 && baseZ > 0.5) {
      const cam = camera.current;
      if (cam) {
        raycaster.setFromCamera(mouseNDC, cam);
        hovered = raycaster.intersectObject(cardMesh).length > 0;
      }
    }

    const hoverTarget = hovered ? 1 : 0;
    hoverProgress += (hoverTarget - hoverProgress) * Math.min(1, delta * 8);

    const finalOpacity = clamped * (0.5 + 0.5 * hoverProgress);
    cardMatFront.opacity = finalOpacity;
    cardMatBack.opacity = finalOpacity;
    cardGlassMat.opacity = finalOpacity;
    clickPulse *= Math.max(0, 1 - delta * 14);

    cardGroup.scale.setScalar(1 + hoverProgress * 0.16 + clickPulse * 0.07);
    cardGroup.position.z = baseZ + hoverProgress * 0.5;

    // ── Floating label parallax: lerpa leggermente più lentamente della card ──
    if (labelGroup && (cardTitle || cardSubtitle)) {
      const LAG = Math.min(1, delta * 15);
      labelPosX += (cardGroup.position.x - labelPosX) * LAG;
      labelPosY += (cardGroup.position.y - labelPosY) * LAG;
      labelPosZ += (cardGroup.position.z - labelPosZ) * LAG;
      labelRotY += (selfRot - labelRotY) * LAG;
      labelGroup.visible = clamped > 0.01;
      labelGroup.position.set(
        labelPosX,
        labelPosY - (CARD_H / 2 - 0.4),
        labelPosZ + 0.50,
      );
      labelGroup.rotation.y = labelRotY;
      labelGroup.scale.setScalar(cardGroup.scale.x);
      labelMat.opacity = finalOpacity;
      labelGroup.renderOrder = cardGroup.renderOrder;
    }

    // Disegno del frame video sulla texture Three.js
    if (videoEl && videoEl.readyState >= 2) {
      const ctx = cvs.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 640, 360);

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(0, 0, 640, 360, [39]);
        ctx.clip();

        ctx.drawImage(videoEl, 0, 0, 640, 360);

        ctx.fillStyle = 'rgba(78, 119, 133, 0.12)';
        ctx.fillRect(0, 0, 640, 360);

        const grad = ctx.createLinearGradient(0, 360, 0, 0);
        grad.addColorStop(0,    '#070F11');
        grad.addColorStop(0.20, '#0F2124');
        grad.addColorStop(1,    'rgba(78, 119, 133, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 640, 360);

        ctx.restore();
        cardTexture.needsUpdate = true;
      }
    }
  });
</script>

<T.Group bind:ref={cardGroup}>
  <!-- Vetro lati: renderizzato per primo, coperto dai cap texture — visibile solo sui lati in prospettiva -->
  <T.Mesh>
    <T is={cardGeom} />
    <T is={cardGlassMat} />
  </T.Mesh>
  <!-- Retro: BackSide con stesso canvas — UV del back cap sono invertiti, appare specchiato -->
  <T.Mesh>
    <T is={cardGeom} />
    <T is={cardMatBack} />
  </T.Mesh>
  <!-- Fronte: disegnato per ultimo (sopra) — UV corretti quando la faccia frontale è verso la camera -->
  <T.Mesh bind:ref={cardMesh}>
    <T is={cardGeom} />
    <T is={cardMatFront} />
  </T.Mesh>
</T.Group>

<!-- Label floating: posizione in world space aggiornata via lerp nel useTask -->
<T.Group bind:ref={labelGroup}>
  <T.Mesh>
    <T is={labelPlaneGeom} />
    <T is={labelMat} />
  </T.Mesh>
</T.Group>