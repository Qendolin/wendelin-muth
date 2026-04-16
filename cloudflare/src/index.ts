/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
	DB: D1Database;
	ADMIN_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Allow your website to call the API
app.use(
	'/*',
	cors({
		origin: ['https://www.webindex.page', 'http://localhost:5173', 'http://localhost:4173'],
		allowHeaders: ['Content-Type', 'Authorization'],
		allowMethods: ['GET', 'POST', 'OPTIONS'],
	}),
);

// --- ADMIN AUTH MIDDLEWARE ---
// This protects ALL routes starting with /admin/
app.use('/admin/*', async (c, next) => {
	const authHeader = c.req.header('Authorization');
	if (authHeader !== `Bearer ${c.env.ADMIN_SECRET}`) {
		return c.json({ error: 'Unauthorized' }, 401);
	}
	await next();
});

// ==============================
// POLLS CRUD
// ==============================

// READ
app.get('/admin/polls', async (c) => {
	const { results } = await c.env.DB.prepare('SELECT * FROM polls_polls ORDER BY created_at DESC').all();
	return c.json(results);
});

// CREATE
app.post('/admin/polls', async (c) => {
	const { id, options } = await c.req.json();

	await c.env.DB.prepare('INSERT INTO polls_polls (id) VALUES (?, ?)').bind(id).run();

	const stmt = c.env.DB.prepare('INSERT INTO polls_options (poll_id, text) VALUES (?, ?)');
	const batch = options.map((opt: string) => stmt.bind(id, opt));
	await c.env.DB.batch(batch);

	return c.json({ success: true, id });
});

// DELETE: Remove a poll (Deletes votes, then options, then the poll)
app.delete('/admin/polls/:id', async (c) => {
	const pollId = c.req.param('id');

	// We use batch() so they all delete together safely
	await c.env.DB.batch([
		c.env.DB.prepare('DELETE FROM polls_votes WHERE poll_id = ?').bind(pollId),
		c.env.DB.prepare('DELETE FROM polls_options WHERE poll_id = ?').bind(pollId),
		c.env.DB.prepare('DELETE FROM polls_polls WHERE id = ?').bind(pollId),
	]);

	return c.json({ success: true });
});

// ==============================
// OPTIONS CRUD
// ==============================

// CREATE: Add a new option to an existing poll
app.post('/admin/polls/:id/options', async (c) => {
	const pollId = c.req.param('id');
	const { text } = await c.req.json();

	// "RETURNING id" asks SQLite to give us back the auto-generated ID
	const newOption = await c.env.DB.prepare('INSERT INTO polls_options (poll_id, text) VALUES (?, ?) RETURNING id')
		.bind(pollId, text)
		.first();

	return c.json({ success: true, optionId: newOption?.id });
});

// UPDATE: Change the text of an option
app.put('/admin/options/:id', async (c) => {
	const optionId = c.req.param('id');
	const { text } = await c.req.json();

	await c.env.DB.prepare('UPDATE polls_options SET text = ? WHERE id = ?').bind(text, optionId).run();

	return c.json({ success: true });
});

// DELETE: Remove an option (and its associated votes)
app.delete('/admin/options/:id', async (c) => {
	const optionId = c.req.param('id');

	await c.env.DB.batch([
		c.env.DB.prepare('DELETE FROM polls_votes WHERE option_id = ?').bind(optionId),
		c.env.DB.prepare('DELETE FROM polls_options WHERE id = ?').bind(optionId),
	]);

	return c.json({ success: true });
});

// --- PUBLIC: Get Poll ---
app.get('/polls/:id', async (c) => {
	const pollId = c.req.param('id');

	if (!pollId) {
		return c.json({ error: "Missing parameter 'id'" }, 400);
	}

	const results = await c.env.DB.prepare(
		`
    SELECT id, text, vote_count as votes
    FROM polls_options
    WHERE poll_id = ?
  `,
	)
		.bind(pollId)
		.all();

	return c.json({ pollId, results: results.results });
});

// --- PUBLIC: Vote ---
app.post('/polls/:id/vote', async (c) => {
	const pollId = c.req.param('id');

	if (!pollId) {
		return c.json({ error: "Missing parameter 'id'" }, 400);
	}

	let body;
	try {
		body = await c.req.json();
	} catch (e) {
		return c.json({ error: 'Invalid JSON payload' }, 400);
	}
	const { userId, optionIds } = body;

	// 1. Delete existing votes for this user on this poll (Allows changing votes)
	await c.env.DB.prepare('DELETE FROM polls_votes WHERE poll_id = ? AND user_id = ?').bind(pollId, userId).run();

	// 2. Insert new votes (Allows multiple choices)
	if (optionIds && optionIds.length > 0) {
		const stmt = c.env.DB.prepare('INSERT INTO polls_votes (poll_id, option_id, user_id) VALUES (?, ?, ?)');
		const batch = optionIds.map((optId) => stmt.bind(pollId, optId, userId));
		await c.env.DB.batch(batch);
	}

	return c.json({ success: true });
});

export default app satisfies ExportedHandler<Env>;
