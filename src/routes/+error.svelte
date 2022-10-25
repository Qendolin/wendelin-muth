<script>
  import { page } from '$app/stores';
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
</svelte:head>
<h1>Error {$page.status}</h1>
<details>
  <summary>Error Message</summary>
  <code style="display: block;">
    {$page.error?.message}
  </code>
</details>
<h2><a href="/">Go to Home</a></h2>
