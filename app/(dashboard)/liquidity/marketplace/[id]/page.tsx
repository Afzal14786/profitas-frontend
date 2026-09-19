"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle, Gavel } from "lucide-react";
import { api, extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Listing, Offer } from "@/types";
import { formatCrores, formatDate, humanize } from "@/lib/format";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ErrorBanner from "@/components/ui/ErrorBanner";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import StatusBadge from "@/components/features/StatusBadge";
import Modal from "@/components/ui/Modal";
import { Input, FormField } from "@/components/ui/Input";

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isSeller, setIsSeller] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const [offerOpen, setOfferOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerError, setOfferError] = useState("");
  const [offerSubmitting, setOfferSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const l = await api.get(`/liquidity/listings/${id}`);
      const listingData: Listing = l.data.data;
      setListing(listingData);

      // Fetch offers (real endpoint now)
      const o = await api.get(`/liquidity/listings/${id}/offers`);
      setOffers(o.data.data || []);

      // Determine if current user is the seller via parent request
      if (listingData.liquidityRequestId) {
        try {
          const req = await api.get(
            `/liquidity/requests/${listingData.liquidityRequestId}`,
          );
          setIsSeller(req.data.data.requestedBy === user?.id);
        } catch {
          setIsSeller(false);
        }
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const submitOffer = async () => {
    setOfferError("");
    const num = Number(offerAmount);
    if (!num || num <= 0) {
      setOfferError("Enter a positive amount.");
      return;
    }
    setOfferSubmitting(true);
    try {
      await api.post(`/liquidity/listings/${id}/offers`, { amount: num });
      setOfferOpen(false);
      setOfferAmount("");
      await load();
    } catch (err) {
      setOfferError(extractErrorMessage(err));
    } finally {
      setOfferSubmitting(false);
    }
  };

  const updateOffer = async (
    offerId: string,
    status: "accepted" | "rejected",
  ) => {
    setActionError("");
    setActionLoading(offerId + status);
    try {
      await api.patch(`/liquidity/offers/${offerId}`, { status });
      await load();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-40" />
        <Card className="p-8 space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-24 w-full" />
        </Card>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.push("/liquidity/marketplace")}
          className="text-sm text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </button>
        <ErrorBanner message={error || "Listing not found"} />
      </div>
    );
  }

  const canMakeOffer = listing.status === "active" && !isSeller;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => router.push("/liquidity/marketplace")}
        className="text-sm text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </button>

      {actionError && <ErrorBanner message={actionError} />}

      <Card className="p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Listing
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mt-1">
              {formatCrores(Number(listing.askingPrice))}
            </h1>
            <div className="text-sm text-slate-500 mt-1">
              Listed {formatDate(listing.createdAt)}
            </div>
          </div>
          <StatusBadge status={listing.status} />
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          {isSeller ? (
            <p className="text-sm text-slate-500">
              You are the seller on this listing. Offers appear below.
            </p>
          ) : (
            <Button
              onClick={() => setOfferOpen(true)}
              disabled={!canMakeOffer}
              icon={<Gavel className="w-4 h-4" />}
              className="w-full"
            >
              {canMakeOffer
                ? "Make an Offer"
                : listing.status !== "active"
                  ? "Listing is not active"
                  : "Unavailable"}
            </Button>
          )}
        </div>
      </Card>

      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-3">
          Offers ({offers.length})
        </h2>
        {offers.length === 0 ? (
          <Card>
            <EmptyState
              icon={Gavel}
              title="No offers yet"
              description={
                isSeller
                  ? "Buyers haven't placed any offers on this listing."
                  : "Be the first to make an offer on this listing."
              }
              action={
                canMakeOffer ? (
                  <Button onClick={() => setOfferOpen(true)}>Make Offer</Button>
                ) : undefined
              }
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {offers.map((o) => (
              <Card key={o.id} className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-slate-900">
                      {formatCrores(Number(o.amount))}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Buyer {o.buyerId.slice(0, 8)}… · {formatDate(o.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={o.status} />
                    {isSeller && o.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<CheckCircle2 className="w-4 h-4" />}
                          loading={actionLoading === o.id + "accepted"}
                          onClick={() => updateOffer(o.id, "accepted")}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<XCircle className="w-4 h-4" />}
                          loading={actionLoading === o.id + "rejected"}
                          onClick={() => updateOffer(o.id, "rejected")}
                          className="text-red-600 hover:bg-red-50"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={offerOpen}
        onClose={() => setOfferOpen(false)}
        title="Make an Offer"
        size="sm"
      >
        <div className="space-y-4">
          {offerError && <ErrorBanner message={offerError} />}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm">
            Asking price:{" "}
            <strong>{formatCrores(Number(listing.askingPrice))}</strong>
          </div>
          <FormField label="Your Offer (₹)" required>
            <Input
              type="number"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              placeholder="e.g. 48000000"
            />
          </FormField>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOfferOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitOffer} loading={offerSubmitting}>
              Submit Offer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
