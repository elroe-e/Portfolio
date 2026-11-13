import { ImageResponse } from "next/og";
import { site } from "@/content/site";

/** The preview image shown when the site is shared on social media or in chats. */
export const alt = `${site.name} — ${site.roles.join(" & ")}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        color: "#f3efe8",
        backgroundColor: "#08080a",
        backgroundImage:
          "radial-gradient(circle at 88% 0%, rgba(255,106,61,0.38), rgba(8,8,10,0) 55%), radial-gradient(circle at 0% 100%, rgba(88,116,255,0.24), rgba(8,8,10,0) 50%)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: 26,
          letterSpacing: 6,
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: 16,
            backgroundColor: "#ff6a3d",
            marginRight: 18,
          }}
        />
        PORTFOLIO
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 150,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: -6,
          }}
        >
          {site.firstName}
        </div>
        <div
          style={{
            fontSize: 150,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -6,
          }}
        >
          {site.lastName}
        </div>
      </div>

      <div style={{ display: "flex", fontSize: 38, color: "#a39f97" }}>
        {site.roles[0]}
        <span style={{ color: "#ff6a3d", margin: "0 16px" }}>&amp;</span>
        {site.roles[1]}
      </div>
    </div>,
    size,
  );
}
