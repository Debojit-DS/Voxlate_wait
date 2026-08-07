"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function CareersPage() {
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
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-text-primary mb-4">Careers at Voxlate</h1>
              <p className="text-xl font-semibold text-text-primary mb-4">Build the Future of Human Communication</p>
              <p className="text-text-secondary leading-relaxed">
                At Voxlate, we're building the next generation of AI-powered real-time voice translation technology. If you're passionate about innovation and want to solve real-world communication challenges, we'd love to hear from you.
              </p>
            </div>

            <div className="space-y-12">
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-6 pb-2 border-b border-border">Open Positions</h2>
                
                <div className="space-y-8">
                  <div className="p-6 rounded-lg bg-bg-page border border-border">
                    <h3 className="text-xl font-semibold text-text-primary mb-2">Hardware & Embedded Systems Engineer</h3>
                    <p className="text-text-secondary mb-4">Help us build the future of Voxlate's hardware device.</p>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-lg font-semibold text-text-primary mb-2">Responsibilities</h4>
                        <ul className="list-disc pl-6 space-y-1 text-text-secondary">
                          <li>Design and develop embedded hardware systems.</li>
                          <li>Work with microcontrollers, processors, sensors, microphones, speakers, and wireless communication modules.</li>
                          <li>Collaborate with software and AI teams to integrate hardware and software seamlessly.</li>
                          <li>Assist in PCB design, circuit testing, hardware debugging, and prototype development.</li>
                          <li>Optimize hardware for performance, battery life, reliability, and real-world usability.</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-lg font-semibold text-text-primary mb-2">Preferred Skills</h4>
                        <ul className="list-disc pl-6 space-y-1 text-text-secondary">
                          <li>Embedded Systems</li>
                          <li>PCB Design</li>
                          <li>Circuit Design & Debugging</li>
                          <li>Microcontrollers (STM32, ESP32, ARM, etc.)</li>
                          <li>Bluetooth, Wi-Fi & Low-Power Electronics</li>
                          <li>Hardware Prototyping</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-lg bg-bg-page border border-border">
                    <h3 className="text-xl font-semibold text-text-primary mb-2">Sales & Business Development Executive</h3>
                    <p className="text-text-secondary mb-4">Help bring Voxlate to businesses, educational institutions, and users around the world.</p>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-lg font-semibold text-text-primary mb-2">Responsibilities</h4>
                        <ul className="list-disc pl-6 space-y-1 text-text-secondary">
                          <li>Identify and connect with potential customers and enterprise clients.</li>
                          <li>Present and demonstrate Voxlate's products and services.</li>
                          <li>Build long-term relationships with partners and customers.</li>
                          <li>Generate leads and support business growth.</li>
                          <li>Work closely with the marketing team to expand Voxlate's reach.</li>
                          <li>Gather customer feedback and communicate market insights to the product team.</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-lg font-semibold text-text-primary mb-2">Preferred Skills</h4>
                        <ul className="list-disc pl-6 space-y-1 text-text-secondary">
                          <li>Strong communication and presentation skills.</li>
                          <li>Sales or business development experience is a plus.</li>
                          <li>Confidence in networking and relationship building.</li>
                          <li>Passion for technology and startups.</li>
                          <li>Self-motivated with a growth mindset.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-6 pb-2 border-b border-border">Why Join Voxlate?</h2>
                <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                  <li>Work on cutting-edge AI and hardware technology.</li>
                  <li>Build products with real-world impact.</li>
                  <li>Collaborate with a passionate and ambitious team.</li>
                  <li>Learn, innovate, and grow in a fast-moving startup environment.</li>
                  <li>Help shape the future of global communication.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
