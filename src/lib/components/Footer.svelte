<footer class="footer">
  <span class="footer-title">LE OLIMPIADI DEGLI INVISIBILI</span>
  <span class="footer-copy">©</span>
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

    backdrop-filter: blur(40px) brightness(1.05);
    -webkit-backdrop-filter: blur(40px) brightness(1.05);
    background: rgba(255, 255, 255, 0.08);
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
