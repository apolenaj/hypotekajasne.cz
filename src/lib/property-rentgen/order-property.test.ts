import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  EMPTY_ORDER_PROPERTY_FORM,
  buildPropertyAddressLine,
  formStateToOrderSnapshot,
  isValidHttpUrl,
  validateOrderPropertyForCheckout,
} from "@/lib/property-rentgen/order-property";
import { validatePhotoBuffer } from "@/lib/property-rentgen/order-photos";
import { parseOrderInputSnapshot } from "@/lib/property-rentgen/checkout-parse";

describe("order property validation", () => {
  it("rejects city-only without address or URL", () => {
    const form = {
      ...EMPTY_ORDER_PROPERTY_FORM,
      identificationMode: "address" as const,
      city: "Praha",
      street: "",
      propertyDescription: "A".repeat(50),
      purchasePrice: "4500000",
      monthlyRent: "18000",
      equity: "900000",
    };
    const r = validateOrderPropertyForCheckout({
      form,
      photoCount: 1,
      requirePhotoWithoutListing: true,
    });
    assert.equal(r.ok, false);
    if (!r.ok) {
      assert.ok(r.errors.some((e) => /adres|inzerát/i.test(e)));
    }
  });

  it("accepts exact address without URL", () => {
    const form = {
      ...EMPTY_ORDER_PROPERTY_FORM,
      identificationMode: "address" as const,
      street: "Vinohradská 1234/56",
      city: "Praha",
      postalCode: "120 00",
      propertyDescription: "Byt 2+kk po částečné rekonstrukci, 58 m², OV.".repeat(2),
      purchasePrice: "4 500 000",
      monthlyRent: "18 000",
      equity: "900 000",
    };
    const r = validateOrderPropertyForCheckout({
      form,
      photoCount: 1,
      requirePhotoWithoutListing: true,
    });
    assert.equal(r.ok, true);
  });

  it("accepts valid listing URL without address", () => {
    const form = {
      ...EMPTY_ORDER_PROPERTY_FORM,
      identificationMode: "url" as const,
      listingUrl: "https://www.sreality.cz/detail/123",
      propertyDescription: "Byt 2+kk po částečné rekonstrukci, 58 m², OV.".repeat(2),
      purchasePrice: "4500000",
      monthlyRent: "18000",
      equity: "900000",
    };
    const r = validateOrderPropertyForCheckout({
      form,
      photoCount: 0,
      requirePhotoWithoutListing: true,
    });
    assert.equal(r.ok, true);
  });

  it("rejects invalid URL", () => {
    assert.equal(isValidHttpUrl("not-a-url"), false);
    assert.equal(isValidHttpUrl("ftp://example.com"), false);
    const form = {
      ...EMPTY_ORDER_PROPERTY_FORM,
      identificationMode: "url" as const,
      listingUrl: "not-a-url",
      propertyDescription: "A".repeat(50),
      purchasePrice: "1",
      monthlyRent: "1",
      equity: "1",
    };
    const r = validateOrderPropertyForCheckout({
      form,
      photoCount: 0,
      requirePhotoWithoutListing: true,
    });
    assert.equal(r.ok, false);
  });

  it("rejects empty description", () => {
    const form = {
      ...EMPTY_ORDER_PROPERTY_FORM,
      identificationMode: "address" as const,
      street: "Vinohradská 1",
      city: "Praha",
      propertyDescription: "",
      purchasePrice: "1",
      monthlyRent: "1",
      equity: "1",
    };
    const r = validateOrderPropertyForCheckout({
      form,
      photoCount: 1,
      requirePhotoWithoutListing: true,
    });
    assert.equal(r.ok, false);
    if (!r.ok) assert.ok(r.errors.some((e) => /popis/i.test(e)));
  });

  it("requires photo when no listing URL", () => {
    const form = {
      ...EMPTY_ORDER_PROPERTY_FORM,
      identificationMode: "address" as const,
      street: "Vinohradská 1",
      city: "Praha",
      propertyDescription: "A".repeat(50),
      purchasePrice: "1",
      monthlyRent: "1",
      equity: "1",
    };
    const r = validateOrderPropertyForCheckout({
      form,
      photoCount: 0,
      requirePhotoWithoutListing: true,
    });
    assert.equal(r.ok, false);
    if (!r.ok) assert.ok(r.errors.some((e) => /fotograf/i.test(e)));
  });

  it("builds address line and snapshot with listingUrl", () => {
    assert.equal(
      buildPropertyAddressLine({
        street: "Vinohradská 1",
        city: "Praha",
        postalCode: "120 00",
      }),
      "Vinohradská 1, 120 00 Praha"
    );
    const snap = formStateToOrderSnapshot({
      ...EMPTY_ORDER_PROPERTY_FORM,
      identificationMode: "both",
      listingUrl: "https://www.bezrealitky.cz/x",
      street: "Vinohradská 1",
      city: "Praha",
      propertyDescription: "Popis nemovitosti dostatečně dlouhý pro test.",
      purchasePrice: "1000000",
      monthlyRent: "10000",
      equity: "200000",
      floorArea: "58",
      layout: "2+kk",
      propertyType: "Byt",
    });
    assert.equal(snap.listingUrl, "https://www.bezrealitky.cz/x");
    assert.equal(snap.areaM2, 58);
    assert.equal(snap.layout, "2+kk");
  });
  it("allows digital checkout without description or photos", () => {
    const form = {
      ...EMPTY_ORDER_PROPERTY_FORM,
      identificationMode: "url" as const,
      listingUrl: "https://www.sreality.cz/detail/123",
      propertyDescription: "",
      floorArea: "58",
      purchasePrice: "4500000",
      monthlyRent: "18000",
      equity: "900000",
    };
    const r = validateOrderPropertyForCheckout({
      form,
      photoCount: 0,
      requirePhotoWithoutListing: false,
      requireDescription: false,
      requireFloorArea: true,
    });
    assert.equal(r.ok, true);
  });

  it("requires floor area when requireFloorArea", () => {
    const form = {
      ...EMPTY_ORDER_PROPERTY_FORM,
      identificationMode: "url" as const,
      listingUrl: "https://www.sreality.cz/detail/123",
      purchasePrice: "4500000",
      monthlyRent: "18000",
      equity: "900000",
      floorArea: "",
    };
    const r = validateOrderPropertyForCheckout({
      form,
      photoCount: 0,
      requirePhotoWithoutListing: false,
      requireDescription: false,
      requireFloorArea: true,
    });
    assert.equal(r.ok, false);
    if (!r.ok) assert.ok(r.errors.some((e) => /ploch/i.test(e)));
  });
});

