<script>
  import Link from '$lib/components/Link.svelte';
  import Image from '$lib/components/Image.svelte';
</script>

<p>
  After wrapping up <Link href="./ascent">Ascent</Link> I felt like I had pushed OpenGL about as far as I wanted to. The API was familiar, the patterns were settled,
  and the interesting unsolved problems had moved elsewhere. Vulkan was the obvious next step, not because a project demanded it, but because I wanted to understand
  how modern GPU work actually gets scheduled, synchronized, and submitted. I had touched the Vulkan C API in the
  <em>Fundamentals of Computer Graphics</em> bachelor's course, but that was guided and narrow. So I started this renderer with no deadline and no deliverable, just
  a codebase to think in.
</p>
<p>
  The project is available on <Link href="https://github.com/Qendolin/cpp-vulkan-playground">GitHub</Link>. Work on it was interrupted in October 2025 when <Link
    href="./city-lights">City Lights</Link
  > took over, but I plan to pick it up again. It is the kind of project I keep coming back to whenever there is a technique I have not tried yet.
</p>

<h2>Moving Beyond the C API</h2>
<p>
  The Vulkan I had written before used the raw C API. This project switched to vulkan-hpp, the official C++ bindings, which brings RAII handles, typed enums,
  and method syntax to an API that can otherwise feel quite mechanical. Combined with VMA for memory allocation, the boilerplate around resource management
  dropped considerably. Ascent was my first real C++ project, and this was a continuation of that learning, with more room to go deeper into the language
  itself.
</p>

<h2>Tracy</h2>
<p>
  This was my first time integrating <Link href="https://github.com/wolfpld/tracy">Tracy</Link>, a frame profiler that gives a timeline view of CPU and GPU work
  with very low overhead. Since the rendering is GPU driven the CPU is mostly idle, so there was not much of practical value to see, but getting it wired up and
  understanding how it works was worthwhile on its own.
</p>

<h2>HZB Culling</h2>
<p>
  The main new rendering technique in this project is hierarchical Z-buffer culling. Objects that were visible in the previous frame are rendered first in a
  depth prepass, and a depth pyramid is built from the result. Each level of the pyramid stores the maximum depth in a region of the screen. A compute shader
  then tests each remaining object's bounding box against the pyramid. If the nearest point of the box is farther than the stored maximum depth at the
  appropriate pyramid level, the object is occluded and can be skipped. The approach is GPU-driven and avoids any CPU readback.
</p>

<!-- TODO: add 1-2 screenshots showing HZB culling visualization -->
<!-- <Image src="/img/project/vulkan-playground/hzb-..." alt="..." caption="..." /> -->

<h2>Barrier Tracking and Bindless Descriptors</h2>
<p>
  Managing Vulkan synchronization by hand gets tedious quickly. I added a simple barrier tracker that keeps the last known layout and access state for each
  resource and emits the correct pipeline barriers automatically when a transition is needed. It is not a full render graph, just enough structure to avoid
  writing barriers by hand everywhere and introducing subtle bugs when passes are reordered.
</p>
<p>
  Bindless descriptors also made their first appearance here, before I carried the pattern into City Lights. Binding textures through a large descriptor array
  and indexing into it from the shader removes the per-draw descriptor update cost and makes the draw submission path simpler.
</p>

<h2>Build System</h2>
<p>
  On the tooling side, this project was my first use of VCPkg for dependency management alongside a proper attempt at understanding CMake, rather than copying
  boilerplate and hoping it works. CMake is genuinely complicated and I would not claim to fully understand it, but I know enough now to be deliberate about it.
  Getting this right feels important if I want to work on graphics professionally, where build reproducibility and dependency management are not optional.
</p>

<h2>What's Next</h2>
<p>
  This project gave me enough of a foundation that City Lights felt approachable rather than overwhelming, going in with a clear enough picture of the API to
  know what I wanted to do and roughly how. That said, some problems in Vulkan I still have not found a satisfying answer to. Managing resources pending
  deletion is one of them, every solution I have landed on has felt like a compromise rather than something I am actually happy with.
</p>
<p>
  I am interested in continuing this whenever there is a technique worth exploring, and the list is never empty. Meshlets and mesh shaders are near the top of
  it, and I would also like to try <Link href="https://shader-slang.com">Slang</Link> as a shading language.
</p>
