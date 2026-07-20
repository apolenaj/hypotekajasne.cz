"use client";

import { useState } from "react";
import { Copy, Link2, Lock, ShieldOff } from "lucide-react";
import {
  buildShareUrl,
  createReportShare,
  listSharesForReport,
  loadReportEngineStore,
  revokeReportShare,
  type ReportDocument,
  type ReportShareGrant,
} from "@/lib/report-engine";

type ReportSharePanelProps = {
  report: ReportDocument;
  onSharesChange?: () => void;
};

export function ReportSharePanel({ report, onSharesChange }: ReportSharePanelProps) {
  const [password, setPassword] = useState("");
  const [expiresHours, setExpiresHours] = useState(168);
  const [allowSensitive, setAllowSensitive] = useState(false);
  const [lastLink, setLastLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shares, setShares] = useState<ReportShareGrant[]>(() =>
    listSharesForReport(loadReportEngineStore(), report.id)
  );

  const refresh = () => {
    setShares(listSharesForReport(loadReportEngineStore(), report.id));
    onSharesChange?.();
  };

  const onCreate = () => {
    const { grant } = createReportShare({
      reportId: report.id,
      expiresInHours: expiresHours,
      password: password.trim() || null,
      allowSensitive,
      whiteLabel: report.whiteLabel,
    });
    const url = buildShareUrl(grant.token);
    setLastLink(url);
    refresh();
  };

  const onCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const onRevoke = (token: string) => {
    revokeReportShare(token);
    refresh();
  };

  return (
    <section className="rounded-2xl border-2 border-deep-teal/20 bg-white p-5">
      <h3 className="flex items-center gap-2 font-heading text-sm font-bold">
        <Link2 className="h-4 w-4 text-deep-teal" />
        Sdílení reportu
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Odkaz s expirací, volitelné heslo a možnost kdykoli zrušit přístup.
        Ve výchozím nastavení bez citlivých údajů (příjmy, přesné zůstatky).
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold">
          Expirace (hodin)
          <input
            type="number"
            min={1}
            max={720}
            value={expiresHours}
            onChange={(e) => setExpiresHours(Number(e.target.value) || 168)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs font-semibold">
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3" /> Heslo (volitelné)
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Prázdné = bez hesla"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="mt-3 flex items-start gap-2 text-xs">
        <input
          type="checkbox"
          checked={allowSensitive}
          onChange={(e) => setAllowSensitive(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          <strong>Zobrazit citlivá data</strong> — výslovně povolte osobní údaje a přesné částky ve sdílené
          verzi. Ve výchozím nastavení je vypnuto.
        </span>
      </label>

      <button
        type="button"
        onClick={onCreate}
        className="mt-4 rounded-full bg-deep-teal px-5 py-2.5 text-sm font-bold text-white"
      >
        Vytvořit odkaz ke sdílení
      </button>

      {lastLink ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-[#eef3f1] p-3">
          <code className="flex-1 break-all text-xs">{lastLink}</code>
          <button
            type="button"
            onClick={() => onCopy(lastLink)}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Zkopírováno" : "Kopírovat"}
          </button>
        </div>
      ) : null}

      {shares.length > 0 ? (
        <ul className="mt-5 space-y-2">
          <p className="text-xs font-bold uppercase text-muted-foreground">Aktivní granty</p>
          {shares.map((s) => {
            const url = buildShareUrl(s.token);
            const expired = Date.parse(s.expiresAt) <= Date.now();
            const revoked = Boolean(s.revokedAt);
            return (
              <li
                key={s.token}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-xs"
              >
                <div>
                  <span className="font-mono">{s.token.slice(0, 12)}…</span>
                  {s.passwordHash ? (
                    <span className="ml-2 text-muted-foreground">· heslo</span>
                  ) : null}
                  {s.allowSensitive ? (
                    <span className="ml-2 font-bold text-amber-700">· citlivá data</span>
                  ) : null}
                  <div className="text-muted-foreground">
                    exp. {new Date(s.expiresAt).toLocaleString("cs-CZ")}
                    {revoked ? " · zrušeno" : expired ? " · vypršelo" : ""}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!revoked && !expired ? (
                    <>
                      <button
                        type="button"
                        onClick={() => onCopy(url)}
                        className="rounded border border-border px-2 py-1 font-semibold"
                      >
                        Kopírovat
                      </button>
                      <button
                        type="button"
                        onClick={() => onRevoke(s.token)}
                        className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2 py-1 font-semibold text-red-800"
                      >
                        <ShieldOff className="h-3 w-3" />
                        Zrušit přístup
                      </button>
                    </>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
