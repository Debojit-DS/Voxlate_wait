import { Inter } from "next/font/google";
import { WaitlistModalProvider } from "@/components/waitlist/WaitlistModalProvider";
import { WaitlistModal } from "@/components/waitlist/WaitlistModal";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AuthPromptProvider } from "@/components/auth/AuthPromptProvider";
import { AuthPromptModal } from "@/components/auth/AuthPromptModal";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Voxlate",
  description: "Breaking Language Barriers",
  icons: {
    icon: [
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon.ico" },
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "manifest", url: "/favicon/site.webmanifest" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AuthProvider>
          <AuthPromptProvider>
            <WaitlistModalProvider>
              {children}
              <WaitlistModal />
              <AuthPromptModal />
            </WaitlistModalProvider>
          </AuthPromptProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
