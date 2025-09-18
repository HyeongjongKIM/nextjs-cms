import { PageSchema } from '@/lib/generated/zod';
import { z } from 'zod';

// Create form schema by picking fields from generated PageSchema and making some optional
const pageFormSchema = PageSchema.pick({
  title: true,
  slug: true,
  content: true,
  excerpt: true,
  featuredImage: true,
  category: true,
  tags: true,
  metaTitle: true,
  metaDescription: true,
  ogImage: true,
  status: true,
})
  .extend({
    // Make slug optional for forms (will be auto-generated if not provided)
    slug: z.string().optional(),
    // Make optional fields truly optional (empty strings converted to null)
    excerpt: z.string().optional(),
    featuredImage: z.string().optional(),
    category: z.string().optional(),
    tags: z.string().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    ogImage: z.string().optional(),
  })
  .refine(
    (data) => {
      // Validate slug format if provided
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

// Use the same schema for both create and update
const createPageSchema = pageFormSchema;
const updatePageSchema = pageFormSchema;

type CreatePageFormValues = z.infer<typeof createPageSchema>;
type UpdatePageFormValues = z.infer<typeof updatePageSchema>;
type PageFormValues = CreatePageFormValues | UpdatePageFormValues;

export {
  createPageSchema,
  updatePageSchema,
  type CreatePageFormValues,
  type UpdatePageFormValues,
  type PageFormValues,
};
