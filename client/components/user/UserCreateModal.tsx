"use client";

import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";
import Modal from "@/components/ui/modal";
import type { UserRole } from "./types";

type UserCreateModalProps = {
  open: boolean;
  onClose: () => void;
  username: string;
  setUsername: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  role: UserRole;
  setRole: (v: UserRole) => void;
  loading: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

const UserCreateModal = ({
  open,
  onClose,
  username,
  setUsername,
  password,
  setPassword,
  role,
  setRole,
  loading,
  onSubmit,
}: UserCreateModalProps) => (
  <Modal open={open} onClose={onClose} title="Create User" size="md">
    <form className="max-w-md space-y-4" onSubmit={onSubmit}>
      <div className="space-y-1.5">
        <label htmlFor="new-user-username" className="text-sm font-medium">
          Username
        </label>
        <input
          id="new-user-username"
          type="text"
          autoComplete="off"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          pattern="[a-z0-9._-]{3,32}"
          minLength={3}
          maxLength={32}
          required
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="new-user-role" className="text-sm font-medium">
          Role
        </label>
        <select
          id="new-user-role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          required
        >
          <option value="faculty">Faculty</option>
          <option value="admin">Admin</option>
        </select>
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
          onChange={(e) => setPassword(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          required
        />
      </div>
      <div className="flex w-full justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <LoadingSpinner />
              Creating...
            </span>
          ) : (
            "Create User"
          )}
        </Button>
      </div>
    </form>
  </Modal>
);

export default UserCreateModal;
