'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  PageFormValues,
  createPageSchema,
  updatePageSchema,
} from './page-schema';
import { createPage, updatePage, type PageTableData } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageStatus } from '@/lib/generated/prisma';
import { generateSlug } from '@/lib/utils';
import { toast } from 'sonner';

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'ARCHIVED', label: 'Archived' },
] as const;

interface PageFormProps {
  page?: PageTableData;
  onSuccess?: () => void;
}

export function PageForm({ page, onSuccess }: PageFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [autoSlug, setAutoSlug] = useState(true);

  const isEdit = !!page;
  const schema = isEdit ? updatePageSchema : createPageSchema;

  const form = useForm<PageFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: page?.title || '',
      slug: page?.slug || '',
      content: page?.content || '',
      excerpt: page?.excerpt || '',
      featuredImage: page?.featuredImage || '',
      category: page?.category || '',
      tags: page?.tags || '',
      status: (page?.status as PageStatus) || PageStatus.DRAFT,
      metaTitle: page?.metaTitle || '',
      metaDescription: page?.metaDescription || '',
      ogImage: page?.ogImage || '',
    },
  });

  // Auto-generate slug from title (only for new pages)
  const handleTitleChange = (value: string) => {
    if (autoSlug && !isEdit) {
      const slug = generateSlug(value);
      form.setValue('slug', slug);
    }
  };

  const handleSlugChange = (value: string) => {
    if (!isEdit) {
      setAutoSlug(false);
    }
    const slug = generateSlug(value);
    form.setValue('slug', slug);
  };

  const onSubmit = (values: PageFormValues) => {
    startTransition(async () => {
      // Convert empty strings to undefined for optional fields
      const pageData = {
        ...values,
        excerpt: values.excerpt || undefined,
        featuredImage: values.featuredImage || undefined,
        category: values.category || undefined,
        tags: values.tags || undefined,
        metaTitle: values.metaTitle || undefined,
        metaDescription: values.metaDescription || undefined,
        ogImage: values.ogImage || undefined,
      };

      const result = isEdit
        ? await updatePage(page!.id, pageData)
        : await createPage(pageData);

      if (result.success) {
        toast.success(`Page ${isEdit ? 'updated' : 'created'} successfully`);
        if (!isEdit) {
          form.reset();
        }
        onSuccess?.();
        router.push('/admin/collections/pages');
      } else {
        toast.error(result.error);
        form.setError('root', {
          message:
            result.error || `Failed to ${isEdit ? 'update' : 'create'} page`,
        });

        if (result.details) {
          // Handle field-specific errors
          Object.entries(result.details).forEach(([field, errors]) => {
            if (Array.isArray(errors) && errors.length > 0) {
              form.setError(field as keyof PageFormValues, {
                message: errors[0],
              });
            }
          });
        }
      }
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="h-full flex flex-col gap-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Basic Information Section - Top on mobile, right sidebar on desktop */}
          <div className="order-1 lg:order-2 lg:col-span-1 space-y-6">
            <Card className="lg:sticky lg:top-6">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Essential page settings and metadata.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter page title"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleTitleChange(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="page-url-slug"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleSlugChange(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        URL-friendly version of the title.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="Page category" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input placeholder="tag1, tag2, tag3" {...field} />
                      </FormControl>
                      <FormDescription>Comma-separated tags</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <FormField
                  control={form.control}
                  name="featuredImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Featured Image</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        URL of the featured image.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area - Bottom on mobile, left side on desktop */}
          <div className="order-2 lg:order-1 lg:col-span-3 space-y-6">
            <Card className="h-full">
              <Tabs defaultValue="content" className="h-full">
                <CardHeader className="pb-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                  </TabsList>
                </CardHeader>

                {/* Content Tab */}
                <TabsContent value="content" className="m-0">
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <CardTitle>Page Content</CardTitle>
                      <CardDescription>
                        Write your page content and excerpt.
                      </CardDescription>
                    </div>

                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter page content"
                              className="min-h-[400px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Page content. Rich text editor will be added in a
                            future update.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="excerpt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Excerpt</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Brief description of the page"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Short description for listings and search results.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </TabsContent>

                {/* SEO Tab */}
                <TabsContent value="seo" className="m-0">
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <CardTitle>SEO Settings</CardTitle>
                      <CardDescription>
                        Optimize your page for search engines and social media.
                      </CardDescription>
                    </div>

                    <FormField
                      control={form.control}
                      name="metaTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="SEO-optimized title"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Title that appears in search results (recommended:
                            50-60 characters)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="metaDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Brief description for search results"
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Description that appears in search results
                            (recommended: 150-160 characters)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ogImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Open Graph Image</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/og-image.jpg"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Image that appears when shared on social media.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>

        {form.formState.errors.root && (
          <div className="text-sm text-red-600 rounded-md p-3 bg-red-50 border border-red-200 shadow-lg">
            {form.formState.errors.root.message}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.setValue('status', PageStatus.DRAFT);
                form.handleSubmit(onSubmit)();
              }}
              disabled={isPending}
            >
              Save as Draft
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? isEdit
                  ? 'Updating...'
                  : 'Creating...'
                : isEdit
                  ? 'Update Page'
                  : 'Create Page'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
