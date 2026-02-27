import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { generateAndDownloadDocx } from "@/lib/generate-docx";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Download, FileText, Loader2, Clock } from "lucide-react";
import { format } from "date-fns";

interface Doc {
  id: string;
  doc_type: string;
  content: string;
  created_at: string;
}

export default function DocumentHistory() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("id, doc_type, content, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load history");
      } else {
        setDocs((data as Doc[]) || []);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleDownload = (doc: Doc) => {
    generateAndDownloadDocx(doc.doc_type, doc.content);
    toast.success("Document downloaded!");
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Document History
          </h1>
          <p className="text-muted-foreground mb-8">
            View and re-download your previously generated documents.
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : docs.length === 0 ? (
            <div className="text-center py-20">
              <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-1">No documents yet</h3>
              <p className="text-muted-foreground">Generated documents will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {docs.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-5 rounded-xl border bg-card hover:shadow-card transition-shadow"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-secondary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{doc.doc_type}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(doc.created_at), "dd MMM yyyy, hh:mm a")}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                    <Download className="mr-1 h-4 w-4" />
                    Download
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
