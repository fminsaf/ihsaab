import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../../auth/authProvider";
import supabase from "../../../lib/supabase";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldSet,
} from "../../../components/ui/field";
import { Separator } from "../../../components/ui/separator";
import { toast } from "../../../components/ui/toast";
import {
  KeyRound,
  ShieldAlert,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

export default function AccountSettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Password State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Account Delete State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Handle Password Change
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.add({ description: "New password must be at least 8 characters long.", type: "error" });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.add({ description: "Passwords do not match.", type: "error" });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      setNewPassword("");
      setConfirmPassword("");
      toast.add({ description: "Password updated successfully.", type: "success" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update password";
      toast.add({ description: msg, type: "error" });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Handle Account Deletion
  const handleDeleteAccount = async () => {
    if (confirmText.trim() !== "DELETE") {
      toast.add({ description: 'Please type "DELETE" to confirm.', type: "error" });
      return;
    }

    setIsDeletingAccount(true);
    try {
      // Clean up local storage and sign out
      localStorage.clear();
      await supabase.auth.signOut();

      toast.add({
        description: "Your account session has been closed and removed.",
        type: "success",
      });

      navigate("/", { replace: true });
    } catch {
      toast.add({ description: "Error closing account.", type: "error" });
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Top Header Card */}
      <div className="border-b border-border/80 pb-6">
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Personal Account Settings
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your personal credentials, identity details, and security preferences.
        </p>
      </div>

      {/* Password Change Form */}
      <form onSubmit={handleUpdatePassword}>
        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <KeyRound className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Change Password
              </h3>
              <p className="text-xs text-muted-foreground">
                Ensure your account is protected with a strong, unique password.
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <FieldSet>
            <FieldGroup>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* New Password */}
                <Field>
                  <FieldLabel htmlFor="new-pw">New Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="new-pw"
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </Field>

                {/* Confirm Password */}
                <Field>
                  <FieldLabel htmlFor="confirm-pw">Confirm New Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="confirm-pw"
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="pr-10"
                    />
                  </div>
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>

          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              disabled={isUpdatingPassword || !newPassword}
              className="gap-2"
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <KeyRound className="size-4" />
                  <span>Update Password</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* 3. Danger Zone: Delete Account */}
      <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
            <ShieldAlert className="size-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-destructive">
              Danger Zone: Delete Personal Account
            </h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed sm:text-sm">
              Permanently delete your personal profile, credentials, and access to all managed businesses.
              This operation cannot be reversed.
            </p>

            <div className="mt-4">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  setConfirmText("");
                  setShowDeleteModal(true);
                }}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-border pb-3.5 text-destructive">
              <div className="flex size-8 items-center justify-center rounded-xl bg-destructive/10">
                <ShieldAlert className="size-4" />
              </div>
              <h4 className="text-base font-bold">Confirm Account Deletion</h4>
            </div>

            <div className="mt-4 space-y-3 text-xs leading-relaxed text-muted-foreground">
              <p>
                Are you sure you want to permanently delete your account for{" "}
                <strong className="text-foreground">{user?.email}</strong>?
              </p>
              <p>
                Please type <strong className="text-foreground font-mono">DELETE</strong> to confirm:
              </p>

              <Input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="mt-2 text-sm font-mono"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={confirmText.trim() !== "DELETE" || isDeletingAccount}
                onClick={handleDeleteAccount}
              >
                {isDeletingAccount ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>I understand, delete my account</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

