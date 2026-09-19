"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Trash2, Upload, Download, File } from "lucide-react";
import { api, extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { DocumentItem, DocumentType } from "@/types";
import { formatDate, humanize } from "@/lib/format";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ErrorBanner from "@/components/ui/ErrorBanner";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Select, FormField } from "@/components/ui/Input";
import { useToast } from "@/context/ToastContext";

const documentTypes: { value: DocumentType; label: string }[] = [
  { value: "title", label: "Title" },
  { value: "ownership", label: "Ownership" },
  { value: "encumbrance", label: "Encumbrance" },
  { value: "sale_agreement", label: "Sale Agreement" },
  { value: "lease", label: "Lease" },
  { value: "investment_agreement", label: "Investment Agreement" },
  { value: "collateral", label: "Collateral" },
  { value: "compliance", label: "Compliance" },
  { value: "other", label: "Other" },
];

export default function DocumentsTab({
  propertyId,
  canUpload,
}: {
  propertyId: string;
  canUpload: boolean;
}) {
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [uploadOpen, setUploadOpen] = useState(false);
  const [docType, setDocType] = useState<DocumentType | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    api
      .get(`/documents?propertyId=${propertyId}&limit=100`)
      .then((r) => {
        const payload = r.data.data;
        setItems(Array.isArray(payload) ? payload : payload.data || []);
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  const submitUpload = async () => {
    setUploadError("");
    if (!file) return setUploadError("Please select a file.");
    if (!docType) return setUploadError("Please select a document type.");

    setUploading(true);
    try {
      const formData = new FormData();
      // ORDER MATTERS — propertyId must come BEFORE file
      formData.append("propertyId", propertyId);
      formData.append("documentType", docType);
      formData.append("fileName", file.name);
      formData.append("file", file);

      await api.post("/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadOpen(false);
      setFile(null);
      setDocType("");
      if (fileRef.current) fileRef.current.value = "";
      load();
      toast("Document uploaded", "success");
    } catch (err) {
      toast(extractErrorMessage(err), "error");
    } finally {
      setUploading(false);
    }
  };

  const remove = async () => {
    if (!confirmDeleteId) return;
    setDeletingId(confirmDeleteId);
    try {
      await api.delete(`/documents/${confirmDeleteId}`);
      toast("Document deleted", "success");
      setConfirmDeleteId(null);
      load();
    } catch (err) {
      toast(extractErrorMessage(err), "error");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">
          {items.length} document{items.length === 1 ? "" : "s"} for this
          property
        </div>
        {canUpload && (
          <Button
            size="sm"
            icon={<Upload className="w-4 h-4" />}
            onClick={() => setUploadOpen(true)}
          >
            Upload Document
          </Button>
        )}
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <Card className="p-5 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="No documents uploaded"
            description="Upload ownership, title, encumbrance, or agreement documents."
            action={
              canUpload ? (
                <Button
                  icon={<Upload className="w-4 h-4" />}
                  onClick={() => setUploadOpen(true)}
                >
                  Upload Document
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <Card className="divide-y divide-slate-100">
          {items.map((d) => {
            const isOwner = d.uploadedBy === user?.id;
            const canDelete = isAdmin || isOwner;
            return (
              <div
                key={d.id}
                className="p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <File className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900 truncate">
                      {d.fileName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {humanize(d.documentType)} · {formatDate(d.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={d.cloudinaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100 flex items-center justify-center"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  {canDelete && (
                    <button
                      onClick={() => setConfirmDeleteId(d.id)}
                      className="w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 flex items-center justify-center"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {/* Upload modal */}
      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload Document"
        size="md"
      >
        <div className="space-y-4">
          {uploadError && <ErrorBanner message={uploadError} />}

          <FormField label="Document Type" required>
            <Select
              value={docType}
              onChange={(e) => setDocType(e.target.value as DocumentType)}
            >
              <option value="">Select a type</option>
              {documentTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="File" required hint="PDF, JPG, or PNG. Max 10 MB.">
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => setUploadOpen(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button onClick={submitUpload} loading={uploading}>
              Upload
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={Boolean(confirmDeleteId)}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={remove}
        title="Delete Document"
        description="This will remove the document permanently from the platform and Cloudinary."
        confirmText="Delete"
        variant="danger"
        loading={!!deletingId}
      />
    </div>
  );
}
