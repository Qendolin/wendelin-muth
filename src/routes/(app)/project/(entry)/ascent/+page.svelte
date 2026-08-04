<script>
  import Link from '$lib/components/Link.static.svelte';
  import Image from '$lib/components/Image.static.svelte';
  import ImageCompare from '$lib/components/ImageCompare.svelte';
</script>

<p>
  <Link href="https://github.com/Qendolin/ptvc24-ascent">Source Code</Link>
</p>

<p>
  Before this I had built a deferred renderer in Go: OpenGL 4.5, a single shadow map, physically based bloom, material batching, and PBR shading. It covered the
  fundamentals but was not a game and was not written in C&NoBreak;+&NoBreak;+. This project was a test of how much of that knowledge I could carry over, and a
  first real attempt at C&NoBreak;+&NoBreak;+ at the same time. The course required raw OpenGL or Vulkan, no frameworks, which suited what I wanted to do
  anyway. I chose OpenGL over Vulkan since I had only started learning Vulkan one semester earlier in the <em>Fundamentals of Computer Graphics</em> course, and being
  new to C&NoBreak;+&NoBreak;+ at the same time was already challenge enough. I also wanted to build something genuinely good, and I knew that I could only do that
  in OpenGL.
</p>
<p>
  For the <em>Programmiertechniken für Visual Computing</em> bachelor's course at TU Vienna (2024), the task was to build a real-time 3D game from scratch with
  a set of required rendering effects. I ended up going well past the minimum. We received a <strong>Sehr Gut</strong> and the project is listed on the
  <Link href="https://www.cg.tuwien.ac.at/courses/PTVC/HallOfFame/2024S">course Hall of Fame</Link>.
</p>

<h2>The Game</h2>
<p>
  The course is set on a mountain island. You fly through it wingsuit-style, threading checkpoint rings as fast as possible and racing against your own best
  time. Controls are minimal: mouse to look, Shift to boost. At full boost foreground objects like the goal rings streak past. Checkpoint propellers spin, some
  obstacles move, and there is a stack of physics boxes on the hillside that reacts to the player flying through it. The race timer and boost meter live in a
  HUD built with <Link href="https://github.com/immediate-mode-ui/nuklear">Nuklear</Link>. Finishing the course shows a performance graph alongside your
  previous best time.
</p>

<iframe
  src="https://www.youtube-nocookie.com/embed/yGkNzov98J8?si=S3ihEG-WczRJ8jVD"
  title="YouTube video player"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  referrerpolicy="strict-origin-when-cross-origin"
  class="aspect-video w-full"
  allowfullscreen
></iframe>

<h2>Rendering</h2>

<h3>Scene Rendering and Material Batching</h3>
<p>
  The scene is rendered with a very small number of draw calls by batching geometry by material. When the glTF file is loaded, meshes are split into sections
  (primitives that share a material) and sorted so that all sections using the same material are contiguous in the vertex and element buffers. A draw command is
  recorded for each section, and all commands sharing a material are grouped into a batch. The entire scene is then rendered with a single
  <code>glMultiDrawElementsIndirect</code> call per material, pulling draw parameters directly from a GPU-side buffer. Instancing is handled in the same pipeline:
  per-object data such as the transformation matrix lives in a separate vertex buffer with an attribute divisor, so instanced objects cost nothing extra.
</p>

<Image
  src="https://raw.githubusercontent.com/Qendolin/ptvc24-ascent/refs/heads/main/docs/resources/Batching-Indirect_Drawing.svg"
  alt="Diagram of the material batching and indirect drawing approach"
  w={600}
  caption="The material batching and indirect drawing approach used in the renderer."
/>

<h3>Modern OpenGL</h3>
<p>
  The renderer uses a set of OpenGL 4.5 features that most tutorials never reach. Direct State Access lets you operate on objects directly by name rather than
  having to bind them first, which both eliminates redundant state changes and gives the API a cleaner, more object-oriented shape. Shaders are compiled as
  separate programs and linked into pipeline objects. Storage buffers use immutable storage, and vertex attributes use the separate attribute format API, which
  decouples the attribute layout description from the buffer binding and gives more flexibility in how data is arranged.
</p>

