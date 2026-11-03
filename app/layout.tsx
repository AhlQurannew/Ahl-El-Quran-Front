import { Cairo } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { Providers } from "./providers";
import { getDir, LANG_COOKIE, normalizeLang } from "@/i18n";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-cairo",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read on the server so the first paint already has the right language and direction.
  const lang = normalizeLang((await cookies()).get(LANG_COOKIE)?.value);

  return (
    <html lang={lang} dir={getDir(lang)} className={cairo.variable}>
      <body className={cairo.className}>
        <Providers lang={lang}>{children}</Providers>
      </body>
    </html>
  );
}
