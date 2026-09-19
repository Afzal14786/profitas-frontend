"use client";

import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { api, extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { CreditApplication, Partner } from "@/types";
import { formatCrores, formatDate } from "@/lib/format";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ErrorBanner from "@/components/ui/ErrorBanner";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import StatusBadge from "@/components/features/StatusBadge";
import LiquidityTabs from "@/components/features/LiquidityTabs";
import Modal from "@/components/ui/Modal";
import { Select, FormField } from "@/components/ui/Input";
import { TableWrapper, THead, Th, Tr, Td } from "@/components/ui/Table";

export default function CreditApplicationsPage() {
  const { isAdmin } = useAuth();
  const [apps, setApps] = useState<CreditApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lenders, setLenders] = useState<Partner[]>([]);

  const [routeOpen, setRouteOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<CreditApplication | null>(
    null,
  );
  const [lenderId, setLenderId] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    api
      .get(`/liquidity/credit-applications${isAdmin ? "" : "?mine=true"}`)
      .then((r) => setApps(r.data.data.data))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    api
      .get("/partners?limit=100")
      .then((r) => {
        const list: Partner[] = r.data.data.data || r.data.data;
        setLenders(
          list.filter((p) =>
            ["bank", "nbfc", "institution"].includes(p.partnerType),
          ),
        );
      })
      .catch(() => setLenders([]));
  }, [isAdmin]);

  const openRoute = (app: CreditApplication) => {
    setSelectedApp(app);
    setLenderId(app.lenderId ?? "");
    setActionError("");
    setRouteOpen(true);
  };

  const submitRoute = async () => {
    if (!selectedApp || !lenderId) {
      setActionError("Please select a lender.");
      return;
    }
    setActionError("");
    setActionLoading("route");
    try {
      await api.patch(
        `/liquidity/credit-applications/${selectedApp.id}/route`,
        { lenderId },
      );
      setRouteOpen(false);
      load();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    } finally {
      setActionLoading("");
    }
  };

  const updateStatus = async (
    id: string,
    status: "approved" | "rejected" | "disbursed",
  ) => {
    if (!confirm(`Mark this application as ${status}?`)) return;
    setActionError("");
    setActionLoading(id + status);
    try {
      await api.patch(`/liquidity/credit-applications/${id}/status`, {
        status,
      });
      load();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Liquidity</h1>
        <p className="text-slate-500 mt-1">
          {isAdmin
            ? "All credit applications across the ecosystem"
            : "Your credit applications"}
        </p>
      </div>

      <LiquidityTabs />

      {error && <ErrorBanner message={error} />}
      {actionError && <ErrorBanner message={actionError} />}

      {loading ? (
        <Card className="p-5 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </Card>
      ) : apps.length === 0 ? (
        <Card>
          <EmptyState
            icon={Wallet}
            title="No credit applications"
            description={
              isAdmin
                ? "Credit applications appear when investors request liquidity via Get Credit."
                : "You haven't requested any credit yet."
            }
          />
        </Card>
      ) : (
        <TableWrapper>
          <THead>
            <Tr>
              <Th className="text-right">Amount</Th>
              <Th>Status</Th>
              <Th>Lender</Th>
              <Th>Requested</Th>
              {isAdmin && <Th className="text-right">Actions</Th>}
            </Tr>
          </THead>
          <tbody>
            {apps.map((a) => {
              const lender = lenders.find((l) => l.id === a.lenderId);
              return (
                <Tr key={a.id} className="hover:bg-slate-50">
                  <Td className="text-right font-medium text-slate-900">
                    {formatCrores(Number(a.requestedAmount))}
                  </Td>
                  <Td>
                    <StatusBadge status={a.status} />
                  </Td>
                  <Td className="text-slate-600">
                    {lender ? lender.organizationName || "Lender" : "—"}
                  </Td>
                  <Td className="text-slate-500">{formatDate(a.createdAt)}</Td>
                  {isAdmin && (
                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!a.lenderId && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openRoute(a)}
                          >
                            Route
                          </Button>
                        )}
                        {a.status === "routed" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              loading={actionLoading === a.id + "approved"}
                              onClick={() => updateStatus(a.id, "approved")}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              loading={actionLoading === a.id + "rejected"}
                              onClick={() => updateStatus(a.id, "rejected")}
                              className="text-red-600 hover:bg-red-50"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {a.status === "approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            loading={actionLoading === a.id + "disbursed"}
                            onClick={() => updateStatus(a.id, "disbursed")}
                          >
                            Mark Disbursed
                          </Button>
                        )}
                      </div>
                    </Td>
                  )}
                </Tr>
              );
            })}
          </tbody>
        </TableWrapper>
      )}

      <Modal
        open={routeOpen}
        onClose={() => setRouteOpen(false)}
        title="Route to Lender"
        size="sm"
      >
        <div className="space-y-4">
          {actionError && <ErrorBanner message={actionError} />}
          <FormField label="Select Lender" required>
            <Select
              value={lenderId}
              onChange={(e) => setLenderId(e.target.value)}
            >
              <option value="">Choose a bank, NBFC, or institution</option>
              {lenders.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.organizationName || l.email} ({l.partnerType})
                </option>
              ))}
            </Select>
          </FormField>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setRouteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitRoute} loading={actionLoading === "route"}>
              Route
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
