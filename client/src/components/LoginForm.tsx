import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type TenantOption = {
  tenant: {
    id: string;
    name: string;
    slug: string;
    type: string;
  };
  roles: string[];
};

export default function LoginForm() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Multi-tenant/role selection state
  const [showTenantSelector, setShowTenantSelector] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [tenantOptions, setTenantOptions] = useState<TenantOption[]>([]);
  const [roleOptions, setRoleOptions] = useState<string[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<TenantOption | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

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
        // Multi-tenant user - show tenant selector
        setTenantOptions(data.tenants);
        setUserInfo(data.user);
        setShowTenantSelector(true);
      } else if (data.type === "select_role") {
        // Multi-role user - show role selector
        setRoleOptions(data.roles);
        setSelectedTenant({
          tenant: data.tenant,
          roles: data.roles,
        });
        setUserInfo(data.user);
        setShowRoleSelector(true);
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

  const handleTenantSelect = async (option: TenantOption) => {
    // If single role, login directly
    if (option.roles.length === 1) {
      try {
        const response = await fetch("/api/login/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userInfo.email,
            tenantId: option.tenant.id,
            role: option.roles[0],
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Token oluşturulamadı");
        }

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
        setShowTenantSelector(false);
        setLocation("/dashboard");
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: error instanceof Error ? error.message : "Token oluşturulamadı",
        });
      }
    } else {
      // Multiple roles - show role selector
      setSelectedTenant(option);
      setRoleOptions(option.roles);
      setShowTenantSelector(false);
      setShowRoleSelector(true);
    }
  };

  const handleRoleSelect = async (role: string) => {
    if (!selectedTenant || !userInfo) return;
    
    try {
      const response = await fetch("/api/login/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userInfo.email,
          tenantId: selectedTenant.tenant.id,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Token oluşturulamadı");
      }

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
      setShowRoleSelector(false);
      setLocation("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error instanceof Error ? error.message : "Token oluşturulamadı",
      });
    }
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
          Demo Arpdo Konut Yönetimi
        </Button>
      </form>

      {/* Tenant Selector Dialog */}
      <Dialog open={showTenantSelector} onOpenChange={setShowTenantSelector}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tenant Seçin</DialogTitle>
            <DialogDescription>
              Birden fazla tenant'a erişiminiz var. Devam etmek için bir tenant seçin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {tenantOptions.map((option) => (
              <Button
                key={option.tenant.id}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => handleTenantSelect(option)}
                data-testid={`select-tenant-${option.tenant.slug}`}
              >
                <div className="flex-1">
                  <div className="font-medium">{option.tenant.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {option.roles.map((role) => (
                      <Badge key={role} variant="secondary" className="mr-1">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Role Selector Dialog */}
      <Dialog open={showRoleSelector} onOpenChange={setShowRoleSelector}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rol Seçin</DialogTitle>
            <DialogDescription>
              {selectedTenant?.tenant.name} için bir rol seçin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {roleOptions.map((role) => (
              <Button
                key={role}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleRoleSelect(role)}
                data-testid={`select-role-${role}`}
              >
                {role}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
