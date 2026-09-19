"use client";

import { useEffect, useState } from "react";
import { Save, KeyRound, ShieldCheck, Mail, Calendar } from "lucide-react";
import { api, extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/format";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ErrorBanner from "@/components/ui/ErrorBanner";
import { Input, FormField } from "@/components/ui/Input";

export default function ProfilePage() {
  const { user, isAdmin, refreshUser } = useAuth();

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [nameSuccess, setNameSuccess] = useState("");
  const [nameLoading, setNameLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  const saveName = async () => {
    setNameError("");
    setNameSuccess("");
    if (!name.trim() || name.trim().length < 2) {
      setNameError("Name must be at least 2 characters.");
      return;
    }
    setNameLoading(true);
    try {
      await api.patch("/users/me", { name: name.trim() });
      await refreshUser();
      setNameSuccess("Profile updated successfully.");
      setTimeout(() => setNameSuccess(""), 3000);
    } catch (err) {
      setNameError(extractErrorMessage(err));
    } finally {
      setNameLoading(false);
    }
  };

  const savePassword = async () => {
    setPwError("");
    setPwSuccess("");
    if (!currentPassword) return setPwError("Enter your current password.");
    if (newPassword.length < 8)
      return setPwError("New password must be at least 8 characters.");
    if (newPassword !== confirmPassword)
      return setPwError("New passwords do not match.");

    setPwLoading(true);
    try {
      await api.patch("/users/me/password", {
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPwSuccess("Password changed successfully.");
      setTimeout(() => setPwSuccess(""), 3000);
    } catch (err) {
      setPwError(extractErrorMessage(err));
    } finally {
      setPwLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
        <p className="text-slate-500 mt-1">
          Manage your personal information and password
        </p>
      </div>

      {/* Read-only info card */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-semibold text-slate-900">
                {user.name}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                  isAdmin
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                {isAdmin ? "Admin" : "Investor"}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {user.email}
              </span>
              {user.createdAt && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined {formatDate(user.createdAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Name form */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Personal Information
        </h2>
        <div className="mt-4 space-y-4">
          {nameError && <ErrorBanner message={nameError} />}
          {nameSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
              {nameSuccess}
            </div>
          )}
          <FormField label="Full Name" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
          <div className="flex justify-end">
            <Button
              icon={<Save className="w-4 h-4" />}
              onClick={saveName}
              loading={nameLoading}
            >
              Save
            </Button>
          </div>
        </div>
      </Card>

      {/* Password form */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Change Password
        </h2>
        <div className="mt-4 space-y-4">
          {pwError && <ErrorBanner message={pwError} />}
          {pwSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
              {pwSuccess}
            </div>
          )}
          <FormField label="Current Password" required>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
          </FormField>
          <FormField
            label="New Password"
            required
            hint="At least 8 characters."
          >
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </FormField>
          <FormField label="Confirm New Password" required>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </FormField>
          <div className="flex justify-end">
            <Button
              icon={<KeyRound className="w-4 h-4" />}
              onClick={savePassword}
              loading={pwLoading}
            >
              Change Password
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
