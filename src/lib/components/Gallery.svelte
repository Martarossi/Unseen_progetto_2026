<script>
  import { onMount } from "svelte";
  import gsap from "gsap";
  import ScrollTrigger from "gsap/dist/ScrollTrigger";

  /** @type {HTMLElement|null} */
  let scrollWrapper = null;
  /** @type {HTMLElement|null} */
  let galleryContainer = null;
  /** @type {HTMLElement|null} */
  let titlesContainer = null;
  /** @type {NodeListOf<HTMLElement>|null} */
  let cardElements = null;
  /** @type {NodeListOf<HTMLElement>|null} */
  let titleElements = null;

  let currentIndex = $state(0);
  let activeIndexRounded = $derived(Math.min(4, Math.max(0, Math.round(currentIndex))));

  const projects = [
    {
      id: 1,
      title: "MILANO 2026",
      subtitle: "THE DIGITAL SOUL",
      image: "/gallery_milanocortina.png",
      desc: "An innovative digital ecosystem for the Winter Olympic Games, turning performance data into fluid glass aesthetics.",
      year: "2026"
    },
    {
      id: 2,
      title: "HELVETICA",
      subtitle: "SWISS INTERFACE",
      image: "/gallery_helvetica.png",
      desc: "Reimagining the legendary typeface for high-tech digital layouts, incorporating vector grids and interactive typography.",
      year: "2025"
    },
    {
      id: 3,
      title: "NEURAL LAB",
      subtitle: "GENERATIVE CORE",
      image: "/gallery_neural.png",
      desc: "A sandbox for GPU-accelerated fluid branding, showcasing organic glass materials and morphing metallic cores.",
      year: "2026"
    },
    {
      id: 4,
      title: "UNSEEN",
      subtitle: "HOLOGRAPHIC ROOM",
      image: "/gallery_unseen.png",
      desc: "Physical and digital archive exhibition at Politecnico di Milano, combining holographic projections and minimal spatial UI.",
      year: "2025"
    },
    {
      id: 5,
      title: "ALPINE TECH",
      subtitle: "VECTOR TOPOGRAPHY",
      image: "/gallery_alpine.png",
      desc: "Interactive mountain peak rendering with topographical vector curves, simulating alpine lighting systems in real-time.",
      year: "2026"
    }
  ];

  /**
   * Updates coordinates and 3D transforms for all elements based on scroll index (float).
   * Effect: cards fold like book pages — above cards hinge from their bottom edge,
   * below cards hinge from their top edge, creating the "spine" fold shown in screenshots.
   * @param {number} index
   */
  function updateGallery(index) {
    if (!cardElements || !titleElements) return;

    const CARD_H = 380; // must match CSS height of .gallery-card
    const FOLD_ANGLE = 65; // degrees per step

    // 1. Cards: book-spine fold animation
    cardElements.forEach((card, i) => {
      const diff = i - index;
      const absDiff = Math.abs(diff);

      // Vertical offset stacks cards edge-to-edge before rotation
      const yOffset = diff * CARD_H;
      // Rotation: positive diff folds downward, negative folds upward
      const rotX = diff * FOLD_ANGLE;

      const opacityVal = Math.max(0.06, 1 - absDiff * 0.5);
      const zIndexVal = Math.round(100 - absDiff * 10);

      // Above/active: pivot at bottom edge so card folds up from the spine
      // Below: pivot at top edge so card folds down from the spine
      card.style.transformOrigin = diff <= 0 ? '50% 100%' : '50% 0%';
      card.style.transform = `translate(-50%, calc(-50% + ${yOffset}px)) rotateX(${rotX}deg)`;
      card.style.opacity = String(opacityVal);
      card.style.zIndex = String(zIndexVal);
      card.style.pointerEvents = absDiff < 0.45 ? 'auto' : 'none';

      const playOverlay = /** @type {HTMLElement | null} */ (card.querySelector('.play-overlay'));
      if (playOverlay) {
        playOverlay.style.opacity = String(Math.max(0, 1 - absDiff * 2.5));
      }
    });

    // 2. Sliding vertical project titles on the left
    titleElements.forEach((title, i) => {
      const diff = i - index;
      const absDiff = Math.abs(diff);
      title.style.opacity = String(Math.max(0.15, 1 - absDiff * 0.85));
      title.style.transform = `scale(${Math.max(0.85, 1 - absDiff * 0.15)})`;
      title.classList.toggle('active', absDiff < 0.5);
    });

    // 3. Scroll the titles strip to keep active title centered
    if (titlesContainer) {
      titlesContainer.style.transform = `translateY(${-index * 90}px)`;
    }
  }

  onMount(() => {
    // Query DOM nodes
    cardElements = galleryContainer?.querySelectorAll(".gallery-card") ?? null;
    titleElements = galleryContainer?.querySelectorAll(".project-title-item") ?? null;
    
    // Initial draw
    updateGallery(0);

    const mm = gsap.matchMedia();
    mm.add("(min-width: 800px)", () => {
      const stateObj = { index: 0 };

      const galleryTl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollWrapper,
          start: "top top",
          end: "+=3600",
          scrub: 1,
        }
      });

      galleryTl.to(stateObj, {
        index: projects.length - 1,
        ease: "none",
        onUpdate: () => {
          currentIndex = stateObj.index;
          updateGallery(stateObj.index);
        }
      });

      return () => {
        galleryTl.kill();
      };
    });
  });
</script>

