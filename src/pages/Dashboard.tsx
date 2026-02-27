import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { FileText, History, ArrowRight, Scale, Briefcase, Shield, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";

const features = [
  {
    icon: FileText,
    title: "9+ Document Types",
    description: "From employment contracts to NDAs, all major legal documents covered.",
  },
  {
    icon: Shield,
    title: "AI-Powered",
    description: "Gemini AI generates professional, legally formatted documents.",
  },
  {
    icon: Briefcase,
    title: "Ready to Sign",
    description: "No placeholders, no editing. Download and use immediately.",
  },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Welcome back
            </h1>
            <p className="text-muted-foreground">
              {user?.email} — ready to generate your next legal document?
            </p>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <Link
              to="/generate"
              className="group flex items-center gap-4 p-6 rounded-xl bg-card shadow-card border hover:shadow-elevated transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-lg bg-gradient-accent flex items-center justify-center shrink-0">
                <FileText className="h-6 w-6 text-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground group-hover:text-secondary transition-colors">
                  Generate Document
                </h3>
                <p className="text-sm text-muted-foreground">Create a new legal document with AI</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/history"
              className="group flex items-center gap-4 p-6 rounded-xl bg-card shadow-card border hover:shadow-elevated transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-lg bg-gradient-brand flex items-center justify-center shrink-0">
                <History className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground group-hover:text-secondary transition-colors">
                  Document History
                </h3>
                <p className="text-sm text-muted-foreground">View and re-download past documents</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all" />
            </Link>
          </div>

          {/* Features */}
          <h2 className="text-lg font-semibold text-foreground mb-4">What LegalEase does</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (i + 1) }}
                className="p-5 rounded-xl border bg-card"
              >
                <f.icon className="h-8 w-8 text-secondary mb-3" />
                <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
