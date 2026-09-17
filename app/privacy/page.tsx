"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="w-full px-6 py-6">
        <div className="mx-auto max-w-[1200px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="h-16 w-auto" />
            <div className="leading-none">
              <span className="block text-3xl font-bold tracking-tight text-text-primary">VOXLATE</span>
              <span className="block text-xs font-medium uppercase tracking-widest text-text-muted">Breaking Language Barriers</span>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-card bg-surface p-8 shadow-sm border border-border">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-text-primary mb-3">Privacy Policy</h2>
              <p className="text-sm text-text-secondary">Last updated: August 2026</p>
            </div>

            <div className="space-y-8 text-text-secondary leading-relaxed">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-text-primary pt-2">1. Information We Collect</h3>
                <p className="text-base">We collect information you provide directly to us, such as your name, email address, and other information you choose to provide when joining our waitlist or creating an account.</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-text-primary pt-2">2. How We Use Your Information</h3>
                <p className="text-base">We use the information we collect to provide, maintain, and improve our services, communicate with you about our products and services, and comply with legal obligations.</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-text-primary pt-2">3. Data Storage and Security</h3>
                <p className="text-base">We take reasonable measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-text-primary pt-2">4. Data Sharing</h3>
                <p className="text-base">We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as required by law or as necessary to provide our services.</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-text-primary pt-2">5. Your Rights</h3>
                <p className="text-base">You have the right to access, correct, or delete your personal information at any time. You can do this by contacting us or through your account settings.</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-text-primary pt-2">6. Cookies</h3>
                <p className="text-base">We use cookies and similar tracking technologies to enhance your experience on our platform. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-text-primary pt-2">7. Children's Privacy</h3>
                <p className="text-base">Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will take steps to delete the information.</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-text-primary pt-2">8. Changes to Privacy Policy</h3>
                <p className="text-base">We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-text-primary pt-2">9. Contact Us</h3>
                <p className="text-base">If you have any questions about this Privacy Policy, please contact us at privacy@voxlate.com.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
