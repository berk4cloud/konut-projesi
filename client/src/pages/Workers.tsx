import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, User, Info, ArrowUpDown, ChevronUp, ChevronDown, Bed, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import AccommodationFinder from "@/components/AccommodationFinder";

type WorkerStatus = "active" | "left_no_notice" | "notice_period" | "on_vacation" | "new_registration" | "checked_out";

type Worker = {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  country: string;
  email?: string;
  phone?: string;
  house: string;
  room: string;
  bed: string;
  status: WorkerStatus;
  // Check-in/Check-out dates
  checkInDate?: string; // Giriş tarihi
  checkOutDate?: string; // Çıkış tarihi
  keyHandedOverDate?: string; // Anahtar teslim tarihi
  keyReturnedDate?: string; // Anahtar iade tarihi
  // Status-specific dates
  vacationStartDate?: string; // For on_vacation
  vacationEndDate?: string; // For on_vacation
  plannedExitDate?: string; // For notice_period
  leftDate?: string; // For left_no_notice
};

// Mock houses for dropdowns
const mockHouses = [
  { id: "h1", name: "Geldernstrasse 13", rooms: ["45", "46", "47"] },
  { id: "h2", name: "Hauptstrasse 45", rooms: ["101", "102"] },
  { id: "h3", name: "Marktplatz 7", rooms: ["201", "202"] },
  { id: "h4", name: "Atatürk Caddesi 42", rooms: ["1", "2", "3"] },
];

