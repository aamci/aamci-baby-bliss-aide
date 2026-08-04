import { X } from "lucide-react";
import { useSignedVideoUrl } from "@/hooks/useVideoCapsules";
import { useEffect, useRef } from "react";

export default function VideoPlayer({ capsule, onClose }: { capsule: { title: string; storage_path: string | null; external_url: string | null; description: string | null; author: string | null; source_url: string | null }; onClose: () => void }) {
  const { data: signed } = useSignedVideoUrl(capsule.storage_path);
  const src = signed || capsule.external_url;
  const isEmbed = src && /youtube|vimeo|nocookie/.test(src);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Keyboard: Escape closes, focus the close button on open
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col" role="dialog" aria-modal="true" aria-label={`Lecture vidéo : ${capsule.title}`}>
      <div className="flex items-center justify-between p-3 pt-[max(env(safe-area-inset-top),0.75rem)] text-white">
        <h2 className="text-sm font-semibold truncate flex-1 pr-2">{capsule.title}</h2>
        <button ref={closeRef} onClick={onClose} aria-label="Fermer le lecteur vidéo (Échap)" className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><X className="w-5 h-5" aria-hidden="true" /></button>
      </div>
      <div className="flex-1 flex items-center justify-center bg-black">
        {src ? (isEmbed ? (
          <iframe src={src} className="w-full h-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen title={capsule.title} />
        ) : (
          <video src={src} controls autoPlay playsInline className="w-full h-full max-h-full object-contain" aria-label={capsule.title} />
        )) : <p className="text-white/70 text-sm" role="status">Vidéo indisponible</p>}
      </div>
      {(capsule.author || capsule.description) && (
        <div className="p-4 bg-card space-y-1 max-h-[35vh] overflow-y-auto pb-[max(env(safe-area-inset-bottom),1rem)]">
          {capsule.author && <p className="text-xs font-semibold text-primary">{capsule.author}</p>}
          {capsule.description && <p className="text-xs text-muted-foreground">{capsule.description}</p>}
          {capsule.source_url && <a href={capsule.source_url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary underline">Source</a>}
        </div>
      )}
    </div>
  );
}