#!/usr/bin/env npx tsx
/**
 * generate-blog-meta.ts
 *
 * Walks all blog/(entry) slug directories, reads each +page.sveltex, and uses a
 * local llama-server (port 8080, router mode) to generate:
 *   - description  – ~25-word blurb
 *   - topics       – array of relevant tags
 *
 * Then rewrites the sidecar +page.ts with those values inserted / updated.
 *
 * Usage:
 *   deno --allow-all scripts/generate-blog-meta.ts [--dry-run] [--slug some-slug] [--force] [--seed seed]
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { CommonTopics } from '../src/lib/blog-entry';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const LLAMA_BASE_URL = 'http://localhost:8080';
const MODEL = 'unsloth/gemma-4-E4B-it-GGUF:Q4_K_M';
const BLOG_ROOT = path.resolve('src/routes/(app)/blog/(entry)');

const PREDEFINED_TOPICS = Array.from(CommonTopics);

// ---------------------------------------------------------------------------
// JSON schema for structured output
// ---------------------------------------------------------------------------

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    description: {
      type: 'string',
      description: 'A concise ~25-word blurb summarising the blog post.'
    },
    topics: {
      type: 'array',
      items: { type: 'string' },
      description: 'Relevant topic tags for the post.'
    }
  },
  required: ['description', 'topics'],
  additionalProperties: false
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LLMResult {
  description: string;
  topics: string[];
}

// ---------------------------------------------------------------------------
// LLM call
// ---------------------------------------------------------------------------

async function callLlm(postContent: string, title: string, seed: number | null): Promise<LLMResult> {
  const systemPrompt = `You are writing meta descriptions and topic tags for a personal/technical blog. Follow these rules exactly.

## Description rules

- Length: approximately 25 words. Do not go significantly over or under.
- Never use hype or marketing language.
- Never use em dashes (— or –). Use commas, parentheses, or rewrite the sentence instead.
- Never say "the author", "the writer", or refer to the blogger in the third person.
- Do not describe the post's metadata or format. Do not mention that it "includes a video", "links to a repository", "contains code snippets", etc. Describe the ideas and content, not the packaging.
- Do not invent or infer facts that are not clearly stated in the post. If you are not sure whether something is true, leave it out. It is better to write a shorter, accurate description than a longer one that contains assumptions.
- Do not make it sound dry.

### Starter examples

These are just some examples, you do not have to stick to them.

- "A few notes on…"
- "See how I…"
- "I think we should…"
- "XYZ is…"
- "Using XYZ to…" or "Building XY using Z…" or any combination of the "verb + gerund + noun" pattern.

## Topics rules

- Pick tags that directly reflect the concrete subject matter of the post.
- Prefer tags from this predefined list when they fit: ${PREDEFINED_TOPICS.join(', ')}
- You may add new tags if none of the predefined ones are appropriate. Keep new tags concise and consistent in style with the existing ones.
- Use "Learning" only when the post is explicitly about the process of learning something, such as picking up a new language or skill from scratch. Do not use it simply because a reader could learn something from the post.
- Do not over-tag. 2 to 4 tags is usually right. Only add more if the post genuinely spans multiple distinct topics.
`;

  const systemPrompt2 = `You are writing meta descriptions and topic tags for a personal technical blog. Follow these rules exactly.

## Description rules

- Length: approximately 25 words. Do not go significantly over or under.
- Tone: neutral. Write like a technical abstract, not a tweet or ad copy.
- Never use hype, marketing language, or calls-to-action. Forbidden phrases include (but are not limited to): "Explore how…", "Discover how…", "Learn how…", "Dive into…", "Find out…", "See how…", "Take a look at…", and any variation of these.
- Never use em dashes (— or –). Use commas, parentheses, or rewrite the sentence instead.
- Do not always start with "I" unless it is genuinely the most natural way to open. Prefer leading with the subject matter itself. "I" is fine mid-sentence or when the post is clearly personal ("I built X" for a project post), but avoid forcing it as a default opener. As an example, you can also start with 'A …' (i.e. "A brief note on…").
- Do not use passive or participial openers ("Built X", "Developed X", "Designed X").
- Never say "the author", "the writer", or refer to the blogger in the third person.
- Do not pad the description with generic statements about what the reader will gain. Describe what the post actually contains.
- If the post is short or covers a narrow topic, write a correspondingly modest description. Do not exaggerate the scope or depth of the post.
- If the post is a personal opinion or observation, reflect that plainly (e.g. "A short note on…", "My take on…", "Thoughts on…").
- Do not describe the post's metadata or format. Do not mention that it "includes a video", "links to a repository", "contains code snippets", etc. Describe the ideas and content, not the packaging.
- Do not invent or infer facts that are not clearly stated in the post. If you are not sure whether something is true, leave it out. It is better to write a shorter, accurate description than a longer one that contains assumptions.
- Never start the description with "This post", "The post", "In this post", or any similar self-referential opener. Just describe the subject matter directly.
- Do not describe the post's metadata or format. Do not mention that it "includes a video", "links to X", "includes a listen link", "contains code snippets", etc. Describe the ideas and content, not the packaging.
- If the post is very short (two or three short paragraphs at most), a lighter and more conversational tone is acceptable. There is not much to say about the contents, so a brief, relaxed description is fine. The other rules still apply (no hype, no "This post", no packaging descriptions, no invented facts).

## Topics rules

- Pick tags that directly reflect the concrete subject matter of the post.
- Prefer tags from this predefined list when they fit: ${PREDEFINED_TOPICS.join(', ')}
- You may add new tags if none of the predefined ones are appropriate. Keep new tags concise and consistent in style with the existing ones.
- Use "Learning" only when the post is explicitly about the process of learning something, such as picking up a new language or skill from scratch. Do not use it simply because a reader could learn something from the post.
- Do not over-tag. 2 to 4 tags is usually right. Only add more if the post genuinely spans multiple distinct topics.

## Examples

Post: A write-up of a small turn-based game built in C++ with OpenGL for a university graphics course.
Good description: "My first proper game, built in C++ with OpenGL for a uni graphics course. Covers the basic architecture and a few things I would do differently."
Good topics: ["C++", "OpenGL", "Game", "Computer Graphics"]

Post: An argument that binary tree child pointers should have semantically meaningful names instead of generic "left" and "right".
Good description: "A case for naming binary tree children after their semantic role rather than position, making the structure's intent clearer at the call site."
Good topics: ["C++"]

Post: A short post written shortly after ChatGPT launched with first impressions on what it is good and bad at.
Good description: "A short note on ChatGPT shortly after launch. First impressions on where it handles coding and reasoning well, and where it falls flat."
Good topics: ["Tool"]

Post: A post considering whether to use Disqus for blog comments, weighing up the tracking and bundle size downsides.
Good description: "Weighing up Disqus for blog comments. The tracking baggage and bundle size give me pause."
Good topics: ["Tool"]

## Anti-examples (never produce descriptions like these)

Bad: "Check out 'Ascent,' the author's debut game, developed for a Computer Graphics course. See the project in action and download the Windows/Linux builds now!"
Why bad: Third-person ("the author's"), call-to-action ("Check out", "See the project in action"), marketing tone.

Bad: "Explore how ChatGPT is transforming productivity. Discover how this AI assistant excels at solving complex coding problems, tackling math, and boosting creative brainstorming."
Why bad: Hype verbs ("Explore", "Discover"), wildly overstates the scope of a short impressionistic post, no concrete information.

Bad: "The post includes the project repository, builds for Windows and Linux, and a demonstration video."
Why bad: Describes the format and packaging of the post, not the actual content or ideas.

Bad: "I transitioned from using Disqus due to tracking and bundle size issues, electing to build a custom comment system."
Why bad: States as fact something the post does not say. Only describe what is clearly present in the post.

Bad: "This post describes ReVanced, a patched application manager that functions as a replacement for YouTube Vanced."
Why bad: Opens with "This post", which is a self-referential filler phrase. Start with the subject matter directly instead.`;

  const userPrompt = `Title: ${title}

--- BEGIN POST ---
${postContent.slice(0, 12000)}
--- END POST ---`;

  const body = {
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 1.0,
    max_tokens: 4096 + 2048,
    num_ctx: 16384 + 4096 * 2,
    seed: 42,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'blog_meta',
        strict: true,
        schema: RESPONSE_SCHEMA
      }
    }
  };

  if (seed !== null && seed !== undefined) {
    body.seed = seed;
  }

  const res = await fetch(`${LLAMA_BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`llama-server error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  const raw = data.choices[0]?.message?.content ?? '';

  // Strip any <think>…</think> reasoning block the model may emit before JSON
  const stripped = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // Extract JSON – handle models that wrap output in ```json fences
  const jsonMatch = stripped.match(/```(?:json)?\s*([\s\S]*?)```/) ?? stripped.match(/(\{[\s\S]*\})/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : stripped;

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error(`Failed to parse LLM JSON response:\n${raw}`);
  }

  if (typeof parsed !== 'object' || parsed === null || !('description' in parsed) || !('topics' in parsed)) {
    throw new Error(`Unexpected LLM response shape: ${JSON.stringify(parsed)}`);
  }

  return parsed as LLMResult;
}

// ---------------------------------------------------------------------------
// +page.ts rewriter
// ---------------------------------------------------------------------------

/**
 * Inserts or replaces `description` and `topics` inside the meta object
 * literal in a +page.ts source string.  Uses a text-level approach that
 * preserves the rest of the file unchanged.
 */
