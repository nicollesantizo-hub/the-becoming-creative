import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Price My Work — The Becoming Creative",
    short_name: "The Becoming Creative",
    description: "Photography pricing and quoting tool for working photographers.",
    start_url: "/pricing",
    display: "standalone",
    background_color: "#f7f3ed",
    theme_color: "#8b5e3c",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
