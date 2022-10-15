<template src="./privacy.html"></template>

<script lang="ts">
export default {}
</script>

<style lang="scss" scoped>
#main {
	max-width: 800px;

	h2 {
		margin-block-start: 2rem;
		counter-increment: section;
		&::before {
			content: counter(section, upper-roman) '. ';
		}
	}

	nav {
		> ul {
			list-style: upper-roman;
		}
	}
}
</style>
