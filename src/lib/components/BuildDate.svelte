<script>
  import { PUBLIC_BUILD_TIMESTAMP } from '$env/static/public';

  export const prerender = false;

  const date = new Date(Number(PUBLIC_BUILD_TIMESTAMP));

  const formatted = new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'medium'
  }).format(date);
</script>

{formatted}
