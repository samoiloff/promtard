"use client";

// Email (Resend) and Facebook are wired in auth.ts but hidden until app/domain verification.

import { useEffect, useId, useRef } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

import { GitHubIcon, GoogleIcon } from "@/components/icons/oauth-icons";

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
};

function OAuthButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-center text-xs font-medium leading-snug text-zinc-900 transition hover:bg-zinc-50 sm:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
    >
      <span className="shrink-0">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const searchParams = useSearchParams();

  const oauthLinkError =
    open && searchParams.get("error") === "OAuthAccountNotLinked"
      ? "This email is already linked to another sign-in method. Use the same provider you used before."
      : null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      if (dialog.open) return;
      onClose();
    };

    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  function handleOAuth(provider: "google" | "github") {
    void signIn(provider, { callbackUrl: "/" });
  }

  function requestClose() {
    dialogRef.current?.close();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-zinc-200 bg-white p-0 text-zinc-900 shadow-xl backdrop:bg-black/50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) requestClose();
      }}
    >
      <div className="p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-xl font-semibold tracking-tight">
            Log in to Promptard.ai
          </h2>
          <button
            type="button"
            onClick={requestClose}
            className="rounded-lg px-2 py-1 text-sm text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="Close"
          >
            Close
          </button>
        </div>

        {oauthLinkError ? (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">
            {oauthLinkError}
          </p>
        ) : null}

        <div className="flex flex-row gap-2">
          <OAuthButton
            label="Log in with Google"
            icon={<GoogleIcon />}
            onClick={() => handleOAuth("google")}
          />
          <OAuthButton
            label="Log in with GitHub"
            icon={<GitHubIcon />}
            onClick={() => handleOAuth("github")}
          />
        </div>
      </div>
    </dialog>
  );
}