<h3>Physically Based Shading and Image-Based Lighting</h3>
<p>
  Materials follow the PBR metallic-roughness model, with albedo, normal, roughness, metallic, and occlusion maps loaded from the glTF files. The shading
  implementation draws on the
  <Link href="https://google.github.io/filament/Filament.html#materialsystem">Filament rendering engine's documentation</Link>, which covers the full
  derivation. Indirect lighting comes from a precomputed environment map stored in a custom <code>.iblenv</code> format bundling diffuse irradiance and specular radiance,
  compressed with LZ4. The split-sum approximation handles the specular integration. Having IBL from the start meant the scene looked physically grounded even before
  any direct lights were added.
</p>

<ImageCompare
  before="/img/project/ascent/ambient-constant.webp"
  after="/img/project/ascent/ambient-ibl.webp"
  altBefore="Scene with constant ambient lighting"
  altAfter="Scene with image-based lighting"
  captionBefore="With constant ambient lighting, the scene looks flat and materials look less realistic."
  captionAfter="With image-based lighting, the environment contributes realistic diffuse and specular light that gives the scene more depth especially for normal maps."
/>

<h3>Depth Setup</h3>
<p>
  The depth buffer uses a
  <Link href="https://developer.nvidia.com/content/depth-precision-visualized">reversed-Z infinite projection</Link>: the far plane maps to 0 and the near plane
  to 1, with no explicit far clip. Reversing the mapping redistributes floating-point precision toward the distance rather than concentrating it near the
  camera, which made a noticeable difference to z-fighting on the large terrain.
</p>

<h3>Cascaded Shadow Maps</h3>
<p>
  The sun is the only light source in the scene and uses cascaded shadow maps fitted to the view frustum. Filtering uses the
  <Link href="https://developer.nvidia.com/gpugems/gpugems/part-ii-lighting-and-shadows/chapter-11-shadow-map-antialiasing"
    >4-sample PCF technique from GPU Gems</Link
  >, combined with normal-offset biasing to avoid the disconnected-shadow artifact that constant depth bias introduces on steep surfaces. I later revisited this
  implementation for <Link href="./city-lights">City Lights</Link>, where the cascade fitting and culling logic was substantially improved.
</p>

<h3>Ground Truth Ambient Occlusion</h3>
<p>
  Ambient occlusion uses the
  <Link href="https://www.activision.com/cdn/research/Practical_Real_Time_Strategies_for_Accurate_Indirect_Occlusion_NEW%20VERSION_COLOR.pdf"
    >GTAO algorithm</Link
  >, which takes a horizon-based approach and produces a closer approximation to ground-truth AO than SSAO at comparable sample counts. It was the most
  difficult effect to implement, largely because the reference paper assumes significant background knowledge and public implementations were scarce at the
  time. I later revisited and improved this for <Link href="./city-lights">City Lights</Link>.
</p>

<ImageCompare
  before="/img/project/ascent/gtao-off.webp"
  after="/img/project/ascent/gtao-on.webp"
  altBefore="Scene without ambient occlusion"
  altAfter="Scene with GTAO ambient occlusion"
  captionBefore="Without ambient occlusion, the scene looks flat and the shapes of objects are less clear."
  captionAfter="With GTAO, crevices in the terrain and around obstacles receive occlusion, which gives the scene more depth and makes shapes more readable."
/>

<h3>GPU Particle System</h3>
<p>
  Particles are simulated entirely on the GPU using a compute shader, based on
  <Link href="https://juandiegomontoya.github.io/particles.html">this reference</Link>. Emission rate, initial velocity, lifetime, size over life, and colour
  over life are all configurable and can be tweaked at runtime through the debug menu. The system is used for the checkpoint ring effects and the victory
  celebration when you finish the course.
</p>

<Image
  src="/img/project/ascent/particles.webp"
  alt="GPU particle system in action"
  proxy={false}
  caption="The goal firework particle effect. All simulation runs on the GPU."
/>

<h3>Terrain and Water</h3>
<p>
  The mountain uses hardware tessellation driven by a height map, with tessellation level computed per patch based on screen-space size. The terrain has a
  matching physics collider generated from the same height data. The water surface also uses tessellation combined with animated height maps to produce
  geometric waves. The wave normals are not interpolated, which gives the water a more abstract, stylised quality rather than a photorealistic one.
</p>

