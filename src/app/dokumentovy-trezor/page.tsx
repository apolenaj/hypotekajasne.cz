import type { Metadata } from "next";
import { DocumentVaultView } from "@/components/document-vault/DocumentVaultView";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { routes } from "@/lib/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Document Vault — bezpečné uložení hypotečních dokumentů",
  description:
    "Šifrovaný trezor dokumentů, checklist dle situace, AI extrakce faktických pozorování a sdílení se specialistou po explicitním souhlasu.",
  path: routes.documentVault,
});

export default function DocumentVaultPage() {
  return (
    <>
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <Breadcrumbs
            items={crumbs({ name: "Document Vault", path: routes.documentVault })}
          />
        </div>
      </div>
      <DocumentVaultView />
    </>
  );
}
