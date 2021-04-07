<template>
	<nav role="navigation">
		<NuxtLink v-for="item in items" :key="item.to" :to="item.to" tabindex="1">{{ item.title }}</NuxtLink>
	</nav>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'

export type NavItem = {
	title: string
	to: string
}

@Component
export default class Navigation extends Vue {
	@Prop({ type: Array, default: [] })
	public items!: NavItem[]
}
</script>

<style lang="scss" scoped>
@use '~/assets/css/colors';

nav {
	height: 100%;
	max-height: 100vh;
	position: sticky;
	top: 0;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	overflow: hidden;

	a {
		display: inline-block;
		padding-block: 1rem;
		padding-left: 2rem;
		padding-right: 2rem + 1.5rem;
		width: 100%;
		transition: transform 0.5s;
		font-size: 2rem;
		color: colors.$text;
		text-decoration: none;
		position: relative;

		&::after {
			content: '';
			position: absolute;
			bottom: 1rem;
			left: 1.5rem;
			width: 200%;
			border-bottom: 1pt solid;
		}

		&:focus {
			outline: none;
		}

		&:hover,
		&:focus,
		&:focus-within {
			transform: translateX(-1rem);
		}

		&.nuxt-link-exact-active {
			transform: translateX(-1.5rem);
		}
	}
}
</style>