<h3>Bloom, Lens Flares, and Tonemapping</h3>
<p>
  Physically based bloom uses the dual-filter pyramid approach from the
  <Link href="https://www.iryoku.com/next-generation-post-processing-in-call-of-duty-advanced-warfare/">CoD: Advanced Warfare presentation</Link>. I had
  implemented this in my earlier deferred renderer and reused the approach here and later in City Lights. Lens flares and light streaks are layered on top using
  John Chapman's <Link href="https://john-chapman-graphics.blogspot.com/2013/02/pseudo-lens-flare.html">pseudo lens flare</Link> method with Kawase-style streaks.
  Tonemapping uses AgX, which handles saturated highlights more gracefully than ACES or Reinhard. All post-process passes run as compute shaders rather than via a
  full-screen triangle.
</p>

<Image
  src="/img/project/ascent/lens-effects.webp"
  alt="Bloom, lens flare and glare, and vignetting effects around the sun"
  caption="Bloom, lens flare and glare, and vignetting effects around the sun. The lens flare and glare is completely dynamic."
/>

<h3>Motion Blur</h3>
<p>
  Framerate-independent motion blur is applied as a post-process pass, based on
  <Link href="https://john-chapman-graphics.blogspot.com/2013/01/what-is-motion-blur-motion-pictures-are.html">John Chapman's approach</Link>. It is disabled by
  default and can be turned on in the settings.
</p>

<h3>Volumetric Altitude Fog</h3>
<p>
  Rather than simple distance-based fog, the implementation integrates density along the view ray while accounting for camera and fragment altitude. The scene
  is a mountain island surrounded by ocean, and the fog sits low over the water, thinning as the terrain rises. It gives the scene much more perceived depth
  than flat exponential fog would.
</p>

<h3>Physics and Audio</h3>
<p>
  Collision detection and rigid body dynamics run through the <Link href="https://github.com/jrouwe/JoltPhysics">Jolt Physics</Link> engine. Physics meshes are defined
  directly in Blender alongside the visual geometry, which kept the workflow unified but made the integration somewhat tricky to get right. The stack of boxes on
  the hillside is a fully simulated rigid body pile that reacts to the player. Audio is handled by SoLoud, which provides full 3D positional sound, used for in-world
  effects throughout the course.
</p>

<h2>Level Design</h2>
<p>
  The level was built entirely in Blender, including all the modelling. Entities such as obstacles and checkpoints are placed and configured directly in the
  scene using Blender's custom properties feature, which exports cleanly into the glTF file and is read at load time. To lay out the track I wrote a set of
  Python scripts inside Blender for placing and adjusting the checkpoint sequence. Having Blender serve as the full editor for geometry, entities, and tooling
  made iteration fast.
</p>

<Image
  src="/img/project/ascent/blender.webp"
  alt="Level layout in Blender"
  caption="The course laid out in Blender. Checkpoint rings, obstacles, and entity configuration all live in the same scene file."
/>

<h2>Looking Back</h2>
<p>
  I am happy with what was implemented. The rendering features held up and several of them, including the bloom, GTAO, and shadow maps, fed directly into
  <Link href="./city-lights">City Lights</Link> in improved form. The main thing I would change is the C&NoBreak;+&NoBreak;+ code itself: it was my first time writing
  C&NoBreak;+&NoBreak;+ seriously and parts of it are quite odd in hindsight. The rendering and gameplay decisions I stand by.
</p>

<h2>Stack</h2>
<dl>
  <dt>Language</dt>
  <dd>C&NoBreak;+&NoBreak;+ (first project in the language)</dd>
  <dt>Graphics API</dt>
  <dd>OpenGL 4.5 (core profile)</dd>
  <dt>Shaders</dt>
  <dd>GLSL</dd>
  <dt>Scene loading</dt>
  <dd>glTF 2.0 via TinyGLTF, images via STB</dd>
  <dt>Physics</dt>
  <dd>Jolt Physics</dd>
  <dt>Math</dt>
  <dd>GLM</dd>
  <dt>UI</dt>
  <dd>Nuklear (HUD and menus), Dear ImGui (debug)</dd>
  <dt>Audio</dt>
  <dd>SoLoud (3D positional audio)</dd>
  <dt>Other</dt>
  <dd>Tweeny (UI animation), Tortellini (INI config), LZ4 (IBL decompression)</dd>
</dl>
