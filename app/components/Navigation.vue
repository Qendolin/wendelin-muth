<template>
	<nav>
		<a v-for="item in items" :key="item.to" :href="item.to">{{ item.title }}</a>
	</nav>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'

export type NavItem = {
	title: string
	to: string
}

@Component({})
export default class Navigation extends Vue {
	@Prop({ type: Array, default: [] })
	public items!: NavItem[]
}
</script>

<style lang="scss" scoped>
nav {
	height: 100%;
	max-height: 100vh;
	position: sticky;
	top: 0;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding-inline: 2rem;

	* {
		padding-block: 1rem;
	}
}
</style>
