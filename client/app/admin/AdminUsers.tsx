"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type UserRow = {
  username: string;
  email: string;
  createdAt: string;
};

export default function AdminUsers() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadUsers() {
    setIsLoadingUsers(true);
    try {
      const response = await fetch("/api/auth/users", { cache: "no-store" });
      const data = (await response.json().catch(() => null)) as { error?: string } | UserRow[] | null;
      if (!response.ok || !Array.isArray(data)) {
        setError((data as { error?: string } | null)?.error || "Failed to load users");
        return;
      }
      setUsers(data);
    } catch {
      setError("Unable to load users right now.");
    } finally {
      setIsLoadingUsers(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  function resetCreateForm() {
    setUsername("");
    setPassword("");
    setIsCreateOpen(false);
  }

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = (await response.json().catch(() => null)) as
        | { error?: string; user?: { username?: string } }
        | null;

      if (!response.ok) {
        setError(data?.error || "Failed to create user");
        return;
      }

      setSuccess(`User created: ${data?.user?.username ?? username}`);
      resetCreateForm();
      await loadUsers();
    } catch {
      setError("Unable to create user right now.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser(targetUsername: string) {
    if (!confirm(`Delete user "${targetUsername}"?`)) return;
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`/api/auth/users/${encodeURIComponent(targetUsername)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error || "Failed to delete user");
        return;
      }
      setSuccess(`Deleted user: ${targetUsername}`);
      await loadUsers();
    } catch {
      setError("Unable to delete user right now.");
    }
  }

  async function handleResetPassword(targetUsername: string) {
    if (!confirm(`Reset password for "${targetUsername}" to default (jbcmhs_local)?`)) return;
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`/api/auth/users/${encodeURIComponent(targetUsername)}/reset-password`, {
        method: "POST",
      });
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(data?.error || "Failed to reset password");
        return;
      }
      setSuccess(`Password reset for: ${targetUsername}`);
    } catch {
      setError("Unable to reset password right now.");
    }
  }

  return (
    <Card className="space-y-4">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Users</CardTitle>
          <Button type="button" onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Create User
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
        {success ? <p className="mb-3 text-sm text-emerald-600 dark:text-emerald-400">{success}</p> : null}

        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left">
              <tr>
                <th className="px-3 py-2 font-semibold">Username</th>
                <th className="px-3 py-2 font-semibold">Email</th>
                <th className="px-3 py-2 font-semibold">Date Added</th>
                <th className="px-3 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingUsers ? (
                <tr>
                  <td colSpan={4} className="px-3 py-3 text-muted-foreground">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-3 text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user, idx) => (
                  <tr key={user.username} className="border-t">
                    <td className="px-3 py-2">{user.username}</td>
                    <td className="px-3 py-2">{user.email}</td>
                    <td className="px-3 py-2">{new Date(user.createdAt).toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2" >
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetPassword(user.username)}
                        >
                          Reset Password
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={user.username === 'admin'}
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteUser(user.username)}
                        >
                          Delete User
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      <Modal open={isCreateOpen} onClose={resetCreateForm} title="Create User" size="md">
        <form className="max-w-md space-y-4" onSubmit={handleCreateUser}>
          <div className="space-y-1.5">
            <label htmlFor="new-user-username" className="text-sm font-medium">
              Username
            </label>
            <input
              id="new-user-username"
              type="text"
              autoComplete="off"
              value={username}
              onChange={(event) => setUsername(event.target.value.toLowerCase())}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              pattern="[a-z0-9._-]{3,32}"
              minLength={3}
              maxLength={32}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="new-user-password" className="text-sm font-medium">
              Temporary password
            </label>
            <input
              id="new-user-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            />
          </div>
          <div className="flex w-full justify-end gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create User"}
            </Button>
          </div>

        </form>
      </Modal>
    </Card>
  );
}
