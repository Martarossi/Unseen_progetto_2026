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
    showGlass = $bindable(true),
  } = $props();

  const stats = [
    {
      title: "COPERTURA IMMERSIVA\nDEI CONTENUTI",
      desc: "Un ecosistema visivo diffuso tra tutti i cluster olimpici. Dalle ottiche ultra-long-range per lo sci alpino ai sistemi micro-camera per bob e curling, è garantita la copertura totale di ogni momento di gara.",
      target: 800,
      duration: 2.5,
      label: "TELECAMERE ATTIVE SUI CAMPI DI GARA"
    },
    {
      title: "FLUSSO DI PRODUZIONE\nE DISTRIBUZIONE GLOBALE",
      desc: "Il racconto continuo delle Olimpiadi. Grazie alla trasmissione multi-piattaforma in Ultra HD gestita da OBS, ogni sessione competitiva viene prodotta in tempo reale per i broadcaster di tutto il mondo.",
      target: 900,
      duration: 3.0,
      label: "ORE DI DIRETTA STREAMING"
    },
    {
      title: "CENTRI DI COMANDO\nTECNOLOGICO",
      desc: "Infrastrutture ad alta tecnologia suddivise tra regie mobili nei siti di gara e regie virtualizzate presso l'IBC. Una capillarità necessaria per coordinare simultaneamente eventi live paralleli.",
      target: 23,
      duration: 2.0,
      label: "REGIE INTERNESSE IN RETE"
    },
  ];

  /** @type {HTMLElement|null} */
  let scrollWrapper = null;
  /** @type {HTMLElement|null} */
  let sectionEl = null;
  /** @type {(HTMLElement|null)[]} */
  let counterEls = $state([]);
  /** @type {(HTMLElement|null)[]} */
  let statCols = $state([]);

  const modelProps = {
    scale: 2.0,
    rotX: Math.PI * 3.5,
    rotY: Math.PI * 5.8,
    rotZ: Math.PI * 3.5,
    twistX: 150,
    twistZ: 200,
  };

  const circleState = {
    rotX: Math.PI * 5.0,
    rotY: Math.PI * 8.0,
    rotZ: Math.PI * 5.0,
    twistX: 60,
    twistZ: 60,
  };

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
        modelPosition[0] = 0; modelPosition[1] = 0; modelPosition[2] = 0;
        modelScale[0] = modelScale[1] = modelScale[2] = modelProps.scale;
        modelRotation[0] = modelProps.rotX;
        modelRotation[1] = modelProps.rotY;
        modelRotation[2] = modelProps.rotZ;
        currentTwistX = modelProps.twistX;
        currentTwistZ = modelProps.twistZ;
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollWrapper,
          start: "top top",
          end: "+=1200",
          scrub: 0.5,
          onEnter:     () => { model3dVisible = true; showGlass = false; },
          onLeave:     () => { showGlass = true; },
          onEnterBack: () => { model3dVisible = true; showGlass = false; },
          onLeaveBack: () => { showGlass = true; },
        },
      });

      tl.to(modelProps, {
        rotX: circleState.rotX,
        rotY: circleState.rotY,
        rotZ: circleState.rotZ,
        twistX: circleState.twistX,
        twistZ: circleState.twistZ,
        duration: 1.0,
        ease: "none",
        onUpdate: update3D,
      });

      tl.to({}, { duration: 1.5 });

      tl.to(modelProps, {
        rotX: wakeState.rotX,
        rotY: wakeState.rotY,
        rotZ: wakeState.rotZ,
        twistX: wakeState.twistX,
        twistZ: wakeState.twistZ,
        duration: 1.5,
        ease: "none",
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
      const update3D = () => {
        modelPosition[0] = 0; modelPosition[1] = 0; modelPosition[2] = 0;
        modelScale[0] = modelScale[1] = modelScale[2] = modelProps.scale;
        modelRotation[0] = modelProps.rotX;
        modelRotation[1] = modelProps.rotY;
        modelRotation[2] = modelProps.rotZ;
        currentTwistX = modelProps.twistX;
        currentTwistZ = modelProps.twistZ;
      };

      modelProps.scale = 4.5; // Intro ha già portato il modello a questa scala
      modelProps.rotX = circleState.rotX;
      modelProps.rotY = circleState.rotY;
      modelProps.rotZ = circleState.rotZ;
      modelProps.twistX = circleState.twistX;
      modelProps.twistZ = circleState.twistZ;

      const MODEL_END = 0;
      const SLOT = 4.0;
      const ENTER_DUR = 0.8;
      const EXIT_DUR = 0.8;
      const TOTAL_DUR = MODEL_END + stats.length * SLOT; // 12.0

      const validCols = /** @type {HTMLElement[]} */ (statCols.filter(Boolean));
      gsap.set(validCols, { y: 80, opacity: 0 });

      // Counter tweens: auto-play, non legati allo scrub
      /** @type {(gsap.core.Tween | null)[]} */
      const counterTweens = [];
      const counterFired = [false, false, false];

      stats.forEach((stat, i) => {
        const el = counterEls[i];
        if (!el) { counterTweens.push(null); return; }

        const proxy = { val: 0 };
        counterTweens.push(gsap.to(proxy, {
          val: stat.target,
          duration: 2.5,
          ease: "power1.out",
          paused: true,
          onUpdate: () => {
            el.textContent = String(Math.round(proxy.val)).padStart(3, '0');
          },
        }));
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollWrapper,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          onUpdate: (st) => {
            stats.forEach((_, i) => {
              const ct = counterTweens[i];
              const el = counterEls[i];
              if (!ct || !el) return;

              const triggerProg = (MODEL_END + i * SLOT + ENTER_DUR) / TOTAL_DUR;

              if (st.progress >= triggerProg && !counterFired[i]) {
                counterFired[i] = true;
                ct.restart();
              } else if (st.progress < triggerProg && counterFired[i]) {
                counterFired[i] = false;
                ct.pause().progress(0);
                el.textContent = '000';
              }
            });
          },
          onEnter: () => {
            model3dVisible = true;
            showGlass = false;
            update3D();
            if (validCols[0]) gsap.set(validCols[0], { y: 0, opacity: 1 });
            if (!counterFired[0] && counterTweens[0]) {
              counterFired[0] = true;
              counterTweens[0].restart();
            }
          },
          onLeave:     () => { showGlass = true; },
          onEnterBack: () => { model3dVisible = true; showGlass = false; },
          onLeaveBack: () => { showGlass = true; },
        },
      });

      // Transizioni blocchi: il primo appare subito su onEnter, gli altri con scrub
      stats.forEach((_, i) => {
        const col = statCols[i];
        if (!col) return;

        const slotStart = MODEL_END + i * SLOT;
        const slotEnd = slotStart + SLOT;

        if (i > 0) {
          tl.to(col, { y: 0, opacity: 1, duration: ENTER_DUR, ease: "power2.out" }, slotStart);
        }
        tl.to(col, { y: -80, opacity: 0, duration: EXIT_DUR, ease: "power2.in" }, slotEnd - EXIT_DUR);
      });

      return () => {
        tl.kill();
        counterTweens.forEach(t => t?.kill());
        gsap.set(validCols, { clearProps: "all" });
      };
    });
  });
