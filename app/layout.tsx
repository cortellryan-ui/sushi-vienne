// Layout racine "passe-plat" : le vrai <html>/<body> est rendu par
// app/[locale]/layout.tsx (qui connaît la locale). Le not-found global
// rend son propre <html>.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
