<script>
  import { onMount, tick } from "svelte";
  import gsap from "gsap";

  let heroRef;
  let descriptionRef;

  let mouseX = $state(0);
  let mouseY = $state(0);
  let showLogo = $state(false);
  let isClicked = $state(false);

  function handleMouseMove(e) {
    if (!heroRef || isClicked) return;
    const rect = heroRef.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }

  async function handleClick() {
    if (!showLogo || isClicked) return;
    isClicked = true;

    await tick();

    // Anima il cerchio fino a coprire tutta la pagina
    gsap.to(heroRef, {
      "--mask-radius": "3000px",
      duration: 1.5,
      ease: "power2.inOut",
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

    // Fa comparire "scroll down to explore" con 2 secondi di ritardo aggiuntivi
    gsap.fromTo(
      ".scroll-prompt",
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        delay: 2.5,
      },
    );
  }

  function splitIntoLetters(str) {
    return str.split('').map(c => c === ' ' ? '&nbsp;' : c);
  }

  onMount(() => {
    // Inizializza il centro
    mouseX = window.innerWidth / 2;
    mouseY = window.innerHeight / 2;

    const pieces = descriptionRef.querySelectorAll(".text-piece");

    const tl = gsap.timeline({ delay: 0.2 });
    
    // Entrata "a pezzi" con blur
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
      }
    )
    // Uscita "a pezzi" con blur
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
      "+=1.5" // Attende 1.5 secondi prima di scomparire
    )
    .call(() => {
      showLogo = true;
    });
  });
</script>

<div
  class="hero"
  bind:this={heroRef}
  onmousemove={handleMouseMove}
  onclick={handleClick}
  role="presentation"
>
  <p class="description" bind:this={descriptionRef}>
    <span class="phrase">
      <b>
        {#each splitIntoLetters("Scopri ") as char}
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
      {#each splitIntoLetters("fuori dall'") as char}
        <span class="text-piece">{@html char}</span>
      {/each}
      <b>
        {#each splitIntoLetters("inquadratura") as char}
          <span class="text-piece">{@html char}</span>
        {/each}
      </b>
    </span>
  </p>

  <div
    class="logo-reveal"
    style="--mouse-x: {mouseX}px; --mouse-y: {mouseY}px;"
    class:visible={showLogo}
  >
    <img src="/LOGO.png" alt="Unseen Logo" />
  </div>

  {#if isClicked}
    <div class="top-bar reveal-item">
      <a href="/about" class="about-btn">ABOUT</a>
    </div>

    <div class="subtitle reveal-item">
      La prima <i>Intelligent Olympics</i> della storia
    </div>

    <div class="scroll-prompt reveal-item">scroll down to explore</div>
  {/if}
</div>

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
    background-color: #ffffff;
    overflow: hidden;
    cursor: pointer;
  }

  .description {
    font-family: "Helvetica", sans-serif;
    font-weight: var(--font-akira-medium);
    font-size: var(--unit-48);
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
    will-change: opacity, filter, transform;
  }

  /* qui si modifica il cerchio che fa vedere le scritte  */
  .logo-reveal {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.5s ease;
    -webkit-mask-image: radial-gradient(
      circle var(--mask-radius) at var(--mouse-x) var(--mouse-y),
      black 10%,
      transparent 100%
    );
    mask-image: radial-gradient(
      circle var(--mask-radius) at var(--mouse-x) var(--mouse-y),
      black 10%,
      transparent 100%
    );
    z-index: 1;
  }

  .logo-reveal.visible {
    opacity: 1;
  }

  .logo-reveal img {
    max-width: 80%;
    max-height: 80%;
    object-fit: contain;
  }

  /* Nuovi elementi che compaiono al click */
  .top-bar {
    position: absolute;
    top: var(--spacing-9, 36px);
    right: var(--spacing-11, 80px);
    z-index: 20;
    opacity: 0; /* hidden for gsap */
  }

  .about-btn {
    display: inline-block;
    padding: 10px 32px;
    background: #f4f4f4;
    color: #000;
    text-decoration: none;
    border-radius: 50px;
    font-family: "Helvetica", sans-serif;
    font-weight: bold;
    font-size: 14px;
    transition: background 0.2s ease;
  }

  .about-btn:hover {
    background: #e0e0e0;
  }

  .subtitle {
    position: absolute;
    top: calc(50% + 120px); /* Adjust based on your logo size */
    left: 50%;
    transform: translateX(-50%);
    font-family: "Helvetica", sans-serif;
    font-size: 18px;
    color: #333;
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
    font-size: 14px;
    color: #888;
    z-index: 20;
    opacity: 0;
  }
</style>
