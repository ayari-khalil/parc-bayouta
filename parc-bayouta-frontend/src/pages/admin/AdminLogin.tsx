import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const success = await login(username, password);
    
    if (success) {
      toast({ title: "Connexion réussie", description: "Bienvenue dans l'administration." });
      navigate("/admin");
    } else {
      toast({ title: "Erreur", description: "Identifiants incorrects.", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-2xl shadow-card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary mx-auto flex items-center justify-center mb-4">
              <span className="text-primary-foreground font-display font-bold text-2xl">B</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">Administration</h1>
            <p className="text-muted-foreground">Parc Bayouta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Nom d'utilisateur</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  required
                  className="w-full pl-10 p-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Mot de passe</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  required
                  className="w-full pl-10 p-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
          
          <p className="text-xs text-muted-foreground text-center mt-6">
            Demo: admin / admin123
          </p>
        </div>
      </motion.div>
    </div>
  );
}
