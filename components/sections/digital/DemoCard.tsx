"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ChevronDown, Play, Pause } from "lucide-react";
import { useDemoGate } from "@/components/auth/useDemoGate";
import { useWaitlistModal } from "@/components/waitlist/WaitlistModalProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";
import { Button } from "@/components/ui/Button";

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
  
  // FIX 1: Prevents hydration mismatch by tracking client-side mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { status, isAllowed, isLoading, promptJoinWaitlist } = useDemoGate();
  const { user } = useAuth();
  const { openPrompt } = useAuthPrompt();
  const { openModal } = useWaitlistModal();
  
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

  const sendAudioToServer = (audioBlob: Blob) => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws";
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
      const email = user?.email || "demo@example.com";
      ws.send(`email: ${email}`);
    };

    ws.onmessage = async (event) => {
      if (typeof event.data === "string") {
        if (event.data === "permitted") {
          const buffer = await audioBlob.arrayBuffer();
          ws.send(buffer);
          ws.send(`lang: ${LANGUAGE_MAP[language]}`);
        } else if (event.data === "denied") {
          alert("Demo limit exceeded (Max 3 requests).");
          setMicState("idle");
          ws.close();
        } else if (event.data === "error") {
          alert("Server processing error.");
          setMicState("idle");
        } else if (event.data.trim().startsWith("{")) {
          // FIX 2: Only parse if it's actually a JSON string, ignoring "closing connection"
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
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[rgba(3,7,18,0.8)] backdrop-blur-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/5">
                <svg viewBox="0 0 24 24" width={32} height={32} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="text-center px-6">
                <p className="text-3xl font-bold text-white mb-2">VIP Treatment Only 👀</p>
                <p className="text-xl text-[#94A3B8] mb-4">
                  Waitlist join karo → Demo unlocked 🔓 Aap cute ho isliye free, baakiyon se paise lenge! 😭❤️
                </p>
                <Button variant="primary-demo" onClick={() => {
                  if (!user) {
                    openPrompt();
                  } else {
                    openModal("demo-gate");
                  }
                }} className="mx-auto max-w-[500px] px-40 py-7 text-xl font-bold rounded-xl">
                  Join Waitlist
                </Button>
              </div>
            </div>
          )}

          <div className={`grid gap-8 lg:gap-12 lg:grid-cols-2 ${showLockedOverlay ? "blur-sm" : ""}`}>
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
                  2. Tap & Speak
                </label>
                <div className="relative flex flex-col items-center gap-4">
                  <div className="relative flex items-center justify-center" style={{ width: 220, height: 120 }}>
                    <div className="mic-waveform" aria-hidden="true">
                      {Array.from({ length: 40 }).map((_, i) => (
                        <div
                          key={i}
                          className="mic-waveform-bar"
                          style={{
                            height: mounted ? `${Math.random() * 100}%` : "50%",
                            animationDelay: `${i * 0.05}s`,
                            opacity: micState === "recording" ? 1 : 0.4,
                          }}
                        />
                      ))}
                    </div>

                    <div className="relative">
                      {micState === "recording" && (
                        <>
                          <div className="mic-ripple-ring" aria-hidden="true" />
                          <div className="mic-ripple-ring-delayed" aria-hidden="true" />
                        </>
                      )}

                      <button
                        type="button"
                        onClick={handleMicClick}
                        disabled={micState === "processing" || showLockedOverlay}
                        className={`relative flex h-[88px] w-[88px] items-center justify-center rounded-full text-white transition-transform hover:scale-105 disabled:opacity-70 ${showLockedOverlay ? "pointer-events-none opacity-50" : ""}`}
                        style={{
                          background: micState === "recording" ? "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)" : "linear-gradient(135deg, #7C3AED 0%, #3B82F6 50%, #06B6D4 100%)",
                          boxShadow: micState === "recording"
                            ? "0 0 0 4px rgba(239, 68, 68, 0.25), 0 0 40px 10px rgba(239, 68, 68, 0.7)"
                            : "0 0 0 3px rgba(6, 182, 212, 0.15), 0 0 30px 6px rgba(6, 182, 212, 0.5), 0 0 60px 15px rgba(124, 58, 237, 0.4), inset 0 0 15px rgba(6, 182, 212, 0.3)",
                        }}
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
                    <p className="text-sm text-white">
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

              <div className="rounded-xl border border-white/10 bg-[rgba(2,6,23,0.6)] p-4 transition-all duration-500"
                   style={{ opacity: micState === "idle" && !showLockedOverlay ? 0.5 : 1 }}>
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

              <div className="rounded-xl border border-[#7C3AED]/25 bg-[rgba(2,6,23,0.6)] p-4 transition-all duration-500"
                   style={{ opacity: micState === "completed" ? 1 : 0.5 }}>
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
                        height: mounted ? `${Math.random() * 100}%` : "50%",
                        backgroundColor: isPlaying && i < 15 ? "#22D3EE" : "rgba(148,163,184,0.3)",
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs text-[#64748B] font-mono w-10 text-right">{duration}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}