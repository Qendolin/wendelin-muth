<template>
	<form @submit="onSubmit" class="contact-form fill-w">
		<label>
			Absender
			<input v-model="sender" type="email" name="email" placeholder="max.muster@mail.com" />
		</label>
		<label>
			Betreff
			<input v-model="subject" type="text" name="subject"
		/></label>
		<label>
			Nachricht
			<textarea v-model="message" name="message" rows="5"></textarea>
		</label>
		<button type="submit">Senden</button>
	</form>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class ContactForm extends Vue {
	private sender: String = ''
	private subject: String = ''
	private message: String = ''

	onSubmit(ev: Event) {
		ev.preventDefault()
		console.log(this.sender, this.subject, this.message)
	}
}
</script>

<style lang="scss">
.contact-form {
	display: flex;
	flex-direction: column;
	max-width: 500px;
}
</style>
