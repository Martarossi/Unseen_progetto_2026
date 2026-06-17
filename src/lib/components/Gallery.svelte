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
   * Depth-tunnel 3-D carousel.
   *
   * diff < 0 → carta uscita (va in profondità: si sgonfia, sfoca, svanisce)
   * diff = 0 → carta attiva (centrata, piena, nitida)
   * diff > 0 → carte in arrivo (nel fondo, alternano destra/sinistra per parità)
   *
   * @param {number} index  (float, driven by GSAP)
   */
  function updateCards(index) {
    if (!cardsContainer) return;
    const cards = /** @type {NodeListOf<HTMLElement>} */ (
      cardsContainer.querySelectorAll('.interview-card')
    );

    cards.forEach((card, j) => {
      const diff = j - index;
      let xVw, scale, blur, opacity, zIdx, rotY;

      if (diff <= 0) {
        const t = -diff;
        const side = j % 2 === 0 ? -1 : 1;
        xVw     = side * Math.min(t * 110, 110);
        scale   = 1 + t * 0.4;
        blur    = 0;
        opacity = t >= 1 ? 0 : 1;
        zIdx    = t >= 1 ? 1 : 70;
        // lato sinistro in avanti quando esce a sx, lato destro quando esce a dx
        rotY    = -side * 18 * Math.min(t, 1);
      } else {
        const side = j % 2 === 0 ? -1 : 1;
        xVw     = side * 28 * Math.min(diff, 1.1);
        scale   = Math.max(0.42, 1 - diff * 0.27);
        blur    = Math.min(18, diff * 11);
        opacity = diff > 2.2
          ? 0
          : Math.max(0, 1 - Math.max(0, diff - 0.4) * 0.65);
        zIdx    = Math.max(1, Math.round(50 - diff * 12));
        // lato che guarda il centro in avanti mentre la carta si avvicina
        rotY    = side * 18 * Math.min(diff, 1);
      }

      card.style.transform = `translate(calc(-50% + ${xVw}vw), -50%) rotateY(${rotY}deg) scale(${scale})`;
      card.style.filter    = blur > 0.05 ? `blur(${blur}px)` : 'none';
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
          end: '+=4800',
          scrub: true,
          snap: {
            snapTo: 1 / (interviews.length - 1),
            duration: { min: 0.5, max: 0.9 },
            ease: 'power3.out',
            directional: true,
          },
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

          </div>

        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .gallery-scroll-wrapper {
    height: calc(4800px + 100vh);
    position: relative;
  }

  .gallery-sticky {
    width: 100vw;
    height: 100vh;
    position: sticky;
    top: 0;
    overflow: hidden;
    /* Subtle perspective so scale-based depth reads as 3-D */
    perspective: 1400px;
    perspective-origin: 50% 50%;
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
    transform: translate(-50%, -50%) scale(0.42);
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
    .gallery-sticky { perspective: none; }

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
