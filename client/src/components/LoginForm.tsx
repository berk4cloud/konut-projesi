import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LoginForm() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenant, setTenant] = useState("");

  const handleLogin = () => {
    console.log("Login triggered:", { email, password, tenant });
    setLocation("/dashboard");
  };

  const handleDemoLogin = () => {
    setEmail("admin@cova.nl");
    setPassword("demo123");
    setTenant("cova");
    console.log("Demo login triggered");
    setTimeout(() => setLocation("/dashboard"), 100);
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">APDO HABITAT</h1>
        <p className="text-muted-foreground">Konaklama Yönetim Platformu</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tenant">Firma</Label>
          <Select value={tenant} onValueChange={setTenant}>
            <SelectTrigger id="tenant" data-testid="select-tenant">
              <SelectValue placeholder="Firmanızı seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cova">Cova B.V.</SelectItem>
              <SelectItem value="oneflex">Oneflex B.V.</SelectItem>
              <SelectItem value="covagmbh">Cova GmbH</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@firma.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="input-email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Şifre</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
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
          Giriş Yap
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleDemoLogin}
          data-testid="button-demo-login"
        >
          Demo Giriş (Cova B.V.)
        </Button>
      </div>
    </div>
  );
}
