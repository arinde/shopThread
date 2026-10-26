"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { sendMagicLink, type SendMagicLinkState } from "@/lib/actions/auth";

const initialState: SendMagicLinkState = { status: "idle" };

export default function LoginPage() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const [state, formAction, pending] = useActionState(sendMagicLink, initialState);

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in to ShopThread</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          We&apos;ll email you a link to sign in — no password needed.
        </p>

        <form action={formAction} className="mt-6 flex flex-col gap-3">
          <input type="hidden" name="next" value={next} />
          <label className="flex flex-col gap-1 text-sm font-medium">
            Email
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              className="rounded-md border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-60"
          >
            {pending ? "Sending…" : "Send sign-in link"}
          </button>
        </form>

        {state.status !== "idle" && (
          <p
            className={`mt-4 text-sm ${
              state.status === "error" ? "text-red-600" : "text-green-700 dark:text-green-500"
            }`}
          >
            {state.message}
          </p>
        )}
      </div>
    </div>
  );
}
