import { useState } from "react";
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

// Types for Assignment Management System
type AssignmentStatus = "active" | "ending_soon" | "ended" | "pending";
type DepositStatus = "collected" | "pending" | "refunded" | "partial_refund";
type PaymentStatus = "paid" | "pending" | "overdue" | "partial";
type PaymentMethod = "bank_transfer" | "pos" | "cash" | "automatic" | "other";

type Assignment = {
  id: string;
  workerId: string;
  workerName: string;
  houseId: string;
  houseName: string;
  roomNumber: string;
  bedNumber: number;
  startDate: string;
  endDate?: string; // Optional for ongoing assignments
  monthlyRate: number;
  status: AssignmentStatus;
  
  // Deposit tracking
  depositCollected: boolean;
  depositAmount: number;
  depositDate?: string;
  depositCollector?: string; // Who collected the deposit
  depositStatus: DepositStatus;
  depositRefundDate?: string;
  depositRefundAmount?: number;
  damageAmount?: number;
  damageNote?: string;
  
  // Agreement notes
  agreementNotes?: string; // Payment agreements and conversations
};

type Charge = {
  id: string;
  assignmentId: string;
  workerName: string;
  month: string; // "2025-11" format
  amount: number; // Total charge amount
  expectedAmount: number; // Expected payment amount (usually same as amount)
  remainingAmount: number; // Remaining unpaid amount (for partial payments)
  days: number; // Number of days in this charge period
  calculationType: "full_month" | "partial" | "prorated";
  dueDate: string;
  status: PaymentStatus;
  notes?: string;
};

type Payment = {
  id: string;
  chargeId: string;
  workerName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  collectorName?: string; // Who collected this payment
  recordedAt?: string; // When was this payment recorded
  reference?: string;
  notes?: string;
};

// Mock Data
const mockAssignments: Assignment[] = [
  {
    id: "a1",
    workerId: "w1",
    workerName: "Ahmet Yılmaz",
    houseId: "h1",
    houseName: "Geldernstrasse 13, 52511",
    roomNumber: "45",
    bedNumber: 1,
    startDate: "2024-10-15",
    monthlyRate: 600,
    status: "active",
    depositCollected: true,
    depositAmount: 500,
    depositDate: "2024-10-14",
    depositStatus: "collected",
  },
  {
    id: "a2",
    workerId: "w2",
    workerName: "Mehmet Kaya",
    houseId: "h1",
    houseName: "Geldernstrasse 13, 52511",
    roomNumber: "45",
    bedNumber: 2,
    startDate: "2024-11-01",
    monthlyRate: 600,
    status: "active",
    depositCollected: true,
    depositAmount: 500,
    depositDate: "2024-10-30",
    depositStatus: "collected",
  },
  {
    id: "a3",
    workerId: "w3",
    workerName: "Ali Demir",
    houseId: "h2",
    houseName: "Hauptstrasse 45, 5911",
    roomNumber: "101",
    bedNumber: 1,
    startDate: "2024-09-01",
    endDate: "2024-11-15",
    monthlyRate: 550,
    status: "ending_soon",
    depositCollected: true,
    depositAmount: 500,
    depositDate: "2024-08-30",
    depositStatus: "collected",
  },
  {
    id: "a4",
    workerId: "w4",
    workerName: "Fatma Şahin",
    houseId: "h1",
    houseName: "Geldernstrasse 13, 52511",
    roomNumber: "46",
    bedNumber: 1,
    startDate: "2024-11-10",
    monthlyRate: 650,
    status: "active",
    depositCollected: false,
    depositAmount: 0,
    depositStatus: "pending",
  },
];

