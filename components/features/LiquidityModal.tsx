"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Wallet } from "lucide-react";
import { api, extractErrorMessage } from "@/lib/api";
import { Property } from "@/types";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import ErrorBanner from "@/components/ui/ErrorBanner";
import { Input, FormField } from "@/components/ui/Input";
import { formatCrores } from "@/lib/format";
import { useToast } from "@/context/ToastContext";

export default function LiquidityModal({
  open,
  onClose,
  property,
}: {
  open: boolean;
  onClose: () => void;
  property: Property;
}) {
  const router = useRouter();
  const toast = useToast();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState<
    "sell_match" | "get_credit" | ""
  >("");

  const submit = async (type: "sell_match" | "get_credit") => {
    setError("");
    const num = Number(amount);
    if (!num || num <= 0) {
      setError("Please enter a positive amount.");
      return;
    }

    setSubmitting(type);
    try {
      const body: Record<string, unknown> = {
        propertyId: property.id,
        liquidityType: type,
      };
      if (type === "sell_match") body.askingPrice = num;
      else body.requestedAmount = num;

      const r = await api.post("/liquidity/requests", body);
      const requestId = r.data.data.id;
      toast(
        type === "sell_match"
          ? "Sell/Match request created"
          : "Credit request created",
        "success",
      );
      onClose();
      router.push(`/liquidity/${requestId}`);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting("");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="How do you want liquidity?"
      size="md"
    >
      <div className="space-y-5">
        {error && <ErrorBanner message={error} />}

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="text-xs uppercase tracking-wide text-slate-400">
            Property
          </div>
          <div className="font-semibold text-slate-900 mt-0.5">
            {property.name}
          </div>
          <div className="text-sm text-slate-500">
            {property.location} · {formatCrores(property.value)}
          </div>
        </div>

        <FormField
          label="Amount (₹)"
          required
          hint="For Sell / Match this is your asking price. For Get Credit this is your requested credit amount."
        >
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 50000000"
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            disabled={!!submitting}
            onClick={() => submit("sell_match")}
            className="text-left p-5 rounded-2xl border-2 border-slate-900 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            <TrendingUp className="w-5 h-5 mb-3" />
            <div className="font-semibold">SELL / MATCH</div>
            <div className="text-xs text-slate-300 mt-1">
              Find a potential buyer for your asset
            </div>
          </button>

          <button
            disabled={!!submitting}
            onClick={() => submit("get_credit")}
            className="text-left p-5 rounded-2xl border-2 border-blue-600 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Wallet className="w-5 h-5 mb-3" />
            <div className="font-semibold">GET CREDIT</div>
            <div className="text-xs text-blue-100 mt-1">
              Keep asset &amp; explore financing
            </div>
          </button>
        </div>

        <Button variant="ghost" onClick={onClose} className="w-full">
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