</script>

<div class="stats-scroll-wrapper" bind:this={scrollWrapper}>
  <section bind:this={sectionEl} class="stats-section">
    <div class="stats-grid">
      {#each stats as stat, i}
        <div class="stat-col" bind:this={statCols[i]}>
          <h3 class="stat-title">{stat.title}</h3>
          <p class="stat-desc">{stat.desc}</p>
          <div class="stat-divider"></div>
          <div class="stat-counter" bind:this={counterEls[i]}>000</div>
          <span class="stat-label-under">{stat.label}</span>
        </div>
      {/each}
    </div>
    <p class="stats-label">ANALISI AUTOMATIZZATA CONTENUTI ·<br class="label-break"> OLYMPIC BROADCASTING</p>
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

  /* ── DESKTOP LAYOUT (as it was 2 days ago) ── */
  @media (min-width: 800px) {
    .stats-scroll-wrapper {
      height: 1200px;
    }

    .stats-section {
      position: sticky;
      top: 0;
      height: 100vh;
      min-height: unset;
      overflow: hidden;
    }

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
      align-items: flex-start;
      text-align: left;
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
      text-align: left;
    }

    .stat-desc {
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-size: clamp(12px, 1vw, 16px);
      line-height: 1.6;
      color: #f8f8f8;
      text-align: left;
      max-width: 45ch;
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

    .stat-label-under {
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-size: clamp(10px, 0.8vw, 13px);
      color: #f8f8f8;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-top: 0.8rem;
      line-height: 1.4;
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
      color: #f8f8f8;
      text-transform: uppercase;
    }
  }

  /* ── MOBILE LAYOUT (fades & stacked columns) ── */
  @media (max-width: 799px) {
    .stats-scroll-wrapper {
      height: 3600px;
    }

    .stats-section {
      position: sticky;
      top: 0;
      height: 100svh;
      min-height: unset;
      overflow: hidden;
    }

    .stats-grid {
      position: relative;
      flex: 1;
      width: 100%;
      min-height: 0;
    }

    .stat-col {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding-top: 8vh;
    }

    .stat-title {
      font-family: 'Akira Expanded', 'Arial Black', sans-serif;
      font-size: 18px;
      font-weight: 900;
      color: #f8f8f8;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      line-height: 1.3;
      white-space: pre-line;
      margin: 0 0 1.4rem;
      text-align: center;
    }

    .stat-desc {
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 1.7;
      color: #f8f8f8;
      max-width: 38ch;
      margin: 0 0 2rem;
      text-align: center;
    }

    .stat-divider {
      width: 36px;
      height: 1px;
      background: rgba(255, 255, 255, 0.22);
      margin: 0 auto 1.8rem;
    }

    .stat-counter {
      font-family: 'Akira Expanded', 'Arial Black', sans-serif;
      font-size: 28vw;
      font-weight: 900;
      color: #f8f8f8;
      line-height: 0.88;
      letter-spacing: 0.04em;
      will-change: contents;
    }

    .stat-label-under {
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-size: 11px;
      color: #f8f8f8;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-top: 1rem;
      line-height: 1.4;
    }

    .stats-label {
      position: absolute;
      bottom: 16vh;
      left: 0;
      right: 0;
      text-align: center;
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-size: clamp(9px, 0.7vw, 12px);
      letter-spacing: 0.2em;
      color: rgba(248, 248, 248, 0.5);
      text-transform: uppercase;
    }
  }
</style>
