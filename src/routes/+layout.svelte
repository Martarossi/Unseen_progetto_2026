<script>
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />

	<!-- Akira Expanded -->
	 <link href="https://db.onlinewebfonts.com/c/6fa591daa0aa2d0f845653486954aca5?family=Akira+Expanded" rel="stylesheet">
	<!-- Helvetica -->
	 <link rel="stylesheet" href="https://use.typekit.net/tsx2ihe.css">
	 
</svelte:head>

{@render children()}
