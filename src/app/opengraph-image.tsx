import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "HypotékaJasně.cz — hypoteční data a investiční nástroje";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default Open Graph / social image — generated, not a fake photo. */
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 64,
          background: "linear-gradient(165deg, #143d32 0%, #1b4d3e 45%, #0f2f28 100%)",
          color: "white",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: 28, color: "#c5a059", marginBottom: 12 }}>
          hypotekajasne.cz
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1 }}>
          Hypotéka Jasně
        </div>
        <div style={{ fontSize: 28, marginTop: 16, opacity: 0.9, maxWidth: 800 }}>
          Co si můžete dovolit. Kde koupit. Jak financovat.
        </div>
      </div>
    ),
    { ...size }
  );
}
