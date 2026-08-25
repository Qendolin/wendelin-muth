<script lang="ts">
  import Image from '$lib/components/Image.static.svelte';
  import Link from '$lib/components/Link.static.svelte';
  import { highlight } from '$lib/code.static';
</script>

<p>
  <em
    ><strong>2026 Update:</strong> The project has expanded beyond Fabric to support (Neo)Forge under the name <strong>Mod Bisect Tool</strong>. It now features
    a native cross-platform <a href="#graphical-user-interface-gui">Graphical User Interface</a> built with Gio UI, and the search algorithm has been extended
    to <a href="#algorithm-iterative-minimal-conflict-search-with-indeterminate-results-imcs-i">IMCS-I</a> to handle indeterminate test results.</em
  >
</p>

<p>
  <Link href="https://qendolin.github.io/mod-bisect-tool/">Website & Downloads</Link> |
  <Link href="https://github.com/Qendolin/mod-bisect-tool">Source Code</Link>
</p>

<p>
  Anyone who has run a large Minecraft modpack has been there. The game crashes, the log is unhelpful, and you have a hundred mods to blame. The usual approach
  is to manually disable half your mods, try again, and repeat until you find the culprit. It works, but it is tedious and easy to get wrong. I wrote this tool
  to automate that process properly.
</p>
<p>
  The tool supports <strong>Fabric</strong>, <strong>Quilt</strong>, and <strong>(Neo)Forge</strong> (including Sinytra Connector and Kilt configurations).
  Prebuilt binaries with automatic OS detection and comprehensive documentation are hosted on the
  <Link href="https://qendolin.github.io/mod-bisect-tool/">project website</Link>, and the source code is on
  <Link href="https://github.com/Qendolin/mod-bisect-tool">GitHub</Link>. Step-by-step guides for both versions are available online:
  <Link href="https://qendolin.github.io/mod-bisect-tool/GUI-User-Guide.html">GUI User Guide</Link> and
  <Link href="https://qendolin.github.io/mod-bisect-tool/TUI-User-Guide.html">TUI User Guide</Link>.
</p>

<h2>How It Works</h2>
<p>
  The core of the tool is a bisection search. It splits the pool of candidate mods in half, asks you to run the game and report whether the issue occurred, then
  eliminates whichever half is clean. Each round cuts the search space in half, so even a modpack with hundreds of mods converges to a result in a handful of
  steps. The user interface walks you through each test one at a time, so there is no guesswork involved.
</p>
<p>
  One thing that makes this more than a simple binary search is dependency handling. Mods often require other mods to be present, and naively enabling a subset
  of mods can produce crashes that are unrelated to the actual conflict. The tool includes a dependency resolver that automatically activates any required
  dependencies when a mod is selected for testing, keeping each test valid. It also reads bundled JARs so that if a conflict is caused by a library shipped
  inside another mod, the tool still points to the right culprit.
</p>
<p>
  Some conflicts only surface when two or more mods are active together. The bisection engine handles this by continuing to narrow down the candidate set until
  it isolates the exact combination responsible. After a conflict is found, the tool can set those mods aside and resume searching the rest of the pool, finding
  any number of separate, unrelated conflicts in one session.
</p>
<p>
  The algorithm described in the appendix (IMCS-I) is my own approach, designed specifically for this use case. It is optimized for situations where only a
  small number of conflicts exist within a large set of components, focusing on minimizing the number of required test runs by isolating one conflicting element
  at a time and handling secondary failures that produce indeterminate test outcomes. In contrast, delta debugging (ddmin) and QuickXplain (QXP) have a lot of
  overhead in such scenarios, but perform better when the number of conflicts is large.
</p>

<h2>Managing the Search</h2>
<p>
  The tool gives you fine-grained control over which mods participate in the search. A mod can be force-enabled if it must always be present for the issue to
  reproduce, force-disabled if you already know it is safe to exclude, or omitted to remove it from the candidate pool while still allowing the resolver to
  activate it as a dependency for other mods. A history page logs every test and its outcome so you can review how the tool arrived at its conclusion, and a
  live log page exposes internal diagnostics for bug reports.
