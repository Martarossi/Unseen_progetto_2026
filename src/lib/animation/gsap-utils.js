/**
 * gsap-utils.js
 * Helper centralizzato per inizializzare GSAP e registrare i plugin.
 *
 * IMPORTANTE: Dal 2025, ScrollTrigger è gratuito nel piano free di GSAP.
 * Non serve nessuna licenza Club GSAP per usarlo.
 *
 * Perché centralizzare qui?
 * - `gsap.registerPlugin()` va chiamato una sola volta nell'app.
 * - Avere un singolo punto di import previene errori di "plugin registrato due volte".
 * - In SvelteKit, i moduli vengono importati una volta sola grazie all'ES module cache.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Registra ScrollTrigger una volta sola.
// Tutti i componenti possono importare gsap direttamente dopo che questo modulo è caricato.
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

/**
 * Crea una configurazione ScrollTrigger standard per le rivelazioni on-scroll.
 * Riutilizzabile nei componenti per evitare ripetizione di configurazione.
 *
 * @param {Element} trigger - L'elemento che attiva l'animazione
 * @param {Object} overrides - Opzioni aggiuntive per sovrascrivere i default
 */
export function scrollRevealConfig(trigger, overrides = {}) {
	return {
		trigger,
		start: 'top 80%',   // parte quando il trigger è all'80% della viewport
		end:   'bottom 20%',
		toggleActions: 'play none none reverse', // play in avanti, reverse indietro
		...overrides
	};
}
