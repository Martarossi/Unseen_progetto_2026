<script>
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import ScrollTrigger from 'gsap/dist/ScrollTrigger';

  const stats = [
    {
      title: "TEMPO GENERAZIONE\nREPLAY 3D",
      desc: "Precisione temporale inferiore a 0,1 secondi per elaborazioni grafiche simultanee, generate in pochissimi millisecondi per replay fluidi.",
      target: 15,
      duration: 7.0,
    },
    {
      title: "SESSIONI DI GARA\nANALIZZATE",
      desc: "12 sistemi stroboscopici, 17 replay 360°, sensori, computer vision con funzioni Replay 360°, ricostruzione 3D e frame-freeze.",
      target: 391,
      duration: 4.5,
    },
    {
      title: "TELECAMERE PER\nSINGOLO EVENTO",
      desc: "Tutte le telecamere sono di alta qualità, con risoluzione a 8K per riprese perfette di ogni singolo dettaglio, garantendo una fedeltà senza precedenti.",
      target: 14,
      duration: 5.5,
    },
  ];

  /** @type {HTMLElement|null} */
  let sectionEl = null;

  /** @type {(HTMLElement|null)[]} */
  let counterEls = [];

  onMount(() => {
    stats.forEach((stat, i) => {
      const el = counterEls[i];
      if (!el) return;

      const proxy = { val: 0 };

      gsap.to(proxy, {
        val: stat.target,
        duration: stat.duration,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: sectionEl,
          // Parte quando la sezione è già ben visibile: l'utente vede 000 prima che inizi
          start: 'top 25%',
          toggleActions: 'play none none reset',
        },
        onUpdate() {
          if (el) el.textContent = String(Math.round(proxy.val)).padStart(3, '0');
        },
      });
    });
  });
</script>

<section bind:this={sectionEl} class="stats-section">
  <div class="stats-grid">
    {#each stats as stat, i}
      <div class="stat-col">
        <h3 class="stat-title">{stat.title}</h3>
        <p class="stat-desc">{stat.desc}</p>
        <div class="stat-divider"></div>
        <div class="stat-counter" bind:this={counterEls[i]}>000</div>
      </div>
    {/each}
  </div>
  <p class="stats-label">ANALISI AUTOMATIZZATA CONTENUTI · OLYMPIC BROADCASTING</p>
</section>

<style>
  .stats-section {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 12vh 6vw 8vh;
    box-sizing: border-box;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 3vw;
    align-items: start;
    width: 100%;
  }

  .stat-col {
    display: flex;
    flex-direction: column;
  }

  .stat-title {
    font-family: "Akira Expanded", "Impact", "Arial Black", sans-serif;
    font-size: clamp(11px, 1.1vw, 18px);
    font-weight: 900;
    color: #f8f8f8;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    line-height: 1.3;
    white-space: pre-line;
    margin: 0 0 1.2rem;
  }

  .stat-desc {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: clamp(10px, 0.82vw, 14px);
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.62);
    /* Testo leggermente più stretto: si avvolge su ~3 righe */
    max-width: 75%;
    margin: 0 0 1.6rem;
  }

  .stat-divider {
    width: 36px;
    height: 1px;
    background: rgba(255, 255, 255, 0.22);
    margin-bottom: 1.4rem;
  }

  .stat-counter {
    font-family: "Impact", "Arial Black", sans-serif;
    font-size: 13vw;
    font-weight: 900;
    color: #f8f8f8;
    line-height: 0.88;
    letter-spacing: 0.04em;
    will-change: contents;
  }

  .stats-label {
    text-align: center;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: clamp(9px, 0.7vw, 12px);
    letter-spacing: 0.2em;
    color: rgba(255, 255, 255, 0.4);
    margin-top: 5vh;
    text-transform: uppercase;
  }

  @media (max-width: 799px) {
    .stats-grid {
      grid-template-columns: 1fr;
      gap: 6vh;
    }

    .stat-counter {
      font-size: 28vw;
    }

    .stat-desc {
      max-width: 100%;
    }

    .stat-title {
      font-size: 14px;
    }

    .stat-desc {
      font-size: 13px;
    }
  }
</style>
