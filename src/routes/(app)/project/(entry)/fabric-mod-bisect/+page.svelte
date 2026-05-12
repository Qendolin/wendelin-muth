<script lang="ts">
  import Image from '$lib/components/Image.static.svelte';
  import Link from '$lib/components/Link.static.svelte';
  import { highlight } from '$lib/code.static';
</script>

<p>
  Anyone who has run a large Minecraft modpack has been there. The game crashes, the log is unhelpful, and you have a hundred mods to blame. The usual approach
  is to manually disable half your mods, try again, and repeat until you find the culprit. It works, but it is tedious and easy to get wrong. I wrote this tool
  to automate that process properly.
</p>
<p>
  The source and prebuilt binaries for Windows, Linux, and macOS are on <Link href="https://github.com/Qendolin/fabric-mod-bisect-tool">GitHub</Link>.
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
  The algorithm described in the appendix (IMCS) is my own approach, designed specifically for this use case. It is optimized for situations where only a small
  number of conflicts exist within a large set of components, focusing on minimizing the number of required test runs by isolating one conflicting element at a
  time. In contrast, delta debugging (ddmin) and QuickXplain (QXP) have a lot of overhead in such scenarios, but perform better when the number of conflicts is
  large.
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

<h2>Future Work</h2>

<p>
  One limitation is that a test result is not always simply "Good" or "Fail". In practice, other issues can mask the real problem and lead to indeterminate
  outcomes, for example due to missing or incorrect dependency metadata. The tool currently does not handle such cases, but I have a potential approach in mind
  to address this in the future.
</p>

<hr class="my-12" />

<h2 class="mt-0">Appendix</h2>

<h3>Algorithm: Iterative Minimal Conflict Search (IMCS)</h3>

<p>
  The Iterative Minimal Conflict Search (IMCS) algorithm is a novel, highly efficient method for identifying a 1-minimal conflict set from a larger collection
  of components. Building upon the core principles of binary search and iterative component isolation, IMCS significantly refines traditional bisection
  techniques. Unlike the classic <code>ddmin</code> algorithm, which struggles with multi-component conflicts due to its exponential increase in test calls when
  faced with union issues, IMCS maintains stable and predictable <code>O(p log n)</code> performance. While sharing the same optimal theoretical complexity as
  <code>QuickXplain</code> (QXP), IMCS distinguishes itself by adopting a "lean start" strategy, precisely targeting individual conflict elements and avoiding QXP's
  upfront speculative tests. This results in superior practical performance and significantly lower variance for sparse problems, making IMCS ideally suited for real-world
  troubleshooting scenarios.
</p>

<h4>1. Objective</h4>

<p>
  To efficiently identify a 1-minimal conflict set of size <code>p</code> from a larger superset of <code>n</code> components. A conflict set is defined as the smallest
  subset of components that causes a system failure (or a designated undesirable outcome) when tested together.
</p>

<h4>2. Core Principle</h4>

<p>
  The IMCS algorithm operates on a "lean start, iterative isolation" principle. It fundamentally avoids the high overhead of speculative testing on large
  component sets. Instead, it executes a series of highly efficient, independent binary searches. Each search is tasked with identifying exactly one new
  <em>conflict element</em> that contributes to the system's failure. This iterative process guarantees stable, predictable performance and is mathematically
  optimized for sparse conflicts (where <code>p</code> is much smaller than <code>n</code>), which is the common scenario in troubleshooting complex systems.
</p>

<h4>3. Algorithm Description</h4>

<p>The algorithm consists of a main procedure, <code>FindConflictSet</code>, and a recursive helper, <code>FindNextConflictElement</code>.</p>

<h5>Definitions:</h5>
<dl>
  <dt>InitialCandidates</dt>
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
    A black-box function that returns <code>FAIL</code> if the system exhibits the undesirable outcome when configured with set <code>S</code> of components,
    and <code>GOOD</code> otherwise.
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
function FindConflictSet(InitialCandidates):
  ConflictSet ← {}
  CandidateSet ← InitialCandidates
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

  // Base Case 2: Handles the initial call if CandidateSet has only one element.
  if size(CandidateSet) = 1:
    let c be the single element in CandidateSet
    if test(StableSet ∪ {c}) is FAIL:
      return c
    else:
      return null

  // Recursive Step: Divide and conquer.
  Split CandidateSet into two halves, C₁ and C₂.

  // Test the first half in conjunction with the current StableSet.
  if test(StableSet ∪ C₁) is FAIL:
    // The next conflict element is in C₁.
    // Optimization: If C₁ is a single element, it must be the one.
    if size(C₁) = 1:
      return the single element in C₁
    else:
      return FindNextConflictElement(StableSet, C₁)

  // Otherwise, the first half is safe. Add it to the StableSet and search C₂.
  else:
    newStableSet ← StableSet ∪ C₁
    // Optimization: The next conflict element might be in C₂.
    // If C₂ is a single element, test it directly.
    if size(C₂) = 1:
      let c be the single element in C₂
      if test(newStableSet ∪ {c}) is FAIL:
        return c
      else:
        return null // This was the last possible conflict element.
    else:
      return FindNextConflictElement(newStableSet, C₂)
