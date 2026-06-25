<script>
  import { onMount, tick } from "svelte";
  import gsap from "gsap";

  let { onClicked } = $props();

  /** @type {HTMLElement|null} */
  let heroRef = null;
  /** @type {HTMLElement|null} */
  let descriptionRef = null;
  /** @type {HTMLElement|null} */
  let transitionBgRef = null;

  let mouseX = $state(0);
  let mouseY = $state(0);
  let hintX = $state(0);
  let hintY = $state(0);
  let showLogo = $state(false);
  let isTouchDevice = $state(false);
  let isClicked = $state(false);
  let canvasBgOpacity = $state(1);
  let scrollY = $state(0);
  let scrollOpacity = $derived(Math.max(0, 1 - scrollY / 350));

  /** @type {HTMLCanvasElement|null} */
  let canvasRef = null;
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
    const canvas = /** @type {HTMLCanvasElement} */ (canvasRef);
    const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext("2d"));
    if (!ctx) return;
    const maskCanvas = document.createElement("canvas");
    const maskCtx = /** @type {CanvasRenderingContext2D} */ (maskCanvas.getContext("2d"));
    if (!maskCtx) return;

    // Gradient spot pre-renderizzato una sola volta su canvas offscreen.
    // Viene scalato via drawImage a runtime → zero allocazioni di CanvasGradient per frame.
    const SPOT_RES = 256;
    const spotCanvas = document.createElement("canvas");
    spotCanvas.width = SPOT_RES;
    spotCanvas.height = SPOT_RES;
    const spotCtx = /** @type {CanvasRenderingContext2D} */ (spotCanvas.getContext("2d"));
    if (spotCtx) {
      const g = spotCtx.createRadialGradient(SPOT_RES / 2, SPOT_RES / 2, 0, SPOT_RES / 2, SPOT_RES / 2, SPOT_RES / 2);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      spotCtx.fillStyle = g;
      spotCtx.fillRect(0, 0, SPOT_RES, SPOT_RES);
    }

    const logoImg = new Image();
    logoImg.src = "/LOGO.png";
    let imgLoaded = false;
    logoImg.onload = () => { imgLoaded = true; resize(); };

    const bgImg = new Image();
    bgImg.src = "/SFONDO.png";
    let bgLoaded = false;
    bgImg.onload = () => { bgLoaded = true; resize(); };

    function resize() {
      const canvas = /** @type {HTMLCanvasElement} */ (canvasRef);
      if (!canvas) return;
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
    }

    window.addEventListener("resize", resize);
    resize();

    /** @type {number} */
    let animationFrame = 0;
    let currentX = mouseX;
    let currentY = mouseY;
    let idleTargetX = canvas.width / 2;
    let idleTargetY = canvas.height / 2;

    const TRAIL_DURATION = 1000;
    // Ring buffer con TypedArray: zero allocazioni per frame
    const MAX_TRAIL = 90;
    const histX    = new Float32Array(MAX_TRAIL);
    const histY    = new Float32Array(MAX_TRAIL);
    const histTime = new Float64Array(MAX_TRAIL);
    let histHead  = 0;
    let histCount = 0;

    function loop() {
      const now = performance.now();

      if (!imgLoaded || !bgLoaded) {
        animationFrame = requestAnimationFrame(loop);
        return;
      }

      const idleTime = Date.now() - lastMoveTime;
      if (idleTime > 2000) isIdle = true;

      if (isIdle && showLogo && !isClicked) {
        const dist = Math.hypot(currentX - idleTargetX, currentY - idleTargetY);
        if (dist < 50 || idleTargetX > canvas.width || idleTargetY > canvas.height) {
          idleTargetX = canvas.width * (0.1 + Math.random() * 0.8);
          idleTargetY = canvas.height * (0.1 + Math.random() * 0.8);
        }
        currentX += (idleTargetX - currentX) * 0.02;
        currentY += (idleTargetY - currentY) * 0.02;
      } else {
        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;
      }

      // Push nel ring buffer — nessun oggetto allocato
      if (showLogo) {
        histX[histHead]    = currentX;
        histY[histHead]    = currentY;
        histTime[histHead] = now;
        histHead = (histHead + 1) % MAX_TRAIL;
        if (histCount < MAX_TRAIL) histCount++;
      }

      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

      if (showLogo) {
        const cutoff = now - TRAIL_DURATION;
        const r = revealRadius;
        const d = r * 2;
        // Itera dal più recente al più vecchio: il buffer è ordinato per inserimento
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

      const scrollY = window.scrollY;

      ctx.globalAlpha = canvasBgOpacity;
      if (canvas.width <= 799) {
        // Mobile: scala per coprire l'altezza intera, parte da sinistra (stessa area del desktop)
        const bgScale = canvas.height / bgImg.height;
        const bgDrawWidth = bgImg.width * bgScale;
        const bgDrawHeight = bgImg.height * bgScale;
        ctx.drawImage(bgImg, 0, 0, bgDrawWidth, bgDrawHeight);
      } else {
        // Desktop: formula originale — scala per larghezza, parte da sinistra
        const bgScale = canvas.width / bgImg.width;
        const bgDrawHeight = bgImg.height * bgScale;
        ctx.drawImage(bgImg, 0, scrollY * 1.2, canvas.width, bgDrawHeight);
      }
      ctx.globalAlpha = 1.0;

      const scale = Math.min(
        (canvas.width * 0.8) / logoImg.width,
        (canvas.height * 0.8) / logoImg.height,
        1,
      );
      const dWidth  = logoImg.width  * scale;
      const dHeight = logoImg.height * scale;
      const dx = (canvas.width  - dWidth)  / 2;
      const dy = (canvas.height - dHeight) / 2;
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

  /** @param {MouseEvent} e */
  function handleMouseMove(e) {
    if (!heroRef || isClicked) return;
    const rect = heroRef.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    hintX = e.clientX;
    hintY = e.clientY;
    lastMoveTime = Date.now();
    isIdle = false;
  }

  /** @param {TouchEvent} e */
  function handleTouchStart(e) {
    isTouchDevice = true;
    if (!heroRef || isClicked) return;
    const touch = e.touches[0];
    if (!touch) return;
    const rect = heroRef.getBoundingClientRect();
    mouseX = touch.clientX - rect.left;
    mouseY = touch.clientY - rect.top;
    lastMoveTime = Date.now();
    isIdle = false;
  }

  /** @param {TouchEvent} e */
  function handleTouchMove(e) {
    if (!heroRef || isClicked) return;
    const touch = e.touches[0];
    if (!touch) return;
    const rect = heroRef.getBoundingClientRect();
    mouseX = touch.clientX - rect.left;
    mouseY = touch.clientY - rect.top;
    lastMoveTime = Date.now();
    isIdle = false;
  }

  async function handleClick() {
    if (!showLogo || isClicked) return;
    isClicked = true;

    if (typeof window !== "undefined") {
      // @ts-ignore
      window.heroHasBeenClicked = true;
      window.dispatchEvent(new CustomEvent("heroClicked"));
    }

    // Enable scrolling once clicked
    document.body.style.overflow = "";

    if (onClicked) onClicked();

    await tick();

    // Anima il cerchio fino a coprire tutta la pagina
    let obj = { radius: revealRadius };
    gsap.to(obj, {
      radius: 3000,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => {
        revealRadius = obj.radius;
      },
    });

    // Sfuma la visibilità dello sfondo del canvas per rivelare lo sfondo globale fisso
    let opacityObj = { val: 1 };
    gsap.to(opacityObj, {
      val: 0,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => {
        canvasBgOpacity = opacityObj.val;
      },
    });

    // Fa comparire i primi elementi (about e subtitle)
    gsap.fromTo(
      ".top-bar, .subtitle",
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        delay: 0.5,
      },
    );

    // Fa comparire "scroll down to explore" con 2 secondi di ritardo aggiuntivi, poi avvia il pulse
    gsap.fromTo(
      ".scroll-prompt",
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        delay: 1.2,
        onComplete: () => {
          scrollPromptPulse = gsap.to(".scroll-prompt", {
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
    // Inizializza il centro
    mouseX = window.innerWidth / 2;
    mouseY = window.innerHeight / 2;
    hintX = mouseX;
    hintY = mouseY;

    // Rileva se è un dispositivo touch all'avvio
    isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // BLOCCO INIZIALE DELLO SCROLL: Disabilita lo scorrimento sul body all'avvio per mantenere l'utente focalizzato sull'animazione iniziale.
    document.body.style.overflow = "hidden";

    const pieces = descriptionRef?.querySelectorAll(".text-piece") ?? [];

    const tl = gsap.timeline({ delay: 0.2 });

    // ANIMAZIONE DI ENTRATA DEL TESTO: Fa comparire progressivamente le lettere con dissolvenza, traslazione verticale e rimozione del blur.
    tl.fromTo(
      pieces,
      { opacity: 0, filter: "blur(10px)", y: 20 },
      {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        duration: 1.2,
        stagger: 0.03, // ritardo tra ogni lettera
        ease: "power2.out",
      },
    )
      // ANIMAZIONE DI USCITA DEL TESTO: Nasconde le lettere facendole sfumare verso l'alto e sfocandole prima di svelare il logo.
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

<svelte:window bind:scrollY />

<div
  class="hero"
  bind:this={heroRef}
  onmousemove={handleMouseMove}
  ontouchstart={handleTouchStart}
  ontouchmove={handleTouchMove}
  onclick={handleClick}
  role="presentation"
  style="cursor: {showLogo && !isClicked ? 'pointer' : 'default'}"
>
  <p class="description" bind:this={descriptionRef}>
    <span class="phrase">
      <b>
        {#each splitIntoLetters("Scopri") as char}
          <span class="text-piece">{@html char}</span>
        {/each}
      </b>
    </span>
    <span class="phrase">
      {#each splitIntoLetters("quello che resta") as char}
        <span class="text-piece">{@html char}</span>
      {/each}
    </span>
    <br />
    <span class="phrase">
      {#each splitIntoLetters("fuori dall'") as char}<span class="text-piece">{@html char}</span>{/each}<b>{#each splitIntoLetters("inquadratura") as char}<span class="text-piece">{@html char}</span>{/each}</b>
    </span>
  </p>

  <div class="logo-reveal" class:visible={showLogo} class:scrolled={scrollY > 0} style="opacity: {showLogo ? scrollOpacity : 0};">
    <canvas bind:this={canvasRef}></canvas>
  </div>

  {#if isClicked}
    <div class="scroll-fade-container" style="opacity: {scrollOpacity};">
      <div class="subtitle reveal-item">
        La prima <i>Intelligent Olympic</i> della storia
      </div>

      <div class="scroll-prompt reveal-item">scroll down to explore</div>
    </div>
  {/if}

  <div
    class="transition-overlay"
    bind:this={transitionBgRef}
    style="--expand-radius: 0%;"
  ></div>
</div>

{#if showLogo && !isClicked}
  {#if isTouchDevice}
    <div class="click-hint click-hint--mobile">
      <span class="hint-primary">drag to discover</span>
      <span class="hint-secondary">tap to reveal</span>
    </div>
  {:else}
    <div class="click-hint" style="left: {hintX}px; top: {hintY}px;">click to reveal</div>
  {/if}
{/if}

<style>
  .hero {
    --mask-radius: 180px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    min-height: 100vh;
    padding: var(--spacing-11);
    text-align: center;
    background-color: transparent;
    overflow: hidden;
  }

  .description {
    font-family: "Helvetica", sans-serif;
    font-weight: var(--font-secondary);
    font-size: 4vh;
    line-height: normal;
    color: var(--colors-content-primary);
    margin: 0;
    width: 1120px;
    max-width: 100%;
    position: relative;
    z-index: 10;
  }

  .phrase {
    display: inline-block;
  }

  .text-piece {
    display: inline-block;
    opacity: 0;
  }

  /* CONTENITORE RIVELAZIONE LOGO E SFONDO: Gestisce il canvas che mostra il logo interattivo mascherato radialmente dal mouse */
  .logo-reveal {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.5s ease;
    z-index: 1;
  }

  .logo-reveal.scrolled {
    transition: none;
  }

  .logo-reveal canvas {
    width: 100%;
    height: 100%;
    display: block;
  }

  .logo-reveal.visible {
    opacity: 1;
  }

  .scroll-fade-container {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 20;
    will-change: opacity;
  }

  /* ELEMENTI SECONDARI REVEAL: Subtitle e prompt di scorrimento visualizzati dopo il click dell'utente */

  .subtitle {
    position: absolute;
    top: calc(50% + 120px); /* Adjust based on your logo size */
    left: 50%;
    transform: translateX(-50%);
    font-family: "Helvetica", sans-serif;
    font-size: 18px;
    color: #F8F8F8;
    z-index: 20;
    opacity: 0;
    white-space: nowrap;
  }

  .scroll-prompt {
    position: absolute;
    bottom: var(--spacing-11, 80px);
    left: 50%;
    transform: translateX(-50%);
    font-family: "Helvetica", sans-serif;
    font-size: 1.1rem;
    color: #4E7785;
    z-index: 20;
    opacity: 0;
    letter-spacing: 0.05em;
  }

  .click-hint {
    position: fixed;
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, 28px);
    font-family: "Helvetica", "Arial", sans-serif;
    font-size: 1.1rem;
    font-weight: 400;
    letter-spacing: 0.12em;
    color: #4E7785;
    white-space: nowrap;
    animation: pulse-intermittent 0.7s ease-in-out infinite alternate;
  }

  .transition-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 50% 50%, #4a565e 0%, #293035 100%);
    z-index: 100;
    pointer-events: none;
    -webkit-clip-path: circle(var(--expand-radius) at calc(100% - 137px) 53px);
    clip-path: circle(var(--expand-radius) at calc(100% - 137px) 53px);
  }

  /* ── MOBILE ──────────────────────────────────────── */
  @media (max-width: 799px) {
    .description {
      font-size: clamp(20px, 6.5vw, 28px);
      line-height: 1.25;
      padding: 0 6vw;
      text-align: center;
    }

    .subtitle {
      top: calc(50% + 80px);
      font-size: 15px;
      white-space: normal;
      text-align: center;
      width: 80%;
    }

    .scroll-prompt {
      bottom: 40px;
    }

    .click-hint--mobile {
      position: fixed;
      bottom: 48px;
      left: 50%;
      transform: translateX(-50%);
      top: auto;
      font-family: "Helvetica", "Arial", sans-serif;
      font-size: 1.1rem;
      letter-spacing: 0.12em;
      color: #4E7785;
      pointer-events: none;
      z-index: 9999;
      white-space: nowrap;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .click-hint--mobile .hint-secondary {
      opacity: 0.8;
      font-weight: 300;
    }
  }

  @keyframes pulse-intermittent {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0.2;
    }
  }
</style>
