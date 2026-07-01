<script>
  import { onMount } from 'svelte';
  import gsap from 'gsap';

  /** @type {HTMLElement|null} */
  let scrollWrapper = null;
  /** @type {HTMLElement|null} */
  let cardsContainer = null;

  const interviews = [
    {
      id: 1,
      firstName: 'JORDAN',
      lastName: 'COWAN',
      role: 'Videomaker\nEx pattinatore professionista',
      image: '/gallery_milanocortina.png',
      thumb: '/gallery_helvetica.png',
      video: '/video_interviste/Intro-Cowan.mp4',
      youtubeUrl: 'https://youtu.be/KLLawK2Y0jo',
      desc: 'Cosa succede quando un ex pattinatore artistico del Team USA decide di portare la macchina da presa sul ghiaccio? In questa intervista esclusiva, Jordan Cowan, fondatore di On Ice Perspectives, ci racconta come ha rivoluzionato il modo in cui il mondo guarda il pattinaggio artistico, arrivando a filmare direttamente sulla pista delle Olimpiadi.',
    },
    {
      id: 2,
      firstName: 'LUCIO',
      lastName: 'PIAZZINI',
      role: 'Videomaker',
      image: '/gallery_helvetica.png',
      thumb: '/gallery_neural.png',
      video: '/video_interviste/Intro-Piazzini.mp4',
      youtubeUrl: 'https://youtu.be/pFnFSAPNwc0',
      desc: `Mentre il mondo ha gli occhi puntati sui campioni e sulle medaglie, c'è chi lavora nell'ombra, a bordo pista o dietro le ricetrasmittenti, pronto a intervenire nei momenti più critici. In questa intervista, il videomaker Lucio Piazzini ci racconta come è nato il progetto di Regione Veneto per mostrare chi salva vite: i soccorritori del 118 durante i Giochi Olimpici di Cortina.`,
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
      firstName: 'MARCO',
      lastName: `DONA'`,
      role: 'Operatrice\nsteadicam',
      image: '/gallery_unseen.png',
      thumb: '/gallery_alpine.png',
      video: '/video_interviste/Intro-Dona.mp4',
    },
    {
      id: 5,
      firstName: 'ANDREA',
      lastName: 'UDALI',
      role: 'Videomaker',
      image: '/gallery_alpine.png',
      thumb: '/gallery_milanocortina.png',
      video: '/video_interviste/Intro-Udali.mp4',
      youtubeUrl: 'https://youtu.be/nMPI1SWulRo',
      desc: `Cosa significa lavorare come cameraman durante i Giochi Olimpici Invernali? In questa intervista andiamo dietro l'obiettivo con un professionista con 24 anni di esperienza che ha coperto le spettacolari e adrenaliniche discipline del Mogul (le gobbe) e dell'Aerial a Livigno, una delle località più fredde d'Italia. `
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

  /** @type {Record<number, boolean>} */
  let videoEnded = $state({});
  /** @type {Record<number, boolean>} */
  let videoHovered = $state({});

  /** @param {number} id */
  function onVideoEnded(id) {
    videoEnded = { ...videoEnded, [id]: true };
  }

  /** @param {number} id @param {boolean} hovered */
  function onVideoHover(id, hovered) {
    videoHovered = { ...videoHovered, [id]: hovered };
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
            {#if iv.video}
              <div
                class="video-wrapper"
                role="presentation"
                onmouseenter={() => onVideoHover(iv.id, true)}
                onmouseleave={() => onVideoHover(iv.id, false)}
              >
                <video
                  src={iv.video}
                  autoplay
                  muted
                  playsinline
                  onended={() => onVideoEnded(iv.id)}
                ></video>
                {#if (videoEnded[iv.id] || videoHovered[iv.id]) && iv.youtubeUrl}
                  <a
                    href={iv.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="video-end-overlay"
                    class:ended={videoEnded[iv.id]}
                  >
                    <span>per la versione integrale</span>
                    <span>clicca qui</span>
                  </a>
                {/if}
              </div>
            {:else}
              <img src={iv.image} alt="{iv.firstName} {iv.lastName}" />
            {/if}
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

            {#if iv.desc}
              <p class="card-desc">{iv.desc}</p>
            {/if}
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

  .card-media img,
  .card-media video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .video-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .video-wrapper video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .video-end-overlay {
    position: absolute;
    inset: 0;
    background: rgba(53, 91, 99, 0.75);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    text-decoration: none;
    color: #ffffff;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: clamp(13px, 1.2vw, 17px);
    font-weight: 400;
    letter-spacing: 0.06em;
    text-align: center;
    padding: 5% 20px 0;
    animation: veo-fade-in 0.9s ease forwards;
  }

  .video-end-overlay span {
    display: block;
    transition: filter 0.4s ease, opacity 0.4s ease;
  }

  .video-end-overlay:has(span:hover) span {
    filter: blur(6px);
    opacity: 0.5;
  }

  @keyframes veo-fade-in {
    from { opacity: 0; backdrop-filter: blur(0px); }
    to   { opacity: 1; backdrop-filter: blur(14px); }
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
    font-family: 'Akira Expanded', 'Arial Black', sans-serif;
    font-size: clamp(26px, 2.8vw, 46px);
    font-weight: 900;
    letter-spacing: -0.02em;
    text-transform: uppercase;
    color: #273b42;
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
    font-size: clamp(14px, 1.4vw, 19px);
    line-height: 1.7;
    color: rgba(26, 42, 53, 0.6);
    margin: 0;
  }

  .card-desc {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: clamp(12px, 1.1vw, 15px);
    line-height: 1.65;
    color: #273b42;
    margin: 0;
    align-self: flex-end;
  }

  /* ── Mobile ── */
  @media (max-width: 799px) {
    .gallery-scroll-wrapper { height: auto; }

    .gallery-sticky {
      perspective: none;
      position: relative;
      width: 100%;
      height: auto;
      overflow: visible;
      padding: 60px 0;
      box-sizing: border-box;
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
      width: 92%;
      margin: 0 auto;
      height: auto;
      min-height: unset;
      transform: none !important;
      filter: none !important;
      opacity: 1 !important;
      flex-direction: column;
    }

    .card-media {
      flex: 0 0 auto;
      width: calc(100% - 20px);
      aspect-ratio: 16 / 9;
      margin: 10px 10px 0;
    }

    .card-info {
      padding: 14px 14px 18px;
    }

    .card-header {
      flex-direction: row;
      flex-wrap: wrap;
      align-items: baseline;
      column-gap: 0.7em;
      padding-top: 8px;
    }

    .name-line {
      font-size: 26px;
      flex: 0 0 auto;
    }

    .name-divider,
    .card-role {
      flex: 0 0 100%;
    }

    .card-role {
      font-size: 12px;
    }

    .card-desc {
      font-size: 12px;
      line-height: 1.55;
    }
  }
</style>
