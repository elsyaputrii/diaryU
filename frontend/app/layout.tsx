import type { Metadata } from "next";
import { Nunito, Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/providers/ToastProvider";
import { themeInitScript } from "@/features/settings/themeScript";

// Tiga font pilihan di halaman Settings. Masing-masing jadi variabel CSS
// (--font-poppins, dst.) yang dipilih lewat data-font di globals.css.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Elsya's Diary — Your Personal Safe Space",
  description: "Aesthetic, minimalist, and elegant digital diary application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: atribut data-theme/data-font diisi script sebelum React aktif
    <html
      lang="id"
      suppressHydrationWarning
      className={`${poppins.variable} ${nunito.variable} ${playfair.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans bg-page text-ink antialiased min-h-screen flex flex-col selection:bg-accent-soft selection:text-ink">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
