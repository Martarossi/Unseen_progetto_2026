<script>
  import { T, useTask, useThrelte } from '@threlte/core';
  import * as THREE from 'three';

  /** @type {{ angle: number, y: number, opacity: number, centerX: number, centerY: number }} */
  let { orbitProps = { angle: 0, y: -3, opacity: 0, centerX: 0, centerY: 0 }, label = 'VIDEOAI1' } = $props();

  const { camera } = useThrelte();

  const ORBIT_RADIUS = 3.5;
  const CARD_W = 3.6;
  const CARD_H = 2.025; // 16:9

  // --- Canvas texture: card visual design ---
  const cvs = document.createElement('canvas');
  cvs.width = 640;
  cvs.height = 360;
  const ctx = cvs.getContext('2d');

  if (ctx) {
    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, 0, 360);
    bg.addColorStop(0, '#07101f');
    bg.addColorStop(1, '#0b1829');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 640, 360);

    // Outer border with glow
    ctx.shadowColor = '#A7CED8';
    ctx.shadowBlur = 14;
    ctx.strokeStyle = '#A7CED8';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, 632, 352);
    ctx.shadowBlur = 0;

    // Corner L-shaped accents
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

    // Header label
    ctx.fillStyle = '#A7CED8';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(label, 22, 40);

    // Thin separator under header
    ctx.strokeStyle = 'rgba(167, 206, 216, 0.22)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(22, 54);
    ctx.lineTo(618, 54);
    ctx.stroke();

    // Video placeholder area (dark tinted rect)
    ctx.fillStyle = 'rgba(167, 206, 216, 0.04)';
    ctx.fillRect(22, 66, 596, 266);

    // Play button outer circle
    ctx.beginPath();
    ctx.arc(320, 202, 46, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(167, 206, 216, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Play button triangle
    ctx.fillStyle = 'rgba(167, 206, 216, 0.75)';
    ctx.beginPath();
    ctx.moveTo(308, 182);
    ctx.lineTo(308, 222);
    ctx.lineTo(346, 202);
    ctx.closePath();
    ctx.fill();

    // Bottom status text
    ctx.fillStyle = 'rgba(167, 206, 216, 0.42)';
    ctx.font = '13px monospace';
    ctx.fillText('● IN ARRIVO', 22, 346);
  }

  const cardTexture = new THREE.CanvasTexture(cvs);

  const cardMat = new THREE.MeshBasicMaterial({
    map: cardTexture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  /** @type {THREE.Group | undefined} */
  let cardGroup;
  /** @type {THREE.Mesh | undefined} */
  let cardMesh;

  // Hover: raycasting via document mousemove (canvas has pointer-events: none)
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

  // Run every frame: update orbit position, self-rotation, opacity, and hover
  useTask((delta) => {
    if (!cardGroup) return;

    // Render after the glass object so depth testing occludes the card correctly
    // when it is behind the glass, eliminating the intersection artifact
    cardGroup.renderOrder = 1;

    const { angle, y, opacity, centerX, centerY } = orbitProps;

    const baseZ = ORBIT_RADIUS * Math.sin(angle);
    cardGroup.position.set(
      centerX + ORBIT_RADIUS * Math.cos(angle),
      centerY + y,
      baseZ
    );

    // Piecewise self-rotation around Y — five smooth segments (zero-derivative joins):
    //   angle  π   → 3π/2 : 3π/4 → π    enters 3/4-flipped, completes to full back
    //   angle 3π/2 → 5π/2 : π   → 0     swings to full front as card comes in front
    //   angle 5π/2 → 3π   : 0   → -3π/4 quick flip OTHER way to mostly-back as card moves left
    //   angle 3π   → 7π/2 : -3π/4 → -π  slow completion to full back behind object (opposite side)
    //   angle 7π/2 → 4π   : -π  → -3π/4 partial flip as card exits top-right
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

    // Hover detection: only when card is visible and in front of the glass (positive Z)
    let hovered = false;
    if (cardMesh && clamped > 0.01 && baseZ > 0.5) {
      const cam = camera.current;
      if (cam) {
        raycaster.setFromCamera(mouseNDC, cam);
        hovered = raycaster.intersectObject(cardMesh).length > 0;
      }
    }

    // Smooth hover progress (8× speed → ~0.12s transition)
    const hoverTarget = hovered ? 1 : 0;
    hoverProgress += (hoverTarget - hoverProgress) * Math.min(1, delta * 8);

    // Scale up + push toward camera on hover
    cardGroup.scale.setScalar(1 + hoverProgress * 0.4);
    cardGroup.position.z = baseZ + hoverProgress * 0.9;
  });
</script>

<T.Group bind:ref={cardGroup}>
  <T.Mesh bind:ref={cardMesh}>
    <T.PlaneGeometry args={[CARD_W, CARD_H]} />
    <T is={cardMat} />
  </T.Mesh>
</T.Group>
