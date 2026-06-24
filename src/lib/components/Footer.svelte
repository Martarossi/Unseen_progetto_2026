<footer class="footer">
  <div class="footer-grain" aria-hidden="true"></div>

  <span class="footer-title">LE OLIMPIADI DEGLI INVISIBILI</span>
  <img src="/copyright.png" alt="Copyright" class="footer-copy" />
  <div class="footer-logo-wrap">
    <img
      src="/logopolimi.png"
      alt="Politecnico di Milano 1863"
      class="footer-logo"
    />
  </div>
</footer>

<style>
  .footer {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 40px 48px 40px;
    box-sizing: border-box;
    isolation: isolate;

    background: transparent;
  }

  .footer-grain {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    mix-blend-mode: overlay;
    opacity: 0.22;
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
    flex: 1;
  }

    .footer-copy {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      height: 36px;
      width: auto;
      opacity: 0.85;
      z-index: 2;
    }

  .footer-logo-wrap {
    flex: 1;
    display: flex;
    justify-content: flex-end;
  }

  .footer-logo {
    height: 36px;
    width: auto;
    object-fit: contain;
    opacity: 0.9;
    filter: brightness(0) invert(1);
  }
</style>
