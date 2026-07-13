import { X } from "lucide-react";
import { useSignedVideoUrl } from "@/hooks/useVideoCapsules";

export default function VideoPlayer({ capsule, onClose }: { capsule: { title: string; storage_path: string | null; external_url: string | null; description: string | null; author: string | null; source_url: string | null }; onClose: () => void }) {
  const { data: signed } = useSignedVideoUrl(capsule.storage_path);
  const src = signed || capsule.external_url;
  const isEmbed = src && /youtube|vimeo|nocookie/.test(src);
  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      <div className="flex items-center justify-between p-3 pt-[max(env(safe-area-inset-top),0.75rem)] text-white">
        <p className="text-sm font-semibold truncate flex-1 pr-2">{capsule.title}</p>
        <button onClick={onClose} aria-label="Fermer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center active:scale-95"><X className="w-5 h-5" /></button>
      </div>
      <div className="flex-1 flex items-center justify-center bg-black">
        {src ? (isEmbed ? (
          <iframe src={src} className="w-full h-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen title={capsule.title} />
        ) : (
          <video src={src} controls autoPlay playsInline className="w-full h-full max-h-full object-contain" />
        )) : <p className="text-white/70 text-sm">Vidéo indisponible</p>}
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