<template>
	<main>
		<section>
			<h1>Heading 1</h1>
			<h2>Heading 2</h2>
			<h3>Heading 3</h3>
			<h4>Heading 4</h4>
			<h5>Heading 5</h5>
			<h6>Heading 6</h6>
		</section>
		<hr />
		<section>
			<p>
				Paragraph <br />
				Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
				dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
				clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet,
				consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed
				diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea
				takimata sanctus est Lorem ipsum dolor sit amet.
			</p>
		</section>
		<hr />
		<section>
			<form>
				<input placeholder="Input" />
				<input type="text" placeholder="Text Input" />
				<input type="search" placeholder="Search Input" />
				<input type="email" placeholder="Email Input" />
				<input type="tel" placeholder="Email Input" />
				<input type="url" placeholder="Url Input" />
				<input type="password" placeholder="Password Input" />
				<input type="number" placeholder="Number Input" />
				<input type="radio" name="radio" />
				<input type="radio" name="radio" />
				<input type="radio" name="radio" />
				<input type="checkbox" />
				<input type="date" />
				<input type="datetime-local" />
				<input type="month" />
				<input type="time" />
				<input type="week" />
				<input type="color" />
				<input type="range" />
				<input type="file" />
				<input type="image" value="Image Input" />
				<input type="reset" value="Reset Input" />
				<input type="submit" value="Submit Input" />
				<input type="button" value="Button Input" />
				<textarea cols="30" rows="10">Textarea</textarea>
			</form>
		</section>
		<hr />
		<section>
			<button>Button</button>
		</section>
	</main>
</template>

<script lang="ts">
export default {}
</script>

<style lang="scss" scoped>
$padding-md: 2rem;
section {
	padding: $padding-md;
}
</style>
