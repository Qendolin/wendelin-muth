<script>
  import Link from '$lib/components/Link.static.svelte';
  import Image from '$lib/components/Image.static.svelte';
  import ImageCompare from '$lib/components/ImageCompare.svelte';
</script>

<p>
  <Link href="https://github.com/Qendolin/cg25-city-lights">Source Code</Link> | <Link
    href="https://www.cg.tuwien.ac.at/sites/default/files/hall_of_fame/10445/City_LightsNeumannvideo-city-lights.mp4">Demo Video</Link
  >
</p>

<p>
  A few semesters before this, I built a small game from scratch in OpenGL for the bachelor's equivalent of this course. After finishing that I knew I wanted to
  move to Vulkan, mostly because OpenGL is effectively dead and Vulkan is where the interesting work is happening. So I spent the next year or so learning it on
  a toy renderer with no real goal other than getting comfortable with the API and modern C&NoBreak;+&NoBreak;+. This demo was where I wanted to find out if
  that time had paid off, and whether I had actually caught up to where I was in OpenGL.
</p>
<p>
  For the <em>Real-Time Rendering</em> master's course at TU Vienna (2025), the task was to build a real-time 3D renderer from scratch with at least two complex
  rendering effects. I built it in C&NoBreak;+&NoBreak;+ and Vulkan together with Felix Neumann, though I ended up putting in way more work than the course
  asked for. We got a <strong>Sehr Gut</strong> and placed
  <strong>2nd out of all demos</strong> that semester. You can download the Windows build from the
  <Link href="https://www.cg.tuwien.ac.at/courses/Computer-Graphics/HallOfFame/2025W">course Hall of Fame</Link>.
</p>

<h2>The Demo</h2>
<p>
  The scene is a city that starts out in daylight and gradually transitions to night. The skybox blends between two textures and the sun light is animated
  directly in the glTF scene file. A few cars cruise through the streets, an alien blob floats around curiously, and then a spaceship swoops in and beams it up.
  Simple story, but it gave us a good excuse to throw a lot of lights at the renderer. Streetlights, car headlights, the spaceship glow. That was kind of the
  whole point. All animations are keyframed and loaded from a single glTF file. Audio is handled by SoLoud.
</p>

<Image src="/img/project/city-lights/hero.webp" alt="City Lights demo screenshot" caption="The city at night, as the spaceship arrives." />

<h2>Frame Breakdown</h2>
<p>Here is every pass that runs to produce a single frame, in order.</p>

<h3>Culling and MDI Buffer Generation</h3>
<p>
  Before any rasterization happens, a compute shader walks over all mesh sections and tests their AABBs against the camera frustum. The output is a compacted
  draw buffer consumed directly by a <code>vkCmdDrawIndexedIndirectCount</code> call, taking advantage of GPU-driven rendering. The same approach is used for the
  shadow pass, with per-cascade variants of the buffer.
</p>

<h3>Depth Pre-pass</h3>
<p>
  The scene is rendered into the depth buffer at 4x MSAA using the compacted MDI buffer from the culling pass. A <Link
    href="https://developer.nvidia.com/blog/visualizing-depth-precision/">reverse-Z infinite projection</Link
  > is used together with a 32-bit float depth buffer. Floating point precision is not uniform, so mapping the far plane to 0 and the near plane to 1 means the bulk
  of available precision ends up where it matters most, in the distance. This depth image feeds into SSAO, the Forward+ tile pass, and the fog clustering.
</p>

<h3>SSAO</h3>
<p>
  Ambient occlusion runs at half resolution using a modified version of
  <Link href="https://www.activision.com/cdn/research/PracticalRealtimeStrategiesTRfinal.pdf">GTAO (Ground Truth Ambient Occlusion)</Link>. The implementation
  skips the depth pre-processing step from the reference (edge detection and LOD generation), which simplifies things at the cost of some performance for large
  screen-space radii. The reference implementation also produces noticeable darkening at screen edges, which is fixed here. Three slices with six samples per
  slice direction gave a good balance between quality and cost. The shader also outputs bent normals, though nothing in this particular scene ended up
  benefiting from them so that output goes unused. The result is upscaled back to full resolution using a depth-aware bilateral blur.
</p>
<p>The SSAO pass can optionally run async on the compute queue, overlapping with early shadow rendering.</p>

