import { Context } from './types';
import { collection, getDocs } from 'firebase/firestore/lite';
import { $ } from './html';
import './blog.css';
import { DocumentData } from '@google-cloud/firestore';

export async function create({ db }: Context, root$: HTMLElement) {
	const blog = collection(db, 'blog');
	const entries = await getDocs(blog);

	if (entries.empty) {
		root$.append(
			$('h2', {
				text: 'Sorry, no entries!',
			})
		);
		return;
	}

	const list$ = $('ol', { class: 'blog-entry-list' });
	const dateFormat = new Intl.DateTimeFormat('en-GB', {
		dateStyle: 'full',
		timeStyle: 'short',
		timeZone: 'UTC',
	});
	entries.docs;
	const sortedEntries = entries.docs
		.map((doc) => ({ ...doc.data(), _id: doc.id } as any))
		.sort((doc) => doc.created_date.seconds);
	for (const entry of sortedEntries) {
		const element$ = $('li', { class: 'blog-entry-element', attr: { tabindex: '0' } });
		element$.append(createArticle(entry, dateFormat));
		list$.append(element$);
	}
	root$.append(list$);

	if (location.hash.length > 1) {
		const fragment = document.getElementById(location.hash.substring(1));
		if (fragment != null) fragment.scrollIntoView({ behavior: 'auto' });
	}
}

function createArticle(entry: DocumentData, dateFormat: Intl.DateTimeFormat) {
	const article$ = $('article', {});
	article$.append(
		$('span', {
			class: 'blog-entry-heading',
			childs: [
				$('h2', {
					text: entry.title,
				}),
				$('a', {
					text: '#',
					attr: {
						href: `#${entry._id}`,
						id: entry._id,
					},
				}),
			],
		})
	);
	const createdDate = new Date(entry.created_date.seconds * 1000);
	const modifiedDate = new Date(entry.modified_date.seconds * 1000);
	const time$ = $('span', {
		class: 'blog-entry-time',
		childs: [
			$('time', {
				text: dateFormat.format(createdDate),
				attr: {
					datetime: createdDate.toISOString(),
				},
			}),
		],
	});
	if (Math.abs(modifiedDate.getTime() - createdDate.getTime()) > 1000 * 60 * 10) {
		time$.append($('text', ' — Edited '));
		time$.append(
			$('time', {
				text: dateFormat.format(modifiedDate),
				attr: {
					datetime: modifiedDate.toISOString(),
				},
			})
		);
	}
	article$.append(time$);
	article$.append(
		$('div', {
			class: 'blog-entry-body',
			text: entry.body,
		})
	);
	return article$;
}
