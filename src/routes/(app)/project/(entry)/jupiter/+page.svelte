<script>
  import Image from '$lib/components/Image.static.svelte';
  import Link from '$lib/components/Link.static.svelte';
</script>

<p>
  Many austrian high schools run on <Link href="https://webuntis.com">WebUntis</Link>, a school administration platform that handles schedules, absences, and
  grades. The web interface was slow and cluttered, and the official mobile app was worse. Timetables were hard to read at a glance, basic features were locked
  behind a premium tier, and loading anything took long enough to be genuinely annoying. A friend and I decided to build our own frontend.
</p>

<h2>The Project</h2>
<p>
  Jupiter was a full replacement for the WebUntis frontend, built on top of the same underlying API. We used PHP on the backend and jQuery on the client, which
  reflects when we started it: early in our time at HTL, before we had much of an opinion about software engineering. What came out of it was a web app that ran
  well on mobile, installed as a PWA, and worked offline through service workers.
</p>
<p>
  The timetable layout was redesigned from scratch to be compact and readable on small screens, which was the main frustration with the official app. We also
  built an overview page that showed your current and next period, the room it was in, and a countdown to the next break. The official app had nothing
  comparable.
</p>
<p>
  Most premium features in WebUntis were things nobody really needed, reminder notifications and similar fluff. One that was actually useful was absence
  tracking, since you had to get absences excused and the official free tier hid that entirely. We reverse engineered the mobile app and found that it used a
  completely separate API with no server-side validation, so we were able to query absences directly. Integrating a second API was a bit of a pain, but it
  worked.
</p>
<p>
  There was also a calendar view where class representatives could enter shared dates like upcoming exams for everyone to see. It was a nice idea and
  technically worked well, but in practice nobody really used it beyond our immediate circle.
</p>

<div class="mx-auto table">
  <div class="inline-grid grid-cols-1 justify-center gap-4 md:grid-cols-2">
    <Image h={800} src="/img/project/jupiter/untis.webp" alt="Official WebUntis mobile timetable view" caption="The official WebUntis timetable on mobile." />
    <Image
      h={800}
      src="/img/project/jupiter/jupiter.webp"
      alt="Jupiter mobile timetable view"
      caption="The Jupiter timetable on mobile, more compact and readable."
    />
  </div>
</div>

<p class="text-center text-sm">Sadly, the only decent screenshots I was able to dig up.</p>

<h2>Looking Back</h2>
<p>
  The codebase was a mess by the end. We started it before either of us had a real grasp on how to structure a project and it showed. After two years of
  development spanning from second to fifth semester, the official app had improved enough that the gap had narrowed, though Jupiter was still the better
  experience. I no longer have a student account to test it against, so I cannot showcase it any better than these screenshots.
</p>
<p>
  What I took from it was a solid foundation in web development, learned the hard way. The final product went far beyond anything we were taught at school,
  tackling service workers, offline caching, PWA installation, and API reverse engineering on our own and actually shipping something that people used.
</p>
