<template>
	<div id="__root">
		<Nuxt />
		<aside>
			<Navigation :items="items" />
		</aside>
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

<style>
main {
	width: 90%;
	margin: auto;
}

#__root {
	display: grid;
	grid-template-columns: 1fr max-content;
}
</style>
