<footer class="footer">
  <div class="footer-grain" aria-hidden="true"></div>

  <span class="footer-title">LE OLIMPIADI DEGLI INVISIBILI</span>
  <span class="footer-copy">&copy;</span>
  <img src="/logopolimi.png" alt="Politecnico di Milano 1863" class="footer-logo" />
</footer>

<style>
  .footer {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22px 48px;
    box-sizing: border-box;
    isolation: isolate;

    backdrop-filter: blur(72px);
    -webkit-backdrop-filter: blur(72px);
    background: transparent;
  }

  .footer-grain {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    mix-blend-mode: overlay;
    opacity: 0.22;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 200px 200px;
  }

  .footer > :not(.footer-grain) {
    position: relative;
    z-index: 1;
  }

  .footer-title {
    font-family: "Akira Expanded", "Arial Black", sans-serif;
    font-weight: 900;
    font-size: 0.78rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #f8f8f8;
    white-space: nowrap;
  }

  .footer-copy {
    font-family: "Helvetica", Arial, sans-serif;
    font-size: 1.1rem;
    color: #f8f8f8;
    opacity: 0.85;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .footer-logo {
    height: 36px;
    width: auto;
    object-fit: contain;
    opacity: 0.9;
    filter: brightness(0) invert(1);
  }
</style>
