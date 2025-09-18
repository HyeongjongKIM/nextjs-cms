import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageForm } from '../../page-form';
import { getPageById } from '../../actions';

interface EditPagePageProps {
  params: { id: string };
}

export default async function EditPagePage({ params }: EditPagePageProps) {
  const result = await getPageById(params.id);

  if (!result.success) {
    notFound();
  }

  const page = result.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/collections/pages">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Pages
          </Link>
        </Button>
      </div>

      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Edit Page</h1>
        <p className="text-muted-foreground">
          Update &quot;{page.title}&quot; page content and settings.
        </p>
      </div>

      {/* Form */}
      <PageForm page={page} />
    </div>
  );
}
