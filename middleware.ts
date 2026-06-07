import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Applique l'i18n à tout sauf : routes API, internes Next, et fichiers statiques (avec extension).
  matcher: ["/", "/(fr|en)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
