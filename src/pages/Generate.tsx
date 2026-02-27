import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { documentTypes, validateInput, DocumentType } from "@/lib/document-types";
import { generateAndDownloadDocx } from "@/lib/generate-docx";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, FileText, Download, Copy, Check, ArrowLeft } from "lucide-react";

export default function Generate() {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [copied, setCopied] = useState(false);

  const handleTypeSelect = (typeId: string) => {
    const dt = documentTypes.find((d) => d.id === typeId);
    if (dt) {
      setSelectedType(dt);
      setFormData({});
      setErrors({});
      setGeneratedContent("");
    }
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    if (!selectedType) return false;
    const newErrors: Record<string, string> = {};
    for (const field of selectedType.fields) {
      const value = formData[field.name] || "";
      if (field.type !== "select" && field.type !== "date") {
        const error = validateInput(value);
        if (error) newErrors[field.name] = error;
      } else if (field.required && !value) {
        newErrors[field.name] = "This field is required";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = async () => {
    if (!validateForm() || !selectedType || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-document", {
        body: {
          doc_type: selectedType.name,
          form_data: formData,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const content = data.content;
      setGeneratedContent(content);

      // Save to database
      await supabase.from("documents").insert({
        user_id: user.id,
        doc_type: selectedType.name,
        content,
        form_data: formData,
      });

      toast.success("Document generated successfully!");
    } catch (err: any) {
      console.error("Generation error:", err);
      toast.error(err.message || "Failed to generate document");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedContent || !selectedType) return;
    generateAndDownloadDocx(selectedType.name, generatedContent);
    toast.success("Document downloaded!");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Generate Document
          </h1>
          <p className="text-muted-foreground mb-8">
            Select a document type, fill in the details, and let AI create your legal document.
          </p>

          {/* Step 1: Document type selection */}
          {!selectedType && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documentTypes.map((dt, i) => (
                <motion.button
                  key={dt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleTypeSelect(dt.id)}
                  className="p-5 rounded-xl border bg-card hover:shadow-elevated hover:border-secondary/50 transition-all duration-300 text-left group"
                >
                  <FileText className="h-8 w-8 text-secondary mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-foreground mb-1">{dt.name}</h3>
                  <p className="text-sm text-muted-foreground">{dt.description}</p>
                </motion.button>
              ))}
            </div>
          )}

          {/* Step 2: Form */}
          {selectedType && !generatedContent && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <button
                onClick={() => setSelectedType(null)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back to document types
              </button>

              <div className="bg-card rounded-xl border p-6 shadow-card">
                <h2 className="text-xl font-display font-bold text-foreground mb-1">
                  {selectedType.name}
                </h2>
                <p className="text-sm text-muted-foreground mb-6">{selectedType.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {selectedType.fields.map((field) => (
                    <div
                      key={field.name}
                      className={field.type === "textarea" ? "md:col-span-2" : ""}
                    >
                      <Label className="text-foreground mb-1.5 block">
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </Label>

                      {field.type === "textarea" ? (
                        <Textarea
                          value={formData[field.name] || ""}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          rows={3}
                          className={errors[field.name] ? "border-destructive" : ""}
                        />
                      ) : field.type === "select" ? (
                        <Select
                          value={formData[field.name] || ""}
                          onValueChange={(v) => handleFieldChange(field.name, v)}
                        >
                          <SelectTrigger className={errors[field.name] ? "border-destructive" : ""}>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type={field.type}
                          value={formData[field.name] || ""}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className={errors[field.name] ? "border-destructive" : ""}
                        />
                      )}

                      {errors[field.name] && (
                        <p className="text-xs text-destructive mt-1">{errors[field.name]}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-end">
                  <Button onClick={handleGenerate} size="lg" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Document
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Preview */}
          <AnimatePresence>
            {generatedContent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-display font-bold text-foreground">
                    Generated Document
                  </h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      {copied ? (
                        <Check className="mr-1 h-4 w-4" />
                      ) : (
                        <Copy className="mr-1 h-4 w-4" />
                      )}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                    <Button size="sm" onClick={handleDownload}>
                      <Download className="mr-1 h-4 w-4" />
                      Download .docx
                    </Button>
                  </div>
                </div>

                <div className="bg-card border rounded-xl p-8 shadow-card prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap font-body text-foreground leading-relaxed">
                    {generatedContent}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setGeneratedContent("");
                    }}
                  >
                    Edit Form
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedType(null);
                      setFormData({});
                      setErrors({});
                      setGeneratedContent("");
                    }}
                  >
                    New Document
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
