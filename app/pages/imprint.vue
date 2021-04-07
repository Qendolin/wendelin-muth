<template>
	<main>
		<h1>Impressum</h1>
		<p>
			Informationspflicht laut §5 E-Commerce Gesetz, §14 Unternehmensgesetzbuch, §63 Gewerbeordnung und
			Offenlegungspflicht laut §25 Mediengesetz.
		</p>
		<br />
		<address>
			<strong :id="$id('name')">Name </strong>
			<span :aria-labelledby="$id('name')">Wendelin Muth</span><br />
			<strong :id="$id('location')">Ort </strong>
			<span :aria-labelledby="$id('location')">1230 Wien, Österreich</span><br />
			<strong :id="$id('email')">E-Mail</strong>
			<a :aria-labelledby="$id('email')" href="mailto:wendelin.muth@gmail.com">wendelin.muth@gmail.com</a>
		</address>
	</main>
</template>

<script lang="ts">
export default {}
</script>

<style lang="scss" scoped>
address {
	display: grid;
	grid-template-columns: max-content max-content 0;
	gap: 0.5rem;
}
</style>
