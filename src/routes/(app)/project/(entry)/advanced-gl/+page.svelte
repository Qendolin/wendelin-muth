<script>
  import Image from '$lib/components/Image.svelte';
  import Link from '$lib/components/Link.svelte';
</script>

<p>
  At the end of my third year at <abbr title="Austrian vocational high school for engineering">HTL</abbr> I wanted to build something proper with OpenGL.
  Inspired by javidx9's work I set out to write something similar to his
  <Link href="https://github.com/OneLoneCoder/olcPixelGameEngine">olcPixelGameEngine</Link>, a minimal self-contained framework for 2D rendering, in Go.
</p>
<p>
  It never reached a finished state, but it got further than most of my abandoned projects. The text side was the most developed part: MSDF font rendering
  handled glyph rendering with wrapping and kerning support, and a 2D sprite and layout system sat on top. The most unusual piece was a 3D text generator.
  Marching squares extracted glyph outlines, Connected-Component Labeling identified which regions were interior faces, and earcut triangulated everything into
  a renderable mesh. Eventually it became clear that building a framework without a concrete use case to drive it would not lead anywhere. But it was a good
  learning exercise. The source is on
  <Link href="https://github.com/Qendolin/go-printpixel">GitHub</Link>.
</p>

<div class="mx-auto table">
  <div class="inline-grid grid-cols-1 justify-center gap-4 md:grid-cols-2">
    <Image
      src="/img/project/advanced-gl/msdf-text-wrap.webp"
      h={500}
      alt="2D text layout with MSDF font rendering"
      caption="2D text layout with MSDF font rendering and kerning."
    />
    <Image
      src="/img/project/advanced-gl/3d-text.webp"
      h={500}
      alt="3D text generated from glyph outlines"
      caption="3D text generated using marching squares, Connected-Component Labeling, and earcut triangulation."
    />
  </div>
</div>

<h2>Deferred Renderer</h2>

<Image
  src="/img/project/advanced-gl/hero.webp"
  alt="Customized Sponza scene rendered with the deferred renderer"
  caption="The customized Sponza scene rendered with the deferred renderer."
/>

<p>
  In the summer of 2022, shortly before starting at TU Wien, I began a new project and returned to 3D rendering for the first time since a simple forward
  renderer I had written in Java years earlier, when I barely had any idea what I was doing. The goal this time was to implement deferred rendering properly,
  starting from the <Link href="https://learnopengl.com/Advanced-Lighting/Deferred-Shading">learnopengl.com deferred shading guide</Link> and rendering a customized
  version of the Sponza scene. The source for this project and the PBR renderer below is on <Link href="https://github.com/Qendolin/advanced-gl">GitHub</Link>.
</p>
<p>
  The G-buffer stored rgb8 albedo, rg16_snorm view space normals, rgb16f view space position, and an r8 AO channel. I was not trying to be efficient with the
  layout, and it shows. Shading was diffuse only and supported point, spot, and directional lights. Each light was rendered by drawing a bounding mesh covering
  its area of influence, which caused many fragments to be shaded multiple times and was quite wasteful in practice. Scene data was loaded using a custom format
  exported from Blender via a small export plugin I wrote.
</p>
<p>
  I added SSAO for the first time, following <Link href="https://learnopengl.com/Advanced-Lighting/SSAO">the learnopengl guide</Link>. For shadows there was a
  single shadow map with PCF filtering based on the
  <Link href="https://developer.nvidia.com/gpugems/gpugems/part-ii-lighting-and-shadows/chapter-11-shadow-map-antialiasing"
    >GPU Gems chapter 11.4 technique</Link
  >. Bloom was implemented from the
  <Link href="https://www.iryoku.com/next-generation-post-processing-in-call-of-duty-advanced-warfare/"
    >Call of Duty: Advanced Warfare post-processing presentation</Link
  >, which describes the dual-filter pyramid approach, and this happened to be before the equivalent learnopengl article was published.
</p>

<h2>PBR and Image-Based Lighting</h2>
<p>
  Once I was satisfied with the deferred renderer in spring 2023 I started a follow-up project. The goal this time was physically based rendering, for which
  deferred rendering offered no particular advantage, so I switched back to a simpler forward pipeline and built on a large amount of code carried over from the
  first project. I started with basic PBR shading following the
  <Link href="https://learnopengl.com/PBR/Theory">learnopengl PBR series</Link> and the
  <Link href="https://google.github.io/filament/Filament.html#materialsystem">Filament documentation</Link>, then layered on IBL with diffuse irradiance and
  specular radiance. I even wrote my own cubemap convolver with OpenCL. Last came parallax corrected cubemaps, which fix the directional inaccuracy of
  environment reflections in enclosed spaces by reprojecting the sample direction against a local bounding volume. The implementation drew on writing by
  <Link href="https://seblagarde.wordpress.com/2012/09/29/image-based-lighting-approaches-and-parallax-corrected-cubemap/">Sébastien Lagarde</Link>,
  <Link href="https://c0de517e.blogspot.com/2015/03/being-more-wrong-parallax-corrected.html">Angelo Pesce</Link>, and
  <Link href="https://interplayoflight.wordpress.com/2013/04/29/parallax-corrected-cubemapping-with-any-cubemap/">Kostas Anagnostou</Link>.
</p>

<div class="mx-auto table">
  <div class="inline-grid grid-cols-1 justify-center gap-4 md:grid-cols-2">
    <Image src="/img/project/advanced-gl/pcc-1.webp" alt="Parallax corrected cubemap reflections" caption="" />
    <Image src="/img/project/advanced-gl/pcc-2.webp" alt="Parallax corrected cubemap reflections" caption="" />
    <Image src="/img/project/advanced-gl/pcc-3.webp" alt="Parallax corrected cubemap reflections" caption="" />
    <Image src="/img/project/advanced-gl/pcc-4.webp" alt="Parallax corrected cubemap reflections" caption="" />
  </div>
</div>

<h2>Looking Back</h2>
<p>
  These two projects are where I became genuinely comfortable with modern OpenGL. Working through deferred rendering, shadow maps, SSAO, PBR, IBL, and parallax
  corrected cubemaps gave me a solid enough foundation that I felt confident taking on something much more ambitious. That confidence carried directly into <Link
    href="./ascent">Ascent</Link
  >. In October 2023 I started the <em>Fundamentals of Computer Graphics</em> bachelor's course at TU Wien, where I first encountered Vulkan and C&NoBreak;+&NoBreak;+.
  Ascent came the semester after that.
</p>
