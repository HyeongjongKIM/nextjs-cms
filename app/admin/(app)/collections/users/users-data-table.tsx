'use client';

import * as React from 'react';
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
} from '@tanstack/react-table';
import { ChevronDown, Filter } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { createUserColumns, UserTableData } from './users-table-columns';
import { Role } from '@/lib/generated/prisma';
import { ROLE } from '@/lib/constants';

interface UsersDataTableProps {
  data: UserTableData[];
  currentUser: { id: string; role: Role } | null;
  initialFilters: {
    roles: string[];
    showDeleted: boolean;
  };
}

export function UsersDataTable({
  data,
  currentUser,
  initialFilters,
}: UsersDataTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const columns = createUserColumns(currentUser);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Filter states
  const [selectedRoles, setSelectedRoles] = React.useState<string[]>(
    initialFilters.roles
  );
  const [showDeleted, setShowDeleted] = React.useState(
    initialFilters.showDeleted
  );
  const [searchValue, setSearchValue] = React.useState('');

  // Update URL when filters change
  const updateFilters = React.useCallback(
    (newRoles: string[], newShowDeleted: boolean) => {
      const params = new URLSearchParams(searchParams);

      if (newRoles.length === Object.values(Role).length) {
        params.delete('roles');
      } else {
        params.set('roles', newRoles.join(','));
      }

      if (newShowDeleted) {
        params.set('showDeleted', 'true');
      } else {
        params.delete('showDeleted');
      }

      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleRoleToggle = (role: string) => {
    const newRoles = selectedRoles.includes(role)
      ? selectedRoles.filter((r) => r !== role)
      : [...selectedRoles, role];
    setSelectedRoles(newRoles);
    updateFilters(newRoles, showDeleted);
  };

  const handleShowDeletedToggle = (checked: boolean) => {
    setShowDeleted(checked);
    updateFilters(selectedRoles, checked);
  };

  // Global filter function for name and email search
  const globalFilterFn = (
    row: Row<UserTableData>,
    _columnId: string,
    filterValue: string
  ) => {
    const name = row.getValue('name') as string;
    const email = row.getValue('email') as string;
    const searchTerm = filterValue.toLowerCase();

    return (
      name.toLowerCase().includes(searchTerm) ||
      email.toLowerCase().includes(searchTerm)
    );
  };

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn,
    onGlobalFilterChange: setSearchValue,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter: searchValue,
    },
  });

  return (
    <div className="w-full">
      <div className="space-y-4 py-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Input
            placeholder="Search names or emails..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Role ({selectedRoles.length}/{Object.values(Role).length})
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {Object.values(Role).map((role) => (
                <DropdownMenuCheckboxItem
                  key={role}
                  checked={selectedRoles.includes(role)}
                  onCheckedChange={() => handleRoleToggle(role)}
                >
                  {ROLE[role].label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-deleted"
              checked={showDeleted}
              onCheckedChange={handleShowDeletedToggle}
            />
            <Label htmlFor="show-deleted" className="text-sm font-medium">
              Show deleted users
            </Label>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
