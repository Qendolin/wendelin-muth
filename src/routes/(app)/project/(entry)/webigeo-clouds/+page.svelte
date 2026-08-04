<script>
  import ImageCompare from '$lib/components/ImageCompare.svelte';
  import Link from '$lib/components/Link.static.svelte';
  import Image from '$lib/components/Image.static.svelte';
</script>

<p>
  <Link href="https://github.com/Qendolin/webigeo-clouds">Source Code</Link> | <Link href="https://webigeo.alpinemaps.org/">Online Demo</Link>
</p>

<p>
  My bachelor's thesis at TU Wien, finished in March 2026. The goal was to render volumetric clouds from actual meteorological forecast data inside
  <Link href="https://webigeo.alpinemaps.org/">weBIGeo</Link>, a research platform for interactive 3D terrain visualization built on top of
  <Link href="https://alpinemaps.org/">AlpineMaps</Link>. The motivating idea was something like: a hiker wants to know whether the summit sits above or below
  the cloud layer. Standard weather apps can't answer that because they collapse the atmosphere into a flat map. Volumetric rendering in 3D terrain can.
</p>

<p>
  The input data comes from ICON-D2, the regional forecast model of the German Weather Service, at 2.2 km horizontal resolution and 65 vertical layers. That
  resolution is too coarse for the hiking use case to actually work, but building a complete pipeline from raw forecast files to real-time browser rendering
  turned out to be a substantial project regardless. Everything runs in a standard web browser via WebGPU.
</p>

<Image
  src="/img/project/webigeo-clouds/hero.webp"
  alt="weBIGeo with volumetric clouds over alpine terrain"
  caption="Volumetric clouds rendered over 3D alpine terrain in weBIGeo."
/>

<h2>The Pipeline</h2>

<p>
  There are two stages. An offline preprocessing step runs once per forecast timestamp and produces a TMS tile hierarchy of compressed volume textures. The
  browser renderer streams those tiles on demand and ray-marches through them.
</p>

<p>
  The synthesis runs as a WebGPU compute shader invoked from Python. It reads cloud cover fraction, liquid and ice water content, turbulent kinetic energy,
  temperature, and pressure from ICON-D2, and writes the volumetric extinction coefficient into 256x256x64 voxel tiles at zoom level 10. Vertical interpolation
  uses PCHIP onto a uniform metric grid, because model levels are non-uniformly spaced and vary with local terrain height. Before any of this, two
  inconsistencies in the ICON-D2 fields need correcting. Cloud fraction can be zero where condensate is present, and condensate can be depleted where cloud
  fraction remains non-zero. Both cause cloud regions to render as fully transparent, and the corrections had a large visual impact.
</p>

<ImageCompare
  before="/img/project/webigeo-clouds/without-recovery.webp"
  after="/img/project/webigeo-clouds/with-recovery.webp"
  altBefore="Without condensate consistency correction.."
  altAfter="With condensate consistency correction."
  captionBefore="Without condensate consistency correction. Underestimate when compared to satellite imagery."
  captionAfter="With condensate consistency correction. Overestimate when compared to satellite imagery, but more consistent with webcam observations."
/>

<p>
  At 2.2 km resolution the upsampled fields are too smooth. The shader adds sub-grid detail by first displacing sample coordinates using TKE-driven fractional
  Brownian motion noise, approximating sub-grid turbulent mixing, and then modulating extinction with a regime-adaptive density factor. The approach is inspired
  by the
  <Link href="https://www.guerrilla-games.com/read/nubis-realtime-volumetric-cloudscapes-in-a-nutshell">Nubis pipeline</Link>, using inverted Worley fBm to
  carve out the rounded shapes typical of real clouds. Under stratus conditions smooth fBm perturbs cloud edges. Under convective conditions a multi-scale
  product of gradient fBm and Worley noise generates the rounded cauliflower texture of cumulus clouds. The two blend continuously with a convective weight
  derived from TKE.
</p>

<ImageCompare
  before="/img/project/webigeo-clouds/without-detail.webp"
  after="/img/project/webigeo-clouds/with-detail.webp"
  altBefore="Without sub-grid detail synthesis."
  altAfter="With sub-grid detail synthesis."
  captionBefore="Without sub-grid detail synthesis. Clouds look blurry and lack small-scale structure."
  captionAfter="With sub-grid detail synthesis. Clouds have sharper edges and more realistic texture."
/>

<p>
  The zoom-10 tiles get pooled down to zoom 4 by 2x2 mean pooling on the horizontal axes only. Vertical resolution stays fixed at every zoom level because thin
  cloud layers remain perceptually significant even at small map scales. Everything is encoded as BC4 block-compressed KTX2 textures with zstd supercompression.
  The total compressed output per timestamp averages around 86 MiB, and the whole preprocessing run takes about 33 seconds.