`
  )}
</static>

<h4>4. Complexity Analysis</h4>

<h5>Time Complexity: O(p log n)</h5>

<p>
  The algorithm's total cost is dominated by the <code>p</code> calls to the <code>FindNextConflictElement</code> procedure. Each call performs a binary search
  on a diminishing set of candidates (from <code>n</code> down to <code>n-p+1</code>), with a cost of <code>O(log n)</code>. Therefore, the total time
  complexity is <code>O(p log n)</code>.
</p>

<h5>Space Complexity: O(n)</h5>
<p>
  The algorithm requires storing the set of candidates, which is initially of size <code>n</code>. The recursion depth of the helper function is
  <code>O(log n)</code>.
</p>

<h4>5. Extension: Finding All Independent Conflicts (IMCS_Enumerator)</h4>

<p>
  The core IMCS algorithm finds a single conflict set. The <code>IMCS_Enumerator</code> is a meta-procedure that extends this to discover all independent minimal
  conflict sets in a system that may have multiple unrelated faults.
</p>
<p>
  A persistent, cross-iteration test cache ("knowledge base") is not used. Such a cache is unworkable in practice for two fundamental reasons. First, a <code
    >FAIL</code
  >
  result is only relevant to its specific set of components; once a conflict element from that set is found and removed, that exact test can never be run again, rendering
  the cached result useless. Second, a <code>GOOD</code> result is context-dependent on the user's current focus; caching it could incorrectly mask a different, independent
  issue in a subsequent search. Therefore, the only knowledge that can be safely and usefully persisted between iterations is the reduction of the candidate pool
  itself.
</p>

<static>
  <h5>Meta-Procedure: <code>IMCS_Enumerator</code></h5>
  {@html highlight(
    'pseudo',
    String.raw`
function IMCS_Enumerator(InitialCandidates):
  AllConflictSets ← []
  CandidateSet ← InitialCandidates

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

<h4>6. Capabilities and Limitations</h4>

<p>The IMCS algorithm suite is highly optimized for a specific class of diagnostic problems.</p>

<h5>Capabilities & Strengths</h5>

<ol>
  <li>
    <b>Optimized for Sparse Conflicts:</b> The algorithm's primary strength is its exceptional <code>O(p log n)</code> performance and low variance when finding
    a small number (<code>p</code>) of conflict elements within a large set (<code>n</code>). This makes it ideal for real-world troubleshooting.
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
    <b>Complete Conflict Enumeration:</b>The <code>IMCS_Enumerator</code> extension provides a state-of-the-art method for enumerating all separate, unrelated conflict
    sets efficiently.
  </li>
</ol>

<h5>Limitations</h5>

<ol>
  <li>
    <b>Finding Non-Minimal Supersets:</b> IMCS is designed to find only the <em>smallest</em> set that causes a failure (<code>1-minimal</code>). It will not
    report larger sets that also fail but contain non-essential components.
  </li>
  <li>
    <b>Conflict Prioritization:</b> The algorithm finds conflict sets in an order determined by the binary search path, not by any measure of severity or probability.
  </li>
  <li>
    <b>Dense Conflicts:</b> As demonstrated by benchmarks against <code>QuickXplain</code>, IMCS is less efficient for "dense" problems where <code>p</code> is
    a large fraction of <code>n</code>. In such scenarios, algorithms that leverage information reuse more aggressively may perform better.
  </li>
  <li>
    <b>Non-Deterministic Systems:</b> The algorithm relies on the system behaving deterministically. If a test on the same set of components can produce both
    <code>GOOD</code> and <code>FAIL</code> results, IMCS may fail to find a consistent conflict set or may terminate with an incorrect result.
  </li>
</ol>
