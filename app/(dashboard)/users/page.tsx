"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Users as UsersIcon,
  ShieldCheck,
  ShieldOff,
  UserCheck,
  ArrowLeft,
  ArrowRight,
  Search,
  X,
} from "lucide-react";
import { api, extractErrorMessage } from "@/lib/api";
import { UserDetail, UserStats, Pagination } from "@/types";
import { formatDate } from "@/lib/format";
import AdminOnly from "@/components/features/AdminOnly";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ErrorBanner from "@/components/ui/ErrorBanner";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import StatCard from "@/components/features/StatCard";
import UserDetailModal from "@/components/features/UserDetailModal";
import { Input, Select } from "@/components/ui/Input";
import { TableWrapper, THead, Th, Tr, Td } from "@/components/ui/Table";

function UsersInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "20");
  const q = searchParams.get("q") || "";
  const role = searchParams.get("role") || "";
  const isActiveParam = searchParams.get("isActive") || "";

  const [searchInput, setSearchInput] = useState(q);
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Sync search input if URL q changes externally
  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  // Debounced search → URL
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput === q) return;
      const params = new URLSearchParams(searchParams.toString());
      if (searchInput) params.set("q", searchInput);
      else params.delete("q");
      params.set("page", "1");
      router.replace(`${pathname}?${params.toString()}`);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // Stats (refresh when reloadKey changes)
  useEffect(() => {
    api
      .get<{ data: UserStats }>("/users/stats")
      .then((r) => setStats(r.data.data))
      .catch(() => setStats(null));
  }, [reloadKey]);

  // Users list — depends on URL params + reloadKey
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (q) params.set("q", q);
    if (role) params.set("role", role);
    if (isActiveParam) params.set("isActive", isActiveParam);

    api
      .get(`/users?${params.toString()}`)
      .then((r) => {
        if (cancelled) return;
        setUsers(r.data.data.data);
        setPagination(r.data.data.pagination);
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, limit, q, role, isActiveParam, reloadKey]);

  const updateFilter = (key: "role" | "isActive", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchInput("");
    router.replace(pathname);
  };

  const gotoPage = (p: number) => {
    if (!pagination || p < 1 || p > pagination.pages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.replace(`${pathname}?${params.toString()}`);
  };

  const openUser = (id: string) => {
    setSelectedUserId(id);
    setModalOpen(true);
  };

  const onUserChanged = () => setReloadKey((k) => k + 1);

  const hasFilters = Boolean(q || role || isActiveParam);
  const range =
    pagination && pagination.total > 0
      ? `Showing ${(pagination.page - 1) * pagination.limit + 1}–${Math.min(
          pagination.page * pagination.limit,
          pagination.total,
        )} of ${pagination.total}`
      : "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Users</h1>
        <p className="text-slate-500 mt-1">
          Manage investors, admins and platform access
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {!stats && loading ? (
          <>
            {[0, 1, 2].map((i) => (
              <Card key={i} className="p-5">
                <Skeleton className="h-12 w-full" />
              </Card>
            ))}
          </>
        ) : stats ? (
          <>
            <StatCard
              icon={UsersIcon}
              label="Total Users"
              value={stats.total}
              color="blue"
            />
            <StatCard
              icon={UserCheck}
              label="Active"
              value={stats.active}
              color="emerald"
            />
            <StatCard
              icon={ShieldCheck}
              label="Admins"
              value={stats.admins}
              color="purple"
            />
          </>
        ) : null}
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={role}
          onChange={(e) => updateFilter("role", e.target.value)}
          className="md:w-40"
        >
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </Select>

        <Select
          value={isActiveParam}
          onChange={(e) => updateFilter("isActive", e.target.value)}
          className="md:w-40"
        >
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            icon={<X className="w-4 h-4" />}
          >
            Clear
          </Button>
        )}
      </div>

      {error && <ErrorBanner message={error} />}

      {/* Table */}
      {loading ? (
        <Card className="p-5 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </Card>
      ) : users.length === 0 ? (
        <Card>
          <EmptyState
            icon={UsersIcon}
            title="No users found"
            description="Try clearing the filters or adjusting your search."
            action={
              hasFilters ? (
                <Button onClick={clearFilters}>Clear Filters</Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <TableWrapper>
          <THead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Last Login</Th>
              <Th>Joined</Th>
            </Tr>
          </THead>
          <tbody>
            {users.map((u) => (
              <Tr
                key={u.id}
                className="hover:bg-slate-50 cursor-pointer"
                onClick={() => openUser(u.id)}
              >
                <Td className="font-medium text-slate-900">{u.name}</Td>
                <Td className="text-slate-600">{u.email}</Td>
                <Td>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide ${
                      u.role === "admin"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {u.role}
                  </span>
                </Td>
                <Td>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                      u.isActive ? "text-green-700" : "text-slate-400"
                    }`}
                  >
                    {u.isActive ? (
                      <UserCheck className="w-3.5 h-3.5" />
                    ) : (
                      <ShieldOff className="w-3.5 h-3.5" />
                    )}
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </Td>
                <Td className="text-slate-500 text-xs">
                  {u.lastLoginAt ? formatDate(u.lastLoginAt) : "—"}
                </Td>
                <Td className="text-slate-500 text-xs">
                  {formatDate(u.createdAt)}
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableWrapper>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">{range}</p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => gotoPage(pagination.page - 1)}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Prev
            </Button>
            <span className="text-sm text-slate-500 px-2">
              Page {pagination.page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.pages}
              onClick={() => gotoPage(pagination.page + 1)}
            >
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <UserDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        userId={selectedUserId}
        onChanged={onUserChanged}
      />
    </div>
  );
}

export default function UsersPage() {
  return (
    <AdminOnly>
      <Suspense fallback={<div className="text-slate-500">Loading…</div>}>
        <UsersInner />
      </Suspense>
    </AdminOnly>
  );
}
