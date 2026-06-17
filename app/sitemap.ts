import type { MetadataRoute } from "next";

/** Plan du site : pages publiques en FR (défaut, sans préfixe) et EN (/en). */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://sushi-vienne.vercel.app";
  const paths = [
    "/",
    "/menu",
    "/le-restaurant",
    "/infos",
    "/mentions-legales",
    "/confidentialite",
  ];

  return paths.flatMap((path) => {
    const clean = path === "/" ? "" : path;
    return [
      {
        url: `${base}${clean}`,
        changeFrequency: "weekly" as const,
        priority: path === "/" ? 1 : 0.7,
      },
      {
        url: `${base}/en${clean}`,
        changeFrequency: "weekly" as const,
        priority: path === "/" ? 0.9 : 0.6,
      },
    ];
  });
}
