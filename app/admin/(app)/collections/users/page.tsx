import { UserService } from '@/features/user/user-service'
import { UsersDataTable } from '@/features/user/users-data-table'
import { userColumns, UserTableData } from '@/features/user/users-table-columns'

export default async function Page() {
  const result = await UserService.findAll()

  if (!result.success) {
    return (
      <>
        <div className="text-center">
          <p className="text-destructive">
            Error loading users: {result.error}
          </p>
        </div>
      </>
    )
  }

  const users: UserTableData[] = result.data

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          Manage system users and their permissions.
        </p>
      </div>
      <UsersDataTable columns={userColumns} data={users} />
    </>
  )
}
