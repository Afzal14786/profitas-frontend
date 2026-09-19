"use client";

import AdminOnly from "@/components/features/AdminOnly";

export default function UsersPage() {
  return (
    <AdminOnly>
      <h1>User Page only admin can access this buddy</h1>
    </AdminOnly>
  );
}