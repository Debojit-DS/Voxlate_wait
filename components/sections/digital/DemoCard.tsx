"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ChevronDown, Play, Pause, Star } from "lucide-react";
import { useDemoGate } from "@/components/auth/useDemoGate";
import { useWaitlistModal } from "@/components/waitlist/WaitlistModalProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";
import { Button } from "@/components/ui/Button";
import { useRouter, useSearchParams } from "next/navigation";
import { apiJson } from "@/lib/apiClient";
import { demoSocketUrl } from "@/lib/demoTransport";

const LANGUAGES = ["English", "Spanish", "French", "German", "Bengali", "Tamil", "Hindi", "Japanese", "Chinese", "Arabic"];

const LANGUAGE_MAP: Record<string, string> = {
  "English": "en",
  "Spanish": "es",
  "French": "fr",
  "German": "de",
  "Bengali": "bn",
  "Tamil": "ta",
  "Hindi": "hi",
  "Japanese": "ja",
  "Chinese": "zh",
  "Arabic": "ar"
};

type MicState = "idle" | "recording" | "processing" | "completed";

export function DemoCard() {
  const [language, setLanguage] = useState("Hindi");
  const [micState, setMicState] = useState<MicState>("idle");
  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration] = useState("00:10");
  const [receivedAudioUrl, setReceivedAudioUrl] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { isAllowed, isLoading } = useDemoGate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { openPrompt } = useAuthPrompt();
  const { openModal } = useWaitlistModal();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const autoOpen = searchParams.get("autoOpen");
    if (autoOpen !== "waitlist") return;
    if (isAuthLoading) return;

    if (user) {
      openModal("demo-gate");
    } else {
      openPrompt();
    }
    const url = new URL(window.location.href);
    url.searchParams.delete("autoOpen");
    router.replace(url.pathname + url.search);
  }, [searchParams, user, isAuthLoading, openModal, openPrompt, router]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    if (!user) {
      openPrompt();
      return;
    }
    if (!isAllowed) {
      openModal("demo-gate");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        sendAudioToServer(new Blob(audioChunksRef.current, { type: "audio/webm" }));
      };

      mediaRecorderRef.current.start();
      setMicState("recording");
      setOriginalText("Listening to your voice...");
      setTranslatedText("");
      setReceivedAudioUrl(null);
      setIsPlaying(false);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Please allow microphone access to use the demo.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && micState === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setMicState("processing");
      setOriginalText("Sending audio to Voxlate AI...");
    }
  };

  const handleMicClick = () => {
    if (micState === "recording") {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const sendAudioToServer = async (audioBlob: Blob) => {
    try {
      let wsUrl: string;
      try {
        wsUrl = demoSocketUrl(process.env.NEXT_PUBLIC_WS_URL, window.location.protocol, process.env.NODE_ENV === "production");
      } catch {
        wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws";
      }

      // Try fetching token first for secure authentication
      let token: string | null = null;
      try {
        const ticket = await apiJson<{ status: string; token?: string }>("/api/demo/token", { method: "POST" });
        if (ticket.status === "success" && ticket.token) {
          token = ticket.token;
        }
      } catch {
        // Fallback to email protocol if token endpoint is unreachable
      }

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.binaryType = "arraybuffer";

      ws.onopen = () => {
        if (token) {
          ws.send(token);
        } else {
          const email = user?.email || "demo@example.com";
          ws.send(`email: ${email}`);
        }
      };

      ws.onmessage = async (event) => {
        if (typeof event.data === "string") {
          if (event.data === "permitted") {
            const buffer = await audioBlob.arrayBuffer();
            ws.send(buffer);
            ws.send(`lang: ${LANGUAGE_MAP[language] || "hi"}`);
          } else if (event.data === "denied") {
            alert("Demo limit exceeded (Max 5 requests).");
            setMicState("idle");
            ws.close();
          } else if (event.data === "error") {
            alert("Server processing error.");
            setMicState("idle");
          } else if (event.data.trim().startsWith("{")) {
            try {
              const payload = JSON.parse(event.data);
              if (payload.status === "success") {
                setOriginalText(payload.original_text);
                setTranslatedText(payload.translated_text);

                const byteCharacters = atob(payload.audio_base64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: "audio/wav" });

                setReceivedAudioUrl(URL.createObjectURL(blob));
                setMicState("completed");
              }
            } catch (e) {
              console.error("Failed to parse server message:", e);
            }
          }
        }
      };

      ws.onclose = () => {
        if (micState === "processing") {
          setMicState("idle");
        }
      };
    } catch (e) {
      console.error("WebSocket setup error:", e);
      setMicState("idle");
    }
  };

  const togglePlayback = () => {
    if (audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause();
      } else {
        audioPlayerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const showLockedOverlay = !isLoading && !isAllowed;

  return (
    <section className="px-6 md:px-8 mb-12">
      <div className="mx-auto max-w-[1200px]">
        <div className="rounded-2xl border border-white/20 bg-[rgba(15,23,42,0.5)] backdrop-blur-md p-6 md:p-8 relative overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.25)]">

          {receivedAudioUrl && (
            <audio
              ref={audioPlayerRef}
              src={receivedAudioUrl}
              onEnded={() => setIsPlaying(false)}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              className="hidden"
            />
          )}

          {showLockedOverlay && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[rgba(3,7,18,0.85)] backdrop-blur-md px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/5 shadow-inner">
                <svg viewBox="0 0 24 24" width={30} height={30} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="max-w-xl mx-auto space-y-3">
                <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">VIP Treatment Only 👀</p>
                <p className="text-base sm:text-lg text-[#94A3B8] leading-relaxed">
                  Join the waitlist → Demo unlocked 🔓 Free for you &apos;cause you&apos;re cute, charging everyone else though! 🤫❤️
                </p>
                <div className="pt-2">
                  <Button
                    variant="primary-demo"
                    onClick={() => {
                      if (!user) {
                        openPrompt();
                      } else {
                        openModal("demo-gate");
                      }
                    }}
                    className="mx-auto w-full max-w-[420px] py-4 text-lg font-bold rounded-xl shadow-[0_0_25px_rgba(59,130,246,0.5)] hover:shadow-[0_0_35px_rgba(59,130,246,0.7)] transition-all"
                  >
                    Join Waitlist
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className={`grid gap-8 lg:gap-12 lg:grid-cols-2 ${showLockedOverlay ? "blur-sm pointer-events-none select-none" : ""}`}>
            <div className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-2">
                  1. Translate To
                </label>
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    disabled={micState !== "idle" && micState !== "completed"}
                    className="w-full appearance-none rounded-lg border border-white/20 bg-[rgba(2,6,23,0.6)] px-4 py-2.5 pr-10 text-sm text-white outline-none transition-colors focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:opacity-50"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang} className="bg-[#0F172A] text-white">
                        {lang}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                    <span className="text-sm">🌍</span>
                    <ChevronDown size={16} className="text-[#94A3B8]" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-4">
                  2. Tap &amp; Speak
                </label>
                <div className="flex flex-col items-center gap-6 py-6">
                  <div className="relative">
                    {micState === "recording" && (
                      <>
                        <div className="mic-ripple-ring" />
                        <div className="mic-ripple-ring-delayed" />
                      </>
                    )}

                    <div className="relative flex items-center justify-center">
                      <button
                        type="button"
                        onClick={handleMicClick}
                        disabled={micState === "processing" || showLockedOverlay}
                        className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] via-[#6366F1] to-[#3B82F6] text-white shadow-[0_0_40px_rgba(124,58,237,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                        aria-label={micState === "recording" ? "Stop recording" : "Start recording"}
                      >
                        {micState === "processing" ? (
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : micState === "recording" ? (
                          <div className="h-8 w-8 rounded-sm bg-white" style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.6))" }} />
                        ) : (
                          <svg viewBox="0 0 24 24" width={32} height={32} fill="currentColor" style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.6))" }} aria-hidden="true">
                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" fill="currentColor" />
                            <line x1="12" x2="12" y1="19" y2="22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-medium text-white">
                      {micState === "processing"
                        ? "Translating and cloning voice..."
                        : micState === "recording"
                        ? "Listening... Tap to stop"
                        : showLockedOverlay
                        ? "Join the waitlist to start"
                        : "Tap the microphone and start speaking"}
                    </p>
                    <p className="mt-1 text-xs text-[#94A3B8] italic">Your voice will be translated to {language}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                3. How They Will Hear You – Listen Now
              </label>

              <div
                className="rounded-xl border border-white/10 bg-[rgba(2,6,23,0.6)] p-4 transition-all duration-500"
                style={{ opacity: micState === "idle" && !showLockedOverlay ? 0.5 : 1 }}
              >
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-2">
                  Original (English)
                </label>
                <p className="text-sm text-white leading-relaxed">
                  {originalText ? `"${originalText}"` : '""'}
                </p>
              </div>

              <div className="flex justify-center">
                <ChevronDown size={20} className="text-[#64748B]" />
              </div>

              <div
                className="rounded-xl border border-[#7C3AED]/25 bg-[rgba(2,6,23,0.6)] p-4 transition-all duration-500"
                style={{ opacity: micState === "completed" ? 1 : 0.5 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                    How They Will Hear You
                  </label>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#06B6D4]">{language}</span>
                </div>
                <p className="text-sm text-white leading-relaxed">
                  {translatedText || "..."}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={togglePlayback}
                  disabled={micState !== "completed" || showLockedOverlay}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#7C3AED] text-white transition-transform hover:scale-105 disabled:opacity-50 ${showLockedOverlay ? "pointer-events-none" : ""}`}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                </button>
                <div className="flex-1 flex items-center gap-[2px] h-8">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-full transition-all duration-300"
                      style={{
                        height: mounted ? `${((i * 17) % 70) + 30}%` : "50%",
                        backgroundColor: isPlaying && i < 15 ? "#22D3EE" : "rgba(148,163,184,0.3)",
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs text-[#64748B] font-mono w-10 text-right">{duration}</span>
              </div>

              <div className="border-t border-white/10 pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#6366F1]/60 bg-[#6366F1]/10">
                      <Star className="h-5 w-5 text-[#6366F1]" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">Enjoying the demo?</h3>
                      <p className="mt-1 text-xs text-[#94A3B8]">
                        Get early access to Voxlate Digital and experience seamless real-time conversations in any language.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="primary-demo"
                    onClick={() => {
                      window.dispatchEvent(new Event("review:open-form"));
                      const el = document.getElementById("review-form-section");
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "center" });
                      }
                    }}
                    className="font-bold whitespace-nowrap"
                  >
                    Leave a Review
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