</p>
<p>
  The tool also supports a dependency override file for cases where a mod's metadata is missing or incorrect. Overrides can be placed next to the executable, in
  the Minecraft config folder, or left to the tool's own built-in list, with a clear priority order between them.
</p>

<static>
  <div class="mx-auto table">
    <div class="inline-grid grid-cols-1 justify-center gap-4 md:grid-cols-2">
      <Image
        src="/img/project/fabric-mod-bisect/setup-page.webp"
        alt="Setup screen where the mods folder is loaded"
        caption="The setup screen, where the mods folder is loaded and analyzed before the search begins."
      />
      <Image
        src="/img/project/fabric-mod-bisect/main-page-start.webp"
        alt="Main screen showing the candidate mod list"
        caption="The main screen, showing the current candidates and controls for starting a test."
      />
      <Image
        src="/img/project/fabric-mod-bisect/test-page.webp"
        alt="Test in progress screen"
        caption="The test screen, shown while a specific subset of mods is enabled and the game is running."
      />
      <Image
        src="/img/project/fabric-mod-bisect/result-page.webp"
        alt="Result screen showing the conflicting mods"
        caption="The result screen, listing the conflicting mods and offering the option to continue searching for further conflicts."
      />
    </div>
  </div>
</static>

<h2 id="graphical-user-interface-gui">Graphical User Interface (GUI)</h2>
<p>
  While the terminal user interface (TUI) provides power-user tools like keyboard shortcuts, a full mod management table, a test history page, and an internal
  log viewer, these features add unnecessary friction for everyday troubleshooting. The GUI is built to streamline the entire experience around what actually
  matters: isolating the broken mod with as few clicks and decisions as possible.
</p>
<p>
  The GUI is built using <Link href="https://gioui.org/">Gio UI</Link> (<code>gioui</code> / <code>gogio</code>), an immediate-mode GUI library written in pure
  Go. Using Gio keeps the binary lightweight and dependency-free while rendering natively across operating systems:
</p>
<ul>
  <li><strong>Windows:</strong> Standalone executable (<code>.exe</code>) with native file dialogs.</li>
  <li><strong>macOS:</strong> Standalone application bundle (<code>.app</code>).</li>
  <li><strong>Linux:</strong> Portable, single-file <code>AppImage</code>.</li>
</ul>

<h3>Guided Pre-Search Wizard</h3>
<p>Instead of burying candidate configuration inside nested menus, the GUI introduces a guided wizard right after folder setup:</p>
<ul>
  <li>
    <strong>Handling Already-Disabled Mods:</strong> Modpacks often contain mods that were disabled intentionally or temporarily. The GUI identifies these upfront
    and lets you decide whether they should remain permanently disabled throughout the entire bisect or participate in the candidate pool.
  </li>
  <li>
    <strong>Excluding (Omitting) Safe or Disruptive Mods:</strong> You can exclude mods you already know are safe, or mods that actively get in the way of
    testing. A prime example is <em>Crash Assistant</em>: it displays an interactive GUI dialog whenever the game crashes, which slows down the search since
    frequent game crashes are an expected part of the bisection process. Omitted mods are removed from the candidate pool, but the dependency resolver can still
    activate them if another mod requires them.
  </li>
  <li>
    <strong>Selecting Mods to Keep Enabled:</strong> Some issues only reproduce when a specific prerequisite mod is active. For example, if a visual glitch only occurs
    with shaders enabled, the shader mod (such as Iris) must remain forced-enabled. If it were disabled during testing, you would not be able to tell whether the
    issue was resolved or simply impossible to observe.
  </li>
</ul>

