import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export type PremiumAuditReadyEmailProps = {
  customerName?: string | null;
  propertyLabel: string;
  downloadUrl: string;
  expiresInHours: number;
  amountPaidLabel: string;
};

export function PremiumAuditReadyEmail({
  customerName,
  propertyLabel,
  downloadUrl,
  expiresInHours,
  amountPaidLabel,
}: PremiumAuditReadyEmailProps) {
  const greeting = customerName?.trim()
    ? `Dobrý den, ${customerName.trim()},`
    : "Dobrý den,";

  return (
    <Html lang="cs">
      <Head />
      <Preview>
        Děkujeme za zakoupení Investičního rentgenu. Váš komplexní audit je
        připraven.
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.eyebrow}>Hypotéka Jasně · Investiční rentgen</Text>
          <Heading style={styles.h1}>Komplexní Investiční Audit</Heading>
          <Text style={styles.text}>{greeting}</Text>
          <Text style={styles.text}>
            Děkujeme za zakoupení Investičního rentgenu. Váš komplexní audit je
            připraven.
          </Text>
          <Text style={styles.muted}>
            Nemovitost: <strong>{propertyLabel}</strong>
            <br />
            Uhrazeno: {amountPaidLabel}
          </Text>
          <Section style={styles.ctaSection}>
            <Button href={downloadUrl} style={styles.button}>
              Stáhnout PDF audit
            </Button>
          </Section>
          <Text style={styles.muted}>
            Odkaz je podepsaný (Supabase Signed URL) a platí přibližně{" "}
            {expiresInHours} hodin. Pokud vyprší, ozvěte se na{" "}
            <Link href="mailto:info@hypotekajasne.cz" style={styles.link}>
              info@hypotekajasne.cz
            </Link>
            .
          </Text>
          <Hr style={styles.hr} />
          <Text style={styles.fine}>
            Jde o modelový výstup Hypotéka Jasně — ne nabídku banky, daňové ani
            právní poradenství. Finální podmínky vždy stanoví věřitel.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#f4f7f6",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
    margin: 0,
    padding: "24px 0",
  },
  container: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    margin: "0 auto",
    maxWidth: "560px",
    padding: "32px 28px",
  },
  eyebrow: {
    color: "#1b4d3e",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    margin: "0 0 8px",
    textTransform: "uppercase" as const,
  },
  h1: {
    color: "#1a1a1a",
    fontSize: "22px",
    fontWeight: 700,
    lineHeight: "1.3",
    margin: "0 0 16px",
  },
  text: {
    color: "#1a1a1a",
    fontSize: "15px",
    lineHeight: "1.55",
    margin: "0 0 12px",
  },
  muted: {
    color: "#6b7280",
    fontSize: "13px",
    lineHeight: "1.5",
    margin: "0 0 12px",
  },
  ctaSection: {
    margin: "24px 0",
    textAlign: "center" as const,
  },
  button: {
    backgroundColor: "#c5a059",
    borderRadius: "10px",
    color: "#1a1a1a",
    display: "inline-block",
    fontSize: "14px",
    fontWeight: 700,
    padding: "12px 22px",
    textDecoration: "none",
  },
  link: {
    color: "#1b4d3e",
  },
  hr: {
    borderColor: "#e5e7eb",
    margin: "24px 0",
  },
  fine: {
    color: "#9ca3af",
    fontSize: "11px",
    lineHeight: "1.45",
    margin: 0,
  },
};

export default PremiumAuditReadyEmail;
