<script>
	import { tick } from "svelte";
	import favicon from "$lib/assets/favicon.svg";
	import NavBar from "$lib/components/Navbar.svelte";
	import About from "$lib/components/About.svelte";

	let { children } = $props();
	let showAboutOverlay = $state(false);
	let animateAboutOpen = $state(false);

	async function openAbout() {
		animateAboutOpen = true;
		await tick();
		showAboutOverlay = true;
	}

	function closeAbout() {
		showAboutOverlay = false;
		animateAboutOpen = false;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />

	<!-- Akira Expanded -->
	<link href="https://fonts.cdnfonts.com/css/akira-expanded" rel="stylesheet">
	<!-- Helvetica -->
	<link rel="stylesheet" href="https://use.typekit.net/tsx2ihe.css" />
</svelte:head>

<NavBar onOpenAbout={openAbout} />

{#if animateAboutOpen}
	<div class="about-open-transition" class:active={showAboutOverlay}></div>
{/if}

{#if showAboutOverlay}
	<About closeOverlay={closeAbout} />
{/if}

{@render children()}

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}

	.about-open-transition {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		pointer-events: none;
		z-index: 60;
		background: radial-gradient(circle at calc(100% - 130px) 50px, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.03) 30%, transparent 60%);
		clip-path: circle(0% at calc(100% - 130px) 50px);
		transition: clip-path 0.55s ease-out;
	}

	.about-open-transition.active {
		clip-path: circle(150% at calc(100% - 130px) 50px);
	}
</style>
