"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Menu, X, FlaskRound, Shield, Zap, Lock, Globe, MessageCircle, ChevronDown, Play, Pause, Check, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useWaitlistModal } from "@/components/waitlist/WaitlistModalProvider";
import { Logo } from "@/components/ui/Logo";
import { WaveBackground } from "./WaveBackground";

const LANGUAGES = ["English", "Spanish", "French", "German", "Hindi", "Japanese", "Chinese", "Arabic"];

const PROCESSING_STEPS = [
  { label: "Listening", icon: "mic" },
  { label: "Understanding", icon: "brain" },
  { label: "Translating", icon: "translate" },
  { label: "Generating Voice", icon: "voice" },
];

export function DemoHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all ${
        scrolled ? "bg-bg-base/80 backdrop-blur-md border-b border-border-subtle" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="flex h-[72px] items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Logo className="h-16 w-auto" />
            <div className="leading-none">
              <span className="block text-lg font-bold tracking-tight text-white">VOXLATE</span>
              <span className="block text-[9px] font-semibold uppercase tracking-widest text-gray-400">Breaking Language Barriers</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {["Home", "Digital Version", "Physical Version", "About Us", "Careers"].map((link) => (
              <Link
                key={link}
                href={link === "Home" ? "/" : `/${link.toLowerCase().replace(" ", "-")}`}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                {link}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Log In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
            >
              Sign Up
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden p-2 text-text-primary"
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}

export function DemoHero() {
  return (
    <section className="relative pt-20 pb-16 overflow-hidden">
      <WaveBackground />

      <div className="relative mx-auto max-w-[1200px] px-6 md:px-8 text-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-teal/30 bg-accent-teal/10 px-4 py-1.5 mb-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-accent-teal">Demo Experience</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
            <span className="block text-white">Experience</span>
            <span className="block bg-gradient-to-r from-[#3B82F6] via-[#06B6D4] to-[#7C3AED] bg-clip-text text-transparent">
              Voxlate
            </span>
          </h1>
        </div>

        <p className="mt-6 mx-auto max-w-[520px] text-base md:text-lg text-text-secondary leading-relaxed">
          Real-time AI translation that preserves your original voice, tone and emotion.
        </p>
      </div>
    </section>
  );
}

export function InfoBanner() {
  return (
    <section className="px-6 md:px-8 mb-6">
      <div className="mx-auto max-w-[1200px]">
        <div className="rounded-2xl border border-white/20 bg-[rgba(15,23,42,0.4)] backdrop-blur-xl p-6 md:p-8 shadow-[0_0_30px_rgba(59,130,246,0.25)]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#3B82F6]/30 bg-gradient-to-br from-[#3B82F6]/20 to-[#7C3AED]/20">
                <FlaskRound className="h-6 w-6 text-[#3B82F6]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#06B6D4]">This is a Demo Environment</h3>
                <p className="mt-1 text-sm text-[#94A3B8] leading-relaxed max-w-xl">
                  Test how your voice sounds in another language. Our AI will translate your speech while preserving your original voice, tone & emotion.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 lg:gap-0">
              {[
                { icon: Shield, label: "Your Voice Preserved" },
                { icon: Zap, label: "Real-time Translation" },
                { icon: Lock, label: "100% Secure & Private" },
              ].map((item, idx) => (
                <div key={item.label} className="flex items-center gap-3">
                  {idx > 0 && <div className="hidden lg:block w-px h-8 bg-white/10" />}
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#7C3AED]/20 bg-gradient-to-br from-[#7C3AED]/10 to-[#3B82F6]/10">
                      <item.icon size={14} className="text-[#7C3AED]" />
                    </div>
                    <span className="text-xs text-[#94A3B8] whitespace-nowrap text-center">{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function InfoStrip() {
  return (
    <section className="px-6 md:px-8 mb-6">
      <div className="mx-auto max-w-[1200px]">
        <div className="rounded-xl border border-white/20 bg-[rgba(15,23,42,0.3)] backdrop-blur-xl p-4 md:p-5 shadow-[0_0_25px_rgba(59,130,246,0.2)]">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#6366F1]/40 bg-[#6366F1]/10">
              <Info size={20} className="text-[#6366F1]" />
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-white leading-snug">
                This is just a demo to help you feel the experience.
              </p>
              <p className="mt-1 text-sm text-[#94A3B8] leading-relaxed">
                It gives you a preview of how the other person will hear you in their language.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WaveformBars({ active = false }: { active?: boolean }) {
  const bars = [0.6, 1, 0.8, 1.2, 0.9, 1.1, 0.7, 1, 0.85, 1.15, 0.75, 1.05];
  return (
    <div className="flex items-center gap-[3px] h-16">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full transition-all duration-300"
          style={{
            height: `${h * 100}%`,
            backgroundColor: active ? "var(--waveform-active)" : "var(--waveform-idle)",
            animation: active ? `waveform 1s ease-in-out infinite` : "none",
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}

export function MicButton({ state, onClick }: { state: "idle" | "recording" | "processing"; onClick: () => void }) {
  const isRecording = state === "recording";
  const isProcessing = state === "processing";

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div
          className="absolute inset-0 rounded-full transition-all duration-500"
          style={{
            background: isRecording
              ? "radial-gradient(circle, rgba(124,58,237,0.4) 0%, transparent 70%)"
              : "none",
            boxShadow: isRecording ? "0 0 40px 10px rgba(124,58,237,0.4)" : "none",
            transform: isRecording ? "scale(1.1)" : "scale(1)",
          }}
        />
        <button
          type="button"
          onClick={onClick}
          disabled={isProcessing}
          className="relative flex h-[88px] w-[88px] items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] text-white transition-transform hover:scale-105 disabled:opacity-70"
        >
          {isProcessing ? (
            <Loader2 size={28} className="animate-spin" />
          ) : (
            <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          )}
        </button>
      </div>

      <div className="text-center">
        <p className="text-sm text-text-secondary">
          {isProcessing ? "Processing..." : isRecording ? "Listening... Speak now" : "Tap the microphone and start speaking"}
        </p>
        <p className="mt-1 text-xs text-text-muted italic">Speak in English...</p>
      </div>
    </div>
  );
}

export function LanguageSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">
        1. Select Language
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-border-subtle bg-white/5 px-4 py-2.5 pr-10 text-sm text-text-primary outline-none transition-colors focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang} className="bg-card-bg-solid text-text-primary">
              {lang}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
      </div>
    </div>
  );
}

export function TranslationOutput({ original, translated, language }: { original: string; translated: string; language: string }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">
          Original (English)
        </label>
        <div className="rounded-lg border border-border-subtle bg-white/5 p-4">
          <p className="text-sm text-text-primary leading-relaxed">{original}</p>
        </div>
      </div>

      <div className="flex justify-center">
        <ChevronDown size={20} className="text-text-muted" />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Translated to
          </label>
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent-amber">{language}</span>
        </div>
        <div className="rounded-lg border border-accent-purple/25 bg-white/5 p-4">
          <p className="text-sm text-text-primary leading-relaxed">{translated}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#7C3AED] text-white transition-transform hover:scale-105"
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
        </button>
        <div className="flex-1 flex items-center gap-[2px] h-8">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-full transition-all duration-300"
              style={{
                height: `${Math.random() * 100}%`,
                backgroundColor: isPlaying && i < 15 ? "var(--waveform-active)" : "var(--waveform-idle)",
              }}
            />
          ))}
        </div>
        <span className="text-xs text-text-muted font-mono w-10 text-right">00:10</span>
      </div>
    </div>
  );
}

export function ProcessingStatusBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-card-bg backdrop-blur-xl p-6 md:p-8 shadow-[0_0_30px_rgba(59,130,246,0.25)]">
      <p className="text-center text-[10px] font-bold uppercase tracking-wider text-accent-teal mb-6">
        Processing...
      </p>
      <div className="flex items-center justify-between">
        {PROCESSING_STEPS.map((step, idx) => {
          const isComplete = idx < currentStep;
          const isActive = idx === currentStep;

          return (
            <div key={step.label} className="flex flex-1 flex-col items-center gap-3">
              <div className="relative flex items-center justify-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                    isComplete
                      ? "border-accent-teal bg-accent-teal/15"
                      :                     isActive
                      ? "border-[#7C3AED] bg-[#7C3AED]/20 shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                      : "border-border-subtle bg-white/5"
                  }`}
                >
                  {isComplete ? (
                    <Check size={16} className="text-accent-teal" />
                  ) : isActive ? (
                    <span className="text-xs font-bold text-text-primary animate-pulse">•••</span>
                  ) : (
                    <span className="text-xs font-medium text-text-muted">{idx + 1}</span>
                  )}
                </div>
              </div>
              <span
                className={`text-xs font-medium text-center ${
                  isActive ? "text-text-primary" : isComplete ? "text-accent-teal" : "text-text-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-center text-xs text-text-muted">
        This may take 5–10 seconds depending on the length of the speech.
      </p>
    </div>
  );
}

export function FeatureIconsRow() {
  const features = [
    { icon: Zap, label: "Real-Time Translation" },
    { icon: Shield, label: "Original Voice Preserved" },
    { icon: Globe, label: "100+ Languages" },
    { icon: Lock, label: "Secure & Private" },
    { icon: MessageCircle, label: "Natural Conversations" },
  ];

  return (
    <section className="px-6 md:px-8 mt-12">
      <div className="mx-auto max-w-[1200px]">
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {features.map((feature) => (
              <div key={feature.label} className="flex items-center gap-2">
                <feature.icon size={18} className="text-accent-blue" />
                <span className="text-xs text-text-secondary whitespace-nowrap">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function DemoFooter() {
  return (
    <footer className="border-t border-white/20 mt-16">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-auto" />
            <span className="text-sm font-bold text-white">VOXLATE</span>
          </div>
          <p className="text-xs text-text-muted">© 2026 Voxlate. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="text-xs text-text-muted hover:text-text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-text-muted hover:text-text-primary transition-colors">Terms of Service</Link>
            <Link href="/contact" className="text-xs text-text-muted hover:text-text-primary transition-colors">Contact Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