function rewriteMetaSource(source: string, result: LLMResult): string {
  const { description, topics } = result;

  const descValue = JSON.stringify(description);
  const topicsValue = topics.length === 0 ? '[]' : `[\n    ${topics.map((t) => JSON.stringify(t)).join(',\n    ')},\n  ]`;

  let out = source;

  // ---- description ----
  const descRegexLegacy = /(\bdescription\s*:[\s\n]*)(['"])(?:[^\\]|\\.)*?\2/;
  const descRegexBacktick = /(\bdescription\s*:[\s\n]*)`[^`]*`/;

  if (descRegexBacktick.test(out)) {
    out = out.replace(descRegexBacktick, `$1${descValue}`);
  } else if (descRegexLegacy.test(out)) {
    out = out.replace(descRegexLegacy, `$1${descValue}`);
  } else {
    out = out.replace(/(title\s*:\s*['"`][^'"`]*['"`]\s*,)/, `$1\n  description: ${descValue},`);
  }

  // ---- topics ----
  const topicsRegex = /(\btopics\s*:\s*)\[[^\]]*\]/s;
  if (topicsRegex.test(out)) {
    out = out.replace(topicsRegex, `$1${topicsValue}`);
  } else {
    // Insert before closing brace of the meta object
    out = out.replace(/(\n\s*draft\s*:)/, `\n  topics: ${topicsValue},$1`);
  }

  return out;
}

