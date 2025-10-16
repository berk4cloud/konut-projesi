import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function LoginForm() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter email and password",
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid credentials",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail("admin@cova.nl");
    setPassword("demo123");
    setIsLoading(true);
    try {
      await login("admin@cova.nl", "demo123");
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid credentials",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">APDO HABITAT</h1>
        <p className="text-muted-foreground">Housing Management Platform</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@cova.nl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            disabled={isLoading}
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
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            disabled={isLoading}
            data-testid="input-password"
          />
        </div>

        <Button
          className="w-full"
          onClick={handleLogin}
          disabled={isLoading}
          data-testid="button-login"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleDemoLogin}
          disabled={isLoading}
          data-testid="button-demo-login"
        >
          Demo Login (Cova B.V.)
        </Button>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>Demo Credentials:</p>
          <p>admin@cova.nl / demo123</p>
          <p>admin@oneflex.nl / demo123</p>
          <p>admin@covagmbh.de / demo123</p>
        </div>
      </div>
    </div>
  );
}
