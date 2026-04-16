<script>
  import Image from '$lib/components/Image.svelte';
  import Link from '$lib/components/Link.svelte';
</script>

<p>
  Anyone who has run a large Minecraft modpack has been there. The game crashes, the log is unhelpful, and you have a hundred mods to blame. The usual approach
  is to manually disable half your mods, try again, and repeat until you find the culprit. It works, but it is tedious and easy to get wrong. I wrote this tool
  to automate that process properly.
</p>
<p>
  The source and prebuilt binaries for Windows, Linux, and macOS are on <Link href="https://github.com/Qendolin/fabric-mod-bisect-tool">GitHub</Link>.
</p>

<h2>How It Works</h2>
<p>
  The core of the tool is a bisection search. It splits the pool of candidate mods in half, asks you to run the game and report whether the issue occurred, then
  eliminates whichever half is clean. Each round cuts the search space in half, so even a modpack with hundreds of mods converges to a result in a handful of
  steps. The user interface walks you through each test one at a time, so there is no guesswork involved.
</p>
<p>
  One thing that makes this more than a simple binary search is dependency handling. Mods often require other mods to be present, and naively enabling a subset
  of mods can produce crashes that are unrelated to the actual conflict. The tool includes a dependency resolver that automatically activates any required
  dependencies when a mod is selected for testing, keeping each test valid. It also reads bundled JARs so that if a conflict is caused by a library shipped
  inside another mod, the tool still points to the right culprit.
</p>
<p>
  Some conflicts only surface when two or more mods are active together. The bisection engine handles this by continuing to narrow down the candidate set until
  it isolates the exact combination responsible. After a conflict is found, the tool can set those mods aside and resume searching the rest of the pool, finding
  any number of separate, unrelated conflicts in one session.
</p>

<h2>Managing the Search</h2>
<p>
  The tool gives you fine-grained control over which mods participate in the search. A mod can be force-enabled if it must always be present for the issue to
  reproduce, force-disabled if you already know it is safe to exclude, or omitted to remove it from the candidate pool while still allowing the resolver to
  activate it as a dependency for other mods. A history page logs every test and its outcome so you can review how the tool arrived at its conclusion, and a
  live log page exposes internal diagnostics for bug reports.
</p>
<p>
  The tool also supports a dependency override file for cases where a mod's metadata is missing or incorrect. Overrides can be placed next to the executable, in
  the Minecraft config folder, or left to the tool's own built-in list, with a clear priority order between them.
</p>

<div class="mx-auto table">
  <div class="inline-grid grid-cols-1 justify-center gap-4 md:grid-cols-2">
    <Image
      src="/img/project/fabric-mod-bisect/setup-page.webp"
      alt="Setup screen where the mods folder is loaded"
      caption="The setup screen, where the mods folder is loaded and analyzed before the search begins."
    />
    <Image
      src="/img/project/fabric-mod-bisect/main-page-start.webp"
      alt="Main screen showing the candidate mod list"
      caption="The main screen, showing the current candidates and controls for starting a test."
    />
    <Image
      src="/img/project/fabric-mod-bisect/test-page.webp"
      alt="Test in progress screen"
      caption="The test screen, shown while a specific subset of mods is enabled and the game is running."
    />
    <Image
      src="/img/project/fabric-mod-bisect/result-page.webp"
      alt="Result screen showing the conflicting mods"
      caption="The result screen, listing the conflicting mods and offering the option to continue searching for further conflicts."
    />
  </div>
</div>
