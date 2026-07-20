"use client";

import { useSyncExternalStore, useState } from "react";
import { Lock } from "lucide-react";
import { ReportDocumentView } from "@/components/report-engine/ReportDocumentView";
import { resolveSharedReport } from "@/lib/report-engine";

function subscribeNoop() {
  return () => {};
}
function useIsClient() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

type ReportSharePageClientProps = {
  token: string;
};

export function ReportSharePageClient({ token }: ReportSharePageClientProps) {
  const ready = useIsClient();
  const [password, setPassword] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!ready) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-sm text-muted-foreground">
        Načítám sdílený report…
      </div>
    );
  }

  const { access, report } = resolveSharedReport({
    token,
    password: attempted ? password : undefined,
  });

  if (!access.ok) {
    const needsPassword = access.reason === "password_required" || access.reason === "password_invalid";
    const messages: Record<string, string> = {
      not_found: "Odkaz nebyl nalezen — může být neplatný nebo z jiného prohlížeče (BETA: localStorage).",
      expired: "Platnost odkazu vypršela.",
      revoked: "Přístup byl zrušen (revoke).",
      password_required: "Tento report je chráněn heslem.",
      password_invalid: "Nesprávné heslo.",
    };

    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col justify-center px-4 py-16">
        <div className="rounded-2xl border border-border bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-red-800">
            {messages[access.reason] ?? "Přístup odepřen"}
          </p>
          {needsPassword ? (
            <form
              className="mt-4 space-y-3 text-left"
              onSubmit={(e) => {
                e.preventDefault();
                setAttempted(true);
                setError(null);
              }}
            >
              <label className="block text-xs font-semibold">
                <span className="flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Heslo
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                  autoFocus
                />
              </label>
              {access.reason === "password_invalid" ? (
                <p className="text-xs text-red-600">{error ?? "Zkuste znovu."}</p>
              ) : null}
              <button
                type="submit"
                className="w-full rounded-full bg-deep-teal py-2.5 text-sm font-bold text-white"
              >
                Otevřít report
              </button>
            </form>
          ) : null}
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-sm text-muted-foreground">
        Report není k dispozici.
      </div>
    );
  }

  return <ReportDocumentView report={report} mode="share" />;
}
