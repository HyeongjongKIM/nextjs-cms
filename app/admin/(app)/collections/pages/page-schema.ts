import { PageSchema } from '@/lib/generated/zod';
import { z } from 'zod';

const createPageSchema = z
  .object({
    title: z.string().min(1, { message: 'Title is required' }),
    slug: z.string().optional(),
    content: z.string().min(1, { message: 'Content is required' }),
    excerpt: z.string().optional(),
    featuredImage: z.string().optional(),
    category: z.string().optional(),
    tags: z.string().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    ogImage: z.string().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  })
  .refine(
    (data) => {
      if (data.slug && data.slug.length > 0) {
        return /^[a-z0-9-]+$/.test(data.slug);
      }
      return true;
    },
    {
      message: 'Slug must contain only lowercase letters, numbers, and hyphens',
      path: ['slug'],
    }
  );

type CreatePageFormValues = z.infer<typeof createPageSchema>;

export { createPageSchema, type CreatePageFormValues };
