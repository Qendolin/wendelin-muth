<script>
  import Image from '$lib/components/Image.static.svelte';
</script>

<p>
  The <em>Software Engineering Project</em> course is part of the bachelor's program at TU Vienna and is the closest the curriculum comes to real-world work. It starts
  with a small solo project, and in the group phase that follows, teams of about six students take a provided Spring Boot and Angular skeleton and turn it into a
  full application. We were assigned a ticketing platform for cultural events. We shipped it as NgTickets, though we knew it as Ticketline during development. The
  group phase ran from May to June, roughly eight weeks of actual implementation.
</p>
<p>
  The team consisted of Domenic Melcher, Roman Braunstingl, Sebastian Privas, Carmen Dimov, Si Yu Sun, and myself. The course required us to elect roles so that
  everyone was responsible for specific parts of the project. Carmen and I took the frontend, Domenic and Si Yu the backend, Sebastian test management, and
  Roman team coordination, including talking to the supervisors. We ran two-week sprints, held review meetings with our assigned product owners, and every
  sprint ended with a demo of what we had shipped.
</p>
<p>
  The roles were about responsibility, not exclusivity. Sebastian and Roman wrote plenty of code too, and beyond the frontend I also handled the seat plan
  editor and some backend work, mainly the object store and the image pipeline. Carmen and Si Yu, for their part, designed the whole UI in Figma before anything
  was implemented, which made the frontend work much easier. I genuinely enjoyed working with this team, and I consider myself lucky to have landed in a group
  that was this motivated.
</p>

<div class="mx-auto table">
  <div class="inline-grid grid-cols-1 justify-center gap-4 md:grid-cols-2">
    <Image
      h={400}
      src="/img/project/ticketline/trending.webp"
      alt="NgTickets landing page with trending shows"
      caption="The landing page with trending shows and category filters."
    />
    <Image
      h={400}
      src="/img/project/ticketline/seatplan.webp"
      alt="The interactive seat plan editor"
      caption="Drawing blocks, rows, and price categories on an SVG seat plan."
    />
  </div>
</div>

<div class="mx-auto table">
  <div class="inline-grid grid-cols-1 justify-center gap-4 md:grid-cols-2">
    <Image
      h={400}
      src="/img/project/ticketline/checkout.webp"
      alt="The checkout flow with seat selection"
      caption="Selecting seats on the event page before checkout."
    />
    <Image
      h={400}
      src="/img/project/ticketline/admin.webp"
      alt="The admin user management view"
      caption="User administration with sorting, locking, and role management."
    />
  </div>
</div>

<h2>The App</h2>
<p>
  NgTickets covers the full customer journey for shows in four categories: cinema, concert, opera, and theater. The landing page shows trending shows with
  filters by category and month, and a search page covers shows, artists, locations, and time. Each event has a detail page with an interactive seat plan.
  Sitting places are individual seats you click one by one, while standing places are selected by quantity. The price is computed from a base price plus the
  surcharge of the chosen price category, in euros and cents.
</p>
<p>
  Checkout runs through a credit card form with expiry validation. Instead of buying, you can also reserve seats for free, convert a reservation into a purchase
  later, or cancel it. Orders end up in your profile with states for reserved, bought, and cancelled, and you can download PDF tickets and receipts.
</p>
<p>
  The admin area is just as extensive. Admins manage users with pagination, sorting, locking, role changes, and forced password resets. They create locations,
  rooms, and shows, write news posts with a rich text editor, and draw seat plans in a dedicated editor.
</p>

<h2>Backend</h2>
<p>
  The backend is a Spring Boot 3 application written in Java 21, following the layered structure the course skeleton provided: REST endpoints, services for
  business logic, JPA entities, and repositories for data access. DTOs are generated with MapStruct, and every endpoint is documented through OpenAPI and
  testable in Swagger UI. Authentication uses JWT with two roles, user and admin.
</p>

<h2>Frontend</h2>
<p>
  The frontend is Angular 17 with Bootstrap for styling. The parts I am most happy with are the custom stores built on Angular signals, used for seat selection
  and price categories. Instead of pulling in a state management library, we modeled the checkout flow around a few small, well-defined stores that components
  subscribe to.
</p>
<p>
  Images go through a custom loader that integrates the backend's image service with Angular's optimized image directive. The backend re-encodes uploaded images
  on the fly to WebP with configurable width, height, and quality, so the frontend requests exactly the size it needs.
</p>

<h2>Seat Plan Editor</h2>
<p>
  The most substantial piece was the seat plan editor, which I built from scratch. Admins draw blocks and rows on an SVG canvas, place sitting and standing
  places, and assign price categories with colors, all without leaving the browser. Everything from the ruler and snapping to keyboard navigation is hand-built
  geometry code, no editor library involved. Plans are stored as a JSON description plus a generated SVG preview in the object store.
</p>

<h2>Object Store and PDFs</h2>
<p>
  A generic data entity stores arbitrary files, images, seat plans, and PDFs, protected by Unix-style access-control bits for read and write by the owner or
  others. The same store backs public images and private PDFs.
</p>
<p>
  Tickets, receipts, and cancellation receipts are generated server-side from Thymeleaf templates rendered to PDF with iText. They include the Austrian VAT of
  20 percent and are stored back into the object store, where customers pick them up through the profile page.
</p>

<h2>Security</h2>
<p>
  Security was handled on several fronts. Registration requires verifying your email address through a link, and accounts lock after five failed login attempts.
  Credit card data is encrypted at rest with Spring's text encryptor, using a secret and salt from the configuration. Checkouts and reservations are addressed
  by public UUIDs instead of sequential IDs, with ownership checks on every mutation.
</p>

<h2>CI/CD and Team Workflow</h2>
<p>
  A GitLab CI pipeline ran on every commit. It built and tested the backend with Maven, ran lint and build for the frontend, and produced a gitinspector grading
  report. On the main branch, the built frontend was copied into the backend's static resources, a Docker image was published with Jib, and the course's
  deployment API pushed it to a Kubernetes cluster.
</p>
<p>
  Every feature was a branch named after its GitLab issue and merged through a merge request into an integration chain of dev-1 through dev-4, keeping the main
  branch releasable. The result was about 277 commits across the six of us in eight weeks.
</p>

<h2>Stack</h2>
<dl>
  <dt>Backend</dt>
  <dd>Spring Boot 3.2, Java 21, H2, Spring Data JPA</dd>
  <dt>Frontend</dt>
  <dd>Angular 17, TypeScript, Bootstrap 5, ng-bootstrap</dd>
  <dt>API</dt>
  <dd>REST with JWT auth, OpenAPI and Swagger UI</dd>
  <dt>Mappings</dt>
  <dd>MapStruct with Lombok</dd>
  <dt>PDF</dt>
  <dd>iText with Thymeleaf templates</dd>
  <dt>Images</dt>
  <dd>On-the-fly WebP re-encoding</dd>
  <dt>CI/CD</dt>
  <dd>GitLab CI, Jib, Docker, Kubernetes</dd>
</dl>