const mockCharges: Charge[] = [
  {
    id: "c1",
    assignmentId: "a1",
    workerName: "Ahmet Yılmaz",
    month: "2024-10",
    amount: 340,
    expectedAmount: 340,
    remainingAmount: 0,
    days: 17,
    calculationType: "partial",
    dueDate: "2024-11-01",
    status: "paid",
    notes: "15-31 Ekim arası (oransal hesaplama: 17/30 × €600)",
  },
  {
    id: "c2",
    assignmentId: "a1",
    workerName: "Ahmet Yılmaz",
    month: "2024-11",
    amount: 600,
    expectedAmount: 600,
    remainingAmount: 200,
    days: 30,
    calculationType: "full_month",
    dueDate: "2024-12-01",
    status: "partial",
    notes: "€400 ödendi, €200 kalan (kısmi ödeme)",
  },
  {
    id: "c3",
    assignmentId: "a2",
    workerName: "Mehmet Kaya",
    month: "2024-11",
    amount: 600,
    expectedAmount: 600,
    remainingAmount: 600,
    days: 30,
    calculationType: "full_month",
    dueDate: "2024-12-01",
    status: "pending",
  },
  {
    id: "c4",
    assignmentId: "a3",
    workerName: "Ali Demir",
    month: "2024-11",
    amount: 275,
    expectedAmount: 275,
    remainingAmount: 275,
    days: 15,
    calculationType: "partial",
    dueDate: "2024-11-15",
    status: "pending",
    notes: "1-15 Kasım arası (son dönem)",
  },
  {
    id: "c5",
    assignmentId: "a4",
    workerName: "Fatma Şahin",
    month: "2024-11",
    amount: 430,
    expectedAmount: 430,
    remainingAmount: 430,
    days: 20,
    calculationType: "prorated",
    dueDate: "2024-12-01",
    status: "overdue",
    notes: "10-30 Kasım arası + depozito eksik",
  },
];

const mockPayments: Payment[] = [
  {
    id: "p1",
    chargeId: "c1",
    workerName: "Ahmet Yılmaz",
    amount: 340,
    paymentDate: "2024-10-30",
    paymentMethod: "bank_transfer",
    collectorName: "Elif Yılmaz",
    recordedAt: "2024-10-30T14:30:00",
    reference: "INV-2024-10-001",
    notes: "Banka havalesi ile ödendi",
  },
  {
    id: "p2",
    chargeId: "c2",
    workerName: "Ahmet Yılmaz",
    amount: 400,
    paymentDate: "2024-11-15",
    paymentMethod: "cash",
    collectorName: "Elif Yılmaz",
    recordedAt: "2024-11-15T10:15:00",
    reference: "CASH-001",
    notes: "Nakit ödeme - ilk kısım (€400)",
  },
  {
    id: "p3",
    chargeId: "c2",
    workerName: "Ahmet Yılmaz",
    amount: 200,
    paymentDate: "2024-11-20",
    paymentMethod: "pos",
    collectorName: "Mehmet Arslan",
    recordedAt: "2024-11-20T16:45:00",
    reference: "POS-2024-112",
    notes: "POS ile ödeme - kalan kısım (€200)",
  },
];

