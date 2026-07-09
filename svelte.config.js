import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter({
			// 'index.html' collideva con l'index.html prerenderizzato per la route "/",
			// che veniva sovrascritto dal guscio SPA vuoto (vedi log di build:
			// "Overwriting build/index.html with fallback page"). Il risultato era che
			// il sito serviva sempre il guscio vuoto invece della pagina prerenderizzata
			// completa di CSS, causando un flash di contenuto non stilizzato al primo
			// caricamento. '200.html' è il nome convenzionale per il fallback SPA ed
			// evita la collisione.
			fallback: '200.html'
		})
	}
};

export default config;
