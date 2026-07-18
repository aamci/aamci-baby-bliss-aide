import { Volume2, Pause, Play, Loader2, Square } from "lucide-react";
import { useTTS } from "@/hooks/useTTS";
import { cn } from "@/lib/utils";

interface ListenButtonProps {
  text: string;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}

const ListenButton = ({ text, label = "Écouter", className, size = "md" }: ListenButtonProps) => {
  const { state, toggle, stop } = useTTS();
  const busy = state === "loading";
  const playing = state === "playing";
  const paused = state === "paused";

  const Icon = busy ? Loader2 : playing ? Pause : paused ? Play : Volume2;

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <button
        type="button"
        onClick={() => toggle(text)}
        disabled={busy || !text?.trim()}
        aria-label={playing ? "Mettre en pause la lecture" : paused ? "Reprendre la lecture" : "Lire à voix haute"}
        aria-pressed={playing || paused}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-11",
          size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
          playing || paused
            ? "bg-primary text-primary-foreground"
            : "bg-accent text-accent-foreground hover:bg-accent/80",
        )}
      >
        <Icon className={cn("shrink-0", size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4", busy && "animate-spin")} aria-hidden="true" />
        <span>{busy ? "Chargement…" : playing ? "Pause" : paused ? "Reprendre" : label}</span>
      </button>
      {(playing || paused) && (
        <button
          type="button"
          onClick={stop}
          aria-label="Arrêter la lecture"
          className="inline-flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 min-h-11 min-w-11"
        >
          <Square className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default ListenButton;