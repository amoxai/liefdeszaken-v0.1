import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/cart/CartSidebar";
import AuthProvider from "@/components/providers/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Liefdeszaken - Online Webshop",
    template: "%s | Liefdeszaken",
  },
  description: "Ontdek onze unieke collectie met liefde samengestelde producten. Voor alle mooie momenten in het leven.",
  keywords: ["webshop", "online winkelen", "liefdeszaken", "cadeaus", "producten"],
  authors: [{ name: "Liefdeszaken" }],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "https://liefdeszaken.nl",
    siteName: "Liefdeszaken",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <CartSidebar />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#1f2937",
                color: "#fff",
                borderRadius: "0.5rem",
              },
              success: {
                iconTheme: {
                  primary: "#22c55e",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
