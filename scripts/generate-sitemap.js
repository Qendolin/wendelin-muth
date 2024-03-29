import SitemapGenerator from 'sitemap-generator';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore/lite';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
	apiKey: 'AIzaSyDJ8atqjyu3jXNoCgj8Zi8iAwTUqvWTljk',
	authDomain: 'wendelin-muth.firebaseapp.com',
	projectId: 'wendelin-muth',
	storageBucket: 'wendelin-muth.appspot.com',
	messagingSenderId: '982220326248',
	appId: '1:982220326248:web:1d17c23b5c8e35a76b02dd',
	measurementId: 'G-X73GPRXRWM'
};

const base = 'https://www.webindex.page/';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fetchBlogEntries() {
	const blog = collection(db, 'blog');
	const documents = await getDocs(query(blog, where('draft', '==', false)));
	const entries = documents.docs.map((doc) => ({ ...doc.data(), _id: doc.id }));
	for (const { _id, title, slug } of entries) {
		if (!slug) throw new Error(`Entry "${title}" (${_id}) does not have a slug`);
	}
	return entries.map((doc) => `${base}entry/${doc.slug}`);
}

// create generator
const generator = SitemapGenerator(base, {
	stripQuerystring: false,
	filepath: './static/sitemap.xml',
	changeFreq: 'weekly'
});

generator.on('done', () => {
	console.log('Done!');
});

generator.on('error', (error) => {
	console.log(error);
});

fetchBlogEntries()
	.then((urls) => urls.forEach((url) => generator.queueURL(url)))
	.then(() => generator.start());
