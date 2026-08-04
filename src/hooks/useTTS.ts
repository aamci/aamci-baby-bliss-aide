import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type TTSVoice = "alloy" | "nova" | "shimmer" | "echo" | "onyx" | "fable" | "sage" | "coral";
export type TTSLanguage = "fr" | "en" | "es" | "ar";

const VOICE_KEY = "bebesante_tts_voice";
const LANG_KEY = "bebesante_tts_language";
const SPEED_KEY = "bebesante_tts_speed";

export const DEFAULT_VOICE: TTSVoice = "shimmer";
export const DEFAULT_LANGUAGE: TTSLanguage = "fr";
export const DEFAULT_SPEED = 1.0;

export const SPEED_OPTIONS: { value: number; label: string }[] = [
  { value: 0.75, label: "Lente (0,75×)" },
  { value: 1.0, label: "Normale (1×)" },
  { value: 1.25, label: "Rapide (1,25×)" },
  { value: 1.5, label: "Très rapide (1,5×)" },
];

export const VOICE_OPTIONS: { value: TTSVoice; label: string; gender: "f" | "m" }[] = [
  { value: "shimmer", label: "Claire (F, douce)", gender: "f" },
  { value: "nova", label: "Léa (F, dynamique)", gender: "f" },
  { value: "coral", label: "Sophie (F, chaleureuse)", gender: "f" },
  { value: "alloy", label: "Alex (mixte)", gender: "f" },
  { value: "sage", label: "Camille (F, posée)", gender: "f" },
  { value: "echo", label: "Thomas (H, calme)", gender: "m" },
  { value: "onyx", label: "Marc (H, grave)", gender: "m" },
  { value: "fable", label: "Julien (H, narratif)", gender: "m" },
];

export const LANGUAGE_OPTIONS: { value: TTSLanguage; label: string }[] = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "ar", label: "العربية" },
];

export function getStoredVoice(): TTSVoice {
  if (typeof window === "undefined") return DEFAULT_VOICE;
  return (localStorage.getItem(VOICE_KEY) as TTSVoice) || DEFAULT_VOICE;
}

export function getStoredLanguage(): TTSLanguage {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  return (localStorage.getItem(LANG_KEY) as TTSLanguage) || DEFAULT_LANGUAGE;
}

export function setStoredVoice(v: TTSVoice) {
  localStorage.setItem(VOICE_KEY, v);
  window.dispatchEvent(new Event("tts-settings-changed"));
}

export function setStoredLanguage(l: TTSLanguage) {
  localStorage.setItem(LANG_KEY, l);
  window.dispatchEvent(new Event("tts-settings-changed"));
}

export function getStoredSpeed(): number {
  if (typeof window === "undefined") return DEFAULT_SPEED;
  const v = parseFloat(localStorage.getItem(SPEED_KEY) || "");
  return isNaN(v) ? DEFAULT_SPEED : v;
}

export function setStoredSpeed(s: number) {
  localStorage.setItem(SPEED_KEY, String(s));
  window.dispatchEvent(new Event("tts-settings-changed"));
}

export function useTTSSettings() {
  const [voice, setV] = useState<TTSVoice>(getStoredVoice);
  const [language, setL] = useState<TTSLanguage>(getStoredLanguage);
  const [speed, setS] = useState<number>(getStoredSpeed);
  useEffect(() => {
    const h = () => {
      setV(getStoredVoice());
      setL(getStoredLanguage());
      setS(getStoredSpeed());
    };
    window.addEventListener("tts-settings-changed", h);
    return () => window.removeEventListener("tts-settings-changed", h);
  }, []);
  return { voice, language, speed, setVoice: setStoredVoice, setLanguage: setStoredLanguage, setSpeed: setStoredSpeed };
}

export function useTTS() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "playing" | "paused">("idle");

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const stop = useCallback(() => {
    cleanup();
    setState("idle");
  }, [cleanup]);

  const toggle = useCallback(async (text: string) => {
    if (state === "playing") {
      audioRef.current?.pause();
      setState("paused");
      return;
    }
    if (state === "paused" && audioRef.current) {
      await audioRef.current.play();
      setState("playing");
      return;
    }

    setState("loading");
    try {
      const voice = getStoredVoice();
      const language = getStoredLanguage();
      const speed = getStoredSpeed();
      const { data, error } = await supabase.functions.invoke("tts", {
        body: { text, voice, language, speed },
      });
      if (error) throw error;
      // supabase.functions.invoke returns a Blob for binary responses
      const blob = data instanceof Blob ? data : new Blob([data as any], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.playbackRate = 1; // speed is applied server-side; keep 1 as safety
      audio.onended = () => {
        setState("idle");
        cleanup();
      };
      audio.onerror = () => {
        toast.error("Lecture audio impossible");
        setState("idle");
        cleanup();
      };
      await audio.play();
      setState("playing");
    } catch (e: any) {
      console.error("TTS error", e);
      toast.error("Impossible de générer l'audio");
      setState("idle");
    }
  }, [state, cleanup]);

  return { state, toggle, stop };
}