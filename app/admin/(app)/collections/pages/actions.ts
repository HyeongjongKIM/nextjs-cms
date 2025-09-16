'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import type { Prisma, $Enums } from '@/lib/generated/prisma';
import { getCurrentUser } from '@/lib/auth';

type ActionResult<T> =
  | { data: T; success: true }
  | { error: string; details?: unknown; success: false };

export interface PageTableData {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  author: {
    id: string;
    name: string;
    email: string;
  };
}

export interface GetPagesParams {
  search?: string;
  status?: 'ALL' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  showDeleted?: boolean;
  page?: number;
  pageSize?: number;
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
