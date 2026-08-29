import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Sheet({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-bg/80" />
        <Dialog.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-xl bg-surface p-5 shadow-[var(--shadow-border)] outline-none md:inset-y-0 md:right-0 md:left-auto md:h-full md:w-80 md:rounded-none md:rounded-l-xl",
          )}
        >
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="font-display text-lg font-medium tracking-tight">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-fg"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
