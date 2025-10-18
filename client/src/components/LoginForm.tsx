import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

export default function LoginForm() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Email ve şifre gerekli",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Giriş başarısız");
      }

      // Handle different response types
      if (data.type === "redirect") {
        // Single tenant + single role - direct login
        const userData = {
          id: data.user.id,
          email: data.user.email,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          tenantId: data.tenant.id,
          tenantName: data.tenant.name,
          tenantSlug: data.tenant.slug,
          role: data.role,
        };
        
        login(userData, data.token);
        setLocation("/dashboard");
      } else if (data.type === "select_tenant") {
        // Multi-tenant user - show tenant selector (TODO: implement)
        toast({
          title: "Çoklu Tenant",
          description: "Tenant seçim ekranı yakında gelecek",
        });
      } else if (data.type === "select_role") {
        // Multi-role user - show role selector (TODO: implement)
        toast({
          title: "Çoklu Rol",
          description: "Rol seçim ekranı yakında gelecek",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Giriş Hatası",
        description: error instanceof Error ? error.message : "Bir hata oluştu",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail("jan@cova.nl");
    setPassword("CovaPass123");
    setTimeout(() => handleLogin(), 100);
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('auth.appTitle')}</h1>
        <p className="text-muted-foreground">{t('auth.appSubtitle')}</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            data-testid="input-email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t('auth.password')}</Label>
          <Input
            id="password"
            type="password"
            placeholder={t('auth.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            data-testid="input-password"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
          data-testid="button-login"
        >
          {isLoading ? "Giriş yapılıyor..." : t('auth.login')}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleDemoLogin}
          disabled={isLoading}
          data-testid="button-demo-login"
        >
          {t('auth.demoLogin')}
        </Button>
      </form>
    </div>
  );
}
