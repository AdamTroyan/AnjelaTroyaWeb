"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

type ActionFormProps = Omit<React.ComponentPropsWithoutRef<"form">, "action"> & {
  action: (formData: FormData) => Promise<void> | void;
  refreshMode?: "refresh" | "reload" | "none";
};

export default function ActionForm({
  action,
  children,
  refreshMode = "refresh",
  ...props
}: ActionFormProps) {
  const [, startTransition] = useTransition();
  const router = useRouter();

  const handleAction = async (formData: FormData) => {
    await action(formData);
    if (refreshMode === "reload") {
      window.location.reload();
    } else if (refreshMode === "refresh") {
      router.refresh();
    }
  };

  return (
    <form
      {...props}
      action={(formData) => {
        startTransition(() => {
          void handleAction(formData);
        });
      }}
    >
      {children}
    </form>
  );
}
