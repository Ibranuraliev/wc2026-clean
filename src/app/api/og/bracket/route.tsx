import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const champion = searchParams.get("champion") ?? "?";
  const flag = searchParams.get("flag") ?? "🏆";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A0A0A",
          fontFamily: "sans-serif",
          color: "#FAFAFA",
        }}
      >
        <div style={{ fontSize: 72, marginBottom: 16 }}>{flag}</div>
        <div style={{ fontSize: 20, color: "#9CA3AF", marginBottom: 8 }}>
          My World Cup 2026 Champion
        </div>
        <div style={{ fontSize: 48, fontWeight: "bold", color: "#3DDC84" }}>
          {champion}
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 14,
            color: "#9CA3AF",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "8px 20px",
            borderRadius: 999,
          }}
        >
          road2026.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
