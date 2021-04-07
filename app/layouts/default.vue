<template>
	<div id="__root">
		<Nuxt role="main" />
		<aside>
			<Navigation :items="items" />
		</aside>
		<footer>
			<NuxtLink to="/privacy">Datenschutzerkärung</NuxtLink>
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
#__root {
	display: grid;
	grid-template-areas: 'main nav' 'footer nav';
	grid-template-columns: 1fr max-content;
	grid-template-rows: minmax(100vh, 1fr) max-content;

	main {
		width: 90%;
		margin: auto;
		grid-area: main;
	}

	aside {
		grid-area: nav;
	}

	footer {
		grid-area: footer;
		display: flex;
		justify-content: center;
		padding-block: 0.5rem;
		font-size: 10px;

		a {
			color: gray;
		}
	}
}
</style>
