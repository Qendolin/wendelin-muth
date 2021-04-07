<template>
	<div id="__root">
		<Nuxt id="main" role="main" />
		<aside>
			<Navigation :items="items" />
		</aside>
		<footer>
			<NuxtLink to="/privacy">Datenschutzerkärung</NuxtLink>
			<NuxtLink to="/imprint">Impressum</NuxtLink>
		</footer>
	</div>
</template>

<script lang="ts">
import { NavItem } from 'components/Navigation.vue'

export default {
	data: () => {
		return {
			items: [
				{
					to: '/',
					title: 'Home',
				},
				{
					to: '/style',
					title: 'Style',
				},
				{
					to: '/about',
					title: 'About',
				},
			] as NavItem[],
		}
	},
}
</script>

<style lang="scss">
#main {
	width: 90%;
	margin-inline: auto;
	grid-area: main;
}

#__root {
	display: grid;
	grid-template-areas: 'main nav' 'footer nav';
	grid-template-columns: 1fr max-content;
	grid-template-rows: minmax(100vh, 1fr) max-content;

	aside {
		grid-area: nav;
	}

	footer {
		grid-area: footer;
		display: flex;
		justify-content: center;
		padding-block: 0.5rem;
		font-size: 10px;
		gap: 1rem;

		a {
			color: gray;
		}
	}
}
</style>
