'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import type { Prisma, $Enums } from '@/lib/generated/prisma';
import { getCurrentUser } from '@/lib/auth';
import { generateSlug } from '@/lib/utils';

type ActionResult<T> =
  | { data: T; success: true }
  | { error: string; details?: unknown; success: false };

export interface PageTableData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featuredImage: string | null;
  category: string | null;
  tags: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  status: string;
  publishedAt: Date | null;
  authorId: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface GetPagesParams {
  search?: string;
  status?: 'ALL' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  showDeleted?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CreatePageInput {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  category?: string;
  tags?: string;
  status?: $Enums.PageStatus;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
}

export async function getAllPages(
  params: GetPagesParams = {}
): Promise<ActionResult<{ pages: PageTableData[]; totalCount: number }>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    const {
      search = '',
      status = 'ALL',
      showDeleted = false,
      page = 1,
      pageSize = 10,
    } = params;

    // Build where clause
    const where: Prisma.PageWhereInput = {};

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    // Status filter
    if (status !== 'ALL') {
      where.status = status as $Enums.PageStatus;
    }

    // Deleted filter
    if (showDeleted) {
      where.deletedAt = { not: null };
    } else {
      where.deletedAt = null;
    }

    // Get total count for pagination
    const totalCount = await prisma.page.count({ where });

    // Get pages with pagination
    const pages = await prisma.page.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      success: true,
      data: {
        pages: pages,
        totalCount,
      },
    };
  } catch (error) {
    console.error('Error fetching pages:', error);
    return {
      success: false,
      error: 'Failed to fetch pages',
      details: error,
    };
  }
}

export async function deletePageSoft(id: string): Promise<ActionResult<void>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    // Check if page exists and is not already deleted
    const existingPage = await prisma.page.findUnique({
      where: { id },
      select: { id: true, deletedAt: true },
    });

    if (!existingPage) {
      return { success: false, error: 'Page not found' };
    }

    if (existingPage.deletedAt) {
      return { success: false, error: 'Page is already deleted' };
    }

    // Soft delete the page
    await prisma.page.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidatePath('/admin/collections/pages');

    return { success: true, data: undefined };
  } catch (error) {
    console.error('Error deleting page:', error);
    return {
      success: false,
      error: 'Failed to delete page',
      details: error,
    };
  }
}

export async function restorePage(id: string): Promise<ActionResult<void>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    // Check if page exists and is deleted
    const existingPage = await prisma.page.findUnique({
      where: { id },
      select: { id: true, deletedAt: true },
    });

    if (!existingPage) {
      return { success: false, error: 'Page not found' };
    }

    if (!existingPage.deletedAt) {
      return { success: false, error: 'Page is not deleted' };
    }

    // Restore the page
    await prisma.page.update({
      where: { id },
      data: { deletedAt: null },
    });

    revalidatePath('/admin/collections/pages');

    return { success: true, data: undefined };
  } catch (error) {
    console.error('Error restoring page:', error);
    return {
      success: false,
      error: 'Failed to restore page',
      details: error,
    };
  }
}

export async function createPage(
  data: CreatePageInput
): Promise<ActionResult<PageTableData>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    // Validate required fields
    if (!data.title || data.title.trim().length === 0) {
      return { success: false, error: 'Title is required' };
    }

    if (!data.content || data.content.trim().length === 0) {
      return { success: false, error: 'Content is required' };
    }

    // Generate slug from title if not provided
    let slug = data.slug?.trim();
    if (!slug) {
      slug = generateSlug(data.title);
    } else {
      slug = generateSlug(slug);
    }

    // Check if slug is unique
    const existingPage = await prisma.page.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existingPage) {
      // Generate a unique slug by appending a number
      let counter = 1;
      let uniqueSlug = `${slug}-${counter}`;

      while (true) {
        const slugExists = await prisma.page.findUnique({
          where: { slug: uniqueSlug },
          select: { id: true },
        });

        if (!slugExists) {
          slug = uniqueSlug;
          break;
        }

        counter++;
        uniqueSlug = `${slug}-${counter}`;
      }
    }

    // Create the page
    const page = await prisma.page.create({
      data: {
        title: data.title.trim(),
        slug,
        content: data.content.trim(),
        excerpt: data.excerpt?.trim() || null,
        featuredImage: data.featuredImage?.trim() || null,
        category: data.category?.trim() || null,
        tags: data.tags?.trim() || null,
        status: data.status || 'DRAFT',
        metaTitle: data.metaTitle?.trim() || null,
        metaDescription: data.metaDescription?.trim() || null,
        ogImage: data.ogImage?.trim() || null,
        authorId: user.id,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    revalidatePath('/admin/collections/pages');

    return {
      success: true,
      data: page,
    };
  } catch (error) {
    console.error('Error creating page:', error);
    return {
      success: false,
      error: 'Failed to create page',
      details: error,
    };
  }
}
