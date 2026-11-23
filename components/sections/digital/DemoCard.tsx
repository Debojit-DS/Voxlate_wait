"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight, Lock, Mic, Pause, Play, Square } from "lucide-react";
import { useDemoGate } from "@/components/auth/useDemoGate";
import { useWaitlistModal } from "@/components/waitlist/WaitlistModalProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { apiJson } from "@/lib/apiClient";
import { demoSocketUrl } from "@/lib/demoTransport";

const LANGUAGES: { name: string; code: string; native: string }[] = [
  { name: "Hindi", code: "hi", native: "हिन्दी" },
  { name: "English", code: "en", native: "English" },
  { name: "Bengali", code: "bn", native: "বাংলা" },
  { name: "Tamil", code: "ta", native: "தமிழ்" },
  { name: "Spanish", code: "es", native: "Español" },
  { name: "French", code: "fr", native: "Français" },
  { name: "German", code: "de", native: "Deutsch" },
  { name: "Japanese", code: "ja", native: "Japanese" },
  { name: "Chinese", code: "zh", native: "Chinese" },
  { name: "Arabic", code: "ar", native: "Arabic" },
];

const BARS = Array.from({ length: 44 }, (_, i) => 28 + ((i * 37) % 64));

type MicState = "idle" | "recording" | "processing" | "completed";

