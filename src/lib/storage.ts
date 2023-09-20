import { ref, uploadBytes, type StorageReference, type UploadMetadata } from 'firebase/storage';
import { storage } from './fire-context';

type CustomMetadata = {
	originalName: string;
};

export async function uploadStaticPublicFile(file: File): Promise<StorageReference> {
	const uuid = crypto.randomUUID();
	const ext = file.name.split('.').pop();
	const fileRef = ref(storage, `/public/content/${uuid}.${ext}`);

	const metadata: UploadMetadata = {
		contentType: file.type,
		cacheControl: 'public,max-age=31536000,immutable',
		customMetadata: {
			originalName: file.name
		} as CustomMetadata
	};

	await uploadBytes(fileRef, file, metadata);

	return fileRef;
}

export function stripStorageToken(href: string) {
	const url = new URL(href);
	url.searchParams.delete('token');
	return url.href;
}