export default function Workers() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Calculate age from birth date
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getStatusBadge = (worker: Worker) => {
    switch (worker.status) {
      case "active":
        return null; // Don't show badge for active status
      case "on_vacation":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" data-testid={`badge-status-${worker.id}`}>
            Tatilde {worker.vacationEndDate && `(${new Date(worker.vacationEndDate).toLocaleDateString("tr-TR")} dönüş)`}
          </Badge>
        );
      case "notice_period":
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" data-testid={`badge-status-${worker.id}`}>
            Çıkış Bildirdi {worker.plannedExitDate && `(${new Date(worker.plannedExitDate).toLocaleDateString("tr-TR")})`}
          </Badge>
        );
      case "left_no_notice":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" data-testid={`badge-status-${worker.id}`}>
            Haber Vermeden Gitti {worker.leftDate && `(${new Date(worker.leftDate).toLocaleDateString("tr-TR")})`}
          </Badge>
        );
      case "new_registration":
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" data-testid={`badge-status-${worker.id}`}>
            Yeni Kayıt (Giriş Bekliyor)
          </Badge>
        );
      case "checked_out":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-300" data-testid={`badge-status-${worker.id}`}>
            Çıkış Yaptı {worker.checkOutDate && `(${new Date(worker.checkOutDate).toLocaleDateString("tr-TR")})`}
          </Badge>
        );
      default:
        return null;
    }
  };
  const [workers, setWorkers] = useState<Worker[]>([
    { id: "1", firstName: "John", lastName: "Doe", birthDate: "1980-10-22", gender: "Erkek", country: "Hollanda", email: "john.doe@example.com", phone: "+31612345678", house: "Geldernstrasse 13", room: "45", bed: "1", status: "active" },
    { id: "2", firstName: "Jane", lastName: "Smith", birthDate: "1992-05-15", gender: "Kadın", country: "Almanya", email: "jane.smith@example.com", house: "Geldernstrasse 13", room: "45", bed: "3", status: "on_vacation", vacationStartDate: "2025-10-15", vacationEndDate: "2025-10-30" },
    { id: "3", firstName: "Mike", lastName: "Johnson", birthDate: "1985-11-30", gender: "Erkek", country: "Polonya", phone: "+48123456789", house: "Geldernstrasse 13", room: "47", bed: "1", status: "active" },
    { id: "4", firstName: "Sarah", lastName: "Williams", birthDate: "1988-03-08", gender: "Kadın", country: "Romanya", email: "sarah.w@example.com", phone: "+40123456789", house: "Hauptstrasse 45", room: "101", bed: "2", status: "notice_period", plannedExitDate: "2025-10-31" },
    { id: "5", firstName: "Tom", lastName: "Brown", birthDate: "1995-07-12", gender: "Erkek", country: "Hollanda", house: "Hauptstrasse 45", room: "102", bed: "1", status: "left_no_notice", leftDate: "2025-10-16" },
    { id: "6", firstName: "Ahmet", lastName: "Yılmaz", birthDate: "1990-08-20", gender: "Erkek", country: "Türkiye", email: "ahmet.yilmaz@example.com", phone: "+905551234567", house: "Atatürk Caddesi 42", room: "1", bed: "2", status: "active" },
  ]);
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAccommodationFinderOpen, setIsAccommodationFinderOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    gender: "",
    country: "",
    email: "",
    phone: "",
    house: "",
    room: "",
    bed: "",
    status: "active" as WorkerStatus,
    checkInDate: "",
    checkOutDate: "",
    keyHandedOverDate: "",
    keyReturnedDate: "",
    vacationStartDate: "",
    vacationEndDate: "",
    plannedExitDate: "",
    leftDate: "",
  });

  const filteredWorkers = workers
    .filter((worker) =>
      `${worker.firstName} ${worker.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.house.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.birthDate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (worker.email && worker.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (worker.phone && worker.phone.includes(searchQuery))
    )
    .sort((a, b) => {
      if (!sortOrder) return 0;
      const comparison = `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, 'tr');
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  
  // Pagination calculations
  const totalPages = Math.ceil(filteredWorkers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedWorkers = filteredWorkers.slice(startIndex, endIndex);
  
  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);
  
  // Clamp currentPage when filtered results or page size changes
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredWorkers.length, pageSize, totalPages, currentPage]);
  
  // Reset to page 1 when page size changes
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };
  
  const handleAccommodationAssign = (accommodation: { house: string; room: string; bed: string }) => {
    setFormData({
      ...formData,
      house: accommodation.house,
      room: accommodation.room,
      bed: accommodation.bed,
    });
  };
  
  const handleOpenAddDialog = () => {
    setFormData({
      firstName: "",
      lastName: "",
      birthDate: "",
      gender: "",
      country: "",
      email: "",
      phone: "",
      house: "",
      room: "",
      bed: "",
      status: "active",
      checkInDate: "",
      checkOutDate: "",
      keyHandedOverDate: "",
      keyReturnedDate: "",
      vacationStartDate: "",
      vacationEndDate: "",
      plannedExitDate: "",
      leftDate: "",
    });
    setIsAddDialogOpen(true);
  };
  
  const handleOpenEditDialog = (worker: Worker) => {
    setSelectedWorker(worker);
    setFormData({
      firstName: worker.firstName,
      lastName: worker.lastName,
      birthDate: worker.birthDate,
      gender: worker.gender,
      country: worker.country,
      email: worker.email || "",
      phone: worker.phone || "",
      house: worker.house,
      room: worker.room,
      bed: worker.bed,
      status: worker.status,
      checkInDate: worker.checkInDate || "",
      checkOutDate: worker.checkOutDate || "",
      keyHandedOverDate: worker.keyHandedOverDate || "",
      keyReturnedDate: worker.keyReturnedDate || "",
      vacationStartDate: worker.vacationStartDate || "",
      vacationEndDate: worker.vacationEndDate || "",
      plannedExitDate: worker.plannedExitDate || "",
      leftDate: worker.leftDate || "",
    });
    setIsEditDialogOpen(true);
  };
  
  const handleSaveWorker = () => {
    if (!formData.firstName || !formData.lastName || !formData.birthDate || !formData.gender || !formData.country) {
      toast({
        title: "Hata",
        description: "Lütfen tüm zorunlu alanları doldurun",
        variant: "destructive",
      });
      return;
    }
    
    // Clean up status-specific dates based on status
    const cleanedFormData = {
      ...formData,
      vacationStartDate: formData.status === "on_vacation" ? formData.vacationStartDate : undefined,
      vacationEndDate: formData.status === "on_vacation" ? formData.vacationEndDate : undefined,
      plannedExitDate: formData.status === "notice_period" ? formData.plannedExitDate : undefined,
      leftDate: formData.status === "left_no_notice" ? formData.leftDate : undefined,
    };
    
    if (selectedWorker) {
      // Edit mode
      setWorkers(workers.map((w) => 
        w.id === selectedWorker.id ? { ...w, ...cleanedFormData } : w
      ));
      toast({
        title: "Başarılı",
        description: "Çalışan bilgileri güncellendi",
      });
      setIsEditDialogOpen(false);
    } else {
      // Add mode
      const newWorker: Worker = {
        id: Date.now().toString(),
        ...cleanedFormData,
      };
      setWorkers([...workers, newWorker]);
      toast({
        title: "Başarılı",
        description: "Yeni çalışan eklendi",
      });
      setIsAddDialogOpen(false);
    }
    
    setSelectedWorker(null);
  };
  
  const selectedHouseData = mockHouses.find(h => h.name === formData.house);
  const availableRooms = selectedHouseData?.rooms || [];

  return (
    <div className="min-h-screen bg-background">
      <Header tenantName="Cova B.V." userName="Admin" />

      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Çalışanlar</h2>
              <p className="text-muted-foreground">Tüm çalışanları görüntüleyin ve yönetin</p>
            </div>
            <Button onClick={handleOpenAddDialog} data-testid="button-add-worker">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Çalışan Ekle
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Çalışan ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
              data-testid="input-search-worker"
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground cursor-help" data-testid="icon-search-info" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">İsim, ev, doğum tarihi veya ülke ile arama yapabilirsiniz</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="bg-card rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover-elevate -ml-3 h-8"
                      onClick={() => {
                        if (sortOrder === null) setSortOrder('asc');
                        else if (sortOrder === 'asc') setSortOrder('desc');
                        else setSortOrder(null);
                      }}
                      data-testid="button-sort-name"
                    >
                      Çalışan
                      {sortOrder === 'asc' && <ChevronUp className="ml-1 w-4 h-4" />}
                      {sortOrder === 'desc' && <ChevronDown className="ml-1 w-4 h-4" />}
                      {sortOrder === null && <ArrowUpDown className="ml-1 w-3 h-3 opacity-50" />}
                    </Button>
                  </TableHead>
                  <TableHead>Cinsiyet</TableHead>
                  <TableHead>Ülke</TableHead>
                  <TableHead>Konaklama</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedWorkers.map((worker) => (
                  <TableRow key={worker.id} data-testid={`worker-row-${worker.id}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2" data-testid={`text-worker-name-${worker.id}`}>
                            <span>{worker.firstName} {worker.lastName}</span>
                            <span className="text-sm text-muted-foreground" data-testid={`text-worker-age-${worker.id}`}>
                              ({calculateAge(worker.birthDate)})
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {worker.birthDate}
                            {worker.email && (
                              <span className="ml-2" data-testid={`text-worker-email-${worker.id}`}>
                                • {worker.email}
                              </span>
                            )}
                            {worker.phone && (
                              <span className="ml-2" data-testid={`text-worker-phone-${worker.id}`}>
                                • {worker.phone}
                              </span>
                            )}
                          </div>
                          {getStatusBadge(worker) && (
                            <div className="mt-2">
                              {getStatusBadge(worker)}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{worker.gender}</TableCell>
                    <TableCell>{worker.country}</TableCell>
                    <TableCell className="text-sm">
                      {worker.house ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-foreground">{worker.house}</span>
                          <span className="text-muted-foreground text-xs">
                            Oda {worker.room} • Yatak {worker.bed}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Atanmamış</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleOpenEditDialog(worker)}
                        data-testid={`button-edit-${worker.id}`}
                      >
                        Düzenle
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredWorkers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Çalışan bulunamadı</p>
            </div>
          )}

          {filteredWorkers.length > 0 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="flex items-center gap-6">
                <p className="text-sm text-muted-foreground">
                  Toplam {filteredWorkers.length} çalışan
                  {filteredWorkers.length > pageSize && (
                    <span className="ml-2">
                      (Sayfa {currentPage}/{totalPages})
                    </span>
                  )}
                </p>
                
                <div className="flex items-center gap-2">
                  <Label htmlFor="page-size" className="text-sm text-muted-foreground whitespace-nowrap">
                    Sayfa başına:
                  </Label>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => handlePageSizeChange(Number(value))}
                  >
                    <SelectTrigger id="page-size" className="w-24" data-testid="select-page-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="500">500</SelectItem>
                      <SelectItem value="1000">1000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        data-testid="button-prev-page"
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNum)}
                            isActive={currentPage === pageNum}
                            className="cursor-pointer"
                            data-testid={`button-page-${pageNum}`}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        data-testid="button-next-page"
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Add Worker Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Çalışan Ekle</DialogTitle>
            <DialogDescription>
              Yeni bir çalışan kaydı oluşturun
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-firstname">İsim *</Label>
                <Input
                  id="add-firstname"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  data-testid="input-worker-firstname"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="add-lastname">Soyisim *</Label>
                <Input
                  id="add-lastname"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  data-testid="input-worker-lastname"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-birthdate">Doğum Tarihi *</Label>
                <Input
                  id="add-birthdate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  data-testid="input-worker-birthdate"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-gender">Cinsiyet *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger id="add-gender" data-testid="select-worker-gender">
                    <SelectValue placeholder="Cinsiyet seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Erkek">Erkek</SelectItem>
                    <SelectItem value="Kadın">Kadın</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-country">Ülke *</Label>
                <Input
                  id="add-country"
                  placeholder="Hollanda"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  data-testid="input-worker-country"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-email">E-posta</Label>
                <Input
                  id="add-email"
                  type="email"
                  placeholder="ornek@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  data-testid="input-worker-email"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-phone">Telefon</Label>
                <Input
                  id="add-phone"
                  type="tel"
                  placeholder="+31 6 12345678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  data-testid="input-worker-phone"
                />
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Konaklama</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!formData.firstName || !formData.lastName || !formData.gender) {
                      toast({
                        title: "Eksik Bilgi",
                        description: "Konaklama bulabilmek için önce isim, soyisim ve cinsiyet bilgilerini girin",
                        variant: "destructive",
                      });
                      return;
                    }
                    setIsAccommodationFinderOpen(true);
                  }}
                  data-testid="button-find-accommodation"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Uygun Konaklama Bul
                </Button>
              </div>
              
              {formData.house ? (
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bed className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary">{formData.house}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Oda {formData.room} • Yatak {formData.bed}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData({ ...formData, house: "", room: "", bed: "" })}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground text-center">
                    "Uygun Konaklama Bul" butonunu kullanarak konaklama atayabilirsiniz
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                data-testid="button-cancel-add"
              >
                İptal
              </Button>
              <Button
                onClick={handleSaveWorker}
                data-testid="button-save-worker"
              >
                Kaydet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Worker Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Çalışan Düzenle</DialogTitle>
            <DialogDescription>
              {selectedWorker && `${selectedWorker.firstName} ${selectedWorker.lastName}`} bilgilerini güncelleyin
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstname">İsim *</Label>
                <Input
                  id="edit-firstname"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  data-testid="input-edit-worker-firstname"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-lastname">Soyisim *</Label>
                <Input
                  id="edit-lastname"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  data-testid="input-edit-worker-lastname"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-birthdate">Doğum Tarihi *</Label>
                <Input
                  id="edit-birthdate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  data-testid="input-edit-worker-birthdate"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-gender">Cinsiyet *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger id="edit-gender" data-testid="select-edit-worker-gender">
                    <SelectValue placeholder="Cinsiyet seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Erkek">Erkek</SelectItem>
                    <SelectItem value="Kadın">Kadın</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-country">Ülke *</Label>
                <Input
                  id="edit-country"
                  placeholder="Hollanda"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  data-testid="input-edit-worker-country"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">E-posta</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="ornek@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  data-testid="input-edit-worker-email"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefon</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  placeholder="+31 6 12345678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  data-testid="input-edit-worker-phone"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Durum Yönetimi</h4>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Çalışan Durumu</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: WorkerStatus) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger id="edit-status" data-testid="select-worker-status">
                      <SelectValue placeholder="Durum seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktif - Konaklamada</SelectItem>
                      <SelectItem value="on_vacation">Tatilde</SelectItem>
                      <SelectItem value="notice_period">Çıkış Bildirdi</SelectItem>
                      <SelectItem value="left_no_notice">Haber Vermeden Gitti</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.status === "on_vacation" && (
                  <div className="grid grid-cols-2 gap-4 bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="vacation-start">Tatil Başlangıcı</Label>
                      <Input
                        id="vacation-start"
                        type="date"
                        value={formData.vacationStartDate}
                        onChange={(e) => setFormData({ ...formData, vacationStartDate: e.target.value })}
                        data-testid="input-vacation-start"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vacation-end">Dönüş Tarihi</Label>
                      <Input
                        id="vacation-end"
                        type="date"
                        value={formData.vacationEndDate}
                        onChange={(e) => setFormData({ ...formData, vacationEndDate: e.target.value })}
                        data-testid="input-vacation-end"
                      />
                    </div>
                  </div>
                )}

                {formData.status === "notice_period" && (
                  <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="planned-exit">Planlanan Çıkış Tarihi</Label>
                      <Input
                        id="planned-exit"
                        type="date"
                        value={formData.plannedExitDate}
                        onChange={(e) => setFormData({ ...formData, plannedExitDate: e.target.value })}
                        data-testid="input-planned-exit"
                      />
                    </div>
                  </div>
                )}

                {formData.status === "left_no_notice" && (
                  <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="left-date">Ayrılış Tarihi</Label>
                      <Input
                        id="left-date"
                        type="date"
                        value={formData.leftDate}
                        onChange={(e) => setFormData({ ...formData, leftDate: e.target.value })}
                        data-testid="input-left-date"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Konaklama Bilgileri</h4>
              
              {selectedWorker?.house ? (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{selectedWorker.house}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Oda {selectedWorker.room} • Yatak {selectedWorker.bed}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Konaklama değişikliği için lütfen konut yönetim ekranını kullanın
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground text-center">
                    Bu çalışana henüz konaklama atanmamış
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                data-testid="button-cancel-edit"
              >
                İptal
              </Button>
              <Button
                onClick={handleSaveWorker}
                data-testid="button-update-worker"
              >
                Güncelle
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Accommodation Finder Dialog */}
      <AccommodationFinder
        open={isAccommodationFinderOpen}
        onOpenChange={setIsAccommodationFinderOpen}
        workerGender={formData.gender as "Erkek" | "Kadın"}
        workerName={`${formData.firstName} ${formData.lastName}`}
        workerCity={formData.country}
        onAssign={handleAccommodationAssign}
      />
    </div>
  );
}