<static>
  <div class="mx-auto table">
    <div class="inline-grid grid-cols-1 justify-center gap-4 md:grid-cols-2">
      <Image
        src="/img/project/fabric-mod-bisect/gui-setup-screen.jpg"
        alt="GUI setup screen where the mods folder is loaded and mod loader is detected"
        caption="The GUI setup screen, with automatic mod loader detection and folder selection."
      />
      <Image
        src="/img/project/fabric-mod-bisect/gui-main-screen.jpg"
        alt="GUI main screen showing candidate progress"
        caption="The GUI main screen, showing candidate progress and remaining candidate counts."
      />
      <Image
        src="/img/project/fabric-mod-bisect/gui-test-screen.jpg"
        alt="GUI test prompt screen with Works, Broken, and Can't Tell options"
        caption="The GUI test screen, with options for Works, Broken, and Can't Tell (indeterminate)."
      />
      <Image
        src="/img/project/fabric-mod-bisect/gui-result-screen.jpg"
        alt="GUI result screen showing isolated conflict sets"
        caption="The GUI result screen, displaying the isolated conflict set and next action options."
      />
    </div>
  </div>
</static>

<hr class="my-12" />

<h2 class="mt-0" id="algorithm-iterative-minimal-conflict-search-with-indeterminate-results-imcs-i">Appendix</h2>

<h3>Algorithm: Iterative Minimal Conflict Search with Indeterminate Results (IMCS-I)</h3>

<p>
  The Iterative Minimal Conflict Search (IMCS) algorithm is a novel (citation needed hahaha), highly efficient method for identifying a 1-minimal conflict set
  from a larger collection of components. Building upon the core principles of binary search and iterative component isolation, IMCS maintains stable and
  predictable <code>O(p log n)</code> performance. While sharing the same optimal theoretical complexity as <code>QuickXplain</code> (QXP), IMCS distinguishes itself
  by adopting a "lean start" strategy, precisely targeting individual conflict elements and avoiding QXP's upfront speculative tests. This results in superior practical
  performance and significantly lower variance for sparse problems, making IMCS ideally suited for real-world troubleshooting scenarios.
</p>
<p>
  In practice, test outcomes are not always binary (<code>GOOD</code> vs. <code>FAIL</code>). A secondary issue, such as an undeclared dependency crashing the
  game before the target bug can be observed, leads to an <strong><code>INDETERMINATE</code></strong> result. <strong>IMCS-I</strong> extends IMCS to resolve these
  secondary conflicts automatically during bisection.
</p>

<h4>1. Objective</h4>

<p>
  To efficiently identify a 1-minimal conflict set of size <code>p</code> from a larger superset of <code>n</code> components (<code>C_all</code>). A conflict
  set is defined as the smallest subset of components that causes a system failure (or a designated undesirable outcome) when tested together.
</p>

<h4>2. Core Principle & Indeterminate Handling</h4>

<p>
  The IMCS algorithm operates on a "lean start, iterative isolation" principle. It fundamentally avoids the high overhead of speculative testing on large
  component sets. Instead, it executes a series of independent binary searches, each tasked with identifying exactly one new <em>conflict element</em> that contributes
  to the system's failure.
</p>
<p>
  An <code>INDETERMINATE</code> result on <code>StableSet ∪ C₁</code> indicates an undeclared dependency: a component in <code>C₁</code> silently requires a
  component in <code>C₂</code>, and the split separated them. Because IMCS guarantees that <code>test(StableSet ∪ CandidateSet) = FAIL</code> on every recursive
  call, an <code>INDETERMINATE</code> outcome on <code>StableSet ∪ C₁</code> guarantees that <code>test((StableSet ∪ C₂) ∪ C₁) = FAIL</code> for free without
  requiring an extra test run. When testing <code>C₂</code> confirms it is clean (<code>GOOD</code>), folding <code>C₂</code> into <code>StableSet</code>
  suppresses the secondary conflict across the entire recursive descent into <code>C₁</code>.
</p>

<h4>3. Algorithm Description</h4>

<p>The algorithm consists of a main procedure, <code>FindConflictSet</code>, and a recursive helper, <code>FindNextConflictElement</code>.</p>

