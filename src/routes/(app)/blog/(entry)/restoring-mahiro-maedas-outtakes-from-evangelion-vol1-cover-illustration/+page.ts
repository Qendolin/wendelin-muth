import type { PageLoad } from './$types';
import type { BlogEntryMeta } from '$lib/blog-entries';
import { SimpleDate } from '$lib/date';

export const _meta: BlogEntryMeta = {
  title: "Restoring Mahiro Maeda's 'Outtakes From Evangelion (Vol.1)' Cover Illustration",
  description:
    'Combining archival research and image restoration techniques, this piece details bringing back the detail of an Evangelion album cover using specialized denoising and upscaling.',
  createdDate: SimpleDate(2023, 9, 30),
  modifiedDate: SimpleDate(2024, 1, 31),
  topics: ['Computer Graphics', 'Media', 'Tool'],
  draft: false
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
