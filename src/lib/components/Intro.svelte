<script>
  import { onMount } from "svelte";
  import gsap from "gsap";
  import ScrollTrigger from "gsap/dist/ScrollTrigger";

  /**
   * @typedef {{ opacity: number, groupRotY: number, riseY: number }} CardProps
   */

  let {
    modelPosition = $bindable(/** @type {[number, number, number]} */ ([0, 0, 0])),
    modelScale = $bindable(/** @type {[number, number, number]} */ ([1.5, 1.5, 1.5])),
    modelRotation = $bindable(/** @type {[number, number, number]} */ ([0, 0, 0])),
    currentTwistX = $bindable(360),
    currentTwistZ = $bindable(200),
    cardProps = /** @type {CardProps} */ ({ opacity: 0, groupRotY: 0, riseY: 0 }),
    orbitProps  = /** @type {{ angle: number, y: number, opacity: number, centerX: number, centerY: number }} */ ({ angle: 0, y: -3, opacity: 0, centerX: 0, centerY: 0 }),
    orbitProps2 = /** @type {{ angle: number, y: number, opacity: number, centerX: number, centerY: number }} */ ({ angle: 0, y: -3, opacity: 0, centerX: 0, centerY: 0 }),
    orbitProps3 = /** @type {{ angle: number, y: number, opacity: number, centerX: number, centerY: number }} */ ({ angle: 0, y: -3, opacity: 0, centerX: 0, centerY: 0 }),
    model3dVisible = $bindable(false),
    scrollToCard = $bindable(/** @type {((cardIndex: number) => void) | undefined} */ (undefined)),
  } = $props();

  /** @type {HTMLElement|null} */
  let scrollWrapper = null;
  /** @type {HTMLElement|null} */
  let textImage = null;
  /** @type {HTMLElement|null} */
  let p1 = null;
  /** @type {HTMLElement|null} */
  let p2 = null;
  /** @type {HTMLElement|null} */
  let bigText = null;

  // OGGETTO DI SUPPORTO GSAP: Contiene i valori intermedi che GSAP anima in modo fluido durante lo scrolling e che vengono poi mappati sullo stato 3D.
  const modelProps = {
    posX: 0,
    posY: 0,
    posZ: 0,
    scale: 0,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    twistX: 180,
    twistZ: 120,
  };

  onMount(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 800px)", () => {
      // SINCRONIZZAZIONE STATO 3D: Aggiorna reattivamente le variabili tridimensionali di Svelte basandosi sui valori correnti dell'oggetto animato da GSAP.
      const update3D = () => {
        // Mutazione in-place: evita 3 nuove allocazioni di array per ogni tick GSAP (60fps)
        modelPosition[0] = modelProps.posX;
        modelPosition[1] = modelProps.posY;
        modelPosition[2] = modelProps.posZ;
        modelScale[0] = modelScale[1] = modelScale[2] = modelProps.scale;
        modelRotation[0] = modelProps.rotX;
        modelRotation[1] = modelProps.rotY;
        modelRotation[2] = modelProps.rotZ;
        currentTwistX = modelProps.twistX;
        currentTwistZ = modelProps.twistZ;
        orbitProps.centerX  = modelProps.posX;
        orbitProps.centerY  = modelProps.posY;
        orbitProps2.centerX = modelProps.posX;
        orbitProps2.centerY = modelProps.posY;
        orbitProps3.centerX = modelProps.posX;
        orbitProps3.centerY = modelProps.posY;
      };

      // TIMELINE GSAP CON PINNING: Fissa la sezione intro sullo schermo per uno scorrimento ottimizzato, pilotando la narrazione e la rotazione del modello.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollWrapper,
          start: "top top",
          end: "+=14000",
          scrub: 0.5,
          onEnter:      () => { update3D(); model3dVisible = true; },
          onEnterBack:  () => { update3D(); model3dVisible = true; },
          onLeaveBack:  () => { model3dVisible = false; },
        },
      });

      // --- FASE 1: Dissolvenza completa dell'immagine testuale centrale "non tutto ciò che conta è visibile" con traslazione e sfocatura progressiva ---
      tl.to(
        textImage,
        {
          opacity: 0,
          y: "-=80",
          filter: "blur(15px)",
          duration: 1.5,
          ease: "power2.inOut",
        },
        0,
      );

      // Materializzazione: il modello nasce dal nulla al centro e ruota su se stesso
      tl.fromTo(
        modelProps,
        { posY: -0.5, scale: 0, rotY: 0 },
        {
          posY: 0.5,
          scale: 1.5,
          rotY: Math.PI * 2,
          duration: 1.5,
          ease: "back.out(1.4)",
          onUpdate: update3D,
        },
        0,
      );

      // --- FASE 2: Spostamento del modello 3D sulla destra ed avvio della rotazione orbitale tridimensionale simultanea su X, Y e Z ---
      tl.to(
        modelProps,
        {
          posX: 3.2,
          posY: 0,
          scale: 2.4,
          rotX: Math.PI * 0.3,
          rotY: Math.PI * 0.5,
          rotZ: Math.PI * 0.2,
          duration: 1.6,
          ease: "power2.inOut",
          onUpdate: update3D,
        },
        0.8,
      );

      // --- FASE 3: Comparsa a sinistra del primo paragrafo appena il modello raggiunge la destra ---
      // Show first paragraph earlier with a slightly quicker reveal
      tl.to(
        p1,
        {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          pointerEvents: "auto",
          duration: 1.2,
          ease: "power2.out",
        },
        1.8,
      );

      tl.to(
        modelProps,
        {
          rotX: Math.PI * 0.55,
          rotY: Math.PI * 1.0,
          rotZ: Math.PI * 0.45,
          duration: 1.2,
          ease: "power1.inOut",
          onUpdate: update3D,
        },
        1.8,
      );

      // --- FASE 4: Pausa statica di lettura in cui il primo paragrafo rimane pienamente nitido e leggibile ---
      // Ridotto il tempo di pausa per accelerare la transizione verso il secondo paragrafo
      tl.to({}, { duration: 0.4 });

      // --- FASE 5: Mantieni `p1` nitido fino all'uscita simultanea con `p2`.
      // Rimosso il fade parziale anticipato per assicurare che entrambi i paragrafi
      // salgano e si dissolvano nello stesso momento più avanti nella timeline.

      // Mentre p2 appare, p1 si sfoca e svanisce progressivamente
      tl.to(
        p1,
        {
          opacity: 0.12,
          filter: "blur(14px)",
          duration: 2.2,
          ease: "power1.inOut",
        },
        2.6,
      );

      // Diminuisco il gap tra p1 e p2: faccio partire p2 e la rotazione del modello prima
      tl.to(
        p2,
        {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          pointerEvents: "auto",
          duration: 1.2,
          ease: "power2.inOut",
        },
        2.6,
      );

      tl.to(
        modelProps,
        {
          rotX: Math.PI * 0.9,
          rotY: Math.PI * 1.5,
          rotZ: Math.PI * 0.85,
          duration: 1.2,
          ease: "power2.inOut",
          onUpdate: update3D,
        },
        2.6,
      );

      // --- FASE 7: Pausa finale di lettura sul secondo paragrafo prima dello sblocco definitivo dello scroll della sezione ---
      // Ridotta ulteriormente per accorciare lo scroll tra p2 nitido e la sua scomparsa
      tl.to({}, { duration: 0.3 });

      // ANIME TWIST SCROLL: Distorsione Twist X e Z sincronizzata con lo scorrimento complessivo (durata totale 8.9s)
      tl.to(
        modelProps,
        {
          twistX: 20,
          twistZ: 140,
          duration: 2.197,
          ease: "power2.inOut",
          onUpdate: update3D,
        },
        0
      );

      tl.to(
        modelProps,
        {
          twistX: -150,
          twistZ: 180,
          duration: 2.607,
          ease: "power2.inOut",
          onUpdate: update3D,
        },
        2.197
      );

      tl.to(
        modelProps,
        {
          twistX: 20,
          twistZ: 140,
          duration: 2.234,
          ease: "power2.inOut",
          onUpdate: update3D,
        },
        4.804
      );

      tl.to(
        modelProps,
        {
          twistX: 180,
          twistZ: 120,
          duration: 1.862,
          ease: "power2.inOut",
          onUpdate: update3D,
        },
        7.038
      );

      // --- FASE 8: Uscita paragrafi verso l'alto e ritorno del modello al centro dello schermo ---
      tl.to(
        p1,
        {
          opacity: 0,
          y: -80,
          filter: "blur(10px)",
          duration: 0.8,
          ease: "power2.inOut",
        },
        4.8,
      );

      tl.to(
        p2,
        {
          opacity: 0,
          y: -80,
          filter: "blur(10px)",
          duration: 0.8,
          ease: "power2.inOut",
        },
        4.9,
      );

      // Sincronizza il ritorno del modello al centro con la scomparsa dei paragrafi
      tl.to(
        modelProps,
        {
          posX: 0,
          posY: 0,
          scale: 2.0,
          rotX: Math.PI * 1.5,
          rotY: Math.PI * 2.2,
          rotZ: Math.PI * 1.4,
          duration: 0.8,
          ease: "power2.inOut",
          onUpdate: update3D,
        },
        4.8,
      );

      // --- FASE 9: Testo full-screen sale dal basso insieme allo scroll (lineare, senza easing) ---
      tl.fromTo(
        bigText,
        { yPercent: 100, opacity: 1 },
        {
          yPercent: -250,
          opacity: 1,
          duration: 2.7,
          ease: "none",
          immediateRender: false,
        },
        5.0,
      );

      // MODELLO 3D DURANTE TESTO: deformazione continua per tutta la durata del testo in scorrimento
      tl.to(
        modelProps,
        {
          rotX: Math.PI * 2.0,
          rotY: Math.PI * 3.0,
          rotZ: Math.PI * 1.8,
          scale: 1.8,
          twistX: 60,
          twistZ: 160,
          duration: 2.5,
          ease: "none",
          onUpdate: update3D,
        },
        5.0,
      );

      // --- VIDEOAI1: Card compare leggermente prima della fine del bigText (t=7.0 → 11.0) ---
      tl.to(orbitProps, { opacity: 1, duration: 0.8, ease: "power2.out" }, 7.0);
      tl.fromTo(
        orbitProps,
        { angle: Math.PI, y: -3 },
        { angle: Math.PI * 4, y: 3, duration: 4.0, ease: "none" },
        7.0
      );
      tl.to(orbitProps, { opacity: 0, duration: 0.6, ease: "power2.in" }, 10.4);

      // --- VIDEOAI2: entra 0.8s dopo la prima card (t=7.8 → 11.8) ---
      tl.to(orbitProps2, { opacity: 1, duration: 0.8, ease: "power2.out" }, 7.8);
      tl.fromTo(
        orbitProps2,
        { angle: Math.PI, y: -3 },
        { angle: Math.PI * 4, y: 3, duration: 4.0, ease: "none" },
        7.8
      );
      tl.to(orbitProps2, { opacity: 0, duration: 0.6, ease: "power2.in" }, 11.2);

      // --- VIDEOAI3: entra 0.8s dopo la seconda card (t=8.6 → 12.6) ---
      tl.to(orbitProps3, { opacity: 1, duration: 0.8, ease: "power2.out" }, 8.6);
      tl.fromTo(
        orbitProps3,
        { angle: Math.PI, y: -3 },
        { angle: Math.PI * 4, y: 3, duration: 4.0, ease: "none" },
        8.6
      );
      tl.to(orbitProps3, { opacity: 0, duration: 0.6, ease: "power2.in" }, 12.0);

      // --- Modello 3D: rotazione lenta al centro durante tutte e 3 le orbite (7.0 → 12.6) ---
      tl.to(
        modelProps,
        {
          rotX: Math.PI * 2.3,
          rotY: Math.PI * 4.2,
          rotZ: Math.PI * 2.3,
          twistX: 50,
          twistZ: 130,
          scale: 2.0,
          duration: 5.6,
          ease: "power1.inOut",
          onUpdate: update3D,
        },
        7.0
      );

      // Buffer finale: le card finiscono a t=12.6; il modello continua a ruotare.
      tl.to(
        modelProps,
        {
          rotX: Math.PI * 3.5,
          rotY: Math.PI * 5.8,
          rotZ: Math.PI * 3.5,
          twistX: 150,
          twistZ: 200,
          duration: 1.0,
          ease: "power1.inOut",
          onUpdate: update3D,
        },
        12.6,
      );

      // Tempi nella timeline in cui ogni card è esattamente "frontale" (angle = 5π/2, sin=1)
      // Ogni orbita parte a angle=π e va a 4π in 4s linear → metà orbita = +2s
      const cardFrontTimes = [7.0 + 2.0, 7.8 + 2.0, 8.6 + 2.0]; // [9.0, 9.8, 10.6]

      scrollToCard = (cardIndex) => {
        const st = tl.scrollTrigger;
        if (!st) return;
        const t = cardFrontTimes[cardIndex] ?? cardFrontTimes[0];
        const progress = t / tl.totalDuration();
        const targetScroll = st.start + progress * (st.end - st.start);
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      };

      return () => {
        tl.kill();
        scrollToCard = undefined;
      };
    });

    mm.add("(max-width: 799px)", () => {
      const update3D = () => {
        modelPosition[0] = modelProps.posX;
        modelPosition[1] = modelProps.posY;
        modelPosition[2] = modelProps.posZ;
        modelScale[0] = modelScale[1] = modelScale[2] = modelProps.scale;
        modelRotation[0] = modelProps.rotX;
        modelRotation[1] = modelProps.rotY;
        modelRotation[2] = modelProps.rotZ;
        currentTwistX = modelProps.twistX;
        currentTwistZ = modelProps.twistZ;
        orbitProps.centerX  = modelProps.posX;
        orbitProps.centerY  = modelProps.posY;
        orbitProps2.centerX = modelProps.posX;
        orbitProps2.centerY = modelProps.posY;
        orbitProps3.centerX = modelProps.posX;
        orbitProps3.centerY = modelProps.posY;
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollWrapper,
          start: "top top",
          end: "+=6000",
          scrub: 0.5,
          onEnter:      () => { update3D(); model3dVisible = true; },
          onEnterBack:  () => { update3D(); model3dVisible = true; },
          onLeaveBack:  () => { model3dVisible = false; },
        },
      });

      tl.to(
        textImage,
        {
          opacity: 0,
          y: "-=40",
          filter: "blur(10px)",
          duration: 1.5,
          ease: "power2.inOut",
        },
        0,
      );

      tl.fromTo(
        modelProps,
        { posX: 0, posY: -0.5, scale: 0, rotY: 0 },
        {
          posX: 0,
          posY: 0.2,
          scale: 1.2,
          rotY: Math.PI * 2,
          duration: 1.5,
          ease: "back.out(1.4)",
          onUpdate: update3D,
        },
        0,
      );

      tl.to(
        modelProps,
        {
          posX: 0,
          posY: -0.2,
          scale: 1.1,
          rotX: Math.PI * 0.3,
          rotY: Math.PI * 0.5,
          rotZ: Math.PI * 0.2,
          duration: 1.6,
          ease: "power2.inOut",
          onUpdate: update3D,
        },
        0.8,
      );

      tl.to(
        p1,
        {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          pointerEvents: "auto",
          duration: 1.2,
          ease: "power2.out",
        },
        1.8,
      );

      tl.to(
        modelProps,
        {
          rotX: Math.PI * 0.55,
          rotY: Math.PI * 1.0,
          rotZ: Math.PI * 0.45,
          duration: 1.2,
          ease: "power1.inOut",
          onUpdate: update3D,
        },
        1.8,
      );

      tl.to({}, { duration: 0.4 });

      tl.to(
        p1,
        {
          opacity: 0.1,
          filter: "blur(10px)",
          duration: 2.2,
          ease: "power1.inOut",
        },
        2.6,
      );

      tl.to(
        p2,
        {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          pointerEvents: "auto",
          duration: 1.2,
          ease: "power2.inOut",
        },
        2.6,
      );

      tl.to(
        modelProps,
        {
          rotX: Math.PI * 0.9,
          rotY: Math.PI * 1.5,
          rotZ: Math.PI * 0.85,
          duration: 1.2,
          ease: "power2.inOut",
          onUpdate: update3D,
        },
        2.6,
      );

      tl.to({}, { duration: 0.3 });

      tl.to(
        modelProps,
        {
          twistX: 20,
          twistZ: 140,
          duration: 2.197,
          ease: "power2.inOut",
          onUpdate: update3D,
        },
        0
      );

      tl.to(
        modelProps,
        {
          twistX: -150,
          twistZ: 180,
          duration: 2.607,
          ease: "power2.inOut",
          onUpdate: update3D,
        },
        2.197
      );

      tl.to(
        modelProps,
        {
          twistX: 20,
          twistZ: 140,
          duration: 2.234,
          ease: "power2.inOut",
          onUpdate: update3D,
        },
        4.804
      );

      tl.to(
        modelProps,
        {
          twistX: 180,
          twistZ: 120,
          duration: 1.862,
          ease: "power2.inOut",
          onUpdate: update3D,
        },
        7.038
      );

      tl.to(
        p1,
        {
          opacity: 0,
          y: -40,
          filter: "blur(8px)",
          duration: 0.8,
          ease: "power2.inOut",
        },
        4.8,
      );

      tl.to(
        p2,
        {
          opacity: 0,
          y: -40,
          filter: "blur(8px)",
          duration: 0.8,
          ease: "power2.inOut",
        },
        4.9,
      );

      tl.to(
        modelProps,
        {
          posX: 0,
          posY: 0,
          scale: 1.3,
          rotX: Math.PI * 1.5,
          rotY: Math.PI * 2.2,
          rotZ: Math.PI * 1.4,
          duration: 0.8,
          ease: "power2.inOut",
          onUpdate: update3D,
        },
        4.8,
      );

      tl.fromTo(
        bigText,
        { yPercent: 120, opacity: 1 },
        {
          yPercent: -200,
          opacity: 1,
          duration: 2.7,
          ease: "none",
          immediateRender: false,
        },
        5.0,
      );

      tl.to(
        modelProps,
        {
          rotX: Math.PI * 2.0,
          rotY: Math.PI * 3.0,
          rotZ: Math.PI * 1.8,
          scale: 1.2,
          twistX: 60,
          twistZ: 160,
          duration: 2.5,
          ease: "none",
          onUpdate: update3D,
        },
        5.0,
      );

      tl.to(orbitProps, { opacity: 1, duration: 0.8, ease: "power2.out" }, 7.0);
      tl.fromTo(
        orbitProps,
        { angle: Math.PI, y: -2.2 },
        { angle: Math.PI * 4, y: 2.2, duration: 4.0, ease: "none" },
        7.0
      );
      tl.to(orbitProps, { opacity: 0, duration: 0.6, ease: "power2.in" }, 10.4);

      tl.to(orbitProps2, { opacity: 1, duration: 0.8, ease: "power2.out" }, 7.8);
      tl.fromTo(
        orbitProps2,
        { angle: Math.PI, y: -2.2 },
        { angle: Math.PI * 4, y: 2.2, duration: 4.0, ease: "none" },
        7.8
      );
      tl.to(orbitProps2, { opacity: 0, duration: 0.6, ease: "power2.in" }, 11.2);

      tl.to(orbitProps3, { opacity: 1, duration: 0.8, ease: "power2.out" }, 8.6);
      tl.fromTo(
        orbitProps3,
        { angle: Math.PI, y: -2.2 },
        { angle: Math.PI * 4, y: 2.2, duration: 4.0, ease: "none" },
        8.6
      );
      tl.to(orbitProps3, { opacity: 0, duration: 0.6, ease: "power2.in" }, 12.0);

      tl.to(
        modelProps,
        {
          rotX: Math.PI * 2.3,
          rotY: Math.PI * 4.2,
          rotZ: Math.PI * 2.3,
          twistX: 50,
          twistZ: 130,
          scale: 1.3,
          duration: 5.6,
          ease: "power1.inOut",
          onUpdate: update3D,
        },
        7.0
      );

      tl.to(
        modelProps,
        {
          rotX: Math.PI * 3.5,
          rotY: Math.PI * 5.8,
          rotZ: Math.PI * 3.5,
          twistX: 150,
          twistZ: 200,
          duration: 1.0,
          ease: "power1.inOut",
          onUpdate: update3D,
        },
        12.6,
      );

      const cardFrontTimes = [9.0, 9.8, 10.6];
      scrollToCard = (cardIndex) => {
        const st = tl.scrollTrigger;
        if (!st) return;
        const t = cardFrontTimes[cardIndex] ?? cardFrontTimes[0];
        const progress = t / tl.totalDuration();
        const targetScroll = st.start + progress * (st.end - st.start);
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      };

      return () => {
        tl.kill();
        scrollToCard = undefined;
      };
    });

  });
