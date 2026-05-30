<script>
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import ScrollTrigger from 'gsap/dist/ScrollTrigger';

  let {
    modelPosition = $bindable(/** @type {[number, number, number]} */ ([0, 0, 0])),
    modelScale = $bindable(/** @type {[number, number, number]} */ ([1.5, 1.5, 1.5])),
    modelRotation = $bindable(/** @type {[number, number, number]} */ ([0, 0, 0])),
    currentTwistX = $bindable(360),
    currentTwistZ = $bindable(200),
    model3dVisible = $bindable(false),
  } = $props();

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
  let scrollWrapper = null;
  /** @type {HTMLElement|null} */
  let sectionEl = null;

  /** @type {(HTMLElement|null)[]} */
  let counterEls = [];

  const modelProps = {
    rotX: Math.PI * 4.5,
    rotY: Math.PI * 7.5,
    rotZ: Math.PI * 4.5,
    twistX: 160,
    twistZ: 220,
  };

  const circleState = {
    rotX: Math.PI * 5.0,
    rotY: Math.PI * 8.0,
    rotZ: Math.PI * 5.0,
    twistX: 60,
    twistZ: 60,
  };

  // Stato finale di Stats: il modello inizia a risvegliarsi mentre la sezione sale
  const wakeState = {
    rotX: Math.PI * 5.5,
    rotY: Math.PI * 9.0,
    rotZ: Math.PI * 5.5,
    twistX: 155,
    twistZ: 175,
  };

  onMount(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 800px)", () => {
      const update3D = () => {
        modelPosition = [0, 0, 0];
        modelScale = [2.0, 2.0, 2.0];
        modelRotation = [modelProps.rotX, modelProps.rotY, modelProps.rotZ];
        currentTwistX = modelProps.twistX;
        currentTwistZ = modelProps.twistZ;
      };

      // Trigger sul wrapper (2000px): sticky CSS, niente pin GSAP.
      // Fase 1 (0–500px):   modello → cerchio
      // Fase 2 (500–1250px): pausa statica (contatori in lettura)
      // Fase 3 (1250–2000px): modello si risveglia mentre la sezione sale
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollWrapper,
          start: "top top",
          end: "+=2000",
          scrub: 2,
          onEnter:     () => { model3dVisible = true; },
          onEnterBack: () => { model3dVisible = true; },
          onLeaveBack: () => { model3dVisible = false; },
        },
      });

      // Fase 1: si sistema a cerchio
      tl.to(modelProps, {
        rotX: circleState.rotX,
        rotY: circleState.rotY,
        rotZ: circleState.rotZ,
        twistX: circleState.twistX,
        twistZ: circleState.twistZ,
        duration: 1.0,
        ease: "power2.out",
        onUpdate: update3D,
      });

      // Fase 2: pausa statica — l'utente legge i contatori
      tl.to({}, { duration: 1.5 });

      // Fase 3: il modello si risveglia mentre la sezione inizia a salire
      tl.to(modelProps, {
        rotX: wakeState.rotX,
        rotY: wakeState.rotY,
        rotZ: wakeState.rotZ,
        twistX: wakeState.twistX,
        twistZ: wakeState.twistZ,
        duration: 1.5,
        ease: "power1.inOut",
        onUpdate: update3D,
      });

      /** @type {gsap.core.Tween[]} */
      const counterTweens = [];

      stats.forEach((stat, i) => {
        const el = counterEls[i];
        if (!el) return;

        const proxy = { val: 0 };

        const tween = gsap.to(proxy, {
          val: stat.target,
          duration: stat.duration,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: scrollWrapper,
            start: 'top top',
            toggleActions: 'play none none reset',
          },
          onUpdate() {
            if (el) el.textContent = String(Math.round(proxy.val)).padStart(3, '0');
          },
        });
        counterTweens.push(tween);
      });

      return () => {
        tl.kill();
        counterTweens.forEach(t => t.kill());
      };
    });

    mm.add("(max-width: 799px)", () => {
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
            start: 'top 25%',
            toggleActions: 'play none none reset',
          },
          onUpdate() {
            if (el) el.textContent = String(Math.round(proxy.val)).padStart(3, '0');
          },
        });
      });
    });
  });
</script>

<div class="stats-scroll-wrapper" bind:this={scrollWrapper}>
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
</div>

<style>
  .stats-scroll-wrapper {
    position: relative;
  }

  .stats-section {
    position: relative;
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 4vh 6vw 8vh;
    box-sizing: border-box;
  }

  @media (min-width: 800px) {
    .stats-scroll-wrapper {
      height: 2000px;
    }

    .stats-section {
      position: sticky;
      top: 0;
      height: 100vh;
      min-height: unset;
      overflow: hidden;
    }
  }
  /**/

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8vw;
    align-items: start;
    width: 100%;
  }

  .stat-col {
    display: flex;
    flex-direction: column;
  }

  .stat-title {
    font-family: 'Akira Expanded', 'Arial Black', sans-serif;
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
    text-align: left;        /* Allineamento a sinistra (bandiera a sinistra) */
    max-width: 45ch;         /* Misura ottimale per bloccare il testo su 3 righe su desktop */
    margin: 0 0 1.6rem;
  }

  .stat-divider {
    width: 36px;
    height: 1px;
    background: rgba(255, 255, 255, 0.22);
    margin-bottom: 1.4rem;
  }

  .stat-counter {
    font-family: 'Akira Expanded', 'Arial Black', sans-serif;
    font-size: 8vw;
    font-weight: 900;
    color: #f8f8f8;
    line-height: 0.88;
    letter-spacing: 0.04em;
    will-change: contents;
  }

  .stats-label {
    position: absolute;
    bottom: 8vh;
    left: 0;
    right: 0;
    text-align: center;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: clamp(9px, 0.7vw, 12px);
    letter-spacing: 0.2em;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
  }

  @media (max-width: 799px) {
    .stats-grid {
      grid-template-columns: 1fr;
      gap: 6vh;
    }

    .stat-desc {
      max-width: 42ch;       /* Mantiene la proporzione di 3/4 righe anche su mobile */
    }

    .stat-counter {
      font-size: 28vw;
    }

    .stat-title {
      font-size: 14px;
    }

    .stat-desc {
      font-size: 13px;
    }
  }
</style>