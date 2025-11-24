import { Building2, User, LogOut, Menu, Home, Users, Settings, Moon, Sun, QrCode, Bell, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
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
import { useAuth } from "@/contexts/AuthContext";
import NotificationsDialog from "@/components/NotificationsDialog";
import LanguageSelector from "@/components/LanguageSelector";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { GuestRegistrationRequest } from "@/mocks/data/types";

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
  const { t } = useTranslation();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { logout, user } = useAuth();

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

  const menuItems = [
    { icon: Home, label: t('nav.housingOverview'), path: "/dashboard" },
    { icon: Building2, label: t('nav.houses'), path: "/houses" },
    { icon: Users, label: t('nav.workers'), path: "/workers" },
    // Konaklama menüsü geçici olarak gizlendi - geri açmak için aşağıdaki satırın yorumunu kaldırın ve filter'ı kaldırın
    // { icon: ClipboardList, label: t('nav.accommodation'), path: "/assignments" },
    { icon: QrCode, label: t('nav.qrManagement'), path: "/qr-management" },
    { icon: Settings, label: t('nav.settings'), path: "/settings" },
  ].filter(item => item.path !== "/assignments"); // Konaklama menüsünü filtrele - geri açmak için bu satırı kaldırın

  const pendingRequestsQueryKey = user?.tenantId
    ? [`/api/guest-registration-requests/pending?tenantId=${user.tenantId}`]
    : ['/api/guest-registration-requests/pending'];

  const { data: pendingGuestRequests = [] } = useQuery<GuestRegistrationRequest[]>({
    queryKey: pendingRequestsQueryKey,
    enabled: !!user?.tenantId,
  });

  const approveRequestMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('POST', `/api/guest-registration-requests/${id}/approve`);
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to approve request');
      }
      return payload;
    },
    onSuccess: () => {
      toast({
        title: t("notifications.requestApprovedTitle") || "Approved",
        description: t("notifications.requestApprovedMessage") || "Guest registration approved.",
      });
      queryClient.invalidateQueries({ queryKey: pendingRequestsQueryKey });
    },
    onError: (error: any) => {
      toast({
        title: t("notifications.requestActionError") || "Error",
        description: error?.message || t("notifications.genericError"),
        variant: "destructive",
      });
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('POST', `/api/guest-registration-requests/${id}/reject`);
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to reject request');
      }
      return payload;
    },
    onSuccess: () => {
      toast({
        title: t("notifications.requestRejectedTitle") || "Rejected",
        description: t("notifications.requestRejectedMessage") || "Guest registration rejected.",
      });
      queryClient.invalidateQueries({ queryKey: pendingRequestsQueryKey });
    },
    onError: (error: any) => {
      toast({
        title: t("notifications.requestActionError") || "Error",
        description: error?.message || t("notifications.genericError"),
        variant: "destructive",
      });
    },
  });
  
  const pendingApprovalsCount = pendingGuestRequests.length;
  
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
                  ARPDO HABITAT
                </SheetTitle>
                <SheetDescription>
                  {t('nav.navigationMenu')}
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
            <h1 className="text-xl font-bold">ARPDO HABITAT</h1>
          </div>
          <div className="h-6 w-px bg-border" />
          <span className="text-sm text-muted-foreground" data-testid="text-tenant-name">
            {tenantName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSelector />
          
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
                {t("nav.profile")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                <LogOut className="w-4 h-4 mr-2" />
                {t("nav.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <NotificationsDialog
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
        pendingApprovalsCount={pendingApprovalsCount}
        pendingApprovals={pendingGuestRequests}
        upcomingReminders={upcomingReminders}
        onCompleteReminder={onCompleteReminder || (() => {})}
        onAddNote={onAddNote || (() => {})}
        onApproveSubmission={(id) => approveRequestMutation.mutate(id)}
        onRejectSubmission={(id) => rejectRequestMutation.mutate(id)}
      />
    </header>
  );
}
