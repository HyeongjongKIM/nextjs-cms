import { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PagesDataTable } from './pages-data-table';
import { getAllPages } from './actions';

interface PagesPageProps {
  searchParams: {
    status?: string;
    showDeleted?: string;
  };
}

export default async function PagesPage({ searchParams }: PagesPageProps) {
  // Parse filters from search params
  const statusParam = searchParams.status;
  const showDeletedParam = searchParams.showDeleted === 'true';

  const statusFilter = statusParam
    ? statusParam.split(',')
    : ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

  // Fetch pages data
  const result = await getAllPages({
    status:
      statusFilter.length === 3
        ? 'ALL'
        : (statusFilter[0] as 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'),
    showDeleted: showDeletedParam,
  });

  if (!result.success) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <p className="text-destructive">
            Error loading pages: {result.error}
          </p>
        </div>
      </div>
    );
  }

  const { pages } = result.data;

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
          <p className="text-muted-foreground">
            Manage your website pages and content.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/collections/pages/new">
            <Plus className="mr-2 h-4 w-4" />
            New Page
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div>Loading pages...</div>}>
        <PagesDataTable
          data={pages}
          initialFilters={{
            status: statusFilter,
            showDeleted: showDeletedParam,
          }}
        />
      </Suspense>
    </>
  );
}
