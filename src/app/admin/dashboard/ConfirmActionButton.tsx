"use client";

import { useEffect, useRef, useState } from "react";

type ConfirmActionButtonProps = Readonly<{
  formId: string;
  label: string;
  title: string;
  description: string;
  variant?: "neutral" | "danger";
}>;

export default function ConfirmActionButton({
  formId,
  label,
  title,
  description,
  variant = "neutral",
}: ConfirmActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const titleId = `${formId}-confirm-title`;
  const descriptionId = `${formId}-confirm-description`;

  const closeDialog = () => {
    document.body.style.overflow = "";
    setIsOpen(false);
  };

  const getFocusableElements = (container: HTMLElement | null) => {
    if (!container) {
      return [] as HTMLElement[];
    }

    return Array.from(
      container.querySelectorAll<HTMLElement>(
        "button,[href],input,select,textarea,[tabindex]:not([tabindex='-1'])"
      )
    ).filter((element) => !element.hasAttribute("disabled"));
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      triggerRef.current?.focus();
      return;
    }

    cancelRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDialog();
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = getFocusableElements(dialogRef.current);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleConfirm = () => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (form) {
      form.requestSubmit();
    }
    closeDialog();
  };

  return (
    <>
      <button
        className={
          variant === "danger"
            ? "rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:border-rose-300"
            : "rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
        }
        type="button"
        onClick={() => setIsOpen(true)}
        ref={triggerRef}
      >
        {label}
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6"
          onClick={closeDialog}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            ref={dialogRef}
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-900" id={titleId}>
              {title}
            </h3>
            <p className="mt-2 text-sm text-slate-600" id={descriptionId}>
              {description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                type="button"
                onClick={handleConfirm}
              >
                אישור
              </button>
              <button
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                type="button"
                onClick={closeDialog}
                ref={cancelRef}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
