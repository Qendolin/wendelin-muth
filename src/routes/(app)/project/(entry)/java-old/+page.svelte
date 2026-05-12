<script>
  import Image from '$lib/components/Image.static.svelte';
  import Link from '$lib/components/Link.static.svelte';
</script>

<p>
  This is where my computer graphics journey began. Around the summer of 2016, just as I was starting at
  <abbr title="Austrian vocational high school for engineering">HTL</abbr> and only 14 years old, I became fascinated with the idea of building my own 3D
  engine. I knew some Java, but I was well aware at the time that I barely had a clue what I was doing. I found ThinMatrix's
  <Link href="https://www.youtube.com/playlist?list=PLRIWtICgwaX0u7Rf9zkZhLoLuZVfUksDP">OpenGL tutorial series</Link> on YouTube and worked through it episode by
  episode. A lot of it was copying code, but getting the Stanford dragon to render on my screen for the first time felt genuinely incredible.
</p>

<h2>Chess</h2>
<Link
  href="https://firebasestorage.googleapis.com/v0/b/wendelin-muth.appspot.com/o/public%2Fcontent%2Fuploads%2Fchess.zip?alt=media&token=a5e2558d-fa95-4c83-9abf-bd6d634449a1"
  >Download</Link
>
<p>
  By early 2017 I had a rough 3D renderer and needed something to actually build with it. The first project was chess, rendered in 3D with move validation and
  two game modes. Standard chess was one, and the other was Racing Kings, a variant where both players race their kings to the back rank. Every UI element was
  hand-coded, and the renderer covered the basics: Phong shading, OBJ loading, SDF font rendering, an orbit camera, and 3D object picking, most of which came
  from the ThinMatrix tutorials.
</p>
<Image src="/img/project/java-old/chess.webp" alt="3D chess game" />

<h2>3D Snake</h2>
<Link
  href="https://firebasestorage.googleapis.com/v0/b/wendelin-muth.appspot.com/o/public%2Fcontent%2Fuploads%2Fsnake.zip?alt=media&token=a7fd2878-af00-49a6-a717-55e8145426ad"
  >Download</Link
>
<p>
  The second project was a snake game on a 3D grid. Reading depth on a grid is tricky, so I added three orthographic shadow maps cast from different directions
  to give the scene enough spatial cues to play comfortably. I also put together a very basic GUI with image buttons and some simple layout primitives, a step
  up from hand-coding every interface element as I had done for chess.
</p>
<Image src="/img/project/java-old/snake.webp" alt="3D snake game" />

<p>
  My understanding of OpenGL was still shaky throughout all of this, but these projects gave me a foundation to build on. I returned to 3D rendering a few years
  later with a much clearer head in <Link href="./advanced-gl">Learning OpenGL 4+</Link>.
</p>
