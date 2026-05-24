<script>
  import { T, useTask, useThrelte } from '@threlte/core';
  import * as THREE from 'three';

  /** @type {{
   *   orbitProps?: { angle: number, y: number, opacity: number, centerX: number, centerY: number },
   *   label?: string,
   *   videoSrc?: string,
   *   cardTitle?: string,
   *   cardSubtitle?: string,
   *   onCardClick?: () => void
   * }} */
  let {
    orbitProps = { angle: 0, y: -3, opacity: 0, centerX: 0, centerY: 0 },
    label = 'VIDEOAI1',
    videoSrc = '',
    cardTitle = '',
    cardSubtitle = '',
    onCardClick = undefined
  } = $props();

  const { camera } = useThrelte();

  const ORBIT_RADIUS = 3.5;
  const CARD_W = 3.6;
  const CARD_H = 2.025; // 16:9

  const cvs = document.createElement('canvas');
  cvs.width = 640;
  cvs.height = 360;

  const cardTexture = new THREE.CanvasTexture(cvs);

  const cardMat = new THREE.MeshBasicMaterial({
    map: cardTexture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
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

  const raycaster = new THREE.Raycaster();
  const mouseNDC = new THREE.Vector2(-9999, -9999);
  let hoverProgress = 0;

  $effect(() => {
    /** @param {MouseEvent} e */
    function onMouseMove(e) {
      mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }
    document.addEventListener('mousemove', onMouseMove);
    return () => document.removeEventListener('mousemove', onMouseMove);
  });

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

      clickNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
      clickNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
      clickRaycaster.setFromCamera(clickNDC, camera.current);

      if (clickRaycaster.intersectObject(cardMesh).length > 0) {
        onCardClick?.();
      }
    }

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  });

  useTask((delta) => {
    if (!cardGroup) return;

    cardGroup.renderOrder = 1;

    const { angle, y, opacity, centerX, centerY } = orbitProps;

    const baseZ = ORBIT_RADIUS * Math.sin(angle);
    cardGroup.position.set(
      centerX + ORBIT_RADIUS * Math.cos(angle),
      centerY + y,
      baseZ
    );

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
    cardMat.opacity = clamped;
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

    cardGroup.scale.setScalar(1 + hoverProgress * 0.12);
    cardGroup.position.z = baseZ + hoverProgress * 0.5;

    // Disegno del frame video sulla texture Three.js
    if (videoEl && videoEl.readyState >= 2) {
      const ctx = cvs.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoEl, 0, 0, 640, 360);

        // Gradiente scuro sul fondo per leggibilità del testo
        const grad = ctx.createLinearGradient(0, 160, 0, 360);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.68)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 640, 360);

        if (cardTitle) {
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 52px Arial, Helvetica, sans-serif';
          ctx.fillText(cardTitle, 28, 294);
        }

        if (cardSubtitle) {
          ctx.fillStyle = 'rgba(255,255,255,0.78)';
          ctx.font = '15px Arial, Helvetica, sans-serif';
          ctx.fillText(cardSubtitle, 28, 322);
        }

        cardTexture.needsUpdate = true;
      }
    }
  });
</script>

<T.Group bind:ref={cardGroup}>
  <T.Mesh bind:ref={cardMesh}>
    <T.PlaneGeometry args={[CARD_W, CARD_H]} />
    <T is={cardMat} />
  </T.Mesh>
</T.Group>