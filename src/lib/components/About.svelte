<script>
    import { onMount } from "svelte";
    import gsap from "gsap";
    import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

    let { closeOverlay } = $props();

    let wrapperRef;
    let containerRef;
    let leftColumn;
    let rightColumn;

    onMount(() => {
        gsap.registerPlugin(ScrollTrigger);

        // Colonna di sinistra: parte nitida, diventa sfocata
        gsap.fromTo(
            leftColumn,
            { filter: "blur(0px)", opacity: 1 },
            {
                filter: "blur(12px)",
                opacity: 0.7,
                scrollTrigger: {
                    trigger: containerRef,
                    scroller: wrapperRef,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: true,
                },
            },
        );

        // Colonna di destra: parte sfocata, diventa nitida
        gsap.fromTo(
            rightColumn,
            { filter: "blur(12px)", opacity: 0.7 },
            {
                filter: "blur(0px)",
                opacity: 1,
                scrollTrigger: {
                    trigger: containerRef,
                    scroller: wrapperRef,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: true,
                },
            },
        );
    });
</script>

<div class="about-wrapper" bind:this={wrapperRef}>
    <div class="about-container" bind:this={containerRef}>
        <div class="sticky-content">
            <div class="top-bar">
                <button
                    class="close-btn"
                    onclick={closeOverlay}
                    aria-label="Close">&times;</button
                >
            </div>

            <div class="content-columns">
                <div class="col left-col" bind:this={leftColumn}>
                    <h2>CHI SIAMO?</h2>
                    <p>
                        Siamo cinque studenti del corso di Design della
                        Comunicazione presso il Politecnico di Milano. Il
                        progetto nasce all'interno del corso di Web Design per
                        esplorare l'anima tecnologica e nascosta di Milano
                        Cortina 2026.<br /><br />
                        Al centro della narrazione c'è l'Intelligenza Artificiale,
                        il grande regista invisibile che, pur restando fuori dai
                        riflettori, trasforma la performance atletica in un'esperienza
                        memorabile attraverso tecniche d'avanguardia come Spacetime
                        Slices, Athlete Trackers e Bullet Timing. Ad accompagnare
                        l'utente nel sito è un elemento 3D fluido e mutabile, metafora
                        visiva di un'AI capace di adattarsi a ogni dato ma priva
                        di una propria forma definita.
                    </p>
                </div>

                <div class="col right-col" bind:this={rightColumn}>
                    <h2>COME NASCE UNSEEN?</h2>
                    <p>
                        Un-seen nasce per esplorare ciò che normalmente resta
                        fuori dall'inquadratura. Non l'atleta al centro della
                        scena, ma tutto ciò che rende possibile quella scena.
                        Ogni evento olimpico è costruito su ciò che vediamo:
                        velocità, performance, emozione. Ma dietro ogni immagine
                        esiste un sistema invisibile fatto di dati, connessioni,
                        scelte e tecnologia. Quello che arriva sullo schermo è
                        solo il risultato finale di un processo molto più
                        complesso. Ogni replay, ogni movimento di camera, ogni
                        prospettiva a 360° nasce dall'incontro tra sensibilità
                        umana e infrastrutture intelligenti.<br /><br />
                        Un-seen invita lo spettatore ad andare oltre la superficie
                        delle immagini, per comprendere come nasce la narrazione
                        visiva contemporanea.
                    </p>
                </div>
            </div>

            <div class="huge-image-container">
                <img
                    src="/about-us.png"
                    alt="About Us"
                    class="huge-about-img"
                />
            </div>

            <div class="footer-names">
                <span>HERNANDEZ</span>
                <span>MARCOLIN</span>
                <span>PIZZIGONI</span>
                <span>ROSSI</span>
                <span>SACANNA</span>
            </div>
        </div>
    </div>
</div>

<style>
    .about-wrapper {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        overflow-x: hidden;
        overflow-y: auto;
        z-index: 9999;
        background: radial-gradient(
            circle at 50% 50%,
            #4a565e 0%,
            #293035 100%
        );
    }

    .about-container {
        height: 200vh;
        color: #ffffff;
        font-family: "Helvetica", sans-serif;
    }

    .sticky-content {
        position: sticky;
        top: 0;
        height: 100vh;
        width: 100%;
        display: flex;
        flex-direction: column;
        padding: var(--spacing-9, 40px);
        box-sizing: border-box;
        overflow: hidden;
    }

    .top-bar {
        display: flex;
        justify-content: flex-end;
        align-items: flex-start;
        z-index: 10;
    }

    .logo-img {
        height: 24px;
        object-fit: contain;
        filter: brightness(0) invert(1)
            drop-shadow(0 0 4px rgba(255, 255, 255, 0.3));
    }

    .close-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 50px;
        color: white;
        text-decoration: none;
        line-height: 0.8;
        padding: 0;
        transition: opacity 0.2s;
    }

    .close-btn:hover {
        opacity: 0.7;
    }

    .content-columns {
        display: flex;
        justify-content: space-between;
        flex-grow: 1;
        align-items: center;
        padding: 0 5%;
        gap: 8%;
        margin-top: -20px; /* Slight adjustment to center visually */
    }

    .col {
        flex: 1;
        will-change: filter, opacity;
    }

    .col h2 {
        font-family: var(--font-primary), "Akira Expanded", sans-serif;
        font-size: 28px;
        margin-bottom: 24px;
        font-weight: 900;
        letter-spacing: 1px;
        text-align: left;
        text-transform: uppercase;
    }

    .col p {
        font-size: 16px;
        line-height: 1.6;
        opacity: 0.9;
        text-align: left;
    }

    .huge-image-container {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 30px;
        width: 100%;
        padding: 5 0%;
    }

    .huge-about-img {
        width: 100%;
        height: auto;
        object-fit: contain;
    }

    .footer-names {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        font-weight: 900;
        text-transform: uppercase;
        padding: 0 2%;
        opacity: 0.9;
    }

    @media (max-width: 768px) {
        .content-columns {
            flex-direction: column;
            gap: 30px;
        }
        .col h2 {
            font-size: 20px;
        }
        .col p {
            font-size: 14px;
        }
        .huge-image-container {
            margin-bottom: 20px;
        }
    }
</style>