export default function Assignments() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assignments] = useState(mockAssignments);
  const [charges] = useState(mockCharges);
  const [payments] = useState(mockPayments);
  
  // Payment Dialog State
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState<Charge | null>(null);
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: "cash" as PaymentMethod,
    collectorName: "",
    notes: "",
  });

  // Open payment dialog for a specific charge
  const handleOpenPaymentDialog = (charge: Charge) => {
    setSelectedCharge(charge);
    setNewPayment({
      amount: charge.remainingAmount, // Default to remaining amount
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: "cash",
      collectorName: "",
      notes: "",
    });
    setPaymentDialogOpen(true);
  };

  // Save payment
  const handleSavePayment = () => {
    if (!selectedCharge) return;
    
    // Validation
    if (newPayment.amount <= 0) {
      toast({
        title: "Hata",
        description: "Ödeme tutarı 0'dan büyük olmalıdır.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPayment.amount > selectedCharge.remainingAmount) {
      toast({
        title: "Hata",
        description: `Ödeme tutarı kalan borçtan (€${selectedCharge.remainingAmount}) fazla olamaz.`,
        variant: "destructive",
      });
      return;
    }
    
    if (!newPayment.collectorName.trim()) {
      toast({
        title: "Hata",
        description: "Ödemeyi alan kişinin adı gereklidir.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Ödeme Kaydedildi",
      description: `€${newPayment.amount} tutarında ödeme ${newPayment.collectorName} tarafından kaydedildi.`,
    });
    
    // Close dialog and reset
    setPaymentDialogOpen(false);
    setSelectedCharge(null);
    setNewPayment({
      amount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: "cash",
      collectorName: "",
      notes: "",
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

  // Filter charges based on search
  const filteredCharges = charges.filter(charge => {
    return searchQuery === "" || 
      charge.workerName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Filter payments based on search
  const filteredPayments = payments.filter(payment => {
    return searchQuery === "" || 
      payment.workerName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Statistics
  const activeAssignments = assignments.filter(a => a.status === "active").length;
  const pendingDeposits = assignments.filter(a => !a.depositCollected).length;
  const overdueCharges = charges.filter(c => c.status === "overdue").length;
  const totalPendingAmount = charges
    .filter(c => c.status === "pending" || c.status === "overdue")
    .reduce((sum, c) => sum + c.amount, 0);

  // Helper functions
  const getStatusColor = (status: AssignmentStatus) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "ending_soon": return "bg-amber-500";
      case "ended": return "bg-gray-500";
      case "pending": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: AssignmentStatus) => {
    switch (status) {
      case "active": return "Aktif";
      case "ending_soon": return "Yakında Bitiyor";
      case "ended": return "Bitti";
      case "pending": return "Beklemede";
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
      case "paid": return "Ödendi";
      case "pending": return "Bekliyor";
      case "overdue": return "Gecikmiş";
      case "partial": return "Kısmi";
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
              <h2 className="text-2xl font-bold mb-2">Konaklama Yönetimi</h2>
              <p className="text-muted-foreground">Tahsisler, ücretlendirme ve ödeme takibi</p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aktif Tahsisler</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeAssignments}</div>
                <p className="text-xs text-muted-foreground mt-1">Devam eden konaklamalar</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bekleyen Depozito</CardTitle>
                <AlertCircle className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingDeposits}</div>
                <p className="text-xs text-muted-foreground mt-1">Alınmamış depozitolar</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gecikmiş Ödeme</CardTitle>
                <Clock className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overdueCharges}</div>
                <p className="text-xs text-muted-foreground mt-1">Geçmiş ödemeler</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bekleyen Tutar</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{totalPendingAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Tahsil edilecek</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="assignments" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="assignments" data-testid="tab-assignments">Tahsisler</TabsTrigger>
              <TabsTrigger value="charges" data-testid="tab-charges">Ücretlendirme</TabsTrigger>
              <TabsTrigger value="payments" data-testid="tab-payments">Ödemeler</TabsTrigger>
            </TabsList>

            {/* Assignments Tab */}
            <TabsContent value="assignments" className="space-y-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="İşçi veya konut ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-assignment"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px]" data-testid="select-status-filter">
                    <SelectValue placeholder="Durum filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="ending_soon">Yakında Bitiyor</SelectItem>
                    <SelectItem value="ended">Bitti</SelectItem>
                    <SelectItem value="pending">Beklemede</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4">
                {filteredAssignments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Kayıt bulunamadı
                  </div>
                ) : (
                  filteredAssignments.map((assignment) => (
                  <Card key={assignment.id} data-testid={`assignment-card-${assignment.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{assignment.workerName}</CardTitle>
                          <CardDescription>
                            {assignment.houseName} • Oda {assignment.roomNumber} • Yatak {assignment.bedNumber}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(assignment.status)}>
                          {getStatusLabel(assignment.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Başlangıç</p>
                          <p className="font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(assignment.startDate).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Aylık Ücret</p>
                          <p className="font-medium">€{assignment.monthlyRate}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Depozito</p>
                          {assignment.depositCollected ? (
                            <p className="font-medium flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              €{assignment.depositAmount}
                            </p>
                          ) : (
                            <p className="font-medium flex items-center gap-1 text-amber-600">
                              <AlertCircle className="w-3 h-3" />
                              Bekliyor
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Bitiş</p>
                          <p className="font-medium">
                            {assignment.endDate 
                              ? new Date(assignment.endDate).toLocaleDateString('tr-TR')
                              : "Devam ediyor"}
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
              <div className="space-y-4">
                {filteredCharges.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Kayıt bulunamadı
                  </div>
                ) : (
                  filteredCharges.map((charge) => (
                  <Card key={charge.id} data-testid={`charge-card-${charge.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{charge.workerName}</CardTitle>
                          <CardDescription>
                            {new Date(charge.month + "-01").toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })}
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
                          <p className="text-muted-foreground mb-1">Tutar</p>
                          <p className="font-bold text-lg">€{charge.amount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Gün Sayısı</p>
                          <p className="font-medium">{charge.days} gün</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Hesaplama</p>
                          <p className="font-medium">
                            {charge.calculationType === "full_month" ? "Tam ay" : 
                             charge.calculationType === "partial" ? "Kısmi" : "Oransal"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Ödeme Tarihi</p>
                          <p className="font-medium">
                            {new Date(charge.dueDate).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>
                      
                      {/* Show remaining amount and payment button for unpaid/partial charges */}
                      {charge.status !== "paid" && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                          <div>
                            <p className="text-sm text-muted-foreground">Kalan Borç</p>
                            <p className="font-bold text-lg text-red-600">€{charge.remainingAmount}</p>
                          </div>
                          <Button 
                            onClick={() => handleOpenPaymentDialog(charge)}
                            data-testid={`button-add-payment-${charge.id}`}
                            size="sm"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Ödeme Gir
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
              <div className="space-y-4">
                {filteredPayments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Kayıt bulunamadı
                  </div>
                ) : (
                  filteredPayments.map((payment) => (
                  <Card key={payment.id} data-testid={`payment-card-${payment.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{payment.workerName}</CardTitle>
                          <CardDescription>
                            {new Date(payment.paymentDate).toLocaleDateString('tr-TR', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </CardDescription>
                        </div>
                        <Badge variant="default" className="bg-green-500">
                          Ödendi
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Tutar</p>
                          <p className="font-bold text-lg flex items-center gap-1">
                            <CreditCard className="w-4 h-4" />
                            €{payment.amount}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Ödeme Yöntemi</p>
                          <p className="font-medium">
                            {payment.paymentMethod === "bank_transfer" ? "Banka Transferi" :
                             payment.paymentMethod === "cash" ? "Nakit" : "Otomatik"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Referans</p>
                          <p className="font-medium">{payment.reference || "-"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  ))
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
            <DialogTitle>Yeni Ödeme Gir</DialogTitle>
            <DialogDescription>
              {selectedCharge && (
                <>
                  <span className="font-medium">{selectedCharge.workerName}</span> için ödeme kaydı oluşturun
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedCharge && (
            <div className="space-y-4 py-4">
              {/* Charge Info */}
              <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Toplam Tutar:</span>
                  <span className="font-semibold">€{selectedCharge.amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Kalan Borç:</span>
                  <span className="font-bold text-red-600">€{selectedCharge.remainingAmount}</span>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="payment-amount">Ödeme Tutarı (€) *</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={selectedCharge.remainingAmount}
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) || 0 })}
                  data-testid="input-payment-amount"
                />
                <p className="text-xs text-muted-foreground">
                  Maksimum: €{selectedCharge.remainingAmount}
                </p>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label htmlFor="payment-method">Ödeme Yöntemi *</Label>
                <Select 
                  value={newPayment.paymentMethod} 
                  onValueChange={(value) => setNewPayment({ ...newPayment, paymentMethod: value as PaymentMethod })}
                >
                  <SelectTrigger id="payment-method" data-testid="select-payment-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Nakit</SelectItem>
                    <SelectItem value="bank_transfer">Banka Transferi</SelectItem>
                    <SelectItem value="pos">POS/Kart</SelectItem>
                    <SelectItem value="automatic">Otomatik Ödeme</SelectItem>
                    <SelectItem value="other">Diğer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Collector Name */}
              <div className="space-y-2">
                <Label htmlFor="collector-name">Ödemeyi Alan Kişi *</Label>
                <Input
                  id="collector-name"
                  value={newPayment.collectorName}
                  onChange={(e) => setNewPayment({ ...newPayment, collectorName: e.target.value })}
                  placeholder="İsim Soyisim"
                  data-testid="input-collector-name"
                />
              </div>

              {/* Payment Date */}
              <div className="space-y-2">
                <Label htmlFor="payment-date">Ödeme Tarihi *</Label>
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
                <Label htmlFor="payment-notes">Not (Opsiyonel)</Label>
                <Textarea
                  id="payment-notes"
                  value={newPayment.notes}
                  onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                  placeholder="Ödeme ile ilgili notlar..."
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
              İptal
            </Button>
            <Button 
              onClick={handleSavePayment}
              data-testid="button-save-payment"
            >
              Ödeme Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
