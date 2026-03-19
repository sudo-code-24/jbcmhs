"use client";

import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";
import type { UserRow } from "./types";

type UserTableProps = {
  users: UserRow[];
  isLoading: boolean;
  deletingUsername: string | null;
  resettingUsername: string | null;
  currentUsername?: string | null;
  onResetPassword: (username: string) => void;
  onDeleteUser: (username: string) => void;
};

const UserTable = ({
  users,
  isLoading,
  deletingUsername,
  resettingUsername,
  currentUsername = null,
  onResetPassword,
  onDeleteUser,
}: UserTableProps) => (
  <div className="overflow-x-auto rounded-md border">
    <table className="w-full text-sm">
      <thead className="bg-muted/60 text-left">
        <tr>
          <th className="px-3 py-2 font-semibold">Username</th>
          <th className="px-3 py-2 font-semibold">Email</th>
          <th className="px-3 py-2 font-semibold">Role</th>
          <th className="px-3 py-2 font-semibold">Date Added</th>
          <th className="px-3 py-2 font-semibold">Actions</th>
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          <tr>
            <td colSpan={5} className="px-3 py-3 text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <LoadingSpinner />
                Loading users...
              </span>
            </td>
          </tr>
        ) : users.length === 0 ? (
          <tr>
            <td colSpan={5} className="px-3 py-3 text-muted-foreground">
              No users found.
            </td>
          </tr>
        ) : (
          users.map((user) => (
            <tr key={user.username} className="border-t">
              <td className="px-3 py-2">{user.username}</td>
              <td className="px-3 py-2">{user.email}</td>
              <td className="px-3 py-2 capitalize">{user.role ?? "faculty"}</td>
              <td className="px-3 py-2">{new Date(user.createdAt).toLocaleString()}</td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={Boolean(deletingUsername || resettingUsername)}
                    onClick={() => onResetPassword(user.username)}
                  >
                    {resettingUsername === user.username ? (
                      <span className="inline-flex items-center gap-2">
                        <LoadingSpinner />
                        Resetting...
                      </span>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={user.username === currentUsername || Boolean(deletingUsername || resettingUsername)}
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onDeleteUser(user.username)}
                  >
                    {deletingUsername === user.username ? (
                      <span className="inline-flex items-center gap-2">
                        <LoadingSpinner />
                        Deleting...
                      </span>
                    ) : (
                      "Delete User"
                    )}
                  </Button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default UserTable;
