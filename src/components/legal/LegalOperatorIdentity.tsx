import { formatCommercialRegisterLine, legalOperator } from "@/config/legal";
import {
  formatOperatorAddress,
  formatOperatorAddressCompact,
  getOperatorIdentity,
  operatorDisplayName,
} from "@/lib/legal/operator";
import { cn } from "@/lib/utils";

type LegalOperatorIdentityProps = {
  /**
   * compact — patička / krátký blok
   * full — GDPR / smlouvy
   */
  variant?: "compact" | "full";
  showRegister?: boolean;
  showContact?: boolean;
  showBrandNote?: boolean;
  className?: string;
  heading?: string;
};

/**
 * Jediný UI zdroj zobrazení provozovatele — čte z centrální legal konfigurace.
 */
export function LegalOperatorIdentity({
  variant = "full",
  showRegister,
  showContact,
  showBrandNote,
  className,
  heading,
}: LegalOperatorIdentityProps) {
  const op = getOperatorIdentity();
  const isCompact = variant === "compact";
  const includeRegister = showRegister ?? !isCompact;
  const includeContact = showContact ?? true;
  const includeBrandNote = showBrandNote ?? isCompact;
  const registerLine =
    op.court && op.registerSection && op.registerInsert
      ? formatCommercialRegisterLine({
          court: op.court,
          registerSection: op.registerSection,
          registerInsert: op.registerInsert,
        })
      : null;
  const compactAddress = formatOperatorAddressCompact(op);

  if (isCompact) {
    return (
      <div className={cn("space-y-1 text-sm text-muted-foreground", className)}>
        <p>
          <span className="text-muted-foreground">Provozovatel: </span>
          <span className="font-semibold text-text-dark">
            {operatorDisplayName(op)}
          </span>
        </p>
        {op.ico ? <p>IČO: {op.ico}</p> : null}
        <p>{compactAddress}</p>
        {includeRegister && registerLine ? (
          <p className="text-xs leading-relaxed text-muted-foreground/90">
            {registerLine}
          </p>
        ) : null}
        {includeBrandNote ? (
          <p className="text-xs leading-relaxed">
            {legalOperator.brand} je obchodní značka provozovaná společností{" "}
            {operatorDisplayName(op)}.
          </p>
        ) : null}
        {includeContact ? (
          <p className="text-xs">
            E-mail:{" "}
            <a
              href={`mailto:${op.email}`}
              className="text-deep-teal underline-offset-2 hover:underline"
            >
              {op.email}
            </a>
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-slate-50 px-4 py-4 text-sm",
        className
      )}
    >
      {heading ? (
        <p className="font-semibold text-text-dark">{heading}</p>
      ) : null}
      <p className={cn("text-muted-foreground", heading ? "mt-2" : undefined)}>
        Správcem osobních údajů zpracovávaných prostřednictvím platformy{" "}
        {op.brand} je:
      </p>
      <p className="mt-2 font-semibold text-text-dark">
        {operatorDisplayName(op)}
      </p>
      {op.ico ? (
        <p className="mt-1 text-muted-foreground">IČO: {op.ico}</p>
      ) : null}
      <p className="mt-1 text-muted-foreground">
        Sídlo: {formatOperatorAddress(op)}
      </p>
      {includeRegister && registerLine ? (
        <p className="mt-2 text-muted-foreground">{registerLine}</p>
      ) : null}
      {op.representative ? (
        <p className="mt-2 text-muted-foreground">
          Jednatel: {op.representative}
        </p>
      ) : null}
      {includeContact ? (
        <p className="mt-2 text-muted-foreground">
          Kontaktní e-mail:{" "}
          <a
            href={`mailto:${op.email}`}
            className="font-medium text-deep-teal underline"
          >
            {op.email}
          </a>
          {op.privacyEmail && op.privacyEmail !== op.email
            ? ` · Ochrana údajů: ${op.privacyEmail}`
            : null}
        </p>
      ) : null}
      {op.dpoContact ? (
        <p className="mt-1 text-muted-foreground">
          Kontakt pověřence / DPO: {op.dpoContact}
        </p>
      ) : null}
      {op.lastLegalReviewDate && op.legalReviewedBy ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Právní revize textů (evidovaný odborník): {op.lastLegalReviewDate} (
          {op.legalReviewedBy}).
        </p>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          Tyto stránky prošly redakční kontrolou právních zdrojů. Nejde o
          potvrzení finální právní revize kvalifikovaným právníkem — tu
          zveřejníme odděleně, až bude evidován konkrétní odborník a datum
          revize.
        </p>
      )}
    </div>
  );
}
