<script>
  import { onMount } from "svelte";
  import gsap from "gsap";
  import ScrollTrigger from "gsap/dist/ScrollTrigger";

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
   * Updates coordinates and 3D transforms for all elements based on scroll index (float)
   * @param {number} index
   */
  function updateGallery(index) {
    if (!cardElements || !titleElements) return;

    // 1. Update Cards 3D Transforms
    cardElements.forEach((card, i) => {
      const diff = i - index;
      
      // Direct 3D calculations for curved conveyor belt depth
      const yVal = diff * 210; // Vertical offset
      const rotXVal = Math.max(-50, Math.min(50, -diff * 18)); // rotateX 3D tilt
      const zVal = -Math.abs(diff) * 140; // translateZ depth pushback
      const scaleVal = Math.max(0.65, 1 - Math.abs(diff) * 0.08); // scale shrink
      const opacityVal = Math.max(0, 1 - Math.abs(diff) * 0.4); // opacity fade
      const zIndexVal = Math.round(100 - Math.abs(diff) * 10); // layer order

      card.style.transform = `translate3d(-50%, -50%, ${zVal}px) translateY(${yVal}px) rotateX(${rotXVal}deg) scale(${scaleVal})`;
      card.style.opacity = String(opacityVal);
      card.style.zIndex = String(zIndexVal);
      
      // Disable pointer events on background cards so they don't block clicks
      card.style.pointerEvents = Math.abs(diff) < 0.4 ? "auto" : "none";
      
      // Control explore pill visibility
      const exploreBtn = /** @type {HTMLElement | null} */ (card.querySelector(".explore-btn"));
      if (exploreBtn) {
        exploreBtn.style.opacity = String(Math.max(0, 1 - Math.abs(diff) * 3));
      }
    });

    // 2. Update sliding vertical project titles on the left
    titleElements.forEach((title, i) => {
      const diff = i - index;
      const opacityVal = Math.max(0.12, 1 - Math.abs(diff) * 0.8);
      const scaleVal = Math.max(0.82, 1 - Math.abs(diff) * 0.18);
      
      title.style.opacity = String(opacityVal);
      title.style.transform = `scale(${scaleVal})`;
      
      if (Math.abs(diff) < 0.5) {
        title.classList.add("active");
      } else {
        title.classList.remove("active");
      }
    });

    // 3. Move the titles inner wrapper to keep the active title perfectly vertically centered
    if (titlesContainer) {
      // 80px reflects the line height / padding of the project title item
      const activeTitleOffset = -index * 80;
      titlesContainer.style.transform = `translateY(${activeTitleOffset}px)`;
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

      // Pin the gallery section for 3600px of scrolling to trigger the cards wheel
      const galleryTl = gsap.timeline({
        scrollTrigger: {
          trigger: galleryContainer,
          start: "top top",
          end: "+=3600",
          scrub: 1.8, // Elegant inertia scrubbing
          pin: true,
          anticipatePin: 1,
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

<div class="gallery-container" bind:this={galleryContainer}>
  <div class="gallery-wrapper">
    <!-- LEFT SIDE: Sliding titles vertical deck -->
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

    <!-- CENTER SIDE: 3D Perspective Card Stack -->
    <div class="cards-stack-container">
      <div class="cards-stack">
        {#each projects as project, i}
          <div class="gallery-card">
            <img src={project.image} alt={project.title} loading="lazy" />
            <div class="card-glass-reflection"></div>
            <div class="explore-btn">
              <span>EXPLORE</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- RIGHT SIDE: Elegant rotated label -->
    <div class="side-label-column">
      <div class="side-label">
        <span>UNSEEN</span>
        <span class="divider">•</span>
        <span>GALLERY ARCHIVE</span>
      </div>
    </div>

    <!-- BOTTOM SIDE: Dynamic project details -->
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

<style>
  .gallery-container {
    width: 100vw;
    height: 100vh;
    background-color: #f4f3f0; /* Premium, warm neutral architectural off-white background */
    overflow: hidden;
    position: relative;
    z-index: 10;
    box-sizing: border-box;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  }

  .gallery-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 6vw;
    box-sizing: border-box;
  }

  /* LEFT PANEL: Sliding titles vertical conveyor */
  .titles-column {
    width: 25vw;
    height: 100%;
    display: flex;
    align-items: center;
    position: relative;
    z-index: 15;
  }

  .titles-mask {
    height: 240px; /* Exact height for showing 3 items at a time (3 * 80px) */
    overflow: hidden;
    position: relative;
    width: 100%;
    /* Subtle fade masks at top and bottom to blend text elegantly */
    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%);
    mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%);
  }

  .titles-inner {
    display: flex;
    flex-direction: column;
    transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
    will-change: transform;
    /* Centers the first item vertically inside the 240px mask: (240px - 80px) / 2 = 80px offset initially */
    padding-top: 80px; 
    box-sizing: border-box;
  }

  .project-title-item {
    height: 80px;
    line-height: 80px;
    font-family: "Akira Expanded", sans-serif;
    font-size: 2.2vw;
    font-weight: 900;
    color: #1a1a1a;
    text-transform: uppercase;
    white-space: nowrap;
    opacity: 0.12;
    transform-origin: left center;
    transition: opacity 0.3s ease, transform 0.3s ease, color 0.3s ease;
    cursor: pointer;
  }

  .project-title-item.active {
    color: #111111;
    opacity: 1;
  }

  /* CENTER PANEL: 3D stacked deck container */
  .cards-stack-container {
    flex: 1;
    height: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
  }

  .cards-stack {
    position: absolute;
    width: 520px;
    height: 340px;
    transform-style: preserve-3d;
    perspective: 1200px;
    will-change: transform;
  }

  .gallery-card {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    border-radius: 14px;
    overflow: hidden;
    background-color: #000;
    /* Elegant double shadow for dramatic high-fidelity product depth */
    box-shadow: 
      0 30px 60px rgba(0, 0, 0, 0.16), 
      0 12px 24px rgba(0, 0, 0, 0.08),
      inset 0 0 1px rgba(255, 255, 255, 0.2);
    transform-origin: center center;
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
    background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.15) 100%);
    pointer-events: none;
    z-index: 2;
  }

  /* SLEEK INTERACTIVE OVERLAY BUTTON */
  .explore-btn {
    position: absolute;
    bottom: 30px;
    right: 30px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    padding: 10px 20px;
    border-radius: 100px;
    color: #111111;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.15em;
    display: flex;
    align-items: center;
    gap: 8px;
    opacity: 0;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    transition: background 0.3s ease, transform 0.3s ease, opacity 0.3s ease;
    z-index: 5;
  }

  .explore-btn svg {
    transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  }

  .gallery-card:hover .explore-btn {
    background: #ffffff;
    transform: translateY(-4px) scale(1.03);
  }

  .gallery-card:hover .explore-btn svg {
    transform: translateX(3px);
  }

  /* RIGHT PANEL: Vertical label */
  .side-label-column {
    width: 6vw;
    height: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    position: relative;
    z-index: 15;
  }

  .side-label {
    transform: rotate(90deg) translateY(-20px);
    transform-origin: right center;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 15px;
    font-family: "Helvetica Neue", sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.3em;
    color: #8c8a85;
  }

  .side-label .divider {
    color: #c4c1b9;
    font-size: 14px;
  }

  /* BOTTOM PANEL: Dynamic project description overlay */
  .project-details {
    position: absolute;
    left: 6vw;
    bottom: 7vh;
    width: 320px;
    height: 140px;
    z-index: 20;
    pointer-events: none;
  }

  .details-item {
    position: absolute;
    inset: 0;
    opacity: 0;
    transform: translateY(20px);
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
    margin-bottom: 8px;
  }

  .project-num {
    font-family: "Akira Expanded", sans-serif;
    font-size: 12px;
    font-weight: 900;
    color: #1a1a1a;
  }

  .project-year {
    font-size: 11px;
    font-weight: 500;
    color: #8c8a85;
    letter-spacing: 0.05em;
  }

  .project-subtitle {
    font-size: 13px;
    font-weight: 700;
    color: #111;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin: 0 0 8px 0;
  }

  .project-desc {
    font-size: 13px;
    line-height: 1.5;
    color: #55534e;
    margin: 0;
  }

  /* Responsive styling for smaller viewports */
  @media (max-width: 1024px) {
    .gallery-wrapper {
      padding: 0 4vw;
    }
    .cards-stack {
      width: 440px;
      height: 290px;
    }
    .project-title-item {
      font-size: 3vw;
    }
  }
</style>
