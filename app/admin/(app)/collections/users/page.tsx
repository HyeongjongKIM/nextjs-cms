import { prisma } from '@/lib/prisma';
import { UsersDataTable } from './users-data-table';
import { userColumns, UserTableData } from './users-table-columns';
import { CreateUserFormDialog } from './create-user-form-dialog';
import { getCurrentUser } from '@/lib/auth';
import { Role } from '@/lib/generated/prisma';

export default async function Page() {
  const [users, currentUser] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
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
      <UsersDataTable columns={userColumns} data={userData} />
    </>
  );
}
