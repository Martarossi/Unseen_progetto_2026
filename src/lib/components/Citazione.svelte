<div class="citazione-wrapper">
  <div class="citazione-sticky">
    <img src="/citazione.png" alt="citazione" class="citazione-img" />
    <p class="citazione-autore">
      <strong>Yiannis Exarchos,</strong> <em>CEO di Olympic<br />Broadcasting Services (OBS)</em>
    </p>
  </div>
</div>

<style>
  .citazione-wrapper {
    height: calc(100vh + 250px);
    margin-top: 2vh;
  }

  .citazione-sticky {
    position: sticky;
    top: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  }

  .citazione-img {
    width: clamp(420px, 82vw, 1200px);
    height: auto;
    display: block;
  }

  .citazione-autore {
    width: clamp(420px, 82vw, 1200px);
    text-align: right;
    margin: 8vh 0 0 0;
    padding: 0;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: clamp(11px, 1vw, 14px);
    color: #ffffff;
    line-height: 1.5;
    letter-spacing: 0.02em;
  }

  .citazione-autore strong {
    font-weight: 700;
    font-style: normal;
  }

  .citazione-autore em {
    font-style: italic;
    font-weight: 400;
  }
</style>