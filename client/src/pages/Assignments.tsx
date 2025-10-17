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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, 
  Search, 
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  UserCheck,
  Home,
  CreditCard
} from "lucide-react";

// Types for Assignment Management System
type AssignmentStatus = "active" | "ending_soon" | "ended" | "pending";
type DepositStatus = "collected" | "pending" | "refunded" | "partial_refund";
type PaymentStatus = "paid" | "pending" | "overdue" | "partial";
type PaymentMethod = "bank_transfer" | "cash" | "automatic";

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
  depositStatus: DepositStatus;
  depositRefundDate?: string;
  depositRefundAmount?: number;
  damageAmount?: number;
  damageNote?: string;
};

type Charge = {
  id: string;
  assignmentId: string;
  workerName: string;
  month: string; // "2025-11" format
  amount: number;
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
    days: 30,
    calculationType: "full_month",
    dueDate: "2024-12-01",
    status: "paid",
  },
  {
    id: "c3",
    assignmentId: "a2",
    workerName: "Mehmet Kaya",
    month: "2024-11",
    amount: 600,
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
    reference: "INV-2024-10-001",
  },
  {
    id: "p2",
    chargeId: "c2",
    workerName: "Ahmet Yılmaz",
    amount: 600,
    paymentDate: "2024-11-28",
    paymentMethod: "bank_transfer",
    reference: "INV-2024-11-001",
  },
];

