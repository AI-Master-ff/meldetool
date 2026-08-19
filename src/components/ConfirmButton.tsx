"use client";

export function ConfirmButton({
  confirmMessage,
  children,
  className,
  formAction,
}: {
  confirmMessage: string;
  children: React.ReactNode;
  className?: string;
  formAction: (formData: FormData) => void;
}) {
  return (
    <button
      type="submit"
      formAction={formAction}
      className={className}
      onClick={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