/** The web demo: record a clip, the speech service translates it and answers in your cloned voice. */
export function DemoCard() {
  const [language, setLanguage] = useState("Hindi");
  const [micState, setMicState] = useState<MicState>("idle");
  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [receivedAudioUrl, setReceivedAudioUrl] = useState<string | null>(null);

  const { isAllowed, isLoading } = useDemoGate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { openPrompt } = useAuthPrompt();
  const { openModal } = useWaitlistModal();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("autoOpen") !== "waitlist" || isAuthLoading) return;
    if (user) openModal("demo-gate");
    else openPrompt();
    const url = new URL(window.location.href);
    url.searchParams.delete("autoOpen");
    router.replace(url.pathname + url.search);
  }, [searchParams, user, isAuthLoading, openModal, openPrompt, router]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const code = LANGUAGES.find((l) => l.name === language)?.code ?? "hi";

  useEffect(() => () => wsRef.current?.close(), []);

  const startRecording = async () => {
    if (!user) return openPrompt();
    if (!isAllowed) return openModal("demo-gate");
    setNotice(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => sendAudioToServer(new Blob(audioChunksRef.current, { type: "audio/webm" }));
      mediaRecorderRef.current.start();
      setMicState("recording");
      setOriginalText("");
      setTranslatedText("");
      setReceivedAudioUrl(null);
      setIsPlaying(false);
      setProgress(0);
    } catch {
      setNotice("Please allow microphone access in your browser to try the demo.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && micState === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setMicState("processing");
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

      let token: string | null = null;
      try {
        const ticket = await apiJson<{ status: string; token?: string }>("/api/demo/token", { method: "POST" });
        if (ticket.status === "success" && ticket.token) token = ticket.token;
      } catch {
        // Fall back to the email handshake if the token endpoint is unreachable.
      }

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.binaryType = "arraybuffer";
      ws.onopen = () => ws.send(token ?? `email: ${user?.email || "demo@example.com"}`);
      ws.onmessage = async (event) => {
        if (typeof event.data !== "string") return;
        if (event.data === "permitted") {
          ws.send(await audioBlob.arrayBuffer());
          ws.send(`lang: ${code}`);
        } else if (event.data === "denied") {
          setNotice("You’ve used all 5 demo tries on this account.");
          setMicState("idle");
          ws.close();
        } else if (event.data === "error") {
          setNotice("The translation service hit an error. Please try again.");
          setMicState("idle");
        } else if (event.data.trim().startsWith("{")) {
          try {
            const payload = JSON.parse(event.data);
            if (payload.status === "success") {
              setOriginalText(payload.original_text);
              setTranslatedText(payload.translated_text);
              const bytes = Uint8Array.from(atob(payload.audio_base64), (c) => c.charCodeAt(0));
              setReceivedAudioUrl(URL.createObjectURL(new Blob([bytes], { type: "audio/wav" })));
              setMicState("completed");
            }
          } catch {
            setNotice("We couldn’t read the reply from the server. Please try again.");
            setMicState("idle");
          }
        }
      };
      ws.onerror = () => {
        setNotice("The demo server is unreachable right now. Please try again in a minute.");
        setMicState("idle");
      };
    } catch {
      setNotice("The demo server is unreachable right now. Please try again in a minute.");
      setMicState("idle");
    }
  };

  const togglePlayback = () => {
    const player = audioPlayerRef.current;
    if (!player) return;
    if (isPlaying) player.pause();
    else void player.play();
  };

  const locked = !isLoading && !isAllowed;
  const busy = micState === "recording" || micState === "processing";
  const status =
    micState === "processing"
      ? "Translating and matching your voice…"
      : micState === "recording"
        ? "Listening. Tap again to stop."
        : micState === "completed"
          ? "Done. Play it back, or record another."
          : "Tap the microphone and say a sentence.";

  return (
    <div className="relative overflow-hidden rounded-[14px] border border-line bg-surface">
      {receivedAudioUrl && (
        <audio
          ref={audioPlayerRef}
          src={receivedAudioUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            setProgress(0);
          }}
          onTimeUpdate={(e) => setProgress(e.currentTarget.duration ? e.currentTarget.currentTime / e.currentTarget.duration : 0)}
          className="hidden"
        />
      )}

      {locked && (
        <div className="absolute inset-0 z-10 flex flex-col items-start justify-end gap-4 bg-page/85 p-8 backdrop-blur-[3px] sm:p-12">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white">
            <Lock size={18} aria-hidden />
          </span>
          <p className="vx-display max-w-[18ch] text-[clamp(1.8rem,3.6vw,2.6rem)] text-ink">The demo opens once you’re on the waitlist.</p>
          <p className="max-w-[46ch] text-[16px] text-slate">It’s free. Sign in, join the list, and you get five tries to hear yourself in another language.</p>
          <button type="button" className="vx-btn" onClick={() => (user ? openModal("demo-gate") : openPrompt())}>
            Join the Waitlist <ArrowRight size={17} aria-hidden />
          </button>
        </div>
      )}

      <div className={`grid lg:grid-cols-2 ${locked ? "pointer-events-none select-none blur-[2px]" : ""}`} aria-hidden={locked || undefined}>
        {/* Speak */}
        <div className="border-b border-line p-6 sm:p-10 lg:border-b-0 lg:border-r">
          <p className="vx-label">
            <span className="text-primary">01</span> · Translate to
          </p>
          <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Translate to">
            {LANGUAGES.map((l) => (
              <button
                key={l.name}
                type="button"
                role="radio"
                aria-checked={language === l.name}
                disabled={busy}
                onClick={() => setLanguage(l.name)}
                className="vx-chip disabled:opacity-50"
                lang={l.code}
                style={{ fontFamily: "var(--font-indic)" }}
              >
                {l.native}
              </button>
            ))}
          </div>

          <p className="vx-label mt-10">
            <span className="text-primary">02</span> · Speak
          </p>
          <div className="mt-6 flex items-center gap-6">
            <button
              type="button"
              onClick={micState === "recording" ? stopRecording : startRecording}
              disabled={micState === "processing" || locked}
              aria-label={micState === "recording" ? "Stop recording" : "Start recording"}
              className={`relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full text-white transition-[background-color,transform] duration-200 active:scale-95 disabled:opacity-60 ${
                micState === "recording" ? "bg-primary" : "bg-ink hover:bg-primary"
              }`}
            >
              {micState === "recording" && <span className="absolute inset-0 animate-ping rounded-full bg-primary/30 motion-reduce:hidden" aria-hidden="true" />}
              {micState === "processing" ? (
                <span className="h-7 w-7 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
              ) : micState === "recording" ? (
                <Square size={26} fill="currentColor" aria-hidden />
              ) : (
                <Mic size={30} aria-hidden />
              )}
            </button>
            <div aria-live="polite">
              <p className="text-[17px] font-semibold text-ink">{status}</p>
              <p className="mt-1 text-[14px] text-slate">You’ll hear it back in {language}, in your own voice.</p>
            </div>
          </div>
          {notice && (
            <p role="alert" className="mt-6 border-l-2 border-danger pl-3 text-[14px] text-ink">
              {notice}
            </p>
          )}
        </div>

        {/* Listen */}
        <div className="p-6 sm:p-10">
          <p className="vx-label">
            <span className="text-primary">03</span> · How they’ll hear you
          </p>
          <div className="mt-4 rounded-[10px] border border-line bg-page p-4">
            <p className="text-[13px] text-slate">What you said</p>
            <p className="mt-1 min-h-[24px] text-[16px] leading-relaxed text-ink">{originalText || "—"}</p>
          </div>
          <ArrowDown size={18} className="mx-4 my-2 text-line-strong" aria-hidden />
          <div className="rounded-[10px] border border-line bg-page p-4" style={{ boxShadow: micState === "completed" ? "inset 3px 0 0 var(--color-primary)" : undefined }}>
            <p className="text-[13px] text-slate">
              In <span className="font-medium text-primary">{language}</span>
            </p>
            <p className="mt-1 min-h-[24px] text-[16px] leading-relaxed text-ink" lang={code} style={{ fontFamily: "var(--font-indic)" }}>
              {translatedText || "—"}
            </p>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              type="button"
              onClick={togglePlayback}
              disabled={micState !== "completed" || locked}
              aria-label={isPlaying ? "Pause" : "Play translation"}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-hover disabled:bg-line-strong"
            >
              {isPlaying ? <Pause size={16} aria-hidden /> : <Play size={16} className="ml-0.5" aria-hidden />}
            </button>
            <div className="flex h-9 flex-1 items-center gap-[3px]" aria-hidden="true">
              {BARS.map((h, i) => (
                <span
                  key={i}
                  className="flex-1 rounded-full transition-colors duration-200"
                  style={{ height: `${h}%`, background: i / BARS.length < progress ? "var(--color-primary)" : "var(--color-line)" }}
                />
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <p className="text-[15px] text-slate">Liked how you sounded?</p>
            <Link href="/#testimonials" className="vx-link text-[15px]">
              Share your experience <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
