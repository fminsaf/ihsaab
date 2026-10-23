import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

interface BusinessDangerZoneProps {
  name: string;
  confirmDeleteText: string;
  onConfirmDeleteTextChange: (value: string) => void;
  isDeleting: boolean;
  showDeleteModal: boolean;
  setShowDeleteModal: (open: boolean) => void;
  onOpen: () => void;
  onDelete: () => void;
}

export function BusinessDangerZone({ name, confirmDeleteText, onConfirmDeleteTextChange, isDeleting, showDeleteModal, setShowDeleteModal, onOpen, onDelete }: BusinessDangerZoneProps) {
  return (
    <>
      {/* Danger Zone: Delete Business */}
      <div className="border-destructive/30 bg-destructive/5 rounded-3xl border p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="bg-destructive/15 text-destructive flex size-10 shrink-0 items-center justify-center rounded-2xl">
            <AlertTriangle className="size-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-destructive text-base font-bold">
              Danger Zone: Delete Business
            </h3>
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed sm:text-sm">
              Permanently delete{" "}
              <strong className="text-foreground">{name}</strong> along with all
              associated accounts, double-entry journals, transaction history,
              and financial statements. This action is irreversible.
            </p>

            <div className="mt-4">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onOpen}
                className="gap-1.5"
              >
                <Trash2 className="size-3.5" />
                <span>Delete This Business</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="border-border bg-card w-full max-w-md rounded-3xl border p-6 shadow-2xl">
            <div className="border-border text-destructive flex items-center gap-3 border-b pb-3.5">
              <div className="bg-destructive/10 flex size-8 items-center justify-center rounded-xl">
                <AlertTriangle className="size-4" />
              </div>
              <h4 className="text-base font-bold">Confirm Business Deletion</h4>
            </div>

            <div className="text-muted-foreground mt-4 space-y-3 text-xs leading-relaxed">
              <p>
                Are you absolutely sure you want to delete{" "}
                <strong className="text-foreground">{name}</strong>? All
                accounts and records will be immediately erased.
              </p>
              <p>
                Please type{" "}
                <strong className="text-foreground font-mono">{name}</strong>{" "}
                below to confirm:
              </p>

              <Input
                type="text"
                value={confirmDeleteText}
                onChange={(e) => onConfirmDeleteTextChange(e.target.value)}
                placeholder={name}
                className="mt-2 text-sm"
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
                disabled={
                  confirmDeleteText.trim() !== name.trim() || isDeleting
                }
                onClick={onDelete}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>I understand, delete business</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
