<script>
  import Link from '$lib/components/Link.svelte';
</script>

<p>
  Digi4school is an Austrian platform for digital school textbooks. Students activate books tied to their account and read them in the browser, but there is no
  official way to save them for offline use. During my time at <abbr title="Austrian vocational high school for engineering">HTL</abbr> I got tired of needing an
  internet connection just to study, so I wrote a small Node.js command line tool that downloads any activated book and saves it as a PDF.
</p>
<p>
  The tool is published on npm and can be installed via <code>npm install -g digi4offline</code>. The source is on
  <Link href="https://github.com/Qendolin/digi4offline">GitHub</Link>.
</p>

<h2>How It Works</h2>
<p>
  After authenticating with your digi4school credentials the tool fetches the pages of the requested book in parallel, with configurable concurrency and retry
  counts for both page and image requests. Pages are then assembled into a PDF and written to the output path. The book id comes straight from the URL of an
  open book in the browser, so finding the right one takes no effort at all.
</p>
<p>
  Page ranges are supported, so you can download a single chapter instead of an entire book. Ranges can be specified by index or by the printed page labels if
  those differ, which they often do when a book has a preface or an index section with separate numbering.
</p>
