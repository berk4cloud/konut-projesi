import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import "./i18n"; // Initialize i18next
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/LoginPage";
import HousingDashboard from "@/pages/HousingDashboard";
import Houses from "@/pages/Houses";
import Workers from "@/pages/Workers";
import QRManagement from "@/pages/QRManagement";
import PendingApprovals from "@/pages/PendingApprovals";
import QRPublicPage from "@/pages/QRPublicPage";
import Settings from "@/pages/Settings";
import Assignments from "@/pages/Assignments";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/qr/:code" component={QRPublicPage} />
      <Route path="/dashboard" component={HousingDashboard} />
      <Route path="/houses" component={Houses} />
      <Route path="/workers" component={Workers} />
      <Route path="/assignments" component={Assignments} />
      <Route path="/qr-management" component={QRManagement} />
      <Route path="/pending-approvals" component={PendingApprovals} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