// ---------------------------------------------------------------------------
// Directory walker
// ---------------------------------------------------------------------------

function findSlugs(): string[] {
  if (!fs.existsSync(BLOG_ROOT)) {
    console.error(`Blog root not found: ${BLOG_ROOT}`);
    process.exit(1);
  }
  return fs
    .readdirSync(BLOG_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const slugFilter = (() => {
  const idx = args.indexOf('--slug');
  return idx !== -1 ? args[idx + 1] : null;
})();
const force = args.includes('--force');
const seed = (() => {
  const idx = args.indexOf('--seed');
  return idx !== -1 ? parseInt(args[idx + 1]) : null;
})();

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  let slugs = findSlugs();
  if (slugFilter) {
    slugs = slugs.filter((s) => s === slugFilter);
    if (slugs.length === 0) {
      console.error(`No slug matching "${slugFilter}" found.`);
      process.exit(1);
    }
  }

  console.log(`Found ${slugs.length} blog entries.`);
  if (dryRun) console.log('DRY RUN - no files will be written.\n');

  let ok = 0,
    skipped = 0,
    failed = 0;

  for (const slug of slugs) {
    if (slug.startsWith('!')) continue;

    const dir = path.join(BLOG_ROOT, slug);
    const pagePath = path.join(dir, '+page.sveltex');
    const metaPath = path.join(dir, '+page.ts');

    if (!fs.existsSync(pagePath)) {
      console.warn(`  [skip] ${slug}: +page.sveltex not found`);
      skipped++;
      continue;
    }
    if (!fs.existsSync(metaPath)) {
      console.warn(`  [skip] ${slug}: +page.ts not found`);
      skipped++;
      continue;
    }

    const pageContent = fs.readFileSync(pagePath, 'utf-8');
    const metaSource = fs.readFileSync(metaPath, 'utf-8');

    const alreadyHasDescription = /\bdescription\s*:/.test(metaSource) && !/\bdescription\s*:\s*(['"`])\s*\1/.test(metaSource);
    if (alreadyHasDescription && !force) {
      console.log(`  [skip] ${slug}: already has description (use --force to regenerate)`);
      skipped++;
      continue;
    }

    // Extract title for the prompt
    const titleMatch = metaSource.match(/title\s*:\s*['"`]([^'"`]+)['"`]/);
    const title = titleMatch ? titleMatch[1] : slug;

    process.stdout.write(`  [${slug}] Generating... `);

    let result: LLMResult;
    try {
      result = await callLlm(pageContent, title, seed);
    } catch (err) {
      console.error(`FAILED\n    ${(err as Error).message}`);
      failed++;
      continue;
    }

    console.log('done');
    console.log(`    description: ${result.description}`);
    console.log(`    topics:      ${result.topics.join(', ')}`);

    if (!dryRun) {
      const newMeta = rewriteMetaSource(metaSource, result);
      fs.writeFileSync(metaPath, newMeta, 'utf-8');
      console.log(`    → Written to ${path.relative(process.cwd(), metaPath)}`);
    }

    ok++;
  }

  console.log(`\nDone. ${ok} updated, ${skipped} skipped, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main();
