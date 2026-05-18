<script>
  // Static asset from /static/topbarunseen.png
  const logoSrc = "/topbarunseen.png";
  let { onOpenAbout = () => {} } = $props();
</script>

<nav class="navbar">
  <div class="navbar__brand">
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