</script>

<div class="intro-scroll-wrapper" bind:this={scrollWrapper}>
<div class="intro-container">
  <!-- ELEMENTI TESTUALI E INFOGRAFICA (OVERLAY HTML): Gestisce l'immagine di benvenuto e i testi narrativi disposti a cascata sulla sinistra -->
  <div class="overlay">
    <!-- IMMAGINE TESTUALE DI TAGLINE: L'immagine iniziale centrata che esprime il concetto cardine del progetto -->
    <div class="initial-text-wrapper" bind:this={textImage}>
      <picture>
        <source media="(max-width: 799px)" srcset="/mobile/nontuttocio-mobile.png" />
        <img src="/nontuttociòcheconta.png" alt="non tutto ciò che conta è visibile" class="tagline-image" />
      </picture>
    </div>

    <!-- PARAGRAFI IMPILATI A SINISTRA: Contenitore verticale per i blocchi di testo sequenziali che compaiono con transizioni sfocate alternate -->
    <div class="texts-container">
      <div class="paragraph-wrapper" bind:this={p1}>
        <span class="para-label"><span class="label-main">MILANO–CORTINA</span><span class="label-suffix"> // </span><span class="label-suffix"> 2026</span></span>
        <h2 class="para-title">ANIMA DIGITALE</h2>
        <p>
          Per la prima volta nella storia, le Olimpiadi di
          Milano-Cortina 2026 ridefiniscono l'esperienza
          olimpica attraverso una visione che si
          trasforma in totale immersione.
        </p>
      </div>

      <div class="paragraph-wrapper" bind:this={p2}>
        <span class="para-label"><span class="label-main">SISTEMA INVISIBILE</span><span class="label-suffix"> // </span><span class="label-suffix"> AI</span></span>
        <h2 class="para-title">CONNESSIONI</h2>
        <p>
          Dietro ogni immagine di velocità, performance
          ed emozione che caratterizza l'evento
          olimpico, si nasconde un'infrastruttura
          fondamentale fatta di dati, connessioni e
          tecnologia.
        </p>
      </div>
    </div>

    <!-- TESTO FULL-SCREEN: Comparsa grande dopo l'uscita dei paragrafi -->
    <div class="big-text" bind:this={bigText}>
      Scopri la tecnologia che sta scrivendo il futuro dello sport
    </div>
  </div>
