import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
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

// Legacy status type for backward compatibility
type WorkerStatus = "active" | "left_no_notice" | "notice_period" | "on_vacation" | "new_registration" | "checked_out";

// Employment status from federated model
type EmploymentStatus = "active" | "inactive" | "former" | "invited";

// Worker type matches API response format (federated model via adapter)
type Worker = {
  id: string; // This is employmentId
  employmentId: string;
  profileId: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: "male" | "female";
  phone?: string | null;
  nationality?: string | null;
  dateOfBirth?: string | null;
  photo?: string | null;
  status: EmploymentStatus;
  jobTitle?: string | null;
  department?: string | null;
  startDate: string;
  endDate?: string | null;
  // Legacy fields for backward compatibility
  birthDate?: string;
  country?: string;
  house?: string;
  room?: string;
  bed?: string;
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

  // Fetch workers from API (federated model)
  const { data: workers = [], isLoading } = useQuery<Worker[]>({
    queryKey: ['/api/workers'],
  });

  // Helper: Convert empty strings to null for optional fields
  const normalizeFormData = (data: typeof formData) => {
    return {
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth || null,
      gender: data.gender as "male" | "female",
      nationality: data.nationality || null,
      email: data.email,
      phone: data.phone || null,
      jobTitle: data.jobTitle || null,
      department: data.department || null,
      startDate: data.startDate,
    };
  };

  // Create worker mutation
  const createWorkerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const normalizedData = normalizeFormData(data);
      const res = await apiRequest('POST', '/api/workers', {
        ...normalizedData,
        tenantId: 'cova',
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workers'] });
      toast({
        title: "Başarılı",
        description: "Çalışan başarıyla eklendi",
      });
      setIsAddDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Çalışan eklenemedi",
        variant: "destructive",
      });
    },
  });

  // Update employment mutation
  const updateEmploymentMutation = useMutation({
    mutationFn: async ({ employmentId, data }: { employmentId: number; data: Partial<typeof formData> }) => {
      const normalizedData = normalizeFormData(data as typeof formData);
      const res = await apiRequest('PATCH', `/api/employments/${employmentId}`, normalizedData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workers'] });
      toast({
        title: "Başarılı",
        description: "Çalışan bilgileri güncellendi",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Güncelleme başarısız oldu",
        variant: "destructive",
      });
    },
  });

  // Calculate age from birth date
  const calculateAge = (birthDate: string | null | undefined) => {
    if (!birthDate) return "?";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Gender display helper
  const getGenderDisplay = (gender: "male" | "female") => {
    return gender === "male" ? "Erkek" : "Kadın";
  };

  // Employment status badge for federated model
  const getStatusBadge = (worker: Worker) => {
    switch (worker.status) {
      case "active":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" data-testid={`badge-status-${worker.id}`}>
            Aktif
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-300" data-testid={`badge-status-${worker.id}`}>
            Pasif
          </Badge>
        );
      case "former":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" data-testid={`badge-status-${worker.id}`}>
            Eski Çalışan {worker.endDate && `(${new Date(worker.endDate).toLocaleDateString("tr-TR")})`}
          </Badge>
        );
      case "invited":
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" data-testid={`badge-status-${worker.id}`}>
            Davet Edildi
          </Badge>
        );
      default:
        return null;
    }
  };
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  
  // Form states (federated model)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "" as "male" | "female" | "",
    nationality: "",
    email: "",
    phone: "",
    jobTitle: "",
    department: "",
    startDate: "",
  });

  const filteredWorkers = workers
    .filter((worker) =>
      `${worker.firstName} ${worker.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (worker.nationality && worker.nationality.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (worker.jobTitle && worker.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (worker.department && worker.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      worker.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
  
  
  const handleOpenAddDialog = () => {
    setFormData({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      nationality: "",
      email: "",
      phone: "",
      jobTitle: "",
      department: "",
      startDate: new Date().toISOString().split('T')[0],
    });
    setIsAddDialogOpen(true);
  };
  
  const handleOpenEditDialog = (worker: Worker) => {
    setSelectedWorker(worker);
    setFormData({
      firstName: worker.firstName,
      lastName: worker.lastName,
      dateOfBirth: worker.dateOfBirth || "",
      gender: worker.gender,
      nationality: worker.nationality || "",
      email: worker.email,
      phone: worker.phone || "",
      jobTitle: worker.jobTitle || "",
      department: worker.department || "",
      startDate: worker.startDate,
    });
    setIsEditDialogOpen(true);
  };
  
  const handleSaveWorker = () => {
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.gender || !formData.email) {
      toast({
        title: "Hata",
        description: "Lütfen zorunlu alanları doldurun (Ad, Soyad, Cinsiyet, E-posta)",
        variant: "destructive",
      });
      return;
    }

    if (selectedWorker) {
      // Edit mode - update employment
      updateEmploymentMutation.mutate({ 
        employmentId: selectedWorker.employmentId, 
        data: formData 
      });
    } else {
      // Add mode
      createWorkerMutation.mutate(formData);
    }
    setSelectedWorker(null);
  };
  

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
                            {worker.dateOfBirth && (
                              <span className="text-sm text-muted-foreground" data-testid={`text-worker-age-${worker.id}`}>
                                ({calculateAge(worker.dateOfBirth)})
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {worker.dateOfBirth || "Doğum tarihi yok"}
                            <span className="ml-2" data-testid={`text-worker-email-${worker.id}`}>
                              • {worker.email}
                            </span>
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
                    <TableCell>{getGenderDisplay(worker.gender)}</TableCell>
                    <TableCell>{worker.nationality || "-"}</TableCell>
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
                <Label htmlFor="add-dateOfBirth">Doğum Tarihi</Label>
                <Input
                  id="add-dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  data-testid="input-worker-dateOfBirth"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-gender">Cinsiyet *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value: "male" | "female") => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger id="add-gender" data-testid="select-worker-gender">
                    <SelectValue placeholder="Cinsiyet seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Erkek</SelectItem>
                    <SelectItem value="female">Kadın</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-nationality">Uyruk</Label>
                <Input
                  id="add-nationality"
                  placeholder="Türkiye"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  data-testid="input-worker-nationality"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-email">E-posta *</Label>
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
              
              <div className="space-y-2">
                <Label htmlFor="add-startDate">İşe Başlama Tarihi</Label>
                <Input
                  id="add-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  data-testid="input-worker-startDate"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-jobTitle">Pozisyon</Label>
                <Input
                  id="add-jobTitle"
                  placeholder="Temizlik Görevlisi"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  data-testid="input-worker-jobTitle"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="add-department">Departman</Label>
                <Input
                  id="add-department"
                  placeholder="Operasyon"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  data-testid="input-worker-department"
                />
              </div>
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
                <Label htmlFor="edit-dateOfBirth">Doğum Tarihi</Label>
                <Input
                  id="edit-dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  data-testid="input-edit-worker-dateOfBirth"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-gender">Cinsiyet *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value: "male" | "female") => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger id="edit-gender" data-testid="select-edit-worker-gender">
                    <SelectValue placeholder="Cinsiyet seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Erkek</SelectItem>
                    <SelectItem value="female">Kadın</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nationality">Uyruk</Label>
                <Input
                  id="edit-nationality"
                  placeholder="Türkiye"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  data-testid="input-edit-worker-nationality"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">E-posta *</Label>
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
              
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">İşe Başlama Tarihi</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  data-testid="input-edit-worker-startDate"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-jobTitle">Pozisyon</Label>
                <Input
                  id="edit-jobTitle"
                  placeholder="Temizlik Görevlisi"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  data-testid="input-edit-worker-jobTitle"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-department">Departman</Label>
                <Input
                  id="edit-department"
                  placeholder="Operasyon"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  data-testid="input-edit-worker-department"
                />
              </div>
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

    </div>
  );
}
