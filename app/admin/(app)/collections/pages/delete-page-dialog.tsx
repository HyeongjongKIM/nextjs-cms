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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { deletePageSoft } from './actions';

interface DeletePageDialogProps {
  pageId: string;
  pageTitle: string;
}

export function DeletePageDialog({ pageId, pageTitle }: DeletePageDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (confirmText !== 'delete') {
      toast.error('Please type "delete" to confirm');
      return;
    }

    setIsLoading(true);
    try {
      const result = await deletePageSoft(pageId);

      if (result.success) {
        toast.success(`Page "${pageTitle}" has been deleted successfully`);
        setConfirmText(''); // Reset input
      } else {
        toast.error(result.error || 'Failed to delete page');
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={(e) => e.preventDefault()}
        >
          Delete page
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Page</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <strong>&quot;{pageTitle}&quot;</strong>? This page will be moved to
            the deleted items and can be restored later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confirm-delete">
              Type{' '}
              <code className="bg-muted px-1 py-0.5 rounded text-sm">
                delete
              </code>{' '}
              to confirm
            </Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type 'delete' to confirm"
              disabled={isLoading}
              className="w-full"
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isLoading}
            onClick={() => setConfirmText('')}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading || confirmText !== 'delete'}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
          >
            {isLoading ? 'Deleting...' : 'Delete Page'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
