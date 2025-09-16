import { prisma } from '@/lib/prisma';
import { UsersDataTable } from './users-data-table';
import { UserTableData } from './users-table-columns';
import { CreateUserFormDialog } from './create-user-form-dialog';
import { getCurrentUser } from '@/lib/auth';
import { Role } from '@/lib/generated/prisma';

interface PageProps {
  searchParams: {
    roles?: string;
    showDeleted?: string;
  };
}

export default async function Page({ searchParams }: PageProps) {
  const showDeleted = searchParams.showDeleted === 'true';
  const selectedRoles = searchParams.roles
    ? searchParams.roles.split(',')
    : Object.values(Role);

  const [users, currentUser] = await Promise.all([
    prisma.user.findMany({
      where: {
        ...(showDeleted ? {} : { deletedAt: null }),
        ...(selectedRoles.length > 0 &&
        selectedRoles.length < Object.values(Role).length
          ? { role: { in: selectedRoles as Role[] } }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    getCurrentUser(),
  ]);

  const userData: UserTableData[] = users;
  const canCreateUsers = currentUser?.role === Role.SUPER_ADMIN;

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage system users and their permissions.
          </p>
        </div>
        {canCreateUsers && <CreateUserFormDialog />}
      </div>
      <UsersDataTable
        data={userData}
        currentUser={currentUser}
        initialFilters={{
          roles: selectedRoles,
          showDeleted,
        }}
      />
    </>
  );
}
