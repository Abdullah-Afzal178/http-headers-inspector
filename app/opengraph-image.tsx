import { ImageResponse } from "next/og";

import { PAGE_DESCRIPTION, SITE_NAME } from "@/lib/constants";

export const runtime = "edge";
export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LINES = [
  "HTTP/2 200",
  "strict-transport-security: max-age=63072000",
  "content-security-policy: default-src 'self'",
  "x-content-type-options: nosniff",
  "x-frame-options: DENY",
];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          width: "100%",
          background: "#0a0a0c",
          padding: "56px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", color: "#f43f5e", fontSize: "25px", fontWeight: 800 }}>
            {SITE_NAME}
          </div>
          <div
            style={{
              marginTop: "24px",
              fontSize: "66px",
              lineHeight: 1.03,
              fontWeight: 800,
              color: "#fafafa",
              maxWidth: "900px",
            }}
          >
            Every header, explained.
          </div>
          <div
            style={{
              marginTop: "18px",
              fontSize: "24px",
              lineHeight: 1.4,
              color: "#a1a1aa",
              maxWidth: "840px",
            }}
          >
            {PAGE_DESCRIPTION}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderRadius: "14px",
            border: "1px solid #27272a",
            background: "#000000",
            padding: "24px 28px",
            fontFamily: "monospace",
            fontSize: "22px",
            lineHeight: 1.7,
          }}
        >
          {LINES.map((line, index) => (
            <div key={line} style={{ display: "flex", color: index === 0 ? "#fb7185" : "#d4d4d8" }}>
              {line}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
