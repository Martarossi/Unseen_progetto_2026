<script>
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import ScrollTrigger from 'gsap/dist/ScrollTrigger';

  /** @type {HTMLElement|null} */
  let scrollWrapper = null;
  /** @type {HTMLElement|null} */
  let cardsContainer = null;

  const interviews = [
    {
      id: 1,
      firstName: 'LUCIO',
      lastName: 'PIAZZINI',
      role: 'Videomaker\nPilota di droni',
      image: '/gallery_milanocortina.png',
      thumb: '/gallery_helvetica.png',
    },
    {
      id: 2,
      firstName: 'SARA',
      lastName: 'MARTINI',
      role: 'Camerawoman\nSport estremi',
      image: '/gallery_helvetica.png',
      thumb: '/gallery_neural.png',
    },
    {
      id: 3,
      firstName: 'MARCO',
      lastName: 'FERRI',
      role: 'Direttore\ndella fotografia',
      image: '/gallery_neural.png',
      thumb: '/gallery_unseen.png',
    },
    {
      id: 4,
      firstName: 'ANNA',
      lastName: 'ROSSI',
      role: 'Operatrice\nsteadicam',
      image: '/gallery_unseen.png',
      thumb: '/gallery_alpine.png',
    },
    {
      id: 5,
      firstName: 'LUCA',
      lastName: 'BIANCHI',
      role: 'Videomaker aereo\nDrone FPV',
      image: '/gallery_alpine.png',
      thumb: '/gallery_milanocortina.png',
    },
  ];

  /**
   * diff = i - index
   *
   * diff == 0   → carta attiva: centrata, scala 1, nitida
   * diff >  0   → carte in arrivo: piccole, sotto il centro, sfocate
   * diff <  0   → carte uscite: si ingrandiscono e salgono, poi svaniscono
   *
   * @param {number} index
   */
  function updateCards(index) {
    if (!cardsContainer) return;
    const cards = /** @type {NodeListOf<HTMLElement>} */ (
      cardsContainer.querySelectorAll('.interview-card')
    );

    cards.forEach((card, i) => {
      const diff = i - index;

      let scale, ty, blur, opacity, zIdx;

      if (diff <= 0) {
        // Carta attiva (diff=0) o in uscita (diff<0)
        const t = -diff; // 0 = attiva, 1 = appena uscita
        scale   = 1 + t * 0.5;               // si ingrandisce volando via
        ty      = -t * 38;                   // sale verso l'alto (vh)
        blur    = 0;
        opacity = Math.max(0, 1 - t * 2.2);  // sfuma rapidamente
        zIdx    = 60 + Math.round(t * 10);   // sopra le carte successive durante l'uscita
      } else {
        // Carte future (diff > 0): arrivano dal basso/fondo
        scale   = Math.max(0.25, 1 - diff * 0.32);
        ty      = Math.min(20, diff * 10);   // leggermente più in basso rispetto al centro
        blur    = Math.min(22, diff * 12);
        opacity = diff > 2.4 ? 0 : Math.max(0, 1 - Math.max(0, diff - 0.3) * 0.5);
        zIdx    = Math.max(1, 50 - Math.round(diff * 10));
      }

      card.style.transform = `translate(-50%, calc(-50% + ${ty}vh)) scale(${scale})`;
      card.style.filter    = blur > 0 ? `blur(${blur}px)` : 'none';
      card.style.opacity   = String(Math.max(0, Math.min(1, opacity)));
      card.style.zIndex    = String(zIdx);
    });
  }

  onMount(() => {
    updateCards(0);

    const mm = gsap.matchMedia();
    mm.add('(min-width: 800px)', () => {
      const state = { index: 0 };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollWrapper,
          start: 'top top',
          end: '+=3600',
          scrub: 1,
        },
      });

      tl.to(state, {
        index: interviews.length - 1,
        ease: 'none',
        onUpdate: () => updateCards(state.index),
      });

      return () => tl.kill();
    });
  });
</script>

<div class="gallery-scroll-wrapper" bind:this={scrollWrapper}>
  <div class="gallery-sticky">
    <div class="cards-container" bind:this={cardsContainer}>
      {#each interviews as iv}
        <div class="interview-card">

          <div class="card-media">
            <img src={iv.image} alt="{iv.firstName} {iv.lastName}" />
          </div>

          <div class="card-info">
            <div class="card-header">
              <p class="name-line">{iv.firstName}</p>
              <p class="name-line">{iv.lastName}</p>
              <div class="name-divider"></div>
              <p class="card-role">
                {#each iv.role.split('\n') as line, j}
                  {line}{#if j < iv.role.split('\n').length - 1}<br />{/if}
                {/each}
              </p>
            </div>

            <div class="card-thumb">
              <img src={iv.thumb} alt="" />
            </div>
          </div>

        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .gallery-scroll-wrapper {
    height: 3600px;
    position: relative;
  }

  .gallery-sticky {
    width: 100vw;
    height: 100vh;
    position: sticky;
    top: 0;
    overflow: hidden;
  }

  .cards-container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  /* ── Card di vetro centrata ── */
  .interview-card {
    position: absolute;
    top: 50%;
    left: 50%;
    /* transform gestito interamente da JS */
    transform: translate(-50%, -50%) scale(0.25);
    transform-origin: center center;

    width: 65vw;
    height: min(70vh, 530px);

    background: rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(28px);
    -webkit-backdrop-filter: blur(28px);
    border: 1px solid rgba(255, 255, 255, 0.55);
    border-radius: 22px;
    box-shadow:
      0 16px 56px rgba(0, 0, 0, 0.10),
      inset 0 1px 0 rgba(255, 255, 255, 0.75);

    display: flex;
    overflow: hidden;
    opacity: 0;
    will-change: transform, filter, opacity;
  }

  /* ── Immagine / video ── */
  .card-media {
    flex: 0 0 63%;
    overflow: hidden;
    margin: 10px;
    border-radius: 14px;
  }

  .card-media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* ── Pannello info ── */
  .card-info {
    flex: 1;
    padding: 36px 24px 36px 12px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 0;
  }

  .card-header {
    display: flex;
    flex-direction: column;
  }

  .name-line {
    font-family: 'Impact', 'Arial Black', 'Helvetica Neue', sans-serif;
    font-size: clamp(26px, 2.8vw, 46px);
    font-weight: 900;
    letter-spacing: -0.02em;
    text-transform: uppercase;
    color: #1a2a35;
    line-height: 1.0;
    margin: 0;
  }

  .name-divider {
    width: 100%;
    height: 1px;
    background: rgba(26, 42, 53, 0.2);
    margin: 16px 0;
  }

  .card-role {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: clamp(12px, 1.1vw, 15px);
    line-height: 1.7;
    color: rgba(26, 42, 53, 0.6);
    margin: 0;
  }

  /* ── Thumbnail ── */
  .card-thumb {
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 10px;
    overflow: hidden;
    opacity: 0.6;
  }

  .card-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* ── Mobile ── */
  @media (max-width: 799px) {
    .gallery-scroll-wrapper { height: auto; }

    .gallery-sticky {
      position: relative;
      height: auto;
      overflow: visible;
      padding: 60px 20px;
    }

    .cards-container {
      position: static;
      height: auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .interview-card {
      position: static;
      width: 100%;
      height: auto;
      min-height: 260px;
      transform: none !important;
      filter: none !important;
      opacity: 1 !important;
    }
  }
</style>