<Image src="/img/project/city-lights/ssao-white.webp" alt="SSAO output" caption="Scene with full resolution SSAO. Contrast enhanced." />

<h3>Shadow Pass</h3>
<p>
  Five shadow cascades, each at 2048x2048. The shadow volumes are tightly fitted to the view frustum splits rather than using loose scene-wide bounds. This
  matters mainly for the projected texel size: a tightly fitted cascade covers less world space, so each shadow texel covers a smaller area and shadow edges are
  sharper. Each cascade runs its own culling pass with two additional rules on top of the standard frustum test. First, any object that fits entirely within the
  bounds of the previous (finer) cascade is skipped, since it is already covered at higher resolution. This works because cascades use square extents and are
  always concentric when the horizontal FOV is above 90 degrees. Second, very small objects are culled entirely from higher cascades where they would be
  sub-pixel anyway. During shading, each fragment picks the finest cascade that covers it. Filtering is a 9-tap Poisson disk PCF.
</p>

<Image
  src="/img/project/city-lights/cascades.webp"
  alt="Shadow cascade visualization"
  caption="The five shadow cascades visualized by color. Each covers a progressively larger portion of the frustum."
/>

<h3>Forward+ Light Assignment</h3>
<p>
  A compute shader divides the screen into 16x16 pixel tiles and determines which lights affect each tile. Per group, the min and max depth values in the tile
  are computed from the depth buffer using fast subgroup instructions and shared memory, giving tight near and far bounds for the tile frustum.
</p>
<p>
  Getting the light culling right is the interesting part. A naive frustum vs AABB test produces a huge overestimate. <Link
    href="https://wickedengine.net/2018/01/optimizing-tile-based-light-culling/">This post by Turánszki</Link
  >
  goes into the problem in detail and proposes "2.5D" culling as a fix. Spotlight cones make things even harder.
  <Link href="https://bartwronski.com/2017/04/13/cull-that-cone/">Wronski's "Cull That Cone"</Link>
  explains why the AABB test falls apart for cones and suggests fitting a bounding sphere to each tile frustum instead, which enables an exact cone-sphere test. It
  works very well for short frustums. The problem is at depth discontinuities: a tile that contains both a nearby surface and distant geometry has a very long frustum,
  and the bounding sphere for that frustum gets enormous.
</p>
<p>
  My approach builds on the bounding sphere idea but replaces the sphere with a tapered capsule ("beam") that wraps the tile frustum. The capsule narrows near
  the camera and widens with distance according to the tile's depth bounds, so it stays tight even for long frustums. When the frustum is short the beam
  degenerates into a sphere anyway, so there is no regression in the common case. Both sphere-capsule and cone-capsule tests are cheap and exact. Point lights
  and spotlights share a unified structure in the shader, avoiding any branching between the two cases. The tile buffer is segmented so each tile can hold up to
  255 lights.
</p>
<p>The end result is that the renderer handles over 1000 simultaneous dynamic lights at real-time frame rates.</p>

<ImageCompare
  before="/img/project/city-lights/light-tiles-visual.webp"
  after="/img/project/city-lights/light-tiles-heatmap.webp"
  altBefore="A test scene with many lights"
  altAfter="Tile heatmap showing the number of lights affecting each tile."
  captionBefore="A test scene with many overlapping lights."
  captionAfter="Tile heatmap showing the number of lights affecting each tile."
/>

<h3>Main Render Pass</h3>
<p>
  PBR shading at 4x MSAA using bindless descriptors and a single
  <code>vkCmdDrawIndexedIndirectCount</code> call for the entire scene. The per-tile light lists from the Forward+ pass and the shadow maps are both bound here. Materials
  use albedo, normal, and ORM (occlusion-roughness-metallic) textures. The loader merges separate occlusion, roughness, and metallic maps into a single ORM texture
  at load time when possible.
</p>

<Image src="/img/project/city-lights/raw-output.webp" alt="The HDR output of the main render pass, before post-processing." />

<h3>Skybox</h3>
<p>
  An HDR skybox is rendered after the main pass, writing only to fragments with no geometry (depth test against the far plane). The skybox blends between a
  daytime and nighttime texture to match the animated sun light in the scene. This happens before the blob pass so the blob can composite correctly over it.
