import { useState } from "react";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenant, setTenant] = useState("");

  const handleLogin = () => {
    console.log("Login triggered:", { email, password, tenant });
  };

  const handleDemoLogin = () => {
    setEmail("admin@cova.nl");
    setPassword("demo123");
    setTenant("cova");
    console.log("Demo login triggered");
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">APDO HABITAT</h1>
        <p className="text-muted-foreground">Housing Management Platform</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tenant">Company</Label>
          <Select value={tenant} onValueChange={setTenant}>
            <SelectTrigger id="tenant" data-testid="select-tenant">
              <SelectValue placeholder="Select your company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cova">Cova B.V.</SelectItem>
              <SelectItem value="oneflex">Oneflex B.V.</SelectItem>
              <SelectItem value="covagmbh">Cova GmbH</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="input-email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
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
          Sign In
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleDemoLogin}
          data-testid="button-demo-login"
        >
          Demo Login (Cova B.V.)
        </Button>
      </div>
    </div>
  );
}
