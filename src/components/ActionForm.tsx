"use client";

import { useTransition } from "react";

type ActionFormProps = Omit<React.ComponentPropsWithoutRef<"form">, "action"> & {
  action: (formData: FormData) => Promise<void> | void;
  refreshMode?: "reload" | "none";
};

export default function ActionForm({
  action,
  children,
  refreshMode = "reload",
  ...props
}: ActionFormProps) {
  const [, startTransition] = useTransition();

  const handleAction = async (formData: FormData) => {
    await action(formData);
    if (refreshMode === "reload") {
      window.location.reload();
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
