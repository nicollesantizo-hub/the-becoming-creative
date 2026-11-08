// Round white logo seal that straddles the seam between a dark header band and the
// white page below it, like a letterhead mark. The parent must be position: relative
// and leave room at the top (see paddingTop below).
export function LogoSeal({ src, alt, size = 112 }: { src: string; alt: string; size?: number }) {
  return (
    <div
      className="logo-seal"
      style={{
        position: "absolute",
        zIndex: 2,
        top: -size / 2,
        left: "50%",
        transform: "translateX(-50%)",
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: Math.round(size * 0.075),
        boxShadow: "0 0 0 1px rgba(17,17,17,0.06), 0 10px 30px -12px rgba(0,0,0,0.25)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
    </div>
  );
}

// Space the page needs above its first line of content so nothing runs under the seal.
export function sealPadding(size = 112) {
  return size / 2 + 36;
}
