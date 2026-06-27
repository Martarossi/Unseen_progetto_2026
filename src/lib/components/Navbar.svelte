<script>
  import { onMount } from "svelte";
  import gsap from "gsap";

  const logoSrc = "/topbarunseen.png";
  /** @type {{ onOpenAbout?: (event: MouseEvent) => any }} */
  let { onOpenAbout = () => {} } = $props();

  /** @type {HTMLElement|null} */
  let navbarEl = null;
  let scrollY = $state(0);

  onMount(() => {
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

    // @ts-ignore
    if (typeof window !== "undefined" && window.heroHasBeenClicked) {
      showNavbar();
    } else if (typeof window !== "undefined") {
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
  <div class="navbar__brand" class:visible={scrollY > 450}>
    <div class="navbar__brand-inner">
      <img src={logoSrc} alt="Unseen logo" />
      <div class="logo-tint"></div>
    </div>
  </div>

  <div class="navbar__links">
    <button class="navbar__link" type="button" onclick={onOpenAbout}>About</button>
  </div>
</nav>

<style>
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 2rem;
    box-sizing: border-box;
    pointer-events: auto;
    background: transparent;
    opacity: 0;
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

  .navbar__brand-inner {
    position: relative;
    display: inline-block;
    isolation: isolate;
  }

  .navbar__brand img {
    display: block;
    max-width: 210px;
    width: auto;
    height: auto;
  }

  .logo-tint {
    position: absolute;
    inset: 0;
    background: #273b42;
    mix-blend-mode: multiply;
    opacity: 0;
    pointer-events: none;
  }

  .navbar__links {
    display: flex;
    align-items: center;
  }

.navbar__link {
  position: relative;
  color: #ffffff;
  border: none;
  cursor: pointer;
  background: transparent;
  font-size: 0.95rem;
  font-family: 'Akira Expanded', sans-serif;
  font-weight: 700;
  letter-spacing: 0.24em;
  padding-bottom: 3px;
  filter: blur(0px);
  transition: filter 0.3s ease;
}

  /* Underline animata
  .navbar__link::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 1.5px;
    background-color: #000;
    transition: width 0.3s ease;
  } */

.navbar__link:hover,
.navbar__link:focus-visible {
  filter: blur(3px);
}

  @media (max-width: 768px) {
    .navbar {
      padding: 1rem 1.25rem;
    }

    .navbar__brand img,
    .navbar__brand .logo-tint {
      max-width: 160px;
    }

    .navbar__link {
      font-size: 0.85rem;
    }
  }
</style>