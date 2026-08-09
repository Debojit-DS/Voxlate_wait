"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function TermsPage() {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms");

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
            <div className="mb-6 flex gap-2 border-b border-border">
              <button
                type="button"
                onClick={() => setActiveTab("terms")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "terms"
                    ? "border-orange text-text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                Terms of Service
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("privacy")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "privacy"
                    ? "border-orange text-text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                Privacy Policy
              </button>
            </div>

            {activeTab === "terms" ? (
              <div className="max-w-none">
                <div className="mb-10">
                  <h2 className="text-3xl font-bold text-text-primary mb-3">Terms and Conditions</h2>
                  <p className="text-sm text-text-secondary">Last Updated: August 5, 2026</p>
                </div>

                <div className="space-y-8 text-text-secondary leading-relaxed">
                  <div className="space-y-4">
                    <p className="text-base">
                      Welcome to Voxlate. These Terms and Conditions ("Terms") govern your access to and use of the Voxlate website, applications, software, beta services, future hardware devices, and related products (collectively, the "Services"). By accessing or using Voxlate, you agree to comply with these Terms. If you do not agree with these Terms, please discontinue the use of our Services.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-text-primary pt-2">1. About Voxlate</h3>
                    <p className="text-base">
                      Voxlate is an AI-powered real-time speech translation platform designed to help people communicate across different languages while preserving the speaker's natural voice, tone, and emotion.
                    </p>
                    <p className="text-base">
                      Our mission is to make communication seamless, accessible, secure, and inclusive for individuals, businesses, educational institutions, and organizations worldwide.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-text-primary pt-2">2. Acceptance of These Terms</h3>
                    <p className="text-base">By creating an account, joining our waitlist, downloading our software, accessing beta features, or using any Voxlate Service, you confirm that:</p>
                    <ul className="list-disc pl-6 space-y-2 text-base">
                      <li>You have read and understood these Terms.</li>
                      <li>You agree to comply with these Terms.</li>
                      <li>You will use Voxlate responsibly, ethically, and lawfully.</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-text-primary pt-2">3. Eligibility</h3>
                    <p className="text-base">To use Voxlate, you must:</p>
                    <ul className="list-disc pl-6 space-y-2 text-base">
                      <li>Comply with all applicable laws and regulations.</li>
                      <li>Provide accurate registration information.</li>
                      <li>Maintain the confidentiality of your account credentials.</li>
                      <li>Be responsible for all activities performed through your account.</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-text-primary pt-2">4. User Responsibilities</h3>
                    <p className="text-base">Users agree to:</p>
                    <ul className="list-disc pl-6 space-y-2 text-base">
                      <li>Use the Services responsibly.</li>
                      <li>Respect the rights and privacy of others.</li>
                      <li>Maintain account security.</li>
                      <li>Promptly report unauthorized account access.</li>
                      <li>Use Voxlate only for lawful and legitimate purposes.</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-text-primary pt-2">5. Acceptable Use</h3>
                    <p className="text-base">Voxlate may be used for purposes including:</p>
                    <ul className="list-disc pl-6 space-y-2 text-base">
                      <li>Personal communication</li>
                      <li>Business meetings</li>
                      <li>Remote collaboration</li>
                      <li>Online education</li>
                      <li>Customer support</li>
                      <li>Accessibility assistance</li>
                      <li>International communication</li>
                      <li>Travel and tourism</li>
                      <li>Research and innovation</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-text-primary pt-2">6. Prohibited Uses</h3>
                    <p className="text-base">Users shall not use Voxlate for any unlawful, fraudulent, harmful, abusive, or unethical activity. This includes but is not limited to:</p>
                    <ul className="list-disc pl-6 space-y-2 text-base">
                      <li>Financial fraud</li>
                      <li>Identity theft</li>
                      <li>Phishing</li>
                      <li>Social engineering</li>
                      <li>Scams</li>
                      <li>Cybercrime</li>
                      <li>Extortion</li>
                      <li>Blackmail</li>
                      <li>Harassment</li>
                      <li>Distribution of malware</li>
                      <li>Unauthorized surveillance</li>
                      <li>Impersonation</li>
                      <li>Terrorist or extremist activities</li>
                      <li>Human trafficking</li>
                      <li>Hate speech</li>
                      <li>Money laundering</li>
                      <li>Violating applicable laws</li>
                    </ul>

                    <div className="mt-6 p-6 rounded-lg bg-surface border border-border">
                      <h4 className="text-lg font-semibold text-text-primary mb-3">Fraud Prevention Policy</h4>
                      <p className="text-base mb-4">Voxlate exists to connect people—not to deceive them.</p>
                      <p className="text-base mb-4">The use of Voxlate by scam call centers, fraudulent organizations, cybercriminals, individuals involved in phishing, impersonation, financial fraud, identity theft, or any other illegal activity is strictly prohibited.</p>
                      <p className="text-base mb-4">Voxlate does not support, encourage, or authorize the use of its technology for unlawful activities.</p>
                      <p className="text-base">Where permitted by applicable law, Voxlate reserves the right to:</p>
                      <ul className="list-disc pl-6 space-y-2 text-base mt-2">
                        <li>Suspend or permanently terminate accounts.</li>
                        <li>Restrict access to Services.</li>
                        <li>Investigate suspected misuse.</li>
                        <li>Preserve relevant records where legally required.</li>
                        <li>Cooperate with lawful requests from competent authorities.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-text-primary pt-2">7. Artificial Intelligence</h3>
                    <p className="text-base">Voxlate uses artificial intelligence to process speech and generate translations.</p>
                    <p className="text-base">Users acknowledge that:</p>
                    <ul className="list-disc pl-6 space-y-2 text-base">
                      <li>AI-generated translations may occasionally contain inaccuracies.</li>
                      <li>Translations should not be considered professional legal, medical, financial, or emergency advice.</li>
                      <li>Users should independently verify important information before making critical decisions.</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-text-primary pt-2">8. Beta Features</h3>
                    <p className="text-base">Certain Services may be released as Beta versions.</p>
                    <p className="text-base">Beta features may:</p>
                    <ul className="list-disc pl-6 space-y-2 text-base">
                      <li>Change without notice.</li>
                      <li>Contain bugs.</li>
                      <li>Be discontinued.</li>
                      <li>Produce experimental results.</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-text-primary pt-2">9. Intellectual Property</h3>
                    <p className="text-base">All software, AI models, algorithms, branding, trademarks, graphics, website content, user interfaces, documentation, source code, product designs, and related materials are the exclusive intellectual property of Voxlate or its licensors and are protected under applicable intellectual property laws.</p>
                    <p className="text-base">Users shall not:</p>
                    <ul className="list-disc pl-6 space-y-2 text-base">
                      <li>Copy</li>
                      <li>Modify</li>
                      <li>Sell</li>
                      <li>Redistribute</li>
                      <li>Reverse engineer</li>
                      <li>Decompile</li>
                      <li>Create derivative works</li>
                      <li>Attempt unauthorized access</li>
                    </ul>
                    <p className="text-base">without prior written permission from Voxlate.</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-text-primary pt-2">10. User Content</h3>
                    <p className="text-base">Users retain ownership of content they submit.</p>
                    <p className="text-base">By using Voxlate, users grant Voxlate a limited license to process such content solely for providing, maintaining, improving, securing, and operating the Services in accordance with the Privacy Policy.</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-text-primary pt-2">11. Privacy</h3>
                    <p className="text-base">The collection, storage, processing, and protection of personal information are governed by the Voxlate Privacy Policy.</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-text-primary pt-2">12. Service Availability</h3>
                    <p className="text-base">Although Voxlate strives to provide reliable Services, uninterrupted availability cannot be guaranteed.</p>
                    <p className="text-base">Maintenance, updates, technical issues, internet failures, or circumstances beyond our control may temporarily affect service availability.</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-text-primary pt-2">13. Limitation of Liability</h3>
                    <p className="text-base">To the maximum extent permitted by applicable law, Voxlate shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from:</p>
                    <ul className="list-disc pl-6 space-y-2 text-base">
                      <li>Use of the Services.</li>
                      <li>Inability to access the Services.</li>
                      <li>AI-generated translation inaccuracies.</li>
                      <li>Service interruptions.</li>
                      <li>Data loss caused by circumstances beyond reasonable control.</li>
                    </ul>
                    <p className="text-base">Users remain responsible for how they use translated information.</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-text-primary pt-2">14. Account Suspension and Termination</h3>
                    <p className="text-base">Voxlate reserves the right to suspend or terminate accounts that:</p>
                    <ul className="list-disc pl-6 space-y-2 text-base">
                      <li>Violate these Terms.</li>
                      <li>Engage in fraud or illegal activities.</li>
                      <li>Attempt unauthorized access.</li>
                      <li>Abuse or exploit the platform.</li>
                      <li>Threaten the security or integrity of Voxlate.</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-text-primary pt-2">15. Changes to the Services</h3>
                    <p className="text-base">Voxlate may modify, improve, suspend, or discontinue any feature or Service at any time.</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-text-primary pt-2">16. Changes to These Terms</h3>
                    <p className="text-base">These Terms may be updated periodically.</p>
                    <p className="text-base">Continued use of the Services after updates constitutes acceptance of the revised Terms.</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-text-primary pt-2">17. Compliance with Applicable Laws</h3>
                    <p className="text-base">Users are solely responsible for ensuring that their use of Voxlate complies with all applicable local, national, and international laws and regulations.</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-text-primary pt-2">18. Indemnification</h3>
                    <p className="text-base">Users agree to defend, indemnify, and hold harmless Voxlate, its founders, employees, contractors, affiliates, partners, licensors, and team members from any claims, liabilities, damages, expenses, legal fees, or losses arising from:</p>
                    <ul className="list-disc pl-6 space-y-2 text-base">
                      <li>Violation of these Terms.</li>
                      <li>Misuse of the Services.</li>
                      <li>Violation of applicable law.</li>
                      <li>Infringement of third-party rights.</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-text-primary pt-2">19. Disclaimer of Warranties</h3>
                    <p className="text-base">The Services are provided on an "AS IS" and "AS AVAILABLE" basis.</p>
                    <p className="text-base">Voxlate makes no guarantee regarding:</p>
                    <ul className="list-disc pl-6 space-y-2 text-base">
                      <li>Continuous availability.</li>
                      <li>Error-free operation.</li>
                      <li>Perfect translation accuracy.</li>
                      <li>Fitness for a particular purpose.</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-text-primary pt-2">20. Force Majeure</h3>
                    <p className="text-base">Voxlate shall not be liable for delays or failures caused by events beyond reasonable control, including natural disasters, war, terrorism, government actions, internet outages, cyberattacks, labor disputes, pandemics, or power failures.</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-text-primary pt-2">21. Severability</h3>
                    <p className="text-base">If any provision of these Terms is determined to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-text-primary pt-2">22. Waiver</h3>
                    <p className="text-base">Failure by Voxlate to enforce any provision of these Terms shall not constitute a waiver of that provision or any other right.</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-text-primary pt-2">23. Entire Agreement</h3>
                    <p className="text-base">These Terms, together with the Privacy Policy and any additional policies published by Voxlate, constitute the entire agreement between Voxlate and its users regarding the Services.</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-text-primary pt-2">24. Governing Law and Jurisdiction</h3>
                    <p className="text-base">These Terms shall be governed by the applicable laws of the jurisdiction in which Voxlate is legally established.</p>
                    <p className="text-base">Any dispute arising from these Terms shall first be attempted to be resolved through good-faith discussions. If a resolution cannot be reached, the dispute shall be subject to the jurisdiction of the competent courts where Voxlate is legally established, unless applicable law provides otherwise.</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-text-primary pt-2">25. Contact</h3>
                    <p className="text-base">Questions regarding these Terms or reports of misuse may be submitted through Voxlate's official support channels listed on the website.</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-text-primary pt-2">26. Acknowledgement</h3>
                    <p className="text-base">By accessing or using Voxlate, you acknowledge that you have read, understood, and agreed to these Terms and Conditions.</p>
                    <p className="text-base mt-4">Thank you for supporting Voxlate's mission to eliminate language barriers through ethical, responsible, and innovative artificial intelligence.</p>
                  </div>
                </div>
              </div>) : (
              <div className="prose prose-sm max-w-none text-text-secondary">
                <h2 className="text-xl font-bold text-text-primary mb-4">Privacy Policy</h2>
                <div className="space-y-4">
                  <p>Last updated: August 2026</p>
                  
                  <h3 className="text-lg font-semibold text-text-primary">1. Information We Collect</h3>
                  <p>We collect information you provide directly to us, such as your name, email address, and other information you choose to provide when joining our waitlist or creating an account.</p>
                  
                  <h3 className="text-lg font-semibold text-text-primary">2. How We Use Your Information</h3>
                  <p>We use the information we collect to provide, maintain, and improve our services, communicate with you about our products and services, and comply with legal obligations.</p>
                  
                  <h3 className="text-lg font-semibold text-text-primary">3. Data Storage and Security</h3>
                  <p>We take reasonable measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.</p>
                  
                  <h3 className="text-lg font-semibold text-text-primary">4. Data Sharing</h3>
                  <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as required by law or as necessary to provide our services.</p>
                  
                  <h3 className="text-lg font-semibold text-text-primary">5. Your Rights</h3>
                  <p>You have the right to access, correct, or delete your personal information at any time. You can do this by contacting us or through your account settings.</p>
                  
                  <h3 className="text-lg font-semibold text-text-primary">6. Cookies</h3>
                  <p>We use cookies and similar tracking technologies to enhance your experience on our platform. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
                  
                  <h3 className="text-lg font-semibold text-text-primary">7. Children's Privacy</h3>
                  <p>Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will take steps to delete the information.</p>
                  
                  <h3 className="text-lg font-semibold text-text-primary">8. Changes to Privacy Policy</h3>
                  <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.</p>
                  
                  <h3 className="text-lg font-semibold text-text-primary">9. Contact Us</h3>
                  <p>If you have any questions about this Privacy Policy, please contact us at privacy@voxlate.com.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