export default function Assignments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assignments, setAssignments] = useState(mockAssignments);
  const [charges] = useState(mockCharges);
  const [payments] = useState(mockPayments);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // New Assignment Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    workerId: "",
    houseId: "",
    roomId: "",
    bedId: "",
    startDate: "",
    endDate: "",
    monthlyRate: 600,
    depositCollected: false,
    depositAmount: 500,
    depositDate: "",
  });
  
  // Mock data for selects
  const mockWorkers = [
    { id: "w1", name: "Ahmet Yılmaz" },
    { id: "w2", name: "Mehmet Kaya" },
    { id: "w5", name: "Ayşe Demir" },
    { id: "w6", name: "Can Öztürk" },
  ];
  
  const mockHouses = [
    { id: "h1", name: "Geldernstrasse 13, 52511" },
    { id: "h2", name: "Hauptstrasse 45, 5911" },
    { id: "h3", name: "Bergweg 78, 8001" },
  ];
  
  const mockRooms = [
    { id: "r1", houseId: "h1", number: "45", beds: 4 },
    { id: "r2", houseId: "h1", number: "46", beds: 2 },
    { id: "r3", houseId: "h2", number: "101", beds: 3 },
  ];
  
  const mockBeds = [
    { id: "b1", roomId: "r1", number: 1, status: "available" },
    { id: "b2", roomId: "r1", number: 2, status: "occupied" },
    { id: "b3", roomId: "r1", number: 3, status: "available" },
    { id: "b4", roomId: "r2", number: 1, status: "available" },
  ];
  
  const handleSaveAssignment = () => {
    // Validation
    const errors: Record<string, string> = {};
    
    if (!newAssignment.workerId) {
      errors.workerId = "İşçi seçimi zorunludur";
    }
    if (!newAssignment.houseId) {
      errors.houseId = "Konut seçimi zorunludur";
    }
    if (!newAssignment.roomId) {
      errors.roomId = "Oda seçimi zorunludur";
    }
    if (!newAssignment.bedId) {
      errors.bedId = "Yatak seçimi zorunludur";
    }
    if (!newAssignment.startDate) {
      errors.startDate = "Başlangıç tarihi zorunludur";
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Get worker and house names for display
    const worker = mockWorkers.find(w => w.id === newAssignment.workerId);
    const house = mockHouses.find(h => h.id === newAssignment.houseId);
    const room = mockRooms.find(r => r.id === newAssignment.roomId);
    const bed = mockBeds.find(b => b.id === newAssignment.bedId);
    
    // Create new assignment
    const assignment: Assignment = {
      id: `a${assignments.length + 1}`,
      workerId: newAssignment.workerId,
      workerName: worker?.name || "",
      houseId: newAssignment.houseId,
      houseName: house?.name || "",
      roomNumber: room?.number || "",
      bedNumber: bed?.number || 1,
      startDate: newAssignment.startDate,
      endDate: newAssignment.endDate || undefined,
      monthlyRate: newAssignment.monthlyRate,
      status: "active",
      depositCollected: newAssignment.depositCollected,
      depositAmount: newAssignment.depositAmount,
      depositDate: newAssignment.depositDate || undefined,
      depositStatus: newAssignment.depositCollected ? "collected" : "pending",
    };
    
    // Add to assignments
    setAssignments([...assignments, assignment]);
    
    // Close dialog and reset
    setIsDialogOpen(false);
    setFormErrors({});
    setNewAssignment({
      workerId: "",
      houseId: "",
      roomId: "",
      bedId: "",
      startDate: "",
      endDate: "",
      monthlyRate: 600,
      depositCollected: false,
      depositAmount: 500,
      depositDate: "",
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
            <Button onClick={() => setIsDialogOpen(true)} data-testid="button-new-assignment">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Tahsis
            </Button>
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

      {/* New Assignment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Tahsis Oluştur</DialogTitle>
            <DialogDescription>
              İşçi-yatak tahsisi oluşturun ve depozito bilgilerini girin
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Worker Selection */}
            <div className="space-y-2">
              <Label htmlFor="worker">İşçi Seçin *</Label>
              <Select 
                value={newAssignment.workerId} 
                onValueChange={(value) => {
                  setNewAssignment({ ...newAssignment, workerId: value });
                  setFormErrors({ ...formErrors, workerId: "" });
                }}
              >
                <SelectTrigger id="worker" data-testid="select-worker" className={formErrors.workerId ? "border-red-500" : ""}>
                  <SelectValue placeholder="İşçi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {mockWorkers.map(worker => (
                    <SelectItem key={worker.id} value={worker.id}>
                      {worker.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.workerId && (
                <p className="text-sm text-red-500">{formErrors.workerId}</p>
              )}
            </div>

            {/* House Selection */}
            <div className="space-y-2">
              <Label htmlFor="house">Konut Seçin *</Label>
              <Select 
                value={newAssignment.houseId} 
                onValueChange={(value) => {
                  setNewAssignment({ ...newAssignment, houseId: value, roomId: "", bedId: "" });
                  setFormErrors({ ...formErrors, houseId: "" });
                }}
              >
                <SelectTrigger id="house" data-testid="select-house" className={formErrors.houseId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Konut seçin" />
                </SelectTrigger>
                <SelectContent>
                  {mockHouses.map(house => (
                    <SelectItem key={house.id} value={house.id}>
                      {house.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.houseId && (
                <p className="text-sm text-red-500">{formErrors.houseId}</p>
              )}
            </div>

            {/* Room Selection */}
            <div className="space-y-2">
              <Label htmlFor="room">Oda Seçin *</Label>
              <Select 
                value={newAssignment.roomId} 
                onValueChange={(value) => {
                  setNewAssignment({ ...newAssignment, roomId: value, bedId: "" });
                  setFormErrors({ ...formErrors, roomId: "" });
                }}
                disabled={!newAssignment.houseId}
              >
                <SelectTrigger id="room" data-testid="select-room" className={formErrors.roomId ? "border-red-500" : ""}>
                  <SelectValue placeholder={newAssignment.houseId ? "Oda seçin" : "Önce konut seçin"} />
                </SelectTrigger>
                <SelectContent>
                  {mockRooms
                    .filter(room => room.houseId === newAssignment.houseId)
                    .map(room => (
                      <SelectItem key={room.id} value={room.id}>
                        Oda {room.number} ({room.beds} yatak)
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              {formErrors.roomId && (
                <p className="text-sm text-red-500">{formErrors.roomId}</p>
              )}
            </div>

            {/* Bed Selection */}
            <div className="space-y-2">
              <Label htmlFor="bed">Yatak Seçin *</Label>
              <Select 
                value={newAssignment.bedId} 
                onValueChange={(value) => {
                  setNewAssignment({ ...newAssignment, bedId: value });
                  setFormErrors({ ...formErrors, bedId: "" });
                }}
                disabled={!newAssignment.roomId}
              >
                <SelectTrigger id="bed" data-testid="select-bed" className={formErrors.bedId ? "border-red-500" : ""}>
                  <SelectValue placeholder={newAssignment.roomId ? "Yatak seçin" : "Önce oda seçin"} />
                </SelectTrigger>
                <SelectContent>
                  {mockBeds
                    .filter(bed => bed.roomId === newAssignment.roomId)
                    .map(bed => (
                      <SelectItem key={bed.id} value={bed.id}>
                        Yatak {bed.number} ({bed.status === "available" ? "Boş" : "Dolu"})
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              {formErrors.bedId && (
                <p className="text-sm text-red-500">{formErrors.bedId}</p>
              )}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Başlangıç Tarihi *</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={newAssignment.startDate}
                  onChange={(e) => {
                    setNewAssignment({ ...newAssignment, startDate: e.target.value });
                    setFormErrors({ ...formErrors, startDate: "" });
                  }}
                  className={formErrors.startDate ? "border-red-500" : ""}
                  data-testid="input-start-date"
                />
                {formErrors.startDate && (
                  <p className="text-sm text-red-500">{formErrors.startDate}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">Bitiş Tarihi (Opsiyonel)</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={newAssignment.endDate}
                  onChange={(e) => setNewAssignment({ ...newAssignment, endDate: e.target.value })}
                  data-testid="input-end-date"
                />
              </div>
            </div>

            {/* Monthly Rate */}
            <div className="space-y-2">
              <Label htmlFor="monthly-rate">Aylık Ücret (€)</Label>
              <Input
                id="monthly-rate"
                type="number"
                step="0.01"
                value={newAssignment.monthlyRate}
                onChange={(e) => setNewAssignment({ ...newAssignment, monthlyRate: parseFloat(e.target.value) || 0 })}
                data-testid="input-monthly-rate"
              />
            </div>

            {/* Deposit Section */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h4 className="font-semibold">Depozito Bilgileri</h4>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="deposit-collected"
                  checked={newAssignment.depositCollected}
                  onCheckedChange={(checked) => setNewAssignment({ ...newAssignment, depositCollected: checked as boolean })}
                  data-testid="checkbox-deposit-collected"
                />
                <Label htmlFor="deposit-collected" className="cursor-pointer">
                  Depozito alındı
                </Label>
              </div>

              {newAssignment.depositCollected && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deposit-amount">Depozito Tutarı (€)</Label>
                      <Input
                        id="deposit-amount"
                        type="number"
                        step="0.01"
                        value={newAssignment.depositAmount}
                        onChange={(e) => setNewAssignment({ ...newAssignment, depositAmount: parseFloat(e.target.value) || 0 })}
                        data-testid="input-deposit-amount"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deposit-date">Depozito Tarihi</Label>
                      <Input
                        id="deposit-date"
                        type="date"
                        value={newAssignment.depositDate}
                        onChange={(e) => setNewAssignment({ ...newAssignment, depositDate: e.target.value })}
                        data-testid="input-deposit-date"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              data-testid="button-cancel"
            >
              İptal
            </Button>
            <Button 
              onClick={handleSaveAssignment}
              data-testid="button-save-assignment"
            >
              Tahsis Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
