import { prisma } from '@/lib/prisma';
import { UsersDataTable } from './users-data-table';
import { userColumns, UserTableData } from './users-table-columns';
import { CreateUserFormDialog } from './create-user-form-dialog';

export default async function Page() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const userData: UserTableData[] = users;

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage system users and their permissions.
          </p>
        </div>
        <CreateUserFormDialog />
      </div>
      <UsersDataTable columns={userColumns} data={userData} />
    </>
  );
}
