<script>
  import Link from '$lib/components/Link.static.svelte';
  import Image from '$lib/components/Image.static.svelte';
  import Carousel from '$lib/components/Carousel.svelte';
</script>

<p>
  In 2018, a few friends and I were convinced to represent HTL Spengergasse at
  <Link href="https://ecer.pria.at/competition/">ECER Botball</Link>, the European Conference on Educational Robotics. Our school had not fielded a team in
  previous years, so we had no accumulated knowledge to draw from. None of the four of us had any background in robotics or C. We went with
  <strong>Bluescreen Factory</strong> as our team name, which felt appropriate.
</p>

<h2>The Competition</h2>
<p>
  Each team is given two robots. One is a repurposed Roomba and the other is a custom-built bot with servo motors driven by a KIPR controller board. The arena
  is a table populated with props, small fluffy balls representing water, and wooden figures representing people. The theme for our year was fire rescue. You
  scored points by collecting water or people and delivering them to a dropoff zone, all autonomously.
</p>

<Image
  src="/img/project/botball/arena.webp"
  alt="Schematic 3D view of the Botball arena table"
  caption="A schematic overview of the arena table. Props, people, and water balls are distributed across the surface for teams to collect and deliver."
/>

<p>
  We met every week for a full afternoon throughout the school year, building a local replica of the arena, writing and testing code, and trying to make our
  routines reliable enough to trust in competition. Hardware faults developed along the way. The Roomba stopped charging reliably and the GPIO ports on the
  second robot would simply stop responding.
</p>

<h2>Programming</h2>
<p>
  The KIPR SDK is written in C, which none of us knew coming in. Rather than learn just enough C to get by, I spent a significant portion of our preparation
  time porting the library to Go. A surprisingly tricky part of that work was making the robots drive straight and travel exact distances, something that sounds
  trivial until you are dealing with imprecise motors and no closed-loop feedback.
</p>

<Carousel count={3} style="aspect-ratio: 16/9">
  <Image
    src="/img/project/botball/botball-1.webp"
    alt="Roomba bot collecting wooden figures"
    caption="Our roomba bot attempting to collect wooden figures representing people during practice."
    layout="constrained"
  />
  <Image
    src="/img/project/botball/botball-2.webp"
    alt="Custom-built bot funneling fuzzy balls"
    caption="The custom-built bot collecting fuzzy balls representing water into a bucket."
  />
  <Image
    src="/img/project/botball/botball-3.webp"
    alt="Roomba bot rescuing plush figures"
    caption="The roomba bot performing a rescue on plush figure during practice."
  />
</Carousel>

<h2>The Tournament</h2>
<p>
  When we arrived at the competition in spring 2019, the arena floor turned out to have a raised gravel texture and was not flat. We knew it would be plastic
  plates, but the texture and the ridge running along the seam between them were not mentioned anywhere in the specifications we had practiced against.
</p>
<p>
  The texture cost our lighter robot traction, causing its wheels to slip mid-routine. The ridge was worse. Our Roomba used a cage that slid along the floor
  surface and it got stuck every time it crossed the join. A plan we were confident in fell apart on details that were, by the rules, never supposed to exist.
  Safe to say, we did not return the following year.
</p>

<Image
  src="/img/project/botball/team.webp"
  alt="The Bluescreen Factory team holding the Outstanding Programming award"
  caption="Bluescreen Factory with the Outstanding Programming award for porting the KIPR C library to Go. Left to Right: M. Mayerhofer, C. Hahn, W. Muth and L. Marx"
/>

<h2>Looking Back</h2>
<p>
  This was seven years ago now. The result on the day was frustrating, but looking back it was a genuinely fun project to be part of. We built something from
  nothing, no seniors to learn from, unfamiliar hardware, a language none of us knew, and we walked away with the Outstanding Programming award for the library
  port. HTL Spengergasse also covered the competition in
  <Link href="https://web.archive.org/web/20190823150950/http://www.spengergasse.at/news/spengergasse-goes-botball">a short news post</Link>.
</p>