<h5>Definitions:</h5>
<dl>
  <dt>C_all</dt>
  <dd>The initial superset of all <code>n</code> components.</dd>
  <dt>ConflictSet</dt>
  <dd>The set of components confirmed to be part of the minimal conflict set.</dd>
  <dt>CandidateSet</dt>
  <dd>The set of components currently being considered for inclusion in the <code>ConflictSet</code>.</dd>
  <dt>StableSet</dt>
  <dd>
    A set of components that has been tested together in the current search context and found to be stable (i.e., does not cause a failure). This set serves as
    the baseline for subsequent tests.
  </dd>
  <dt>test(S)</dt>
  <dd>
    A black-box function that returns <code>FAIL</code> if the system exhibits the target failure when configured with set <code>S</code>,
    <code>GOOD</code> if clean, and <code>INDETERMINATE</code> if a secondary issue masks the observation.
  </dd>
</dl>

<h5>Implicit Definitions:</h5>
<dl>
  <dt>ClearedSet</dt>
  <dd>
    An implicit subset of StableSet (specifically, <code>StableSet</code> \ <code>ConflictSet</code>) comprising components that have been tested and found not
    to contribute to the current system failure in their respective search contexts.
  </dd>
</dl>

<h5>Main Procedure: <code>FindConflictSet</code></h5>

<static>
  {@html highlight(
    'pseudo',
    String.raw`
function FindConflictSet(C_all):
  ConflictSet ← {}
  CandidateSet ← C_all
  loop indefinitely:
    // Find the next single component that, in conjunction with the current ConflictSet, contributes to the failure.
    nextElement ← FindNextConflictElement(StableSet=ConflictSet, CandidateSet=CandidateSet)

    // If no additional conflict element can be found, the process is complete.
    if nextElement is null:
      break

    // Add the found element to the confirmed ConflictSet and remove it from the candidate pool.
    ConflictSet ← ConflictSet ∪ {nextElement}
    CandidateSet ← CandidateSet \ {nextElement}

    // Optimization: Test if the current ConflictSet is already a complete, minimal set.
    // If it causes failure, we can terminate early without searching for more components.
    if test(ConflictSet) is FAIL: 
      break

  return ConflictSet
`
  )}

  <h5>Helper Procedure: <code>FindNextConflictElement</code></h5>

  {@html highlight(
    'pseudo',
    String.raw`
function FindNextConflictElement(StableSet, CandidateSet):
  // Base Case 1: No more candidates to test.
  if CandidateSet is empty:
    return null

  // Base Case 2: Handles CandidateSet of size 1.
  if size(CandidateSet) = 1:
    let c be the single element in CandidateSet
    if test(StableSet ∪ {c}) is FAIL:
      return c
    else:
      // GOOD: not a conflict element.
      // INDETERMINATE: c itself causes a secondary conflict; treat as non-element for this search.
      return null

  // Recursive Step: Divide and conquer.
  Split CandidateSet into two halves, C₁ and C₂.
  result₁ ← test(StableSet ∪ C₁)

  if result₁ is FAIL:
    if size(C₁) = 1:
      return the single element in C₁
    return FindNextConflictElement(StableSet, C₁)

  if result₁ is GOOD:
    new_stable ← StableSet ∪ C₁
    if size(C₂) = 1:
      if test(new_stable ∪ C₂) is FAIL:
        return the single element in C₂
      else:
        return null
    return FindNextConflictElement(new_stable, C₂)

  // --- INDETERMINATE: C₁ has a split-induced secondary conflict ---
  if result₁ is INDETERMINATE:
    result₂ ← test(StableSet ∪ C₂)

    // Primary conflict element is in C₂. Proceed normally.
    if result₂ is FAIL:
      if size(C₂) = 1:
        return the single element in C₂
      return FindNextConflictElement(StableSet, C₂)

    // C₂ is confirmed clean. Fold it into StableSet and recurse into C₁ (no extra test needed).
    if result₂ is GOOD:
      return FindNextConflictElement(StableSet ∪ C₂, C₁)

    // Both halves are INDETERMINATE (independent secondary conflicts on both sides).
    // Search both branches, each suppressing the other's secondary conflict.
    if result₂ is INDETERMINATE:
      // A practical alternative in this case is to just halt
      found ← FindNextConflictElement(StableSet ∪ C₂, C₁)
      if found is not null:
        return found
      return FindNextConflictElement(StableSet ∪ C₁, C₂)
`
  )}
