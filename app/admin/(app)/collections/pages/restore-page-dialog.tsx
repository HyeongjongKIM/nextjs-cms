'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { restorePage } from './actions';

interface RestorePageDialogProps {
  pageId: string;
  pageTitle: string;
}

export function RestorePageDialog({
  pageId,
  pageTitle,
}: RestorePageDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      const result = await restorePage(pageId);

      if (result.success) {
        toast.success(`Page "${pageTitle}" has been restored successfully`);
      } else {
        toast.error(result.error || 'Failed to restore page');
      }
    } catch (error) {
      console.error('Error restoring page:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          Restore page
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restore Page</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to restore{' '}
            <strong>&quot;{pageTitle}&quot;</strong>? This page will be moved
            back to the active pages list.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleRestore} disabled={isLoading}>
            {isLoading ? 'Restoring...' : 'Restore Page'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
