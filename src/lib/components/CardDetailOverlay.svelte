<script>
  import { onMount, tick } from 'svelte';

  let { closeOverlay, videoSrc = '' } = $props();

  let opening = $state(false);
  /** @type {HTMLVideoElement|null} */
  let videoEl = $state(null);

  onMount(async () => {
    await tick();
    opening = true;
    if (videoEl) {
      videoEl.play().catch(() => {});
    }
  });
</script>

<div class="overlay-wrapper" class:opening>
  <div class="overlay-inner">
    <button class="close-btn" onclick={closeOverlay}>&times;</button>

    <div class="grid">
      <!-- Left column -->
      <div class="left-col">
        <div class="video-card glass-card">
          <video
            bind:this={videoEl}
            src={videoSrc}
            loop
            playsinline
            class="video-el"
          ></video>
        </div>

        <div class="glass-card segm-card">
          <div class="segm-inner">
            <div class="segm-text">
              <h3>SEGMENTAZIONE</h3>
              <div class="divider"></div>
              <p>L'IA identifica e ritaglia la sagoma dell'atleta in diverse fasi del salto.</p>
            </div>
            <div class="segm-accent"></div>
          </div>
        </div>
      </div>

      <!-- Right column -->
      <div class="right-col">
        <div class="glass-card main-card">
          <h2>SPACETIME<br>SLICE</h2>
          <p class="main-subtitle"><strong>Scomposizione gesto sportivo in fotogrammi simultanei</strong></p>
        </div>

        <div class="glass-card info-card">
          <h3>L'ESERCITO DI LENTI</h3>
          <p>Oltre 60 telecamere 4K sincronizzate al millisecondo catturano l'azione da ogni angolazione possibile.</p>
        </div>

        <div class="glass-card info-card">
          <h3>VELOCITÀ RECORD</h3>
          <p>In soli 15-20 secondi, il sistema crea una ricostruzione 3D dell'azione, rendendo il replay disponibile quasi in tempo reale per il commento tecnico in diretta e per la diretta TV.</p>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .overlay-wrapper {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: radial-gradient(circle at 50% 50%, #4a565e 0%, #293035 100%);
    clip-path: circle(0% at calc(100% - 60px) 40px);
    transition: clip-path 0.7s ease-out;
  }

  .overlay-wrapper.opening {
    clip-path: circle(150% at calc(100% - 60px) 40px);
  }

  .overlay-inner {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 28px 40px 32px;
    box-sizing: border-box;
  }

  .close-btn {
    position: absolute;
    top: 16px;
    right: 40px;
    background: none;
    border: none;
    color: white;
    font-size: 52px;
    cursor: pointer;
    line-height: 0.85;
    padding: 0;
    z-index: 10;
    transition: opacity 0.2s;
  }

  .close-btn:hover {
    opacity: 0.7;
  }

  .grid {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 14px;
    height: calc(100vh - 60px);
    margin-top: 52px;
  }

  .left-col,
  .right-col {
    display: flex;
    flex-direction: column;
    gap: 14px;
    height: 100%;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.13);
    border-radius: 20px;
    color: #f0f0f0;
    box-sizing: border-box;
  }

  /* Left col: video takes most space */
  .video-card {
    flex: 1;
    padding: 0;
    overflow: hidden;
    min-height: 0;
  }

  .video-el {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 20px;
    display: block;
  }

  .segm-card {
    flex: 0 0 auto;
    padding: 0;
  }

  .segm-inner {
    display: flex;
    height: 100%;
  }

  .segm-text {
    flex: 1;
    padding: 20px 22px;
  }

  .segm-accent {
    width: 3px;
    flex: 0 0 3px;
    background: rgba(255, 255, 255, 0.12);
    border-radius: 0 20px 20px 0;
    margin: 16px 16px 16px 0;
  }

  .segm-card h3 {
    font-family: var(--font-primary), 'Helvetica Neue', Helvetica, sans-serif;
    font-size: 13px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin: 0 0 10px 0;
  }

  .divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.14);
    margin-bottom: 10px;
  }

  .segm-card p {
    font-size: 13px;
    line-height: 1.55;
    opacity: 0.82;
    margin: 0;
  }

  /* Right col */
  .main-card {
    flex: 1.2;
    padding: 28px 28px 24px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  .main-card h2 {
    font-family: var(--font-primary), 'Helvetica Neue', Helvetica, sans-serif;
    font-size: clamp(30px, 3.5vw, 54px);
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 2px;
    line-height: 1.05;
    margin: 0 0 18px 0;
  }

  .main-subtitle {
    font-size: 14px;
    line-height: 1.5;
    opacity: 0.9;
    margin: 0;
  }

  .info-card {
    flex: 1;
    padding: 20px 22px;
  }

  .info-card h3 {
    font-family: var(--font-primary), 'Helvetica Neue', Helvetica, sans-serif;
    font-size: 13px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin: 0 0 10px 0;
  }

  .info-card p {
    font-size: 13px;
    line-height: 1.6;
    opacity: 0.82;
    margin: 0;
  }
</style>
