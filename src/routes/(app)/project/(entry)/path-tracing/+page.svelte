<script lang="ts">
  import Image from '$lib/components/Image.static.svelte';
  import Link from '$lib/components/Link.static.svelte';
</script>

<p>
  For the <em>Rendering</em> master's course at TU Vienna (2025SS), the assignments iteratively built up a full path tracer from scratch, starting with direct
  illumination only and ending with recursive and iterative path tracing, a BVH acceleration structure, multiple BSDFs, NEE, and MIS. I worked on it alone, got
  a
  <strong>Sehr Gut</strong>, and placed <strong>2nd out of all final renders</strong> that semester. You can find my final render in the <Link
    href="https://www.cg.tuwien.ac.at/courses/Rendering/HallOfFame/2025S">Hall of Fame</Link
  >. Due to copyright reasons I cannot share the code, so here are some renders instead. All rendering is CPU only, without GPU acceleration.
</p>

<h2>What I Learned</h2>
<p>
  This course gave me a solid grounding in the rendering equation and the math behind it. A few things really clicked during it. The change of variables and
  what it actually means geometrically. How MIS works and why it helps so much in scenes with both small bright lights and large diffuse ones. And probably the
  biggest conceptual unlock: that you can make almost any random choice in a Monte Carlo estimator and it stays unbiased, as long as you divide by the
  probability of that choice. Once that clicked, a lot of other techniques started making sense.
</p>
<p>
  The course also covered biased methods like photon mapping, which was interesting to contrast against the unbiased approach and think about when the tradeoff
  is worth it.
</p>

<h2>Renders</h2>

<div class="mx-auto table">
  <div class="inline-grid grid-cols-1 justify-center gap-4 md:grid-cols-2">
    <Image src="/img/project/path-tracing/suzanne.webp" alt="Suzanne render" caption="Depth of field, implemented as an optional assignment." w={500} h={500} />
    <Image src="/img/project/path-tracing/curtain.webp" alt="Curtain render" caption="A scatter BSDF used as a curtain material." w={500} h={500} />
    <Image
      src="/img/project/path-tracing/complex.webp"
      alt="Complex scene render"
      caption="A scene with mirror and dielectric materials, showcasing MIS and Russian roulette."
      w={500}
      h={500}
    />
    <Image src="/img/project/path-tracing/veach.webp" alt="Veach scene render" caption="A recreation of the classic Veach scene." w={500} h={500} />
  </div>
</div>

<h2>Final Render</h2>
<p>
  The final scene shows a vase of roses on a table, tipping over and splashing water. The only light source is a window in the background, partially obscured by
  curtains. The room has a rug, an armchair, and a clock. Most of the work went into making the roses look convincing. The petals and leaves use a
  single-scattering approximation for subsurface scattering, which works well since they are thin enough that full SSS would be overkill. I also used a sheen
  BSDF for the fabric and the fuzz on the roses. The fluid simulation took many hours of refinement to get right.
</p>

<Image src="/img/project/path-tracing/final-render.webp" alt="Final render" caption="Rendering of a custom scnene for the final assignment." />

<h2>Path Guiding</h2>
<p>
  I also implemented path guiding, based on two papers:
  <Link href="https://tom94.net/data/publications/mueller17practical/mueller17practical.pdf">
    "Practical Path Guiding for Efficient Light-Transport Simulation"
  </Link> by Müller et al. and its follow-up
  <Link href="https://tom94.net/data/courses/vorba19guiding/vorba19guiding-chapter10.pdf">"'Practical Path Guiding' in Production"</Link>. Path guiding tries to
  learn where light comes from as rendering progresses, and then biases new samples toward those directions to reduce noise. The spatial structure is a binary
  tree that subdivides wherever many ray hits accumulate. Each leaf of that tree holds a quadtree that records the incoming radiance distribution, with the axes
  mapping to polar angles. The quadtree refines itself each learning iteration, splitting nodes until their stored energy falls below a threshold. The whole
  structure is trained over several rounds, starting at 1 sample per pixel and doubling each iteration.
</p>

<Image
  src="/img/project/path-tracing/path-guiding.webp"
  alt="Path guiding structure visualization"
  caption="Visualization of the path guiding structure. The arrows show the dominant direction."
/>

<p>
  The implementation works, but performs worse than the standard path tracer on my test scene. I think I understand why. The scene has a small light source
  hidden behind two offset walls, each with a small hole, and the walls are not axis-aligned. Many spatial nodes end up straddling a wall, which means a single
  quadtree is being trained from two essentially uncorrelated sides of the same surface, so the directional distribution it learns is meaningless. A path
  guiding implementation that splits spatial cells based on directional variance rather than hit count would likely handle this better, but I did not have time
  to pursue that. The original paper's authors also note that their method increases noise in certain scenarios, so at least I am in good company.
</p>
