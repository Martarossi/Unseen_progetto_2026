<script>
  import { onMount } from "svelte";
  import gsap from "gsap";

  const FOCUSED = { filter: "blur(0px)",  opacity: 1,    duration: 0.4, ease: "power2.out" };
  const BLURRED = { filter: "blur(12px)", opacity: 0.28, duration: 0.4, ease: "power2.out" };

  const leftQuotes = [
    {
      text: "«Quando il ghiaccio riflette le luci dell'arena e l'atleta entra in pista, c'è una frazione di secondo in cui il mondo si ferma. Noi siamo lì per catturare esattamente quella pausa.»",
      author: "— Marco Ferretti, direttore della fotografia",
    },
    {
      text: "«Non stai solo documentando una gara. Stai costruendo la memoria collettiva di un evento che milioni di persone ricorderanno per tutta la vita. Questa responsabilità non ti abbandona mai.»",
      author: "— Giulia Moretti, cameraman olimpica",
    },
    {
      text: "«Il freddo ti entra nelle ossa, i guanti rendono le dita lente, le condizioni cambiano ogni ora. Ma quando premi il pulsante nel momento giusto, tutto il resto scompare.»",
      author: "— Luca Bernardi, operatore steadicam",
    },
  ];

  const rightQuotes = [
    {
      text: "«Lavorare con i sistemi di tracciamento AI ha cambiato tutto. La macchina anticipa il movimento, ti suggerisce l'inquadratura. Ma l'istinto rimane tuo, e nessun algoritmo può sostituirlo.»",
      author: "— Sara Conti, supervisore tecnico",
    },
    {
      text: "«Ogni Olimpiade ha la sua luce. Cortina ha quella particolare qualità delle Dolomiti: dura, diretta, quasi tagliente. Devi imparare a leggerla in pochi giorni e poi usarla a tuo vantaggio.»",
      author: "— Andrea Visconti, direttore della fotografia",
    },
    {
      text: "«In quindici anni di riprese sportive non mi sono mai abituato al momento della premiazione. C'è qualcosa di primitivo nell'emozione di un atleta sul podio che attraversa l'obiettivo e ti colpisce dritto allo stomaco.»",
      author: "— Francesca Amati, operatrice ENG",
    },
  ];

  onMount(() => {
    gsap.set(".citazione-blurrata", BLURRED);
  });
</script>

<section class="citazioni-section">
  <div class="col-left">
    {#each leftQuotes as q}
      <div
        class="citazione-blurrata"
        role="region"
        onmouseenter={(e) => gsap.to(e.currentTarget, FOCUSED)}
      >
        <p class="citazione-text">{q.text}</p>
        <span class="citazione-author">{q.author}</span>
      </div>
    {/each}
  </div>

  <div class="col-right">
    {#each rightQuotes as q}
      <div
        class="citazione-blurrata"
        role="region"
        onmouseenter={(e) => gsap.to(e.currentTarget, FOCUSED)}
      >
        <p class="citazione-text">{q.text}</p>
        <span class="citazione-author">{q.author}</span>
      </div>
    {/each}
  </div>
</section>

<style>
  .citazioni-section {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }

  .col-left,
  .col-right {
    position: absolute;
    top: 0;
    height: 100%;
    width: 34%;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    padding: 8vh 0;
    box-sizing: border-box;
  }

  .col-left  { left: 6%; }
  .col-right { right: 6%; }

  .citazione-blurrata {
    width: 100%;
    cursor: default;
    will-change: filter, opacity;
    text-align: left;
  }

  .citazione-text {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: clamp(14px, 1.2vw, 19px);
    font-style: italic;
    line-height: 1.6;
    color: #1a2a35;
    margin: 0 0 0.5em;
  }

  .citazione-author {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: clamp(11px, 0.85vw, 13px);
    color: #1a2a35;
    opacity: 0.6;
    font-weight: 500;
    letter-spacing: 0.05em;
  }
</style>