</static>

<h4>4. Handling INDETERMINATE Outcomes</h4>

<h5>Single-INDETERMINATE: Resolving with a Single Test</h5>
<p>
  When a test on <code>C₁</code> returns <code>INDETERMINATE</code>, an undeclared dependency inside <code>C₁</code> was separated from its required mod in
  <code>C₂</code>. A naive troubleshooting approach might spend up to <code>O(log n)</code> additional tests trying to hunt down and restore the missing dependency.
</p>
<p>
  IMCS-I avoids this entirely. Because the algorithm already guarantees that <code>test(StableSet ∪ CandidateSet) = FAIL</code> on entry, we only need a
  <strong>single extra test</strong>
  on <code>C₂</code> (<code>test(StableSet ∪ C₂)</code>) to know exactly how to proceed:
</p>
<ul>
  <li>
    <strong>If <code>C₂</code> returns <code>FAIL</code>:</strong> The primary conflict element resides in <code>C₂</code>. Recursion proceeds into
    <code>C₂</code> as normal.
  </li>
  <li>
    <strong>If <code>C₂</code> returns <code>GOOD</code>:</strong> <code>C₂</code> is confirmed clean, meaning <code>(StableSet ∪ C₂) ∪ C₁</code> is guaranteed
    to fail. We fold <code>C₂</code> into <code>StableSet</code> to satisfy <code>C₁</code>'s missing dependency for the rest of the descent—requiring zero
    further tests.
  </li>
</ul>

<h5>Double-INDETERMINATE: Preventing Complexity Explosion</h5>
<p>
  If <code>C₂</code> <em>also</em> returns <code>INDETERMINATE</code>, two independent undeclared dependencies cross the split in opposite directions. Neither
  half has a clean baseline to lean on.
</p>
<p>
  If the algorithm attempted to fork and search both branches, the recurrence relation would shift from <code>T(n) = T(n/2) + O(1)</code> to
  <code>T(n) = 2·T(n/2) + O(1)</code>, causing the worst-case time complexity to explode from <code>O(log n)</code> to <code>O(n)</code>. Because this situation
  is extremely rare, the tool's implementation avoids exponential branch explosion by simply <strong>halting</strong> the search, reporting the two conflicting groups,
  and letting the user resolve the missing dependency before resuming.
</p>

<h4>5. Complexity Analysis</h4>

<h5>Time Complexity: O((p + q) log n)</h5>
<p>
  The algorithm's total cost is dominated by the <code>p</code> calls to the <code>FindNextConflictElement</code> procedure. Each call performs a binary search
  on a diminishing set of candidates (from <code>n</code> down to <code>n - p + 1</code>), with a baseline cost of <code>O(log n)</code> tests. When secondary
  conflicts occur, each isolated single-<code>INDETERMINATE</code> event costs exactly one extra complement test before clean logarithmic recursion resumes.
  Across <code>p</code> conflict elements and <code>q</code> single-indeterminate occurrences, the total test complexity is tightly bounded at
  <code>O((p + q) log n)</code>.
</p>

<h4>6. Extension: Finding All Independent Conflicts (IMCS-Enumerator)</h4>

<p>
  The core IMCS algorithm finds a single conflict set. The <code>IMCS_Enumerator</code> is a meta-procedure that extends this to discover all independent minimal
  conflict sets in a system that may have multiple unrelated faults.
</p>
<p>
  A persistent, cross-iteration test cache (<code>KnowledgeBase</code>) is not used. Such a cache is unworkable in practice for two fundamental reasons:
