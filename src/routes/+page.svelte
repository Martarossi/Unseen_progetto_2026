<script>
  import Hero from "$lib/components/Hero.svelte";
  // import TopBar from '$lib/components/TopBar.svelte';
  //import Filters from '$lib/components/Filters.svelte';
  //import ProjectGrid from '$lib/components/ProjectGrid.svelte';
  //import { projects } from '$lib/data/projects.js';

  let selectedYear = $state(2026);

  function handleYearChange(year) {
    selectedYear = year;
  }
</script>

<svelte:head>
  <title>Web Design Lab - Politecnico di Milano</title>
  <meta
    name="description"
    content="Archive of the best outcomes from the Web Design Laboratory in Communication Design at Politecnico di Milano"
  />
</svelte:head>

<div class="page">
  <Hero />
  <!-- <TopBar /> -->
  <!-- <Filters {selectedYear} onYearChange={handleYearChange} /> -->
  <!-- <ProjectGrid {projects} {selectedYear} /> -->
</div>

<style>
  .page {
    background: var(--colors-background-primary);
    min-height: 100vh;
    position: relative;
    width: 100%;
    overflow-x: hidden;
  }
</style>
