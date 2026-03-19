"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserCreateModal from "./UserCreateModal";
import UserTable from "./UserTable";
import type { UserRow, UserRole } from "./types";

type AdminUsersProps = {
  currentUsername?: string | null;
};

const AdminUsers = ({ currentUsername = null }: AdminUsersProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("faculty");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [deletingUsername, setDeletingUsername] = useState<string | null>(null);
  const [resettingUsername, setResettingUsername] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const response = await fetch("/api/auth/users", { cache: "no-store" });
      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | UserRow[]
        | null;
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
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const resetCreateForm = useCallback(() => {
    setUsername("");
    setPassword("");
    setRole("faculty");
    setIsCreateOpen(false);
  }, []);

  const handleCreateUser = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError("");
      setSuccess("");
      setLoading(true);
      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, role }),
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
    },
    [username, password, role, resetCreateForm, loadUsers]
  );

  const handleDeleteUser = useCallback(
    async (targetUsername: string) => {
      if (currentUsername && targetUsername === currentUsername) return;
      if (!confirm(`Delete user "${targetUsername}"?`)) return;
      setError("");
      setSuccess("");
      setDeletingUsername(targetUsername);
      try {
        const response = await fetch(
          `/api/auth/users/${encodeURIComponent(targetUsername)}`,
          { method: "DELETE" }
        );
        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null;
          setError(data?.error || "Failed to delete user");
          return;
        }
        setSuccess(`Deleted user: ${targetUsername}`);
        await loadUsers();
      } catch {
        setError("Unable to delete user right now.");
      } finally {
        setDeletingUsername(null);
      }
    },
    [loadUsers]
  );

  const handleResetPassword = useCallback(async (targetUsername: string) => {
    if (!confirm(`Reset password for "${targetUsername}" to default (jbcmhs_local)?`)) return;
    setError("");
    setSuccess("");
    setResettingUsername(targetUsername);
    try {
      const response = await fetch(
        `/api/auth/users/${encodeURIComponent(targetUsername)}/reset-password`,
        { method: "POST" }
      );
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(data?.error || "Failed to reset password");
        return;
      }
      setSuccess(`Password reset for: ${targetUsername}`);
    } catch {
      setError("Unable to reset password right now.");
    } finally {
      setResettingUsername(null);
    }
  }, []);

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
        {success ? (
          <p className="mb-3 text-sm text-emerald-600 dark:text-emerald-400">{success}</p>
        ) : null}

        <UserTable
          users={users}
          isLoading={isLoadingUsers}
          deletingUsername={deletingUsername}
          resettingUsername={resettingUsername}
          currentUsername={currentUsername}
          onResetPassword={handleResetPassword}
          onDeleteUser={handleDeleteUser}
        />
      </CardContent>

      <UserCreateModal
        open={isCreateOpen}
        onClose={resetCreateForm}
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        role={role}
        setRole={setRole}
        loading={loading}
        onSubmit={handleCreateUser}
      />
    </Card>
  );
};

export default AdminUsers;
