<script>
    import { onMount, onDestroy, tick } from "svelte";
    import gsap from "gsap";
    import ScrollTrigger from "gsap/dist/ScrollTrigger";

    let { closeOverlay } = $props();

    /** @type {HTMLElement|null} */
    let aboutWrapperEl = $state(null);
    /** @type {HTMLElement|null} */
    let leftColumn = null;
    /** @type {HTMLElement|null} */
    let rightColumn = null;
    /** @type {HTMLElement|null} */
    let footerNamesEl = null;
    let opening = $state(false);
    let closing = $state(false);

    const FOCUSED = { filter: "blur(0px)",  opacity: 1,    duration: 0.4, ease: "power2.out" };
    const BLURRED = { filter: "blur(14px)", opacity: 0.35, duration: 0.4, ease: "power2.out" };

    function onEnterLeft()  { gsap.to(leftColumn,  FOCUSED); }
    function onLeaveLeft()  { gsap.to(leftColumn,  BLURRED); }
    function onEnterRight() { gsap.to(rightColumn, FOCUSED); }
    function onLeaveRight() { gsap.to(rightColumn, BLURRED); }

    async function handleClose() {
        if (closing) return;
        closing = true;
        await new Promise(r => setTimeout(r, 650));
        closeOverlay();
    }

    /** @type {any[]} */
    const scrollTriggers = [];

    onMount(async () => {
        await tick();
        opening = true;

        if (window.matchMedia('(max-width: 799px)').matches) {
            gsap.registerPlugin(ScrollTrigger);

            const sections = [leftColumn, rightColumn, footerNamesEl].filter(Boolean);

            // Stato iniziale
            gsap.set(leftColumn, { filter: 'blur(0px)', opacity: 1 });
            gsap.set(rightColumn, { filter: 'blur(6px)', opacity: 0.45 });
            gsap.set(footerNamesEl, { filter: 'blur(6px)', opacity: 0.45 });

            // Animazione per il secondo paragrafo (rightColumn)
            const animRight = gsap.fromTo(rightColumn,
                { filter: 'blur(6px)', opacity: 0.45 },
                {
                    filter: 'blur(0px)',
                    opacity: 1,
                    scrollTrigger: {
                        trigger: ".sticky-content",
                        scroller: aboutWrapperEl,
                        start: "top+=30 top",
                        end: "top+=180 top",
                        scrub: true
                    }
                }
            );
            if (animRight.scrollTrigger) scrollTriggers.push(animRight.scrollTrigger);

            // Animazione per il footer names
            const animFooter = gsap.fromTo(footerNamesEl,
                { filter: 'blur(6px)', opacity: 0.45 },
                {
                    filter: 'blur(0px)',
                    opacity: 1,
                    scrollTrigger: {
                        trigger: ".sticky-content",
                        scroller: aboutWrapperEl,
                        start: "top+=180 top",
                        end: "top+=350 top",
                        scrub: true
                    }
                }
            );
            if (animFooter.scrollTrigger) scrollTriggers.push(animFooter.scrollTrigger);
        } else {
            // Desktop: blur su hover
            gsap.set(leftColumn,  { filter: "blur(14px)", opacity: 0.35 });
            gsap.set(rightColumn, { filter: "blur(14px)", opacity: 0.35 });
        }
    });

    onDestroy(() => {
        scrollTriggers.forEach(st => {
            if (st) st.kill();
        });
    });
</script>