</p>

<h3>Blob Pass</h3>
<p>
  The alien blob is a metaball object built from a signed distance field using marching cubes. Marching cubes was chosen over direct SDF ray marching because it
  scores more points in the submission criteria. The SDF domain is segmented into smaller, tighter sub-domains on the CPU using a simple bounding scheme, and
  each sub-domain is meshed by a separate GPU dispatch. A procedural noise texture is sampled during shading to perturb the surface normals, giving the blob a
  slightly organic, lumpy quality. To render it translucently, the HDR framebuffer is resolved to the nearest lower power-of-two texture before the blob draws,
  which is then sampled during shading to composite the blob against the scene behind it.
</p>

<h3>Volumetric Fog</h3>
<p>
  Once the Forward+ tile pass was working, extending it into 3D for volumetric lighting was a natural next step, though it was not part of the original plan.
  The frustum is divided into 32x18x24 voxels ("froxels"). The same tapered capsule intersection logic assigns lights to froxels, with one key difference: depth
  bounds are not used here, because a light floating in mid-air still contributes to the fog volume regardless of what geometry is behind it. Each froxel stores
  up to 128 lights. The fog is rendered at half resolution and upscaled using a depth-aware filter, matching the approach used for SSAO.
</p>
<p>
  Getting 1000+ lights contributing to volumetric scattering while staying real-time was the result I was most pleased with on this project. It was also, to be
  fair, pushing my RTX 5070 Ti to its limits.
</p>

<Image
  src="/img/project/city-lights/volumetric-lights.webp"
  alt="Volumetric fog output"
  caption="Volumetric fog picking up contributions from over a thousand lights across the scene."
/>

<h3>Bloom</h3>
<p>
  The bloom implementation follows the physically based approach from the
  <Link href="https://www.iryoku.com/next-generation-post-processing-in-call-of-duty-advanced-warfare/">Call of Duty: Advanced Warfare presentation</Link>,
  which is more faithful to how light blooms on a sensor than the basic gaussian blur approaches common in tutorials. Bright regions in the HDR buffer are
  progressively downsampled through a pyramid, then upsampled back while accumulating at each level, before being composited into the final image.
</p>

<ImageCompare
  before="/img/project/city-lights/without-bloom.webp"
  after="/img/project/city-lights/with-bloom.webp"
  altBefore="Scene without bloom"
  altAfter="Scene with bloom"
/>

<h3>Tonemapping and Final Output</h3>
<p>
  The final pass composites bloom and applies AgX tonemapping before writing to the swapchain. AgX handles bright saturated colors more gracefully than ACES or
  Reinhard, especially for emissive light sources, which mattered a lot given how many lights are in the scene.
</p>

<h2>If I Did It Again</h2>
<p>
  The biggest lesson was about assets. Finding city geometry with proper PBR textures turned out to be surprisingly hard. Most freely available models do not
  ship roughness, metallic, or normal maps, and creating our own was out of scope. The material quality is the main reason the final result does not look as
  realistic as I had hoped.
</p>
<p>
  The other missing piece is image-based lighting. Without an environment map driving indirect specular and diffuse, the PBR shading loses a lot of the
  grounding that makes a scene feel physically believable. I ran out of time to add it, but it would be the first thing I tackled if I revisited the project.
</p>
<p>
  I am also interested in moving to clustered forward shading as a next step. Tiled forward is essentially obsolete at this point since clustering handles depth
  discontinuities properly without the overdraw problem that tile-based approaches have at silhouette edges.
</p>

<h2>Stack</h2>
<dl>
  <dt>Language</dt>
  <dd>C&NoBreak;+&NoBreak;+23</dd>
  <dt>Graphics API</dt>
  <dd>Vulkan, raw API with no framework, VMA for memory allocation</dd>
  <dt>Shaders</dt>
  <dd>GLSL, compiled at runtime via shaderc and glslang</dd>
  <dt>Scene loading</dt>
  <dd>glTF 2.0 via fastgltf, images via stb_image</dd>
  <dt>Windowing</dt>
  <dd>GLFW</dd>
  <dt>Math</dt>
  <dd>GLM</dd>
  <dt>UI</dt>
  <dd>Dear ImGui</dd>
  <dt>Audio</dt>
  <dd>SoLoud</dd>
</dl>
