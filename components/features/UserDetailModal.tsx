"use client";

import { useEffect, useState } from "react";
import { Save, UserX, UserCheck, Mail, Calendar, Clock } from "lucide-react";
import { api, extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { UserDetail } from "@/types";
import { formatDate } from "@/lib/format";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import ErrorBanner from "@/components/ui/ErrorBanner";
import Skeleton from "@/components/ui/Skeleton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Input, Select, FormField } from "@/components/ui/Input";
import StatusBadge from "@/components/features/StatusBadge";
import { useToast } from "@/context/ToastContext";

export default function UserDetailModal({
  open,
  onClose,
  userId,
  onChanged,
}: {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  onChanged: () => void;
}) {
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const [name, setName] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");

  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  const isSelf = currentUser?.id === userId;

  const toast = useToast();

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    setError("");
    try {
      const r = await api.get(`/users/${userId}`);
      const u: UserDetail = r.data.data;
      setUser(u);
      setName(u.name);
      setRole(u.role);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && userId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId]);

  const save = async () => {
    if (!user) return;
    setActionError("");
    setActionLoading("save");
    try {
      const body: Record<string, unknown> = {};
      if (name.trim() && name !== user.name) body.name = name.trim();
      if (role !== user.role) body.role = role;

      if (Object.keys(body).length === 0) {
        onClose();
        return;
      }
      await api.patch(`/users/${user.id}`, body);
      toast("User updated", "success");
      onChanged();
      await load();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    } finally {
      setActionLoading("");
    }
  };

  const deactivate = async () => {
    if (!user) return;
    setActionError("");
    setActionLoading("deactivate");
    try {
      await api.delete(`/users/${user.id}`);
      setConfirmDeactivate(false);
      toast("User deactivated", "success");
      onChanged();
      await load();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    } finally {
      setActionLoading("");
    }
  };

  const reactivate = async () => {
    if (!user) return;
    setActionError("");
    setActionLoading("activate");
    try {
      await api.patch(`/users/${user.id}/activate`);
      toast("User reactivated", "success");
      onChanged();
      await load();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    } finally {
      setActionLoading("");
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose} title="User Details" size="md">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error || !user ? (
          <ErrorBanner message={error || "User not found"} />
        ) : (
          <div className="space-y-5">
            {actionError && <ErrorBanner message={actionError} />}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {user.email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Joined {formatDate(user.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Last login:{" "}
                {user.lastLoginAt ? formatDate(user.lastLoginAt) : "—"}
              </span>
              <StatusBadge status={user.isActive ? "active" : "inactive"} />
            </div>

            {/* Editable fields */}
            <FormField label="Name" required>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </FormField>

            <FormField
              label="Role"
              hint={isSelf ? "You cannot change your own role." : undefined}
            >
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value as "user" | "admin")}
                disabled={isSelf}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Select>
            </FormField>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
              <Button
                icon={<Save className="w-4 h-4" />}
                onClick={save}
                loading={actionLoading === "save"}
              >
                Save Changes
              </Button>

              {user.isActive ? (
                <Button
                  variant="danger"
                  icon={<UserX className="w-4 h-4" />}
                  disabled={isSelf}
                  loading={actionLoading === "deactivate"}
                  onClick={() => setConfirmDeactivate(true)}
                >
                  Deactivate
                </Button>
              ) : (
                <Button
                  variant="outline"
                  icon={<UserCheck className="w-4 h-4" />}
                  loading={actionLoading === "activate"}
                  onClick={reactivate}
                >
                  Reactivate
                </Button>
              )}
            </div>

            {isSelf && (
              <p className="text-xs text-slate-400">
                You can't deactivate your own account. Ask another admin to do
                that.
              </p>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmDeactivate}
        onClose={() => setConfirmDeactivate(false)}
        onConfirm={deactivate}
        title="Deactivate User"
        description={`Deactivate ${user?.name ?? "this user"}? They will not be able to log in until reactivated.`}
        confirmText="Deactivate"
        variant="danger"
        loading={actionLoading === "deactivate"}
      />
    </>
  );
}
