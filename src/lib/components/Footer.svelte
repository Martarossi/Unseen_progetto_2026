<footer class="footer">
  <div class="footer-grain" aria-hidden="true"></div>

  <img src="/copyright.png" alt="Copyright" class="footer-copy" />

  <span class="footer-title">LE OLIMPIADI DEGLI INVISIBILI</span>
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
    padding: 20px 24px; /* ✅ padding ridotto */
    box-sizing: border-box;
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
    transform: translate(-20%, -50%);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #f8f8f8;
    white-space: nowrap;
    flex: 1;
    margin: 0; /* nessun margine extra */
    padding: 0; /* nessun padding extra */
  }

  .footer-copy {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(
      -50%,
      -50%
    ); /* centrato sia orizzontalmente che verticalmente */
    height: 36px;
    width: auto;
    opacity: 0.85;
    z-index: 2;
    margin: 0;
    display: block;
  }

  .footer-logo-wrap {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .footer-logo {
    height: 36px;
    transform: translate(-50%, -50%);
    width: auto;
    object-fit: contain;
    opacity: 0.9;
    filter: brightness(0) invert(1);
  }
</style>
