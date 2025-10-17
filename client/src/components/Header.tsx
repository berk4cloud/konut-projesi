import { Building2, User, LogOut, Menu, Home, Users, Settings, Moon, Sun, QrCode, Bell, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import NotificationsDialog from "@/components/NotificationsDialog";

type Reminder = {
  id: string;
  type: "maintenance" | "lease_end" | "meter_reading" | "inspection" | "other";
  title: string;
  date: string;
  alertDaysBefore: number;
  note?: string;
  recurring?: "monthly" | "yearly" | "none";
  completed?: boolean;
  completedAt?: string;
  houseName?: string;
};

interface HeaderProps {
  tenantName?: string;
  userName?: string;
  upcomingRemindersCount?: number;
  upcomingReminders?: Reminder[];
  onCompleteReminder?: (reminderId: string) => void;
  onAddNote?: (reminderId: string, note: string) => void;
}

export default function Header({ 
  tenantName = "Cova B.V.", 
  userName = "Admin", 
  upcomingRemindersCount = 0,
  upcomingReminders = [],
  onCompleteReminder,
  onAddNote,
}: HeaderProps) {
  const [location, setLocation] = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { icon: Home, label: "Konaklama Genel Bakış", path: "/dashboard" },
    { icon: Building2, label: "Konutlar", path: "/houses" },
    { icon: Users, label: "Çalışanlar", path: "/workers" },
    { icon: ClipboardList, label: "Konaklama", path: "/assignments" },
    { icon: QrCode, label: "QR Yönetimi", path: "/qr-management" },
    { icon: Settings, label: "Ayarlar", path: "/settings" },
  ];

  // Mock QR submissions (pending approvals)
  const mockQRSubmissions = [
    {
      id: "qs1",
      qrCode: "QR2024ABC1",
      taskType: "worker_registration" as const,
      submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      data: {
        firstName: "Ali",
        lastName: "Yılmaz",
        nationality: "Türkiye",
        phone: "+90 555 123 4567",
        email: "ali.yilmaz@example.com",
        idNumber: "12345678901",
        dateOfBirth: "1990-05-15",
        gender: "male",
      },
    },
    {
      id: "qs2",
      qrCode: "QR2024XYZ2",
      taskType: "meter_reading" as const,
      submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      data: {
        meterType: "electricity" as const,
        meterValue: "15750",
        houseName: "Geldernstrasse 13",
        photo: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=60",
      },
    },
    {
      id: "qs3",
      qrCode: "QR2024DEF3",
      taskType: "document_upload" as const,
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      data: {
        documentType: "Kimlik Belgesi",
        photo: "https://images.unsplash.com/photo-1554224311-beee2c256099?w=800&auto=format&fit=crop&q=60",
      },
    },
    {
      id: "qs4",
      qrCode: "QR2024GHI4",
      taskType: "worker_registration" as const,
      submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      data: {
        firstName: "Maria",
        lastName: "Kowalski",
        nationality: "Polonya",
        phone: "+48 601 234 567",
        email: "maria.k@example.com",
        idNumber: "POL987654321",
        dateOfBirth: "1988-12-10",
        gender: "female",
      },
    },
    {
      id: "qs5",
      qrCode: "QR2024JKL5",
      taskType: "meter_reading" as const,
      submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      data: {
        meterType: "gas" as const,
        meterValue: "2850",
        houseName: "Hauptstrasse 45",
        photo: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=60",
      },
    },
  ];
  
  const pendingApprovalsCount = mockQRSubmissions.length;
  
  // Total notifications (QR approvals + upcoming reminders)
  const totalNotifications = pendingApprovalsCount + upcomingRemindersCount;

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

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotificationsOpen(true)}
            className="relative"
            data-testid="button-notifications"
          >
            <Bell className="w-5 h-5" />
            {totalNotifications > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
                data-testid="badge-notification-count"
              >
                {totalNotifications}
              </Badge>
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

      <NotificationsDialog
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
        pendingApprovalsCount={pendingApprovalsCount}
        pendingApprovals={mockQRSubmissions}
        upcomingReminders={upcomingReminders}
        onCompleteReminder={onCompleteReminder || (() => {})}
        onAddNote={onAddNote || (() => {})}
        onApproveSubmission={(id) => console.log("Approve:", id)}
        onRejectSubmission={(id) => console.log("Reject:", id)}
      />
    </header>
  );
}