<div class="gallery-scroll-wrapper" bind:this={scrollWrapper}>
<div class="gallery-container" bind:this={galleryContainer}>
  <div class="gallery-wrapper">
    <!-- LEFT PANEL: Sliding titles vertical deck -->
    <div class="titles-column">
      <div class="titles-mask">
        <div class="titles-inner" bind:this={titlesContainer}>
          {#each projects as project, i}
            <div class="project-title-item" class:active={activeIndexRounded === i}>
              {project.title}
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- CENTER PANEL: 3D perspective scrolling cylinder -->
    <div class="cards-stack-container">
      <div class="cards-stack">
        {#each projects as project, i}
          <div class="gallery-card">
            <img src={project.image} alt={project.title} loading="lazy" />
            <div class="card-glass-reflection"></div>
            <!-- Transparent outline PLAY text exactly centered inside the active card -->
            <div class="play-overlay">PLAY</div>
          </div>
        {/each}
      </div>
    </div>

    <!-- BOTTOM PANEL: Dynamic project details -->
    <div class="project-details">
      {#each projects as project, i}
        <div class="details-item" class:visible={activeIndexRounded === i}>
          <div class="meta-row">
            <span class="project-num">0{project.id}</span>
            <span class="project-year">// {project.year}</span>
          </div>
          <h4 class="project-subtitle">{project.subtitle}</h4>
          <p class="project-desc">{project.desc}</p>
        </div>
      {/each}
    </div>
  </div>
</div>
</div>

<style>
  .gallery-scroll-wrapper {
    height: 3600px;
    position: relative;
  }

  .gallery-container {
    width: 100vw;
    height: 100vh;
    background-color: transparent;
    overflow: hidden;
    position: sticky;
    top: 0;
    z-index: 10;
    box-sizing: border-box;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  }

  @media (max-width: 799px) {
    .gallery-scroll-wrapper {
      height: auto;
    }

    .gallery-container {
      position: relative;
    }
  }

  .gallery-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }

  /* LEFT PANEL: Sliding titles vertical conveyor */
  .titles-column {
    position: absolute;
    left: 6vw;
    top: 50%;
    transform: translateY(-50%);
    width: 25vw;
    height: 270px; /* 3 * 90px */
    display: flex;
    align-items: center;
    z-index: 15;
  }

  .titles-mask {
    height: 270px;
    overflow: hidden;
    position: relative;
    width: 100%;
    /* Elegant fading masks at top and bottom to blend text */
    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%);
    mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%);
  }

  .titles-inner {
    display: flex;
    flex-direction: column;
    transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
    will-change: transform;
    /* Center first item vertically in mask: (270px - 90px) / 2 = 90px padding-top */
    padding-top: 90px; 
    box-sizing: border-box;
  }

  .project-title-item {
    height: 90px;
    line-height: 90px;
    /* Bold, heavy, condensed impact-style typography matching markclennon.com exactly */
    font-family: "Impact", "Arial Black", "Helvetica Neue", sans-serif;
    font-size: 3.6vw;
    font-weight: 900;
    letter-spacing: -0.03em;
    color: #F8F8F8;
    text-transform: uppercase;
    white-space: nowrap;
    opacity: 0.15;
    transform-origin: left center;
    transition: opacity 0.3s ease, transform 0.3s ease, color 0.3s ease;
    cursor: pointer;
  }

  .project-title-item.active {
    color: #A7CED8;
    opacity: 1;
  }

  /* CENTER PANEL: 3D barrel perspective card stack */
  .cards-stack-container {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 580px;
    height: 380px;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
  }

  .cards-stack {
    position: absolute;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    perspective: 700px;
    will-change: transform;
  }

  .gallery-card {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    border-radius: 1px;
    overflow: hidden;
    background-color: #000;
    box-shadow:
      0 35px 70px rgba(0, 0, 0, 0.22),
      0 15px 30px rgba(0, 0, 0, 0.12);
    will-change: transform, opacity;
    cursor: pointer;
  }

  .gallery-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
  }

  .gallery-card:hover img {
    transform: scale(1.04);
  }

  .card-glass-reflection {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 100%);
    pointer-events: none;
    z-index: 2;
  }

  /* TRANSPARENT OUTLINE "PLAY" OVERLAY TEXT */
  .play-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: "Impact", "Arial Black", "Helvetica Neue", sans-serif;
    font-size: 74px;
    font-weight: 900;
    letter-spacing: 0.05em;
    color: transparent;
    -webkit-text-stroke: 2px #ffffff;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 5;
    pointer-events: none;
  }

  /* BOTTOM PANEL: Dynamic project description overlay */
  .project-details {
    position: absolute;
    left: 6vw;
    bottom: 6vh;
    width: 320px;
    height: 120px;
    z-index: 20;
    pointer-events: none;
  }

  .details-item {
    position: absolute;
    inset: 0;
    opacity: 0;
    transform: translateY(15px);
    pointer-events: none;
    transition: opacity 0.5s cubic-bezier(0.25, 1, 0.5, 1), transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
  }

  .details-item.visible {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  .meta-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 6px;
  }

  .project-num {
    font-family: "Impact", "Arial Black", sans-serif;
    font-size: 14px;
    color: #A7CED8;
  }

  .project-year {
    font-size: 11px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.45);
    letter-spacing: 0.05em;
  }

  .project-subtitle {
    font-size: 12px;
    font-weight: 800;
    color: #F8F8F8;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin: 0 0 6px 0;
  }

  .project-desc {
    font-size: 13px;
    line-height: 1.45;
    color: rgba(255, 255, 255, 0.65);
    margin: 0;
  }

  /* Responsive styling */
  @media (max-width: 1024px) {
    .cards-stack-container {
      width: 440px;
      height: 290px;
    }
    .project-title-item {
      font-size: 4.5vw;
    }
  }
</style>