</div>
</div>

<style>
  .intro-scroll-wrapper {
    height: 14000px;
    position: relative;
  }

  .intro-container {
    width: 100vw;
    height: 100vh;
    position: sticky;
    top: 0;
    background-color: transparent;
    overflow: hidden;
    pointer-events: none;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100dvh;
    z-index: 2;
    box-sizing: border-box;
    padding: var(--spacing-9, 40px) var(--spacing-11, 80px);
  }

  /* Testo full-screen finale */
  .big-text {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    box-sizing: border-box;
    padding: 0 80px;
    font-family: "Akira Expanded", sans-serif;
    font-weight: 900;
    font-size: 10vw;
    text-transform: uppercase;
    line-height: 0.88;
    letter-spacing: -0.03em;
    color: #F8F8F8;
    opacity: 0;
    pointer-events: none;
    z-index: 1;
    will-change: opacity, transform;
  }
  

  /* Centered Text Image in first slide */
  .initial-text-wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60%;
    max-width: 800px;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
  }

  .tagline-image {
    width: 100%;
    height: auto;
    object-fit: contain;
  }

  /* Vertical Stack layout for subsequent paragraphs */
  .texts-container {
    position: absolute;
    top: 50%;
    left: 10%;
    transform: translateY(-50%);
    width: 45%;
    display: flex;
    flex-direction: column;
    gap: 3.5rem; /* Gap between stacked paragraphs */
    z-index: 20;
    pointer-events: auto; /* enable interactions if needed */
  }

  .paragraph-wrapper {
    will-change: opacity, filter, transform;
    opacity: 0;
    transform: translateY(30px);
    filter: blur(10px);
    pointer-events: none;
  }

  .para-label {
    display: flex;
    align-items: center;
    gap: 24px;
    font-family: "Akira Expanded", sans-serif;
    font-size: 0.82rem;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 1.2rem;
  }

  .label-main {
    color: var(--colors-brand-900, #F8F8F8);
  }

  .label-suffix {
    color: #F8F8F8;
  }

  .para-title {
    font-family: "Akira Expanded", sans-serif;
    font-weight: 900;
    font-size: 2.6rem;
    text-transform: uppercase;
    color: var(--colors-brand-900, #273b42);
    line-height: 1;
    letter-spacing: -0.02em;
    margin: 0 0 1.1rem 0;
  }

  .paragraph-wrapper p {
    font-family: "Helvetica", "Arial", sans-serif;
    font-size: 1.15rem;
    line-height: 1.6;
    color: #F8F8F8;
    margin: 0;
    max-width: 420px;
  }

  @media (max-width: 799px) {
    .intro-scroll-wrapper {
      height: 6000px;
    }

    .intro-container {
      width: 100vw;
      height: 100vh;
      position: sticky;
      top: 0;
      background-color: transparent;
      overflow: hidden;
      pointer-events: none;
    }

    .overlay {
      padding: 32px 20px;
    }

    .texts-container {
      width: 85%;
      left: 7.5%;
      gap: 2rem;
    }

    .para-title {
      font-size: 2rem;
    }

    .paragraph-wrapper p {
      font-size: 1.05rem;
      max-width: 100%;
    }

    .big-text {
      font-size: 11vw;
      padding: 0 24px;
    }

    .initial-text-wrapper {
      width: auto;
      max-width: none;
      left: 5%;
      transform: translateY(-50%);
      padding: 0;
    }

    .tagline-image {
      height: 40vh;
      width: auto;
      max-width: none;
    }
  }
</style>