describe("photo buffer validation", () => {
  it("accepts jpeg mime within size", () => {
    const buf = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
    const r = validatePhotoBuffer({
      mimeType: "image/jpeg",
      size: buf.length,
      buffer: buf,
    });
    assert.equal(r.ok, true);
  });

  it("rejects executable mime / MZ header", () => {
    const buf = Buffer.from([0x4d, 0x5a, 0x90, 0x00]);
    const r = validatePhotoBuffer({
      mimeType: "image/jpeg",
      size: buf.length,
      buffer: buf,
    });
    assert.equal(r.ok, false);
  });

  it("rejects oversized file", () => {
    const buf = Buffer.alloc(100);
    const r = validatePhotoBuffer({
      mimeType: "image/png",
      size: 11 * 1024 * 1024,
      buffer: buf,
    });
    assert.equal(r.ok, false);
  });

  it("rejects disallowed mime", () => {
    const buf = Buffer.from("hello");
    const r = validatePhotoBuffer({
      mimeType: "application/pdf",
      size: buf.length,
      buffer: buf,
    });
    assert.equal(r.ok, false);
  });
});

describe("parseOrderInputSnapshot", () => {
  it("persists listingUrl and description", () => {
    const parsed = parseOrderInputSnapshot({
      purchasePriceCzk: 4500000,
      monthlyGrossRentCzk: 18000,
      ownFundsCzk: 900000,
      annualRatePercent: 4.8,
      street: "Vinohradská 1",
      city: "Praha",
      listingUrl: "https://www.sreality.cz/detail/1",
      propertyDescription: "Dostatečně dlouhý popis nemovitosti pro analýzu.",
    });
    assert.ok(!("error" in parsed));
    if (!("error" in parsed)) {
      assert.equal(parsed.listingUrl, "https://www.sreality.cz/detail/1");
      assert.ok(parsed.propertyDescription?.includes("popis"));
    }
  });

  it("rejects missing identity", () => {
    const parsed = parseOrderInputSnapshot({
      purchasePriceCzk: 1,
      monthlyGrossRentCzk: 1,
      ownFundsCzk: 1,
      city: "Praha",
      propertyDescription: "A".repeat(50),
    });
    assert.ok("error" in parsed);
  });
});
