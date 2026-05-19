<script>
  import { onMount } from "svelte";
  import gsap from "gsap";

  // Static asset from /static/topbarunseen.png
  const logoSrc = "/topbarunseen.png";
  /** @type {{ onOpenAbout?: (event: MouseEvent) => any }} */
  let { onOpenAbout = () => {} } = $props();

  /** @type {HTMLElement|null} */
  let navbarEl = null;
  let scrollY = $state(0);

  onMount(() => {
    // Prevent flash of content: immediately hide it offscreen and transparent
    gsap.set(navbarEl, { y: -50, opacity: 0 });

    let animated = false;

    const showNavbar = () => {
      if (animated) return;
      animated = true;
      gsap.to(navbarEl, {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out"
      });
    };

    // If logo has already been clicked, show navbar immediately
    // @ts-ignore
    if (typeof window !== "undefined" && window.heroHasBeenClicked) {
      showNavbar();
    } else if (typeof window !== "undefined") {
      // Listen for the custom event dispatched by Hero
      const handleHeroClicked = () => {
        showNavbar();
        window.removeEventListener("heroClicked", handleHeroClicked);
      };

      window.addEventListener("heroClicked", handleHeroClicked);

      return () => {
        window.removeEventListener("heroClicked", handleHeroClicked);
      };
    }
  });
</script>

<svelte:window bind:scrollY />

<nav class="navbar" bind:this={navbarEl}>
  <!-- Logo is visible only when scrolled past Hero (scrollY > 150) -->
  <div class="navbar__brand" class:visible={scrollY > 450}>
    <img src={logoSrc} alt="Unseen logo" />
  </div>

  <div class="navbar__links">
    <button class="navbar__link" type="button" onclick={onOpenAbout}>ABOUT</button>
  </div>
</nav>

<style>
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 2rem;
    box-sizing: border-box;
    pointer-events: auto;
    background: transparent;
    opacity: 0; /* Starts transparent for safety before GSAP runs */
  }

  .navbar__brand {
    opacity: 0;
    transform: translateX(-20px);
    transition: opacity 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .navbar__brand.visible {
    opacity: 1;
    transform: translateX(0);
  }

  .navbar__brand img {
    display: block;
    max-width: 210px;
    width: auto;
    height: auto;
  }

  .navbar__links {
    display: flex;
    align-items: center;
  }

  .navbar__link {
    color: #000;
    border: none;
    cursor: pointer;
    text-decoration: none;
    background: transparent;
    font-size: 0.95rem;
    font-family: var(--font-sans, system-ui, sans-serif);
    font-weight: 700;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    transition: opacity 0.2s ease;
  }

  .navbar__link:hover,
  .navbar__link:focus-visible {
    opacity: 0.68;
  }

  @media (max-width: 768px) {
    .navbar {
      padding: 1rem 1.25rem;
    }

    .navbar__brand img {
      max-width: 160px;
    }

    .navbar__link {
      font-size: 0.85rem;
    }
  }
</style>
