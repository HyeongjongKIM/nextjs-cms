'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Eye, Edit } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { PageTableData } from './actions';
import { DeletePageDialog } from './delete-page-dialog';
import { RestorePageDialog } from './restore-page-dialog';

const STATUS_CONFIG = {
  DRAFT: { label: 'Draft', color: 'bg-yellow-100 text-yellow-800' },
  PUBLISHED: { label: 'Published', color: 'bg-green-100 text-green-800' },
  ARCHIVED: { label: 'Archived', color: 'bg-gray-100 text-gray-800' },
} as const;

export const createPageColumns = (): ColumnDef<PageTableData>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value: boolean) =>
          table.toggleAllPageRowsSelected(!!value)
        }
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const page = row.original;
      return <div className="font-medium">{page.title}</div>;
    },
  },
  {
    accessorKey: 'slug',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Slug
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const slug = row.getValue('slug') as string;
      return <div className="text-sm text-muted-foreground">/{slug}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue('status') as keyof typeof STATUS_CONFIG;
      const deletedAt = row.original.deletedAt;

      if (deletedAt) {
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Deleted
          </Badge>
        );
      }

      const config = STATUS_CONFIG[status];
      return (
        <Badge variant="secondary" className={config.color}>
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'author',
    header: 'Author',
    cell: ({ row }) => {
      const author = row.getValue('author') as PageTableData['author'];
      return (
        <div>
          <div className="font-medium">{author.name}</div>
          <div className="text-sm text-muted-foreground">{author.email}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'publishedAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Published
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const publishedAt = row.getValue('publishedAt') as Date | null;
      return publishedAt ? (
        <div className="text-sm">{publishedAt.toLocaleDateString()}</div>
      ) : (
        <div className="text-sm text-muted-foreground">Not published</div>
      );
    },
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Updated
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue('updatedAt') as Date;
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString()}
        </div>
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const page = row.original;
      const isDeleted = page.deletedAt !== null;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(page.id)}
            >
              Copy page ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {!isDeleted && page.status === 'PUBLISHED' && (
              <DropdownMenuItem asChild>
                <Link href={`/${page.slug}`} target="_blank">
                  <Eye className="mr-2 h-4 w-4" />
                  View page
                </Link>
              </DropdownMenuItem>
            )}
            {!isDeleted && (
              <DropdownMenuItem asChild>
                <Link href={`/admin/collections/pages/edit/${page.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit page
                </Link>
              </DropdownMenuItem>
            )}
            {!isDeleted && (
              <>
                <DropdownMenuSeparator />
                <DeletePageDialog pageId={page.id} pageTitle={page.title} />
              </>
            )}
            {isDeleted && (
              <>
                <DropdownMenuSeparator />
                <RestorePageDialog pageId={page.id} pageTitle={page.title} />
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
