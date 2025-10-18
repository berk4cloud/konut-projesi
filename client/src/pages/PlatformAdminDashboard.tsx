import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, Shield, Settings, Database, BarChart } from "lucide-react";

export default function PlatformAdminDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLocation("/");
    }
  }, [isAuthenticated, user, setLocation]);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logout();
      setLocation("/");
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Platform Admin Panel</h1>
            <p className="text-sm text-muted-foreground">
              Hoş geldiniz, {user.firstName} {user.lastName}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
            Çıkış Yap
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Tenants Card */}
          <Card className="hover-elevate cursor-pointer" data-testid="card-tenants">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Tenant Yönetimi
              </CardTitle>
              <CardDescription>
                Tüm kiracıları görüntüle ve yönet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" data-testid="button-manage-tenants">
                Tenantları Yönet
              </Button>
            </CardContent>
          </Card>

          {/* Users Card */}
          <Card className="hover-elevate cursor-pointer" data-testid="card-users">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Kullanıcı Yönetimi
              </CardTitle>
              <CardDescription>
                Platform kullanıcılarını yönet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" data-testid="button-manage-users">
                Kullanıcıları Yönet
              </Button>
            </CardContent>
          </Card>

          {/* Platform Admins Card */}
          <Card className="hover-elevate cursor-pointer" data-testid="card-admins">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Admin Yönetimi
              </CardTitle>
              <CardDescription>
                Platform adminlerini yönet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" data-testid="button-manage-admins">
                Adminleri Yönet
              </Button>
            </CardContent>
          </Card>

          {/* Analytics Card */}
          <Card className="hover-elevate cursor-pointer" data-testid="card-analytics">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-5 h-5" />
                Analitik ve Raporlar
              </CardTitle>
              <CardDescription>
                Platform kullanım istatistikleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" data-testid="button-view-analytics">
                Raporları Görüntüle
              </Button>
            </CardContent>
          </Card>

          {/* Database Card */}
          <Card className="hover-elevate cursor-pointer" data-testid="card-database">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Veritabanı Yönetimi
              </CardTitle>
              <CardDescription>
                Veritabanı bakım ve yönetim
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" data-testid="button-manage-database">
                Veritabanı Ayarları
              </Button>
            </CardContent>
          </Card>

          {/* Settings Card */}
          <Card className="hover-elevate cursor-pointer" data-testid="card-settings">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Platform Ayarları
              </CardTitle>
              <CardDescription>
                Genel platform ayarları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" data-testid="button-platform-settings">
                Ayarları Değiştir
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Admin Info */}
        <Card className="mt-8" data-testid="card-admin-info">
          <CardHeader>
            <CardTitle>Admin Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium" data-testid="text-admin-email">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">İsim:</span>
              <span className="font-medium" data-testid="text-admin-name">
                {user.firstName} {user.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rol:</span>
              <span className="font-medium" data-testid="text-admin-role">{user.role}</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