</p>
<ul>
  <li>
    A <code>FAIL</code> result is only relevant to its specific set of components; once a conflict element from that set is found and removed, that exact test can
    never be run again, rendering the cached result useless.
  </li>
  <li>
    A <code>GOOD</code> result is context-dependent on the user's current focus; caching it could incorrectly mask a different, independent issue in a subsequent
    search.
  </li>
</ul>
<p>
  Therefore, the only knowledge that can be safely persisted between iterations is the reduction of the candidate pool itself (<code
    >CandidateSet \ newConflictSet</code
  >).
</p>

<static>
  <h5>Meta-Procedure: <code>IMCS_Enumerator</code></h5>
  {@html highlight(
    'pseudo',
    String.raw`
function IMCS_Enumerator(C_all):
  AllConflictSets ← []
  CandidateSet ← C_all

  loop indefinitely:
    // Find the next conflict set using a fresh IMCS run. This ensures that
    // knowledge from previous runs does not incorrectly influence the current search.
    newConflictSet ← FindConflictSet(CandidateSet)

    // If IMCS returns an empty set, no more conflicts exist among the candidates.
    if newConflictSet is empty:
      break

    // A new independent conflict has been found.
    add newConflictSet to AllConflictSets
    
    // The only safe and persistent knowledge transfer is shrinking the problem space
    // by removing the components of the just-found conflict.
    CandidateSet ← CandidateSet \ newConflictSet

  return AllConflictSets
`
  )}
</static>

<h4>7. Capabilities and Limitations</h4>

<p>The IMCS algorithm suite is highly optimized for a specific class of diagnostic problems.</p>

<h5>Capabilities & Strengths</h5>

<ol>
  <li>
    <b>Optimized for Sparse Conflicts:</b> Exceptional <code>O(p log n)</code> performance and low variance when finding a small number (<code>p</code>) of
    conflict elements within a large set (<code>n</code>). This makes it ideal for real-world troubleshooting.
  </li>
  <li>
    <b>Robust Indeterminate Handling:</b> IMCS-I automatically resolves secondary issues caused by split-induced missing dependencies without discarding progress.
  </li>
  <li>
    <b>Black-Box Operation:</b> IMCS requires no internal knowledge of the system being tested. It operates purely on the <code>GOOD</code>/<code>FAIL</code> outcome
    of tests, making it universally applicable.
  </li>
  <li>
    <b>Low Overhead & High Stability:</b> The "lean start" strategy avoids wasteful speculative tests, and the iterative nature results in extremely stable, predictable
    performance with minimal variance, as confirmed by benchmarks.
  </li>
  <li>
    <b>Complete Conflict Enumeration:</b> The <code>IMCS_Enumerator</code> meta-procedure enumerates all separate, unrelated conflict sets efficiently.
  </li>
</ol>

<h5>Limitations</h5>

<ol>
  <li>
    <b>Finding Non-Minimal Supersets:</b> Designed to find only the smallest set causing a failure (<code>1-minimal</code>); does not report larger sets
    containing non-essential components.
  </li>
  <li>
    <b>Conflict Prioritization:</b> The algorithm finds conflict sets in an order determined by the binary search path, not by any measure of severity or probability.
  </li>
  <li>
    <b>Dense Conflicts:</b> Less efficient for dense problems where <code>p</code> is a large fraction of <code>n</code>, where algorithms like
    <code>QuickXplain</code> that leverage information reuse may perform better.
  </li>
  <li>
    <b>Non-Deterministic Systems:</b> Assumes deterministic outcomes. If identical component configurations produce contradictory results, IMCS may terminate with
    an incorrect conflict set.
  </li>
  <li>
    <b>Side Effects & External State:</b> The algorithm relies on mod toggling being a pure, reversible operation. If enabling or disabling a mod causes persistent
    side effects in game settings, the search can fail. This is quite rare in practice.
  </li>
</ol>
