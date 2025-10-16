import { Building2, User, LogOut, Menu, Home, Users, Settings, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLocation } from "wouter";
import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

interface HeaderProps {
  tenantName?: string;
  userName?: string;
}

export default function Header({ tenantName = "Cova B.V.", userName = "Admin" }: HeaderProps) {
  const [location, setLocation] = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { icon: Home, label: "Konaklama Genel Bakış", path: "/dashboard" },
    { icon: Building2, label: "Konutlar", path: "/houses" },
    { icon: Users, label: "Çalışanlar", path: "/workers" },
    { icon: Settings, label: "Ayarlar", path: "/settings" },
  ];

  const handleNavigation = (path: string) => {
    setLocation(path);
    setSheetOpen(false);
  };

  return (
    <header className="h-16 border-b bg-background sticky top-0 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-menu">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  APDO HABITAT
                </SheetTitle>
                <SheetDescription>
                  Navigasyon Menüsü
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  return (
                    <Button
                      key={item.path}
                      variant={isActive ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleNavigation(item.path)}
                      data-testid={`nav-${item.path}`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">APDO HABITAT</h1>
          </div>
          <div className="h-6 w-px bg-border" />
          <span className="text-sm text-muted-foreground" data-testid="text-tenant-name">
            {tenantName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-user-menu">
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{userName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => console.log("Profile clicked")}>
                <User className="w-4 h-4 mr-2" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log("Logout clicked")}>
                <LogOut className="w-4 h-4 mr-2" />
                Çıkış Yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
