<script lang="ts">
  interface Props {
    url: string;
    height: number;
    theme?: 'dark' | 'light';
    embedStyle?: 'subreddit-first' | 'post-first';
  }

  let { url, height, theme = $bindable('dark'), embedStyle = 'subreddit-first' }: Props = $props();

  let embedUrl = $derived(`${url.replace('www.reddit.com', 'embed.reddit.com')}?embed=true&style=${embedStyle}&theme=${theme}`);
</script>

<iframe
  src={embedUrl}
  {height}
  width="600"
  scrolling="no"
  allowfullscreen
  sandbox="allow-scripts allow-same-origin allow-popups"
  title="Reddit Embed"
  style="border: medium; max-width: 100%; border-radius: 8px; display: block; margin: 0px auto;"
></iframe>
