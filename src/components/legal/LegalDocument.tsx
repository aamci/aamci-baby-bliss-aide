import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import PageTransition from "@/components/PageTransition";
import ListenButton from "@/components/ListenButton";

type Props = {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  markdown?: string;
  listenText?: string;
};

const LegalDocument = ({ title, subtitle, children, markdown, listenText }: Props) => {
  const navigate = useNavigate();
  const spoken = (listenText ?? markdown ?? "").replace(/[#*_>`\-]+/g, " ").replace(/\s+/g, " ").trim();
  return (
    <PageTransition>
      <div className="min-h-[100dvh] bg-background max-w-3xl mx-auto flex flex-col">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 pt-[max(env(safe-area-inset-top),0.75rem)] pb-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0"
            aria-label="Retour"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-bold text-foreground truncate">{title}</h1>
            {subtitle && <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>}
          </div>
          {spoken && <ListenButton text={spoken} size="sm" label="Écouter" />}
        </header>
        <main className="flex-1 px-4 py-5 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
          <article className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-headings:font-bold prose-h1:text-xl prose-h2:text-base prose-h2:mt-6 prose-h3:text-sm prose-h3:mt-4 prose-p:text-[13px] prose-p:leading-relaxed prose-li:text-[13px] prose-strong:text-foreground prose-a:text-primary prose-hr:border-border">
            {markdown ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
            ) : (
              children
            )}
          </article>
        </main>
      </div>
    </PageTransition>
  );
};

export default LegalDocument;