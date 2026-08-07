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
