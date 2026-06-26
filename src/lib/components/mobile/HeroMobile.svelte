<script>
  import { onMount, tick } from "svelte";
  import gsap from "gsap";

  let { onClicked } = $props();

  /** @type {HTMLElement|null} */
  let heroRef = null;
  /** @type {HTMLCanvasElement|null} */
  let canvasRef = null;
  /** @type {HTMLElement|null} */
  let descriptionRef = null;

  let mouseX = $state(0);
  let mouseY = $state(0);
  let showLogo = $state(false);
  let isClicked = $state(false);
  let scrollY = $state(0);
  let scrollOpacity = $derived(Math.max(0, 1 - scrollY / 300));

  let revealRadius = 100;
  let lastMoveTime = Date.now();
  let isIdle = true;

  /** @type {gsap.core.Tween | null} */
  let scrollPromptPulse = null;

  $effect(() => {
    if (scrollY > 0 && scrollPromptPulse) {
      scrollPromptPulse.kill();
      scrollPromptPulse = null;
    }
  });

  function initCanvas() {
    if (!canvasRef) return;
    const canvas = canvasRef;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const maskCanvas = document.createElement("canvas");
    const maskCtx = maskCanvas.getContext("2d");
    if (!maskCtx) return;

    const SPOT_RES = 256;
    const spotCanvas = document.createElement("canvas");
    spotCanvas.width = SPOT_RES;
    spotCanvas.height = SPOT_RES;
    const spotCtx = spotCanvas.getContext("2d");
    if (spotCtx) {
      const g = spotCtx.createRadialGradient(
        SPOT_RES / 2,
        SPOT_RES / 2,
        0,
        SPOT_RES / 2,
        SPOT_RES / 2,
        SPOT_RES / 2,
      );
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      spotCtx.fillStyle = g;
      spotCtx.fillRect(0, 0, SPOT_RES, SPOT_RES);
    }

    const logoImg = new Image();
    logoImg.src = "/LOGO.png";
    let imgLoaded = false;
    logoImg.onload = () => {
      imgLoaded = true;
      resize();
    };

    function resize() {
      if (!canvasRef) return;
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
    }

    window.addEventListener("resize", resize);
    resize();

    let animationFrame = 0;
    let currentX = mouseX;
    let currentY = mouseY;
    let idleTargetX = canvas.width / 2;
    let idleTargetY = canvas.height / 2;

    const TRAIL_DURATION = 1000;
    const MAX_TRAIL = 90;
    const histX = new Float32Array(MAX_TRAIL);
    const histY = new Float32Array(MAX_TRAIL);
    const histTime = new Float64Array(MAX_TRAIL);
    let histHead = 0;
    let histCount = 0;

    function loop() {
      if (!ctx || !maskCtx) return;
      const now = performance.now();

      if (!imgLoaded) {
        animationFrame = requestAnimationFrame(loop);
        return;
      }

      const idleTime = Date.now() - lastMoveTime;
      if (idleTime > 2000) isIdle = true;

      if (isIdle && showLogo && !isClicked) {
        const dist = Math.hypot(currentX - idleTargetX, currentY - idleTargetY);
        if (
          dist < 50 ||
          idleTargetX > canvas.width ||
          idleTargetY > canvas.height
        ) {
          idleTargetX = canvas.width * (0.1 + Math.random() * 0.8);
          idleTargetY = canvas.height * (0.1 + Math.random() * 0.8);
        }
        currentX += (idleTargetX - currentX) * 0.02;
        currentY += (idleTargetY - currentY) * 0.02;
      } else {
        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;
      }

      if (showLogo) {
        histX[histHead] = currentX;
        histY[histHead] = currentY;
        histTime[histHead] = now;
        histHead = (histHead + 1) % MAX_TRAIL;
        if (histCount < MAX_TRAIL) histCount++;
      }

      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

      if (showLogo) {
        const cutoff = now - TRAIL_DURATION;
        const r = revealRadius;
        const d = r * 2;
        for (let n = 0; n < histCount; n++) {
          const idx = (histHead - 1 - n + MAX_TRAIL) % MAX_TRAIL;
          const t = histTime[idx];
          if (t < cutoff) break;
          const age = now - t;
          const alpha = Math.pow(Math.max(0, 1 - age / TRAIL_DURATION), 1.5);
          if (alpha < 0.01) continue;
          maskCtx.globalAlpha = alpha;
          maskCtx.drawImage(spotCanvas, histX[idx] - r, histY[idx] - r, d, d);
        }
        maskCtx.globalAlpha = 1;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Sfondo bianco esplicito sul canvas così il logo si rivela su bianco
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const scale = Math.min(
        (canvas.width * 0.8) / logoImg.width,
        (canvas.height * 0.55) / logoImg.height,
        1,
      );
      const dWidth = logoImg.width * scale;
      const dHeight = logoImg.height * scale;
      const dx = (canvas.width - dWidth) / 2;
      const dy = (canvas.height - dHeight) / 2 - canvas.height * 0.05;
      ctx.drawImage(logoImg, dx, dy, dWidth, dHeight);

      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(maskCanvas, 0, 0);
      ctx.globalCompositeOperation = "source-over";

      animationFrame = requestAnimationFrame(loop);
    }

    loop();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrame);
    };
  }

  /** @param {TouchEvent} e */
  function handleTouchStart(e) {
    if (isClicked || !showLogo) return;
    const touch = e.touches[0];
    if (!touch || !heroRef) return;
    const rect = heroRef.getBoundingClientRect();
    mouseX = touch.clientX - rect.left;
    mouseY = touch.clientY - rect.top;
    lastMoveTime = Date.now();
    isIdle = false;
  }

  /** @param {TouchEvent} e */
  function handleTouchMove(e) {
    if (isClicked || !showLogo) return;
    const touch = e.touches[0];
    if (!touch || !heroRef) return;
    const rect = heroRef.getBoundingClientRect();
    mouseX = touch.clientX - rect.left;
    mouseY = touch.clientY - rect.top;
    lastMoveTime = Date.now();
    isIdle = false;
  }

  async function handleTap() {
    if (!showLogo || isClicked) return;
    isClicked = true;
    document.body.style.overflow = "";
    if (onClicked) onClicked();

    await tick();

    let obj = { radius: revealRadius };
    gsap.to(obj, {
      radius: 3000,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => {
        revealRadius = obj.radius;
      },
    });

    gsap.fromTo(
      ".hero-mobile-subtitle, .hero-mobile-scroll-prompt",
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.3,
        ease: "power3.out",
        delay: 0.6,
        onComplete: () => {
          scrollPromptPulse = gsap.to(".hero-mobile-scroll-prompt", {
            opacity: 0.2,
            duration: 0.7,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        },
      },
    );
  }

  /** @param {string} str */
  function splitIntoLetters(str) {
    return str.split("").map((c) => (c === " " ? "&nbsp;" : c));
  }

  onMount(() => {
    mouseX = window.innerWidth / 2;
    mouseY = window.innerHeight / 2;
    document.body.style.overflow = "hidden";

    const pieces = descriptionRef?.querySelectorAll(".text-piece") ?? [];
    const tl = gsap.timeline({ delay: 0.2 });

    tl.fromTo(
      pieces,
      { opacity: 0, filter: "blur(10px)", y: 20 },
      {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        duration: 1.2,
        stagger: 0.03,
        ease: "power2.out",
      },
    )
      .to(
        pieces,
        {
          opacity: 0,
          filter: "blur(10px)",
          y: -20,
          duration: 0.8,
          stagger: 0.02,
          ease: "power2.in",
        },
        "-=0.7",
      )
      .call(() => {
        showLogo = true;
      });

    const cleanup = initCanvas();
    return () => {
      cleanup?.();
    };
  });
</script>

le card <svelte:window bind:scrollY />

<div
  class="hero-mobile"
  bind:this={heroRef}
  ontouchstart={handleTouchStart}
  ontouchmove={handleTouchMove}
  onclick={handleTap}
  role="presentation"
  style="cursor: {showLogo && !isClicked ? 'pointer' : 'default'}"
>
  <p class="hero-mobile-description" bind:this={descriptionRef}>
    <span class="phrase">
      <b>
        {#each splitIntoLetters("Scopri") as char}
          <span class="text-piece">{@html char}</span>
        {/each}
      </b>
    </span>
    <span class="phrase">
      {#each splitIntoLetters(" quello che resta") as char}
        <span class="text-piece">{@html char}</span>
      {/each}
    </span>
    <br />
    <span class="phrase">
      {#each splitIntoLetters("fuori dall'") as char}
        <span class="text-piece">{@html char}</span>
      {/each}<b
        >{#each splitIntoLetters("inquadratura") as char}
          <span class="text-piece">{@html char}</span>
        {/each}</b
      >
    </span>
  </p>

  <div
    class="logo-reveal"
    class:visible={showLogo}
    style="opacity: {showLogo ? scrollOpacity : 0};"
  >
    <canvas bind:this={canvasRef}></canvas>
  </div>

  {#if showLogo && !isClicked}
    <div class="hero-mobile-tap-hint">
      trascina per rivelare · tocca per entrare
    </div>
  {/if}

  {#if isClicked}
    <div class="hero-mobile-after" style="opacity: {scrollOpacity};">
      <p class="hero-mobile-subtitle">
        La prima <i>Intelligent Olympic</i> della storia
      </p>
      <p class="hero-mobile-scroll-prompt">scroll down to explore</p>
    </div>
  {/if}
</div>

<style>
  .hero-mobile {
    position: relative;
    width: 100%;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #ffffff;
    overflow: hidden;
  }

  .hero-mobile-description {
    font-family: "Helvetica", sans-serif;
    font-size: clamp(28px, 9vw, 38px);
    line-height: 1.25;
    color: #1a1a1a;
    margin: 0;
    padding: 0 8vw;
    text-align: center;
    position: relative;
    z-index: 10;
  }

  .phrase {
    display: inline;
  }

  .text-piece {
    display: inline-block;
    opacity: 0;
  }

  .logo-reveal {
    position: absolute;
    inset: 0;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.5s ease;
    z-index: 1;
  }

  .logo-reveal.visible {
    opacity: 1;
  }

  .logo-reveal canvas {
    width: 100%;
    height: 100%;
    display: block;
  }

  .hero-mobile-tap-hint {
    position: absolute;
    top: 68%;
    left: 50%;
    transform: translateX(-50%);
    font-family: "Helvetica", Arial, sans-serif;
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    color: #4e7785;
    white-space: nowrap;
    z-index: 20;
    pointer-events: none;
    animation: hint-pulse 1.8s ease-in-out infinite alternate;
  }

  @keyframes hint-pulse {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  .hero-mobile-after {
    position: absolute;
    top: 58%;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
    z-index: 20;
    pointer-events: none;
    width: 88%;
  }

  .hero-mobile-subtitle {
    font-family: "Helvetica", sans-serif;
    font-size: 18px;
    color: #1a1a1a;
    text-align: center;
    margin: 0;
    opacity: 0;
    line-height: 1.4;
  }

  .hero-mobile-scroll-prompt {
    font-family: "Helvetica", sans-serif;
    font-size: 12px;
    color: #4e7785;
    letter-spacing: 0.08em;
    margin: 0;
    opacity: 0;
  }
</style>
