import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

export default function LoginForm() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenant] = useState("cova"); // Fixed tenant for ARPDO HABITAT

  const handleLogin = () => {
    console.log("Login triggered:", { email, password, tenant });
    
    // Mock user data for demo - in production this would come from API
    const mockUser = {
      id: "user-1",
      tenantId: tenant || "cova",
      email: email,
      password: "", // Never store in context
      name: "Admin User",
      role: "tenant_admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    login(mockUser);
    setLocation("/dashboard");
  };

  const handleDemoLogin = () => {
    setEmail("admin@cova.nl");
    setPassword("demo123");
    console.log("Demo login triggered");
    
    // Mock demo user
    const demoUser = {
      id: "demo-user-1",
      tenantId: "cova",
      email: "admin@cova.nl",
      password: "",
      name: "Admin Demo",
      role: "tenant_admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    login(demoUser);
    setTimeout(() => setLocation("/dashboard"), 100);
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('auth.appTitle')}</h1>
        <p className="text-muted-foreground">{t('auth.appSubtitle')}</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            data-testid="input-password"
          />
        </div>

        <Button
          className="w-full"
          onClick={handleLogin}
          data-testid="button-login"
        >
          {t('auth.login')}
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleDemoLogin}
          data-testid="button-demo-login"
        >
          {t('auth.demoLogin')}
        </Button>
      </div>
    </div>
  );
}
