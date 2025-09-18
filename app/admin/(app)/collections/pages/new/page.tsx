import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageForm } from '../page-form';

export default function NewPagePage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Create New Page</h1>
        <p className="text-muted-foreground">
          Add a new page to your website with content and SEO settings.
        </p>
      </div>

      {/* Form */}
      <PageForm />
    </div>
  );
}
