import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        // --- Couleurs de marque Sushi Vienne (DA street-food japonaise) ---
        brand: {
          DEFAULT: "#F26522", // orange vif (accent principal)
          deep: "#E63312", // rouge-orangé (fin du dégradé)
        },
        ink: "#0A0A0A", // noir profond (header/footer)
        cream: "#FAF7F2", // fond clair texturé

        // --- Tokens sémantiques (pattern shadcn, pilotés par variables CSS) ---
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        // Titres impactants "arcade/pop" japonaise + texte courant lisible.
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #F26522 0%, #E63312 100%)",
        "gradient-conic":
          "conic-gradient(var(--conic-position), var(--tw-gradient-stops))",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Défilement horizontal infini (galerie de photos)
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        // Halos néon qui dérivent en boucle (fond du menu)
        "neon-1": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(60px, -40px) scale(1.2)" },
        },
        "neon-2": {
          "0%, 100%": { transform: "translate(0, 0) scale(1.1)" },
          "50%": { transform: "translate(-70px, 50px) scale(0.9)" },
        },
        "neon-pulse": {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.8" },
        },
        // Effet « lampe » : allumage progressif + élargissement du faisceau
        "lamp-on": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "lamp-beam": {
          from: { transform: "scaleX(0.5)", opacity: "0.4" },
          to: { transform: "scaleX(1)", opacity: "1" },
        },
        // Brillance qui balaie un texte en dégradé
        shimmer: {
          from: { backgroundPosition: "0% center" },
          to: { backgroundPosition: "200% center" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        marquee: "marquee 40s linear infinite",
        "neon-1": "neon-1 14s ease-in-out infinite",
        "neon-2": "neon-2 18s ease-in-out infinite",
        "neon-pulse": "neon-pulse 6s ease-in-out infinite",
        "lamp-on": "lamp-on 1s ease-in-out 0.2s both",
        "lamp-beam": "lamp-beam 0.9s ease-in-out 0.2s both",
        shimmer: "shimmer 5s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
