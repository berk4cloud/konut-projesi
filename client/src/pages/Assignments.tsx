import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import type { AssignmentWithDetails, ChargeWithWorker, PaymentWithWorker, AssignmentNote, InsertAssignmentNote } from "@shared/schema";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  UserCheck,
  Home,
  CreditCard,
  Plus
} from "lucide-react";

// Local types for Assignment Management System
type AssignmentStatus = "active" | "ending_soon" | "ended";
type DepositStatus = "pending" | "collected" | "refunded" | "partially_refunded";
type PaymentStatus = "pending" | "partial" | "paid" | "overdue";
type PaymentMethod = "cash" | "bank_transfer" | "pos" | "other";

export default function Assignments() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Normalize i18n language code to browser locale format
  const getLocale = () => {
    const lang = i18n.language;
    const localeMap: Record<string, string> = {
      'en': 'en-US',
      'tr': 'tr-TR',
      'de': 'de-DE',
      'nl': 'nl-NL',
      'fr': 'fr-FR',
      'pl': 'pl-PL',
      'bg': 'bg-BG'
    };
    return localeMap[lang] || 'en-US';
  };
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [chargesFilter, setChargesFilter] = useState<string>("all");
  
  // Fetch assignments, charges, and payments from API
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery<AssignmentWithDetails[]>({
    queryKey: ["/api/tenants", user?.tenantId, "assignments"],
    enabled: !!user?.tenantId,
  });
  
  const { data: charges = [], isLoading: chargesLoading } = useQuery<ChargeWithWorker[]>({
    queryKey: ["/api/tenants", user?.tenantId, "charges"],
    enabled: !!user?.tenantId,
  });
  
  const { data: payments = [], isLoading: paymentsLoading } = useQuery<PaymentWithWorker[]>({
    queryKey: ["/api/tenants", user?.tenantId, "payments"],
    enabled: !!user?.tenantId,
  });
  
  // Mutations
  const createPaymentMutation = useMutation({
    mutationFn: (payment: any) =>
      apiRequest("POST", `/api/tenants/${user?.tenantId}/payments`, payment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenants", user?.tenantId, "payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tenants", user?.tenantId, "charges"] });
    },
  });

  const updateChargeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest("PATCH", `/api/charges/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenants", user?.tenantId, "charges"] });
    },
  });

  const updateAssignmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest("PATCH", `/api/assignments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenants", user?.tenantId, "assignments"] });
    },
  });

  // Assignment Detail Dialog State
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentWithDetails | null>(null);
  const [newNote, setNewNote] = useState({
    note: "",
    createdBy: "",
  });

  // Fetch assignment notes for selected assignment
  const { data: assignmentNotes = [] } = useQuery<AssignmentNote[]>({
    queryKey: ["/api/tenants", user?.tenantId, "assignments", selectedAssignment?.id, "notes"],
    enabled: !!selectedAssignment?.id && !!user?.tenantId,
  });

  const createNoteMutation = useMutation({
    mutationFn: (note: InsertAssignmentNote) =>
      apiRequest("POST", `/api/tenants/${user?.tenantId}/assignments/${selectedAssignment?.id}/notes`, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenants", user?.tenantId, "assignments", selectedAssignment?.id, "notes"] });
    },
  });
  
  // Payment Filter State
  const [paymentDateFilter, setPaymentDateFilter] = useState({
    startDate: "",
    endDate: "",
  });
  const [expandedWorkers, setExpandedWorkers] = useState<Set<string>>(new Set());
  
  // Payment Dialog State
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState<ChargeWithWorker | null>(null);
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: "cash" as PaymentMethod,
    collectorName: "Admin",
    notes: "",
  });

  // Open assignment detail dialog
  const handleOpenDetailDialog = (assignment: AssignmentWithDetails) => {
    setSelectedAssignment(assignment);
    setDetailDialogOpen(true);
  };

  // Save conversation note
  const handleSaveNote = () => {
    if (!selectedAssignment || !newNote.note.trim() || !newNote.createdBy.trim() || !user?.tenantId) {
      toast({
        title: t('assignments.toasts.error'),
        description: t('assignments.paymentDialog.errors.missingFields'),
        variant: "destructive",
      });
      return;
    }

    createNoteMutation.mutate({
      tenantId: user.tenantId,
      assignmentId: selectedAssignment.id,
      note: newNote.note.trim(),
      createdBy: newNote.createdBy.trim(),
    }, {
      onSuccess: () => {
        toast({
          title: t('assignments.toasts.success'),
          description: t('assignments.paymentDialog.successDesc'),
        });
        setNewNote({ note: "", createdBy: "" });
      },
      onError: () => {
        toast({
          title: t('assignments.toasts.error'),
          description: "Failed to create note",
          variant: "destructive",
        });
      }
    });
  };

  // Open payment dialog for a specific charge
  const handleOpenPaymentDialog = (charge: ChargeWithWorker) => {
    setSelectedCharge(charge);
    setNewPayment({
      amount: charge.remainingAmount, // Default to remaining amount
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: "cash",
      collectorName: "Admin",
      notes: "",
    });
    setPaymentDialogOpen(true);
  };

  // Save payment
  const handleSavePayment = () => {
    if (!selectedCharge || !user?.tenantId) return;
    
    // Validation
    if (newPayment.amount <= 0) {
      toast({
        title: t('assignments.toasts.error'),
        description: t('assignments.paymentDialog.errors.invalidAmount'),
        variant: "destructive",
      });
      return;
    }
    
    if (newPayment.amount > selectedCharge.remainingAmount) {
      toast({
        title: t('assignments.toasts.error'),
        description: t('assignments.paymentDialog.errors.exceedsRemaining', { remaining: selectedCharge.remainingAmount }),
        variant: "destructive",
      });
      return;
    }
    
    if (!newPayment.collectorName.trim()) {
      toast({
        title: t('assignments.toasts.error'),
        description: t('assignments.paymentDialog.errors.missingFields'),
        variant: "destructive",
      });
      return;
    }

    // Create payment
    createPaymentMutation.mutate({
      tenantId: user.tenantId,
      chargeId: selectedCharge.id,
      amount: newPayment.amount,
      paymentDate: newPayment.paymentDate,
      paymentMethod: newPayment.paymentMethod,
      collectorName: newPayment.collectorName,
      notes: newPayment.notes || undefined,
    }, {
      onSuccess: () => {
        // Calculate new remaining amount
        const newRemainingAmount = selectedCharge.remainingAmount - newPayment.amount;
        
        // Determine new status
        let newStatus: PaymentStatus = "pending";
        if (newRemainingAmount === 0) {
          newStatus = "paid";
        } else if (newRemainingAmount < selectedCharge.amount) {
          newStatus = "partial";
        }
        
        // Update charge
        updateChargeMutation.mutate({
          id: selectedCharge.id,
          data: {
            remainingAmount: newRemainingAmount,
            status: newStatus,
          },
        });

        toast({
          title: t('assignments.paymentDialog.success'),
          description: t('assignments.paymentDialog.successDesc'),
        });
        
        // Close dialog and reset
        setPaymentDialogOpen(false);
        setSelectedCharge(null);
        setNewPayment({
          amount: 0,
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod: "cash",
          collectorName: "Admin",
          notes: "",
        });
      },
      onError: () => {
        toast({
          title: t('assignments.toasts.error'),
          description: "Failed to create payment",
          variant: "destructive",
        });
      },
    });
  };

  // Filter assignments based on search and status
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = searchQuery === "" || 
      assignment.workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.houseName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || assignment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Filter charges based on search and due date
  const filteredCharges = charges.filter(charge => {
    const matchesSearch = searchQuery === "" || 
      charge.workerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Date-based filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(charge.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    // Calculate days overdue
    const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (chargesFilter) {
      case "all":
        return charge.status !== "paid"; // Exclude paid charges from "All" filter
      case "today":
        return dueDate.getTime() === today.getTime() && charge.status !== "paid";
      case "upcoming":
        return dueDate <= threeDaysFromNow && dueDate >= today && charge.status !== "paid";
      case "overdue":
        return dueDate < today && charge.status !== "paid";
      case "overdue7":
        return daysDiff >= 7 && daysDiff < 14 && charge.status !== "paid";
      case "overdue14":
        return daysDiff >= 14 && daysDiff < 30 && charge.status !== "paid";
      case "overdue30":
        return daysDiff >= 30 && daysDiff < 90 && charge.status !== "paid";
      case "overdue30plus":
        return daysDiff >= 90 && charge.status !== "paid";
      default:
        return charge.status !== "paid";
    }
  });

  // Filter payments based on search and date range
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = searchQuery === "" || 
      payment.workerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Date range filtering
    if (paymentDateFilter.startDate || paymentDateFilter.endDate) {
      const paymentDate = new Date(payment.paymentDate);
      paymentDate.setHours(0, 0, 0, 0);
      
      if (paymentDateFilter.startDate) {
        const startDate = new Date(paymentDateFilter.startDate);
        startDate.setHours(0, 0, 0, 0);
        if (paymentDate < startDate) return false;
      }
      
      if (paymentDateFilter.endDate) {
        const endDate = new Date(paymentDateFilter.endDate);
        endDate.setHours(23, 59, 59, 999);
        if (paymentDate > endDate) return false;
      }
    }
    
    return true;
  });
  
  // Group payments by worker name and sort by date (newest first)
  const groupedPayments: Record<string, PaymentWithWorker[]> = {};
  filteredPayments.forEach(payment => {
    if (!groupedPayments[payment.workerName]) {
      groupedPayments[payment.workerName] = [];
    }
    groupedPayments[payment.workerName].push(payment);
  });
  
  // Sort each worker's payments by date (newest first)
  Object.keys(groupedPayments).forEach(workerName => {
    groupedPayments[workerName].sort((a, b) => 
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    );
  });
  
  // Toggle worker expansion
  const toggleWorkerExpansion = (workerName: string) => {
    setExpandedWorkers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(workerName)) {
        newSet.delete(workerName);
      } else {
        newSet.add(workerName);
      }
      return newSet;
    });
  };

  // Statistics
  const activeAssignments = assignments.filter(a => a.status === "active").length;
  const pendingDeposits = assignments.filter(a => !a.depositCollected).length;
  const overdueCharges = charges.filter(c => c.status === "overdue").length;
  const totalPendingAmount = charges
    .filter(c => c.status === "pending" || c.status === "overdue")
    .reduce((sum, c) => sum + c.amount, 0);
  
  // New Enhanced Statistics
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Upcoming Due Dates (Yaklaşan Vadeler)
  const dueTodayCount = charges.filter(c => {
    const dueDate = new Date(c.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime() && c.status !== "paid";
  }).length;
  
  const dueNext3DaysCount = charges.filter(c => {
    const dueDate = new Date(c.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    return dueDate > today && dueDate <= threeDaysFromNow && c.status !== "paid";
  }).length;
  
  const dueNext7DaysCount = charges.filter(c => {
    const dueDate = new Date(c.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    return dueDate > threeDaysFromNow && dueDate <= sevenDaysFromNow && c.status !== "paid";
  }).length;
  
  // Detailed Overdue Levels (Gecikmiş Ödemeler Detaylı)
  const overdue1to7Days = charges.filter(c => {
    const dueDate = new Date(c.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff >= 1 && daysDiff <= 7 && c.status !== "paid";
  }).length;
  
  const overdue8to14Days = charges.filter(c => {
    const dueDate = new Date(c.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff >= 8 && daysDiff <= 14 && c.status !== "paid";
  }).length;
  
  const overdue15to30Days = charges.filter(c => {
    const dueDate = new Date(c.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff >= 15 && daysDiff <= 30 && c.status !== "paid";
  }).length;
  
  const overdue30PlusDays = charges.filter(c => {
    const dueDate = new Date(c.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff > 30 && c.status !== "paid";
  }).length;
  
  // Deposits to Refund (İade Edilecek Depozitolar) - assignments ending in 7 days
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  
  const depositsToRefund = assignments.filter(a => {
    if (!a.endDate || !a.depositCollected) return false;
    const endDate = new Date(a.endDate);
    endDate.setHours(0, 0, 0, 0);
    return endDate <= sevenDaysFromNow && endDate >= today && a.depositStatus === "collected";
  });
  
  const depositsToRefundCount = depositsToRefund.length;
  const depositsToRefundAmount = depositsToRefund.reduce((sum, a) => sum + (a.depositAmount || 0), 0);

  // Helper functions
  const getStatusColor = (status: AssignmentStatus) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "ending_soon": return "bg-amber-500";
      case "ended": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: AssignmentStatus) => {
    switch (status) {
      case "active": return t('assignments.status.active');
      case "ending_soon": return t('assignments.status.endingSoon');
      case "ended": return t('assignments.status.ended');
      default: return status;
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "paid": return "default";
      case "pending": return "secondary";
      case "overdue": return "destructive";
      case "partial": return "outline";
      default: return "secondary";
    }
  };

  const getPaymentStatusLabel = (status: PaymentStatus) => {
    switch (status) {
      case "paid": return t('assignments.paymentStatus.paid');
      case "pending": return t('assignments.paymentStatus.pending');
      case "overdue": return t('assignments.paymentStatus.overdue');
      case "partial": return t('assignments.paymentStatus.partial');
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        tenantName="Cova B.V." 
        userName="Admin"
        upcomingRemindersCount={0}
        upcomingReminders={[]}
        onCompleteReminder={() => {}}
        onAddNote={() => {}}
      />

      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t('assignments.pageTitle')}</h2>
              <p className="text-muted-foreground">{t('assignments.pageSubtitle')}</p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('assignments.cards.activeAssignments')}</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeAssignments}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('assignments.cards.activeAssignmentsDesc')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('assignments.cards.pendingDeposits')}</CardTitle>
                <AlertCircle className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingDeposits}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('assignments.cards.pendingDepositsDesc')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('assignments.cards.overduePayments')}</CardTitle>
                <Clock className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overdueCharges}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('assignments.cards.overduePaymentsDesc')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('assignments.cards.pendingAmount')}</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{totalPendingAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('assignments.cards.pendingAmountDesc')}</p>
              </CardContent>
            </Card>

            {/* New Enhanced Statistics Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('assignments.cards.upcomingDueDates')}</CardTitle>
                <Calendar className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('assignments.cards.dueToday')}</span>
                    <span className="font-bold text-lg">{dueTodayCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{t('assignments.cards.next3Days')}</span>
                    <span className="font-medium">{dueNext3DaysCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{t('assignments.cards.next7Days')}</span>
                    <span className="font-medium">{dueNext7DaysCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('assignments.cards.overdueBreakdown')}</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                      {t('assignments.cards.overdue1to7')}
                    </span>
                    <span className="font-medium">{overdue1to7Days}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      {t('assignments.cards.overdue8to14')}
                    </span>
                    <span className="font-medium">{overdue8to14Days}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      {t('assignments.cards.overdue15to30')}
                    </span>
                    <span className="font-medium">{overdue15to30Days}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-black dark:bg-white"></span>
                      {t('assignments.cards.overdue30Plus')}
                    </span>
                    <span className="font-medium">{overdue30PlusDays}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('assignments.cards.depositsToRefund')}</CardTitle>
                <Home className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{depositsToRefundCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  €{depositsToRefundAmount.toLocaleString()} {t('assignments.cards.toBeRefunded')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{t('assignments.cards.next7DaysCheckout')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="assignments" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="assignments" data-testid="tab-assignments">{t('assignments.tabs.assignments')}</TabsTrigger>
              <TabsTrigger value="charges" data-testid="tab-charges">{t('assignments.tabs.charges')}</TabsTrigger>
              <TabsTrigger value="payments" data-testid="tab-payments">{t('assignments.tabs.payments')}</TabsTrigger>
            </TabsList>

            {/* Assignments Tab */}
            <TabsContent value="assignments" className="space-y-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t('assignments.search.placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-assignment"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px]" data-testid="select-status-filter">
                    <SelectValue placeholder={t('assignments.search.statusFilter')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('assignments.filters.all')}</SelectItem>
                    <SelectItem value="active">{t('assignments.status.active')}</SelectItem>
                    <SelectItem value="ending_soon">{t('assignments.status.endingSoon')}</SelectItem>
                    <SelectItem value="ended">{t('assignments.status.ended')}</SelectItem>
                    <SelectItem value="pending">{t('assignments.status.pending')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4">
                {filteredAssignments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('assignments.empty.noAssignments')}
                  </div>
                ) : (
                  filteredAssignments.map((assignment) => (
                  <Card 
                    key={assignment.id} 
                    data-testid={`assignment-card-${assignment.id}`}
                    className="hover-elevate cursor-pointer"
                    onClick={() => handleOpenDetailDialog(assignment)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{assignment.workerName}</CardTitle>
                            {assignment.isRoomReservation ? (
                              <Badge variant="outline" className="text-xs gap-1">
                                <Home className="w-3 h-3" />
                                Oda Kiralaması
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                Yatak Kiralaması
                              </Badge>
                            )}
                          </div>
                          <CardDescription>
                            {assignment.houseName} • {t('assignments.detailsDialog.room')} {assignment.roomNumber} • {t('assignments.detailsDialog.bed')} {assignment.bedNumber}
                          </CardDescription>
                          {assignment.isRoomReservation && assignment.occupants && assignment.occupants.length > 0 && (
                            <div className="text-xs text-muted-foreground pt-1">
                              <span className="font-medium">Sakinler:</span>{' '}
                              {assignment.occupants?.map((occ, idx) => (
                                <span key={idx}>
                                  {occ.guestName || occ.name}
                                  {idx < (assignment.occupants?.length || 0) - 1 ? ', ' : ''}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <Badge className={getStatusColor(assignment.status)}>
                          {getStatusLabel(assignment.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">{t('assignments.assignmentCard.startDate')}</p>
                          <p className="font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(assignment.startDate).toLocaleDateString(getLocale())}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">{t('assignments.assignmentCard.monthlyRate')}</p>
                          <p className="font-medium">€{assignment.monthlyRate}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">{t('assignments.assignmentCard.deposit')}</p>
                          {assignment.depositCollected ? (
                            <p className="font-medium flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              €{assignment.depositAmount}
                            </p>
                          ) : (
                            <p className="font-medium flex items-center gap-1 text-amber-600">
                              <AlertCircle className="w-3 h-3" />
                              {t('assignments.paymentStatus.pending')}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">{t('assignments.assignmentCard.endDate')}</p>
                          <p className="font-medium">
                            {assignment.endDate 
                              ? new Date(assignment.endDate).toLocaleDateString(getLocale())
                              : t('assignments.assignmentCard.ongoing')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Charges Tab */}
            <TabsContent value="charges" className="space-y-4">
              {/* Charges Filter */}
              <div className="flex items-center gap-4">
                <Select value={chargesFilter} onValueChange={setChargesFilter}>
                  <SelectTrigger className="w-[280px]" data-testid="select-charges-filter">
                    <SelectValue placeholder={t('assignments.search.chargesFilter')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('assignments.filters.all')}</SelectItem>
                    <SelectItem value="today">{t('assignments.filters.today')}</SelectItem>
                    <SelectItem value="upcoming">{t('assignments.filters.next3Days')}</SelectItem>
                    <SelectItem value="overdue">{t('assignments.filters.overdue')}</SelectItem>
                    <SelectItem value="overdue7">{t('assignments.filters.overdue7to14')}</SelectItem>
                    <SelectItem value="overdue14">{t('assignments.filters.overdue14to30')}</SelectItem>
                    <SelectItem value="overdue30">{t('assignments.filters.overdue30to90')}</SelectItem>
                    <SelectItem value="overdue30plus">{t('assignments.filters.overdue90plus')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {filteredCharges.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('assignments.empty.noCharges')}
                  </div>
                ) : (
                  filteredCharges.map((charge) => (
                  <Card key={charge.id} data-testid={`charge-card-${charge.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{charge.workerName}</CardTitle>
                          <CardDescription>
                            {new Date(charge.month + "-01").toLocaleDateString(getLocale(), { year: 'numeric', month: 'long' })}
                          </CardDescription>
                        </div>
                        <Badge variant={getPaymentStatusColor(charge.status)}>
                          {getPaymentStatusLabel(charge.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">{t('assignments.chargeCard.amount')}</p>
                          <p className="font-bold text-lg">€{charge.amount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">{t('assignments.chargeCard.daysCount')}</p>
                          <p className="font-medium">{charge.days} {t('assignments.chargeCard.days')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">{t('assignments.chargeCard.calculation')}</p>
                          <p className="font-medium">
                            {charge.calculationType === "full_month" ? t('assignments.chargeCard.fullMonth') : 
                             charge.calculationType === "partial" ? t('assignments.chargeCard.partial') : t('assignments.chargeCard.prorated')}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">{t('assignments.chargeCard.dueDate')}</p>
                          <p className="font-medium">
                            {new Date(charge.dueDate).toLocaleDateString(getLocale())}
                          </p>
                        </div>
                      </div>
                      
                      {/* Show remaining amount and payment button for unpaid/partial charges */}
                      {charge.status !== "paid" && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                          <div>
                            <p className="text-sm text-muted-foreground">{t('assignments.chargeCard.remainingDebt')}</p>
                            <p className="font-bold text-lg text-red-600">€{charge.remainingAmount}</p>
                          </div>
                          <Button 
                            onClick={() => handleOpenPaymentDialog(charge)}
                            data-testid={`button-add-payment-${charge.id}`}
                            size="sm"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            {t('assignments.chargeCard.enterPayment')}
                          </Button>
                        </div>
                      )}
                      
                      {charge.notes && (
                        <p className="text-sm text-muted-foreground mt-3 p-2 bg-muted/50 rounded">
                          {charge.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-4">
              {/* Date Filter */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Label htmlFor="payment-start-date" className="whitespace-nowrap">{t('assignments.search.startDate')}</Label>
                  <Input
                    id="payment-start-date"
                    type="date"
                    value={paymentDateFilter.startDate}
                    onChange={(e) => setPaymentDateFilter({...paymentDateFilter, startDate: e.target.value})}
                    className="w-[160px]"
                    data-testid="input-payment-start-date"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="payment-end-date" className="whitespace-nowrap">{t('assignments.search.endDate')}</Label>
                  <Input
                    id="payment-end-date"
                    type="date"
                    value={paymentDateFilter.endDate}
                    onChange={(e) => setPaymentDateFilter({...paymentDateFilter, endDate: e.target.value})}
                    className="w-[160px]"
                    data-testid="input-payment-end-date"
                  />
                </div>
                {(paymentDateFilter.startDate || paymentDateFilter.endDate) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPaymentDateFilter({ startDate: "", endDate: "" })}
                    data-testid="button-clear-payment-filter"
                  >
                    {t('assignments.search.clearFilters')}
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {Object.keys(groupedPayments).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('assignments.empty.noPayments')}
                  </div>
                ) : (
                  Object.entries(groupedPayments).map(([workerName, workerPayments]) => {
                    const isExpanded = expandedWorkers.has(workerName);
                    const latestPayment = workerPayments[0];
                    const totalAmount = workerPayments.reduce((sum, p) => sum + p.amount, 0);
                    const paymentsToShow = isExpanded ? workerPayments : [latestPayment];
                    
                    return (
                      <Card key={workerName} data-testid={`payment-group-${workerName}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg">{workerName}</CardTitle>
                              <CardDescription>
                                {t('assignments.paymentCard.paymentsTotal', { count: workerPayments.length, total: totalAmount.toFixed(2) })}
                              </CardDescription>
                            </div>
                            <Badge variant="default" className="bg-green-500">
                              {t('assignments.paymentCard.paidBadge')}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {paymentsToShow.map((payment, index) => (
                            <div 
                              key={payment.id} 
                              className={`p-3 rounded-lg border ${index === 0 ? 'bg-muted/30' : 'bg-background'}`}
                              data-testid={`payment-item-${payment.id}`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="text-sm text-muted-foreground">
                                  {new Date(payment.paymentDate).toLocaleDateString(getLocale(), {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </div>
                                {payment.collectorName && (
                                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <UserCheck className="w-3 h-3" />
                                    {payment.collectorName}
                                  </div>
                                )}
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                <div>
                                  <p className="text-muted-foreground mb-1">{t('assignments.paymentCard.amount')}</p>
                                  <p className="font-bold text-base flex items-center gap-1">
                                    <CreditCard className="w-4 h-4" />
                                    €{payment.amount}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground mb-1">{t('assignments.paymentCard.paymentMethod')}</p>
                                  <p className="font-medium">
                                    {payment.paymentMethod === "bank_transfer" ? t('assignments.paymentMethods.bankTransfer') :
                                     payment.paymentMethod === "pos" ? t('assignments.paymentMethods.pos') :
                                     payment.paymentMethod === "cash" ? t('assignments.paymentMethods.cash') :
                                     payment.paymentMethod === "automatic" ? t('assignments.paymentMethods.automatic') : t('assignments.paymentMethods.other')}
                                  </p>
                                </div>
                                {payment.reference && (
                                  <div>
                                    <p className="text-muted-foreground mb-1">{t('assignments.paymentCard.reference')}</p>
                                    <p className="font-medium text-xs">{payment.reference}</p>
                                  </div>
                                )}
                              </div>
                              {payment.notes && (
                                <p className="text-sm text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
                                  {payment.notes}
                                </p>
                              )}
                            </div>
                          ))}
                          
                          {workerPayments.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleWorkerExpansion(workerName)}
                              className="w-full"
                              data-testid={`button-toggle-${workerName}`}
                            >
                              {isExpanded ? 
                                t('assignments.paymentCard.showLess') : 
                                t('assignments.paymentCard.showMore', { count: workerPayments.length - 1 })
                              }
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Payment Dialog */}
      <Dialog 
        open={paymentDialogOpen} 
        onOpenChange={(open) => {
          setPaymentDialogOpen(open);
          if (!open) {
            // Reset state when dialog closes
            setSelectedCharge(null);
            setNewPayment({
              amount: 0,
              paymentDate: new Date().toISOString().split('T')[0],
              paymentMethod: "cash",
              collectorName: "",
              notes: "",
            });
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('assignments.paymentDialog.title')}</DialogTitle>
            <DialogDescription>
              {selectedCharge && t('assignments.paymentDialog.description', { workerName: selectedCharge.workerName })}
            </DialogDescription>
          </DialogHeader>

          {selectedCharge && (
            <div className="space-y-4 py-4">
              {/* Charge Info */}
              <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('assignments.paymentDialog.fullAmount')}</span>
                  <span className="font-semibold">€{selectedCharge.amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('assignments.paymentDialog.remainingAmount')}</span>
                  <span className="font-bold text-red-600">€{selectedCharge.remainingAmount}</span>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="payment-amount">{t('assignments.paymentDialog.amountLabel')}</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={selectedCharge.remainingAmount}
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) || 0 })}
                  placeholder={t('assignments.paymentDialog.amountPlaceholder')}
                  data-testid="input-payment-amount"
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label htmlFor="payment-method">{t('assignments.paymentDialog.methodLabel')}</Label>
                <Select 
                  value={newPayment.paymentMethod} 
                  onValueChange={(value) => setNewPayment({ ...newPayment, paymentMethod: value as PaymentMethod })}
                >
                  <SelectTrigger id="payment-method" data-testid="select-payment-method">
                    <SelectValue placeholder={t('assignments.paymentDialog.methodPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">{t('assignments.paymentMethods.cash')}</SelectItem>
                    <SelectItem value="bank_transfer">{t('assignments.paymentMethods.bankTransfer')}</SelectItem>
                    <SelectItem value="pos">{t('assignments.paymentMethods.pos')}</SelectItem>
                    <SelectItem value="automatic">{t('assignments.paymentMethods.automatic')}</SelectItem>
                    <SelectItem value="other">{t('assignments.paymentMethods.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Collector Name */}
              <div className="space-y-2">
                <Label htmlFor="collector-name">{t('assignments.paymentDialog.collectorLabel')}</Label>
                <Input
                  id="collector-name"
                  value={newPayment.collectorName}
                  onChange={(e) => setNewPayment({ ...newPayment, collectorName: e.target.value })}
                  placeholder={t('assignments.paymentDialog.collectorPlaceholder')}
                  data-testid="input-collector-name"
                  disabled
                  className="bg-muted text-muted-foreground cursor-not-allowed"
                />
              </div>

              {/* Payment Date */}
              <div className="space-y-2">
                <Label htmlFor="payment-date">{t('assignments.paymentDialog.dateLabel')}</Label>
                <Input
                  id="payment-date"
                  type="date"
                  value={newPayment.paymentDate}
                  onChange={(e) => setNewPayment({ ...newPayment, paymentDate: e.target.value })}
                  data-testid="input-payment-date"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="payment-notes">{t('assignments.paymentDialog.notesLabel')}</Label>
                <Textarea
                  id="payment-notes"
                  value={newPayment.notes}
                  onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                  placeholder={t('assignments.paymentDialog.notesPlaceholder')}
                  rows={3}
                  data-testid="textarea-payment-notes"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setPaymentDialogOpen(false)}
              data-testid="button-cancel-payment"
            >
              {t('assignments.paymentDialog.cancel')}
            </Button>
            <Button 
              onClick={handleSavePayment}
              data-testid="button-save-payment"
            >
              {t('assignments.paymentDialog.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assignment Detail Dialog with Conversation Notes */}
      <Dialog 
        open={detailDialogOpen} 
        onOpenChange={(open) => {
          setDetailDialogOpen(open);
          if (!open) {
            setNewNote({ note: "", createdBy: "" });
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{t('assignments.detailsDialog.title')}</DialogTitle>
            {selectedAssignment && (
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground text-base">{selectedAssignment.workerName}</p>
                  {selectedAssignment.isRoomReservation ? (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Home className="w-3 h-3" />
                      Oda Kiralaması
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Yatak Kiralaması
                    </Badge>
                  )}
                </div>
                <DialogDescription className="text-sm">
                  {selectedAssignment.houseName} • {t('assignments.detailsDialog.room')} {selectedAssignment.roomNumber} • {t('assignments.detailsDialog.bed')} {selectedAssignment.bedNumber}
                </DialogDescription>
                {selectedAssignment.isRoomReservation && selectedAssignment.occupants && selectedAssignment.occupants.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Sakinler:</span>{' '}
                    {selectedAssignment.occupants?.map((occ, idx) => (
                      <span key={idx}>
                        {occ.guestName || occ.name}
                        {idx < (selectedAssignment.occupants?.length || 0) - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-4 text-sm items-center">
                  <span>{t('assignments.detailsDialog.startDate')}: {new Date(selectedAssignment.startDate).toLocaleDateString(getLocale())}</span>
                  <span>{t('assignments.detailsDialog.monthlyRate')}: €{selectedAssignment.monthlyRate}</span>
                  <Badge className={getStatusColor(selectedAssignment.status)}>
                    {getStatusLabel(selectedAssignment.status)}
                  </Badge>
                </div>
              </div>
            )}
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
          {selectedAssignment && (
            <div className="space-y-4 pb-4">
              {/* Conversation Notes List */}
              <div className="space-y-2">
                <Label>{t('assignments.detailsDialog.conversationNotes')}</Label>
                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                  {assignmentNotes
                    .map((note) => (
                      <div 
                        key={note.id} 
                        className="mb-4 pb-4 border-b last:border-0"
                        data-testid={`conversation-note-${note.id}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium">{note.createdBy}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(note.createdAt).toLocaleString('tr-TR')}
                          </span>
                        </div>
                        <p className="text-sm">{note.note}</p>
                      </div>
                    ))}
                  {assignmentNotes.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      {t('assignments.detailsDialog.noNotes')}
                    </p>
                  )}
                </ScrollArea>
              </div>

              {/* New Note Form */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium">{t('assignments.detailsDialog.addNote')}</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="note-text">{t('assignments.detailsDialog.noteLabel')}</Label>
                  <Textarea
                    id="note-text"
                    value={newNote.note}
                    onChange={(e) => setNewNote({ ...newNote, note: e.target.value })}
                    placeholder={t('assignments.detailsDialog.notePlaceholder')}
                    rows={3}
                    data-testid="textarea-conversation-note"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note-creator">{t('assignments.detailsDialog.creatorLabel')}</Label>
                  <Input
                    id="note-creator"
                    value={newNote.createdBy}
                    onChange={(e) => setNewNote({ ...newNote, createdBy: e.target.value })}
                    placeholder={t('assignments.detailsDialog.creatorPlaceholder')}
                    data-testid="input-note-creator"
                  />
                </div>
              </div>
            </div>
          )}
          </div>

          <DialogFooter className="flex-shrink-0">
            <Button 
              variant="outline" 
              onClick={() => {
                setDetailDialogOpen(false);
                setNewNote({ note: "", createdBy: "" });
              }}
              data-testid="button-cancel-note"
            >
              {t('assignments.detailsDialog.cancel')}
            </Button>
            <Button 
              onClick={handleSaveNote}
              data-testid="button-save-note"
            >
              {t('assignments.detailsDialog.saveNote')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