</p>

<h2>The Renderer</h2>

<p>
  All tiles are packed into a single 3D texture atlas at runtime because WebGPU provides no texture array type and caps the number of texture bindings per
  shader. The atlas totals about 1.14 GiB, which exceeds Firefox's current WebGPU texture limit, so it currently requires a Chromium-based browser.
</p>

<p>
  The ray-marcher alternates between a coarse <em>search phase</em> that skips empty air in large steps, and a fine <em>integration phase</em> that accumulates radiance
  and transmittance only where cloud density is non-zero. MIP level is selected independently for the horizontal and vertical ray components, since the tile axes
  have different texel sizes and the anisotropy worsens at lower zoom levels.
</p>

<p>
  Lighting uses a three-term phase function loosely following the Nubis pipeline. A forward Henyey-Greenstein lobe (g=0.7) produces the silver-lining effect
  when looking toward the sun, a weak backward lobe adds slight brightening on the other side, and an isotropic term keeps cloud faces away from the sun from
  going completely dark. Solar transmittance combines Beer-Lambert with a powder sugar term for backlit cloud edges and a multiple-scattering approximation for
  deep interiors. The phase function is evaluated once per pixel before the march since the view and sun directions are constant.
</p>

<p>
  The cloud pass runs at half resolution. Per-pixel jitter combines
  <Link href="https://blog.demofox.org/2022/01/01/interleaved-gradient-noise-a-different-kind-of-low-discrepancy-sequence/">Interleaved Gradient Noise</Link>
  with the golden-ratio <Link href="https://extremelearning.com.au/unreasonable-effectiveness-of-quasirandom-sequences/">R1 sequence</Link>
  so that successive frames accumulate non-redundant sub-pixel samples. A TAAU pass reprojects a full-resolution history buffer using the transmittance-weighted mean
  depth from the ray-marcher, clips the history to current-frame variance to suppress ghosting, and blends transmittance in optical depth space rather than linearly.
  Because the current frame carries a sub-pixel jitter, the accumulation fills in sub-pixel detail without a separate upsampling step.
</p>

<h2>Results</h2>

<p>
  The cloud pass costs around 2.25 ms at peak GPU time, well within the 33 ms budget for 30 fps. Even with no clouds at all there is a fixed cost of about 0.29
  ms from the coarse search loop and TAAU pass running unconditionally. Fully overcast scenes are actually faster than patchy ones, because rays hit the minimum
  transmittance threshold and terminate early rather than traversing long empty stretches between fragments.
</p>

<p>
  Qualitative evaluation compared output against EUMETSAT satellite composites and alpine webcam imagery at matched timestamps. Against satellite, large-scale
  cloud patterns and the distribution of clear and cloudy regions agree well. Against webcam, three concrete limitations show up: the vertical resolution is too
  coarse to resolve sharp fog layer boundaries, small cloud elements like wispy low-altitude puffs are not reproduced as distinct structures, and the tile
  resolution is too coarse to encode the surface texture of individual cumulus cells.
</p>

<ImageCompare
  before="/img/project/webigeo-clouds/satellite.webp"
  after="/img/project/webigeo-clouds/top-down.webp"
  altBefore="Satellite imagery"
  altAfter="Renderer output"
  captionBefore="EUMETSAT true-color composite at a matched timestamp. Note: mountains are covered in snow."
  captionAfter="Top-down renderer view at the same timestamp"
/>

<h2>If I Did It Again</h2>

<p>
  The dominant limitation is source data resolution, which I cannot do much about. Higher-resolution public forecast data for Austria does not appear to be
  available. The procedural detail synthesis is driven entirely by TKE from the model, which is a rough proxy for turbulence intensity but carries no
  information about actual cloud structure at sub-grid scales. Feeding real observations like radar or satellite into the synthesis step is the obvious
  direction, though it would be a significantly more complex problem.
</p>

<p>
  The shadow map assumes a vertical light direction, so shadow shapes do not change with sun position at all. Temporal blending between consecutive forecast
  timestamps would add smooth animation instead of static hourly snapshots. And the TAAU implementation does not fully resolve the tradeoff between ghosting
  suppression and convergence speed during fast camera motion. Those would be the obvious next things.
</p>

<h2>Stack</h2>
<dl>
  <dt>Preprocessing</dt>
  <dd>Python, WebGPU compute via wgpu</dd>
  <dt>Shaders</dt>
  <dd>WGSL</dd>
  <dt>Browser API</dt>
  <dd>WebGPU</dd>
  <dt>Texture format</dt>
  <dd>KTX2, BC4, zstd</dd>
  <dt>Platform</dt>
  <dd>weBIGeo / AlpineMaps</dd>
  <dt>Input data</dt>
  <dd>ICON-D2 (Deutscher Wetterdienst)</dd>
</dl>
