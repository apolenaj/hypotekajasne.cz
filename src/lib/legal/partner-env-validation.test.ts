import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isValidJerrsRegistryUrl,
  validatePartnerEnv,
} from "@/lib/legal/partner-env-validation";

describe("partner-env-validation", () => {
  it("requires atomic all-or-nothing partner config", () => {
    assert.deepEqual(
      validatePartnerEnv({
        legalName: "Test Partner s.r.o.",
        ico: null,
        jerrsVerificationUrl: "https://jerrs.cnb.cz/example",
      }),
      { valid: false, reason: "missing_ico" }
    );
    assert.deepEqual(
      validatePartnerEnv({
        legalName: "Test Partner s.r.o.",
        ico: "12345678",
        jerrsVerificationUrl: null,
      }),
      { valid: false, reason: "missing_url" }
    );
    assert.deepEqual(
      validatePartnerEnv({
        legalName: null,
        ico: "12345678",
        jerrsVerificationUrl: "https://jerrs.cnb.cz/example",
      }),
      { valid: false, reason: "missing_name" }
    );
  });

  it("rejects invalid JERRS URLs", () => {
    assert.equal(isValidJerrsRegistryUrl("http://jerrs.cnb.cz/x"), false);
    assert.equal(isValidJerrsRegistryUrl("https://example.com/x"), false);
    assert.equal(isValidJerrsRegistryUrl("not-a-url"), false);
    assert.equal(
      isValidJerrsRegistryUrl(
        "https://jerrs.cnb.cz/apljerrsdad/JERRS.WEB07.INTRO_PAGE?p_lang=cz"
      ),
      true
    );
  });

  it("rejects placeholder values in partner env", () => {
    const result = validatePartnerEnv({
      legalName: "[ověřený právní subjekt — k právnímu schválení]",
      ico: "12345678",
      jerrsVerificationUrl: "https://jerrs.cnb.cz/example",
    });
    assert.equal(result.valid, false);
    if (!result.valid) assert.equal(result.reason, "placeholder");
  });

  it("accepts complete valid partner env", () => {
    const result = validatePartnerEnv({
      legalName: "Test Partner s.r.o.",
      ico: "12345678",
      jerrsVerificationUrl:
        "https://jerrs.cnb.cz/apljerrsdad/JERRS.WEB07.INTRO_PAGE?p_lang=cz",
    });
    assert.equal(result.valid, true);
    if (result.valid) {
      assert.equal(result.legalName, "Test Partner s.r.o.");
      assert.equal(result.ico, "12345678");
      assert.match(result.jerrsVerificationUrl, /jerrs\.cnb\.cz/);
    }
  });
});