<div class="about-wrapper" bind:this={aboutWrapperEl} class:opening={opening && !closing} class:closing>
    <div class="about-container">
        <div class="sticky-content">

            <!-- Top bar -->
            <div class="top-bar">
                <div class="top-bar-logo">
                    <img src="/topbarunseen.svg" alt="Unseen logo" />
                </div>
                <button
                    class="close-btn"
                    onclick={handleClose}
                    aria-label="Close"
                >&times;</button>
            </div>

            <!-- Two-column text area -->
            <div class="content-columns">
                <div
                    class="col left-col"
                    bind:this={leftColumn}
                    role="region"
                    onmouseenter={onEnterLeft}
                    onmouseleave={onLeaveLeft}
                >
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

                <div
                    class="col right-col"
                    bind:this={rightColumn}
                    role="region"
                    onmouseenter={onEnterRight}
                    onmouseleave={onLeaveRight}
                >
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

            <!-- Full-width image -->
            <div class="huge-image-container">
                <img
                    src="/about-us.png"
                    alt="About Us"
                    class="huge-about-img"
                />
            </div>

            <!-- Footer names — tutto dentro lo stesso div -->
            <div class="footer-names">
                <div class="footer-person">
                    <a href="https://www.instagram.com/dylanmeendez/" target="_blank" rel="noopener noreferrer">DYLAN HERNANDEZ</a>
                    <a href="https://mail.google.com/mail/?view=cm&amp;to=dh.mendez33@gmail.com" class="footer-phone" target="_blank" rel="noopener noreferrer">Mail: dh.mendez33@gmail.com</a>
                </div>
                <div class="footer-person">
                    <a href="https://www.instagram.com/denimarcolin/" target="_blank" rel="noopener noreferrer">DENISE MARCOLIN</a>
                    <a href="https://mail.google.com/mail/?view=cm&amp;to=deni.marcolin@gmail.com" class="footer-phone" target="_blank" rel="noopener noreferrer">Mail: deni.marcolin@gmail.com</a>
                </div>
                <div class="footer-person">
                    <a href="https://www.instagram.com/richi_pizzi/" target="_blank" rel="noopener noreferrer">RICCARDO PIZZIGONI</a>
                    <a href="https://mail.google.com/mail/?view=cm&amp;to=richipizzi04@gmail.com" class="footer-phone" target="_blank" rel="noopener noreferrer">Mail: richipizzi04@gmail.com</a>
                </div>
                <div class="footer-person">
                    <a href="https://www.instagram.com/martarossi_9/" target="_blank" rel="noopener noreferrer">MARTA ROSSI</a>
                    <a href="https://mail.google.com/mail/?view=cm&amp;to=marta2005rossi@gmail.com" class="footer-phone" target="_blank" rel="noopener noreferrer">Mail: marta2005rossi@gmail.com</a>
                </div>
                <div class="footer-person">
                    <a href="https://www.instagram.com/___.dxvide._/" target="_blank" rel="noopener noreferrer">DAVIDE SACANNA</a>
                    <a href="https://mail.google.com/mail/?view=cm&amp;to=davidesacanna@gmail.com" class="footer-phone" target="_blank" rel="noopener noreferrer">Mail: davidesacanna@gmail.com</a>
                </div>
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
        background-image: url('/sfondo-About.png');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        clip-path: circle(0% at calc(100% - 130px) 50px);
        transition: clip-path 0.6s ease-out;
    }

    .about-wrapper.opening {
        clip-path: circle(150% at calc(100% - 130px) 50px);
    }

    .about-wrapper.closing {
        clip-path: circle(0% at calc(100% - 130px) 50px);
        pointer-events: none;
        transition: clip-path 0.6s ease-in;
    }

    .about-container {
        height: 200vh;
        color: #F8F8F8;
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

    /* ── Top bar ── */
    .top-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        z-index: 10;
    }

    .top-bar-logo img {
        height: 16px;
        width: auto;
        display: block;
    }

    .close-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 50px;
        color: white;
        line-height: 0.8;
        padding: 0;
        transition: opacity 0.2s;
    }

    .close-btn:hover {
        opacity: 0.7;
    }

    /* ── Two columns ── */
    .content-columns {
        display: flex;
        justify-content: space-between;
        flex-grow: 1;
        align-items: center;
        padding: 0 5%;
        gap: 8%;
        margin-top: -20px;
    }

    .col {
        flex: 1;
        will-change: filter, opacity;
    }

    .col h2 {
        font-family: 'Akira Expanded', 'Arial Black', sans-serif;
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

    /* ── Image ── */
    .huge-image-container {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 30px;
        width: 100%;
    }

    .huge-about-img {
        width: 92%;
        height: auto;
        object-fit: contain;
    }

    /* ── Footer names ── */
    .footer-names {
        font-family: 'Akira Expanded', 'Arial Black', sans-serif;
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        font-weight: 900;
        text-transform: uppercase;
        padding: 0 6% 0 4%;
        opacity: 0.9;
    }

    .footer-person {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .footer-names a {
        color: inherit;
        text-decoration: none;
        transition: opacity 0.2s;
    }

    .footer-names a:hover {
        opacity: 0.6;
    }

    .footer-phone {
        font-size: 15px;
        font-weight: 400;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        letter-spacing: 0.5px;
        opacity: 0.6;
        text-transform: none;
    }
    
    /* ── Mobile ── */
    @media (max-width: 799px) {
        .about-container {
            height: auto;
        }

        /* Utilizziamo flexbox column per riordinare gli elementi e portarli in alto */
        .sticky-content {
            position: relative;
            height: auto;
            overflow: visible;
            padding: 90px 24px 40px;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
        }

        .top-bar {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 24px;
            z-index: 100;
            background: linear-gradient(to bottom, rgba(0, 0, 0, 0.75) 0%, transparent 100%);
            box-sizing: border-box;
        }

        .top-bar-logo img {
            height: 14px;
            width: auto;
            display: block;
        }

        .close-btn {
            font-size: 40px;
        }

        /* "ABOUT US" in alto (ordine 1) */
        .huge-image-container {
            order: 1;
            position: relative;
            bottom: auto;
            left: auto;
            width: 100%;
            z-index: 10;
            margin: 10px 0 20px;
            pointer-events: auto;
            display: flex;
            justify-content: flex-start;
        }

        .huge-about-img {
            width: 100%;
            max-width: 320px;
            margin: 0;
            height: auto;
            display: block;
        }

        /* Colonne di testo (ordine 2) */
        .content-columns {
            order: 2;
            display: flex;
            flex-direction: column;
            gap: 20px; /* avvicina i paragrafi */
            margin-top: 0;
            padding: 0;
        }

        /* I paragrafi non occupano più 100vh ciascuno e fluiscono naturalmente */
        .col {
            min-height: auto;
            width: 100%;
            box-sizing: border-box;
            padding: 0;
            display: block;
            /* Rimuoviamo !important per permettere a GSAP di animarli */
        }

        .col h2 {
            font-size: 24px;
            margin-bottom: 12px;
            margin-top: 15px;
        }

        .col p {
            font-size: 15px;
            line-height: 1.6;
        }

        .col p br {
            display: none;
        }

        /* Nomi footer in fondo (ordine 3), allineati a sinistra */
        .footer-names {
            order: 3;
            min-height: auto;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
            padding: 30px 0 50px;
            text-align: left;
            gap: 24px;
            flex-wrap: nowrap;
            font-size: 15px;
        }

        .footer-person {
            align-items: flex-start;
        }

        .footer-phone {
            font-size: 12px;
        }
    }
</style>