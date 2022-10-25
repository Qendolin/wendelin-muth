<script lang="ts">
  import { user } from '$lib/stores';

  let username: string;

  async function submit() {
    username = username.trim();

    if (username == null || username.length == 0) return;

    if (!confirm(`Are you sure you want to keep '${username}' as your username?`)) return;

    user.createUser(username);
  }
</script>

<form on:submit|preventDefault={submit}>
  <label>
    Choose a username to comment.<br />
    <input
      type="text"
      placeholder="Max Mustermann"
      required
      minlength="4"
      maxlength="16"
      bind:value={username}
    />
    <button type="submit">Submit</button> <br />
    <em>You cannot change your username afterwards!</em>
  </label>
</form>
