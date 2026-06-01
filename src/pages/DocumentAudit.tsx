import { ArrowLeft, Eye, Download, Upload, Trash2, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useChildren } from "@/hooks/useChildren";
import PageTransition from "@/components/PageTransition";

type AuditRow = {
  id: string;
  user_id: string;
  action: "view" | "download" | "upload" | "delete";
  file_name: string | null;
  child_id: string;
  created_at: string;
};

const actionMeta: Record<string, { label: string; icon: any; cls: string }> = {
  view: { label: "Consultation", icon: Eye, cls: "bg-medical-light-blue text-primary" },
  download: { label: "Téléchargement", icon: Download, cls: "bg-medical-light-green text-medical-green" },
  upload: { label: "Ajout", icon: Upload, cls: "bg-accent text-accent-foreground" },
  delete: { label: "Suppression", icon: Trash2, cls: "bg-medical-light-red text-medical-red" },
};

const DocumentAudit = () => {
  const navigate = useNavigate();
  const { data: children } = useChildren();
  const [logs, setLogs] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [names, setNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      if (!children?.length) { setLoading(false); return; }
      const ids = children.map((c) => c.id);
      const { data } = await supabase
        .from("document_audit_logs")
        .select("*")
        .in("child_id", ids)
        .order("created_at", { ascending: false })
        .limit(200);
      if (data) setLogs(data as AuditRow[]);

      const userIds = Array.from(new Set((data || []).map((l: any) => l.user_id)));
      if (userIds.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", userIds);
        const map: Record<string, string> = {};
        (profs || []).forEach((p: any) => {
          map[p.id] = `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Utilisateur";
        });
        setNames(map);
      }
      setLoading(false);
    };
    load();
  }, [children]);

  const childName = (id: string) => children?.find((c) => c.id === id)?.first_name || "";

  return (
    <PageTransition>
      <div className="min-h-screen bg-background max-w-lg mx-auto">
        <div className="px-4 pt-6 pb-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center" aria-label="Retour">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Journal d'audit</h1>
            <p className="text-xs text-muted-foreground">Accès aux documents médicaux</p>
          </div>
        </div>

        <div className="px-4 space-y-2 pb-24">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Chargement...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Aucune activité enregistrée</p>
            </div>
          ) : (
            logs.map((log) => {
              const meta = actionMeta[log.action] || actionMeta.view;
              const Icon = meta.icon;
              return (
                <div key={log.id} className="medical-card flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${meta.cls} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {meta.label} · {log.file_name || "Document"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Par {names[log.user_id] || "Utilisateur"} · {childName(log.child_id)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(log.created_at).toLocaleString("fr-FR")}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default DocumentAudit;