import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import FilterPanel from "@/components/FilterPanel";
import CapacityWidget from "@/components/CapacityWidget";
import HouseCard from "@/components/HouseCard";
import WorkerAssignmentModal from "@/components/WorkerAssignmentModal";
import GenderWarningModal from "@/components/GenderWarningModal";
import LeaseContractDialog from "@/components/LeaseContractDialog";
import { SearchCombobox } from "@/components/ui/search-combobox";
import { ModernDatePicker } from "@/components/ui/modern-date-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useToast } from "@/hooks/use-toast";
import { FileText, Bell, Calendar, AlertCircle, Plus, ChevronDown, ChevronUp, MapPin, Clock, CheckCircle, Check, ChevronsUpDown, UserPlus, Info } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Lease contract type (for rented properties)
type LeaseContract = {
  startDate: string;
  endDate?: string;
  monthlyRent: number;
  currency: string;
  paymentDay: number;
};

// Reminder/Alert type
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
};

// House type (from API)
type House = {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  ownershipType: "rent" | "owned";
  status: "active" | "inactive";
  rooms: {
    id: string;
    roomNumber: string;
    floor: number | null;
    beds: {
      id: string;
      bedNumber: number;
      status: "available" | "occupied" | "reserved" | "out_of_service";
      worker?: {
        employmentId: string;
        name: string;
        gender: "male" | "female";
      };
      expectedMoveOutDate?: string;
      expectedMoveInDate?: string;
    }[];
  }[];
  totalBeds: number;
  occupiedBeds: number;
  // Local-only fields (not from API yet)
  reminders?: Reminder[];
  leaseContract?: LeaseContract;
};


export default function HousingDashboard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to login if not authenticated (using useEffect to avoid hook call during render)
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLocation("/");
    }
  }, [isAuthenticated, user, setLocation]);

  // Show nothing while redirecting
  if (!isAuthenticated || !user) {
    return null;
  }

  // State for houses (synced from API)
  const [houses, setHouses] = useState<House[]>([]);

  // Get today's date in YYYY-MM-DD format for API
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Fetch houses from API with selected date
  const { data: apiHouses, isLoading: housesLoading } = useQuery<House[]>({
    queryKey: [`/api/houses?tenantId=${user.tenantId}&date=${todayStr}`],
    enabled: !!user.tenantId,
  });

  // Sync houses from API and default empty reminders/leaseContract
  useEffect(() => {
    if (apiHouses) {
      setHouses(apiHouses.map(house => ({
        ...house,
        reminders: house.reminders || [],
        leaseContract: house.leaseContract || undefined,
      })));
    }
  }, [apiHouses]);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [selectedBed, setSelectedBed] = useState<any>(null);
  const [checkInWizardOpen, setCheckInWizardOpen] = useState(false);
  const [colorInfoDialogOpen, setColorInfoDialogOpen] = useState(false);
  
  // Check-in wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [workerComboboxOpen, setWorkerComboboxOpen] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<{
    show: boolean;
    message: string;
    reservationDate: string;
  } | null>(null);
  const [wizardData, setWizardData] = useState({
    // Step 1: Tarih & Filtreler
    startDate: "",
    endDate: "",
    searchCity: "all",
    searchType: "any" as "room" | "bed" | "any", // Oda mı, yatak mı arıyor
    // Step 2: İşçi
    employmentId: "",
    workerName: "",
    // Step 3: Oda/Yatak
    houseId: "",
    houseName: "",
    roomId: "",
    bedId: "",
    // Step 4: Fiyat
    monthlyRate: 600,
    depositAmount: 500,
    depositCollected: false,
    depositCollector: "",
  });

  // Fetch workers from API (federated model)
  type Worker = {
    id: string;
    employmentId: string;
    firstName: string;
    lastName: string;
    gender: string;
    dateOfBirth: string;
    status: string;
  };
  
  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: [`/api/workers?tenantId=${user?.tenantId}`],
    enabled: !!user?.tenantId,
  });

  // Quick worker registration state
  const [quickRegisterOpen, setQuickRegisterOpen] = useState(false);
  const [quickRegisterData, setQuickRegisterData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "" as "male" | "female" | "",
  });

  // Quick worker registration mutation
  const createWorkerMutation = useMutation({
    mutationFn: async (data: typeof quickRegisterData) => {
      const res = await apiRequest("POST", "/api/workers", {
        email: `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}@worker.com`,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        phone: "+31 6 0000 0000",
        nationality: "Türkiye",
        tenantId: user?.tenantId || "tenant-cova",
      });
      return res.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [`/api/workers?tenantId=${user?.tenantId}`] });
      const fullName = `${quickRegisterData.firstName} ${quickRegisterData.lastName}`;
      setWizardData({
        ...wizardData,
        employmentId: result.employmentId,
        workerName: fullName,
      });
      setQuickRegisterData({ firstName: "", lastName: "", dateOfBirth: "", gender: "" });
      setQuickRegisterOpen(false);
      toast({
        title: "İşçi Eklendi",
        description: `${fullName} başarıyla eklendi ve seçildi.`,
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "İşçi eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Prepare upcoming reminders for notifications dialog
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingReminders = houses.flatMap(house => {
    if (!house.reminders) return [];
    
    return house.reminders
      .filter(reminder => {
        // Exclude completed reminders from upcoming list
        if (reminder.completed) return false;
        
        const reminderDate = new Date(reminder.date);
        reminderDate.setHours(0, 0, 0, 0);
        const daysUntil = Math.ceil((reminderDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil >= 0 && daysUntil <= reminder.alertDaysBefore;
      })
      .map(reminder => ({
        ...reminder,
        houseName: house.name,
        houseId: house.id,
      }));
  });
  
  // Get all completed reminders (regardless of date)
  const completedReminders = houses.flatMap(house => {
    if (!house.reminders) return [];
    
    return house.reminders
      .filter(reminder => reminder.completed)
      .map(reminder => ({
        ...reminder,
        houseName: house.name,
        houseId: house.id,
      }));
  });
  
  // Combine upcoming + completed for dialog display
  const allRemindersForDialog = [...upcomingReminders, ...completedReminders];
  
  const upcomingRemindersCount = upcomingReminders.length;
  
  // Reminder management functions
  const handleCompleteReminder = (reminderId: string) => {
    setHouses(prevHouses =>
      prevHouses.map(house => ({
        ...house,
        reminders: house.reminders?.map(reminder =>
          reminder.id === reminderId
            ? { ...reminder, completed: true, completedAt: new Date().toISOString() }
            : reminder
        ),
      }))
    );
    
    toast({
      title: "Hatırlatma tamamlandı",
      description: "Hatırlatma başarıyla tamamlandı olarak işaretlendi.",
    });
  };
  
  const handleAddNoteToReminder = (reminderId: string, note: string) => {
    setHouses(prevHouses =>
      prevHouses.map(house => ({
        ...house,
        reminders: house.reminders?.map(reminder =>
          reminder.id === reminderId ? { ...reminder, note } : reminder
        ),
      }))
    );
    
    toast({
      title: "Not eklendi",
      description: "Hatırlatmaya not başarıyla eklendi.",
    });
  };

  // Filter states
  const [dateString, setDateString] = useState(new Date().toISOString().split("T")[0]);
  const [selectedHouse, setSelectedHouse] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [showEmptyOnly, setShowEmptyOnly] = useState(false);
  
  // Lease contract state
  const [isLeaseDialogOpen, setIsLeaseDialogOpen] = useState(false);
  const [selectedHouseForLease, setSelectedHouseForLease] = useState<House | null>(null);
  
  // Reminders state
  const [isRemindersDialogOpen, setIsRemindersDialogOpen] = useState(false);
  const [selectedHouseForReminders, setSelectedHouseForReminders] = useState<House | null>(null);
  
  // UI state for mobile
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Filter houses based on selected filters
  const filteredHouses = houses
    .filter((house) => {
      // Filter by house
      if (selectedHouse !== "all" && house.id !== selectedHouse) {
        return false;
      }

      // Filter by city
      if (selectedCity !== "all" && house.city.toLowerCase() !== selectedCity) {
        return false;
      }

      // Filter by country
      if (selectedCountry !== "all" && house.country !== selectedCountry) {
        return false;
      }

      // Filter by empty beds only (has at least one empty bed)
      if (showEmptyOnly && house.totalBeds === house.occupiedBeds) {
        return false;
      }

      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'tr-TR')); // Sort alphabetically by name

  const totalBeds = filteredHouses.reduce((sum, house) => sum + house.totalBeds, 0);
  const occupiedBeds = filteredHouses.reduce((sum, house) => sum + house.occupiedBeds, 0);
  const emptyBeds = totalBeds - occupiedBeds;

  // Helper: Calculate upcoming check-outs (within 30 days)
  const getUpcomingVacancies = (house: House) => {
    const vacancies: { bedNumber: number; roomNumber: string; daysUntil: number; workerName: string }[] = [];
    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    house.rooms.forEach((room) => {
      room.beds.forEach((bed: any) => {
        if (bed.expectedMoveOutDate) {
          const moveOutDate = new Date(bed.expectedMoveOutDate);
          if (moveOutDate >= today && moveOutDate <= thirtyDaysLater) {
            const daysUntil = Math.ceil((moveOutDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            vacancies.push({
              bedNumber: bed.bedNumber,
              roomNumber: room.roomNumber,
              daysUntil,
              workerName: bed.worker?.name || "Bilinmiyor",
            });
          }
        }
      });
    });

    return vacancies.sort((a, b) => a.daysUntil - b.daysUntil);
  };

  // Helper: Calculate upcoming check-ins (within 30 days)
  const getUpcomingCheckIns = (house: House) => {
    const checkIns: { bedNumber: number; roomNumber: string; daysUntil: number; workerName: string }[] = [];
    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    house.rooms.forEach((room) => {
      room.beds.forEach((bed: any) => {
        if (bed.expectedMoveInDate) {
          const moveInDate = new Date(bed.expectedMoveInDate);
          if (moveInDate >= today && moveInDate <= thirtyDaysLater) {
            const daysUntil = Math.ceil((moveInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            checkIns.push({
              bedNumber: bed.bedNumber,
              roomNumber: room.roomNumber,
              daysUntil,
              workerName: bed.reservedForWorkerName || "Yeni işçi",
            });
          }
        }
      });
    });

    return checkIns.sort((a, b) => a.daysUntil - b.daysUntil);
  };

  const handleBedClick = (bed: any) => {
    setSelectedBed(bed);
    if (bed.status === "available") {
      setAssignmentModalOpen(true);
    }
  };

  // Quick worker registration handler
  const handleQuickRegister = () => {
    if (!quickRegisterData.firstName || !quickRegisterData.lastName || !quickRegisterData.dateOfBirth || !quickRegisterData.gender) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tüm alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    createWorkerMutation.mutate(quickRegisterData);
  };

  // Wizard handlers
  const handleWizardNext = () => {
    // Step 1: Tarih validation
    if (wizardStep === 1 && !wizardData.startDate) {
      toast({
        title: "Başlangıç Tarihi Gerekli",
        description: "Devam etmek için başlangıç tarihini seçmelisiniz.",
        variant: "destructive",
      });
      return;
    }
    
    // Step 2: İşçi validation
    if (wizardStep === 2 && !wizardData.employmentId) {
      toast({
        title: "İşçi Seçimi Gerekli",
        description: "Devam etmek için bir işçi seçmelisiniz.",
        variant: "destructive",
      });
      return;
    }
    
    // Step 3: Oda/Yatak validation
    if (wizardStep === 3 && !wizardData.bedId) {
      toast({
        title: "Oda/Yatak Seçimi Gerekli",
        description: "Devam etmek için bir yatak seçmelisiniz.",
        variant: "destructive",
      });
      return;
    }
    
    if (wizardStep < 4) setWizardStep(wizardStep + 1);
  };

  const handleWizardBack = () => {
    if (wizardStep > 1) setWizardStep(wizardStep - 1);
  };

  const handleWizardComplete = async () => {
    // Final validation
    if (!wizardData.employmentId || !wizardData.bedId || !wizardData.startDate) {
      toast({
        title: "Eksik Bilgiler",
        description: "İşçi, yatak ve başlangıç tarihi seçimi zorunludur.",
        variant: "destructive",
      });
      return;
    }
    
    // Find selected worker
    const selectedWorker = workers.find(w => w.employmentId === wizardData.employmentId);
    if (!selectedWorker) {
      toast({
        title: "Hata",
        description: "Seçili işçi bulunamadı.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Call backend API to create reservation in database
      const response = await apiRequest("POST", `/api/beds/${wizardData.bedId}/check-in`, {
        employmentId: wizardData.employmentId,
        startDate: wizardData.startDate,
        endDate: wizardData.endDate || null,
        checkInDate: wizardData.startDate, // Check in immediately
        tenantId: user.tenantId,
      });

      if (!response.ok) {
        throw new Error("Failed to create reservation");
      }

      // Invalidate queries to refresh data from backend
      await queryClient.invalidateQueries({ queryKey: [`/api/houses?tenantId=${user.tenantId}`] });

      toast({
        title: "Konaklama Girişi Başarılı",
        description: `${selectedWorker.firstName} ${selectedWorker.lastName} için ${wizardData.houseName} oteline konaklama kaydı oluşturuldu.`,
      });
      
      // Reset wizard
      setCheckInWizardOpen(false);
      setWizardStep(1);
      setWizardData({
        startDate: "",
        endDate: "",
        searchCity: "all",
        searchType: "any",
        employmentId: "",
        workerName: "",
        houseId: "",
        houseName: "",
        roomId: "",
        bedId: "",
        monthlyRate: 600,
        depositAmount: 500,
        depositCollected: false,
        depositCollector: "",
      });
    } catch (error) {
      console.error("Check-in error:", error);
      toast({
        title: "Hata",
        description: "Konaklama girişi sırasında bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  // Get available rooms and beds (filtered by Step 1 selections)
  const getAvailableRoomsAndBeds = () => {
    const availableOptions: any[] = [];
    
    houses.forEach(house => {
      // Apply city filter from Step 1
      if (wizardData.searchCity !== "all" && house.city.toLowerCase() !== wizardData.searchCity) {
        return; // Skip this house if city doesn't match
      }
      
      if (!house.rooms || house.rooms.length === 0) {
        return;
      }
      
      house.rooms.forEach((room: any) => {
        if (!room.beds || room.beds.length === 0) {
          return;
        }
        
        room.beds.forEach((bed: any) => {
          if (bed.status === "available") {
            availableOptions.push({
              houseId: house.id,
              houseName: house.name,
              houseCity: house.city,
              roomId: room.id,
              roomNumber: room.roomNumber,
              bedId: bed.id,
              bedNumber: bed.bedNumber,
            });
          }
        });
      });
    });
    
    return availableOptions;
  };

  // Show loading skeleton while fetching houses
  if (housesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          tenantName={user.tenantName || "ARPDO"} 
          userName={`${user.firstName} ${user.lastName}`} 
          upcomingRemindersCount={0}
          upcomingReminders={[]}
          onCompleteReminder={() => {}}
          onAddNote={() => {}}
        />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        tenantName={user.tenantName || "ARPDO"} 
        userName={`${user.firstName} ${user.lastName}`} 
        upcomingRemindersCount={upcomingRemindersCount}
        upcomingReminders={allRemindersForDialog as any}
        onCompleteReminder={handleCompleteReminder}
        onAddNote={handleAddNoteToReminder}
      />

      {/* Mobile-first responsive layout */}
      <div className="lg:grid lg:grid-cols-[320px_1fr]">
        {/* Left Sidebar - Desktop only, sticky */}
        <aside className="hidden lg:block border-r bg-muted/30 min-h-[calc(100vh-4rem)] p-6 sticky top-16 overflow-y-auto">
          <div className="space-y-6">
            <CapacityWidget
              totalBeds={totalBeds}
              occupiedBeds={occupiedBeds}
              emptyBeds={emptyBeds}
              oosBeds={1}
            />
            <FilterPanel
              dateString={dateString}
              setDateString={setDateString}
              selectedHouse={selectedHouse}
              setSelectedHouse={setSelectedHouse}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              showEmptyOnly={showEmptyOnly}
              setShowEmptyOnly={setShowEmptyOnly}
              houses={houses}
            />
          </div>
        </aside>

        <main className="flex-1">
          {/* Mobile Top Section - Sticky */}
          <div className="lg:hidden sticky top-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 border-b">
            <div className="p-4 space-y-3">
              {/* Capacity Summary - Always Visible */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-card border rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">{t('housing.total')}</p>
                  <p className="text-2xl font-bold">{totalBeds}</p>
                </div>
                <div className="bg-card border rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">{t('housing.occupiedBeds')}</p>
                  <p className="text-2xl font-bold text-green-600">{occupiedBeds}</p>
                </div>
                <div className="bg-card border rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">{t('housing.empty')}</p>
                  <p className="text-2xl font-bold text-red-600">{emptyBeds}</p>
                </div>
              </div>

              {/* Collapsible Filters */}
              <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between" size="sm">
                    <span>{t('dashboard.filters')}</span>
                    {isFiltersOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3">
                  <FilterPanel
                    dateString={dateString}
                    setDateString={setDateString}
                    selectedHouse={selectedHouse}
                    setSelectedHouse={setSelectedHouse}
                    selectedCity={selectedCity}
                    setSelectedCity={setSelectedCity}
                    selectedCountry={selectedCountry}
                    setSelectedCountry={setSelectedCountry}
                    showEmptyOnly={showEmptyOnly}
                    setShowEmptyOnly={setShowEmptyOnly}
                    houses={houses}
                  />
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="p-4 lg:p-6">
            <div className="max-w-7xl mx-auto space-y-4">
              <div className="hidden lg:flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold">{t('dashboard.title')}</h2>
                    <button 
                      onClick={() => setColorInfoDialogOpen(true)}
                      className="text-muted-foreground hover-elevate active-elevate-2 rounded-full p-1 transition-colors" 
                      data-testid="button-color-info"
                    >
                      <Info className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-muted-foreground">
                    {t('dashboard.subtitle')}
                  </p>
                </div>
                <Button 
                  onClick={() => setCheckInWizardOpen(true)}
                  data-testid="button-new-check-in"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('dashboard.newCheckIn')}
                </Button>
              </div>

              {/* House List */}
              <div className="space-y-3">
                {filteredHouses.length > 0 ? (
                  <Accordion type="multiple" className="space-y-3">
                    {filteredHouses.map((house) => {
                      const upcomingVacancies = getUpcomingVacancies(house);
                      const upcomingCheckIns = getUpcomingCheckIns(house);
                      return (
                        <AccordionItem
                          key={house.id}
                          value={house.id}
                          className="border rounded-lg bg-card"
                        >
                          <AccordionTrigger className="px-4 py-3 hover:no-underline">
                            <div className="flex flex-1 items-center justify-between gap-3 text-left">
                              <div className="flex-1">
                                <h3 className="font-semibold text-base md:text-lg flex items-center gap-2 flex-wrap">
                                  {house.name}
                                  <span className="text-sm font-normal text-muted-foreground">
                                    - {house.occupiedBeds}/{house.totalBeds} {t('housing.occupiedBeds')}
                                  </span>
                                  {upcomingVacancies.length > 0 && (
                                    <Badge variant="outline" className="text-amber-600 border-amber-600">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {upcomingVacancies.length} {t('housing.checkingOutBadge')}
                                    </Badge>
                                  )}
                                  {upcomingCheckIns.length > 0 && (
                                    <Badge variant="outline" className="text-green-600 border-green-600">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {upcomingCheckIns.length} {t('housing.checkingInBadge')}
                                    </Badge>
                                  )}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                  <MapPin className="w-3 h-3" />
                                  {house.city}
                                  <span>•</span>
                                  <span>{house.totalBeds - house.occupiedBeds > 0 ? `${house.totalBeds - house.occupiedBeds} ${t('housing.emptyBeds')}` : t('housing.fullOccupancy')}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={house.occupiedBeds === house.totalBeds ? "destructive" : "secondary"}>
                                  {house.occupiedBeds}/{house.totalBeds} • %{Math.round((house.occupiedBeds / house.totalBeds) * 100)}
                                </Badge>
                              </div>
                            </div>
                          </AccordionTrigger>
                        
                        <AccordionContent className="px-4 pb-4">
                          {upcomingVacancies.length > 0 && (
                            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
                              <div className="flex items-start gap-2">
                                <Clock className="w-4 h-4 text-amber-600 mt-0.5" />
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm text-amber-900 dark:text-amber-100 mb-2">
                                    {t('housing.upcomingCheckOuts')}
                                  </h4>
                                  <div className="space-y-1">
                                    {upcomingVacancies.map((vacancy, idx) => (
                                      <div key={idx} className="text-sm text-amber-800 dark:text-amber-200">
                                        <span className="font-medium">{t('housing.room')} {vacancy.roomNumber}</span>
                                        <span className="text-amber-600 dark:text-amber-400"> • </span>
                                        <span>{t('housing.bed')} {vacancy.bedNumber}</span>
                                        <span className="text-amber-600 dark:text-amber-400"> • </span>
                                        <span className="font-medium">{vacancy.daysUntil} {t('housing.daysLater')}</span>
                                        <span className="text-amber-600 dark:text-amber-400"> • </span>
                                        <span>{vacancy.workerName}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {upcomingCheckIns.length > 0 && (
                            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                              <div className="flex items-start gap-2">
                                <Clock className="w-4 h-4 text-green-600 mt-0.5" />
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm text-green-900 dark:text-green-100 mb-2">
                                    {t('housing.upcomingCheckIns')}
                                  </h4>
                                  <div className="space-y-1">
                                    {upcomingCheckIns.map((checkIn, idx) => (
                                      <div key={idx} className="text-sm text-green-800 dark:text-green-200">
                                        <span className="font-medium">{t('housing.room')} {checkIn.roomNumber}</span>
                                        <span className="text-green-600 dark:text-green-400"> • </span>
                                        <span>{t('housing.bed')} {checkIn.bedNumber}</span>
                                        <span className="text-green-600 dark:text-green-400"> • </span>
                                        <span className="font-medium">{checkIn.daysUntil} {t('housing.daysLater')}</span>
                                        <span className="text-green-600 dark:text-green-400"> • </span>
                                        <span>{checkIn.workerName}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <HouseCard
                            name={house.name}
                            city={house.city}
                            totalBeds={house.totalBeds}
                            occupiedBeds={house.occupiedBeds}
                            rooms={house.rooms}
                            ownershipType={house.ownershipType}
                            onBedClick={handleBedClick}
                            onLeaseClick={() => {
                              setSelectedHouseForLease(house);
                              setIsLeaseDialogOpen(true);
                            }}
                          />
                          
                          <div className="flex gap-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedHouseForReminders(house);
                                setIsRemindersDialogOpen(true);
                              }}
                              data-testid={`button-reminders-${house.id}`}
                            >
                              <Bell className="w-4 h-4 mr-2" />
                              {t('housing.reminders')}
                              {house.reminders && house.reminders.length > 0 && (
                                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                                  {house.reminders.length}
                                </Badge>
                              )}
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      );
                    })}
                  </Accordion>
                ) : (
                  <div className="text-center py-12 bg-card rounded-lg border" data-testid="text-no-houses">
                    <p className="text-muted-foreground">Seçilen filtrelere uygun konut bulunamadı</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <WorkerAssignmentModal
        open={assignmentModalOpen}
        onClose={() => setAssignmentModalOpen(false)}
        bedNumber={selectedBed?.bedNumber}
        roomNumber="45"
      />

      <GenderWarningModal
        open={warningModalOpen}
        onClose={() => setWarningModalOpen(false)}
        onMarkAsCouple={() => {
          console.log("Marked as couple");
          setWarningModalOpen(false);
        }}
        onReassign={() => {
          console.log("Reassigning");
          setWarningModalOpen(false);
        }}
        onContinueAnyway={() => {
          console.log("Continuing");
          setWarningModalOpen(false);
        }}
        workerName="Jane Smith"
        roomNumber="45"
      />

      {/* Lease Contract Dialog */}
      <Dialog open={isLeaseDialogOpen} onOpenChange={setIsLeaseDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kira Sözleşmesi Bilgileri</DialogTitle>
            <DialogDescription>
              {selectedHouseForLease?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedHouseForLease?.leaseContract ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Başlangıç Tarihi</p>
                  <p className="font-medium" data-testid="text-lease-start">
                    {new Date(selectedHouseForLease.leaseContract.startDate).toLocaleDateString("tr-TR")}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Bitiş Tarihi</p>
                  <p className="font-medium" data-testid="text-lease-end">
                    {selectedHouseForLease.leaseContract.endDate 
                      ? new Date(selectedHouseForLease.leaseContract.endDate).toLocaleDateString("tr-TR")
                      : "Belirsiz"}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Aylık Kira</p>
                  <p className="text-2xl font-semibold" data-testid="text-lease-rent">
                    {selectedHouseForLease.leaseContract.monthlyRent.toLocaleString()} {selectedHouseForLease.leaseContract.currency}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Ödeme Günü</p>
                  <p className="font-medium" data-testid="text-lease-payment-day">
                    Her ayın {selectedHouseForLease.leaseContract.paymentDay}. günü
                  </p>
                </div>
              </div>
              
              {selectedHouseForLease.leaseContract.endDate && (
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Sözleşme Bitiş Uyarısı</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Sözleşme {Math.ceil(
                          (new Date(selectedHouseForLease.leaseContract.endDate).getTime() - new Date().getTime()) / 
                          (1000 * 60 * 60 * 24)
                        )} {t('housing.daysLater')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Bu konut için kira sözleşmesi bilgisi bulunamadı</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reminders Dialog */}
      <Dialog open={isRemindersDialogOpen} onOpenChange={setIsRemindersDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('housing.reminders')}</DialogTitle>
            <DialogDescription>
              {selectedHouseForReminders?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedHouseForReminders?.reminders && selectedHouseForReminders.reminders.length > 0 ? (
              <div className="space-y-3">
                {selectedHouseForReminders.reminders.map((reminder) => {
                  const daysUntil = Math.ceil(
                    (new Date(reminder.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );
                  const shouldAlert = daysUntil <= reminder.alertDaysBefore && daysUntil >= 0;
                  
                  const typeLabels = {
                    maintenance: "Bakım",
                    lease_end: "Kira Sonu",
                    meter_reading: "Sayaç Okuma",
                    inspection: "Denetim",
                    other: "Diğer",
                  };
                  
                  const typeColors = {
                    maintenance: "bg-blue-100 text-blue-700",
                    lease_end: "bg-purple-100 text-purple-700",
                    meter_reading: "bg-green-100 text-green-700",
                    inspection: "bg-amber-100 text-amber-700",
                    other: "bg-gray-100 text-gray-700",
                  };
                  
                  return (
                    <div
                      key={reminder.id}
                      className={cn(
                        "p-4 rounded-lg border",
                        shouldAlert ? "bg-amber-50 border-amber-300" : "bg-card"
                      )}
                      data-testid={`reminder-${reminder.id}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={typeColors[reminder.type]} variant="secondary">
                              {typeLabels[reminder.type]}
                            </Badge>
                            {reminder.recurring && reminder.recurring !== "none" && (
                              <Badge variant="outline" className="text-xs">
                                {reminder.recurring === "monthly" ? "Aylık" : "Yıllık"}
                              </Badge>
                            )}
                            {shouldAlert && (
                              <Badge variant="default" className="bg-amber-600">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Yaklaşıyor
                              </Badge>
                            )}
                          </div>
                          
                          <h4 className="font-semibold mb-1" data-testid={`text-reminder-title-${reminder.id}`}>
                            {reminder.title}
                          </h4>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(reminder.date).toLocaleDateString("tr-TR")}
                            </div>
                            <div>
                              {daysUntil > 0 ? `${daysUntil} ${t('housing.daysLater')}` : daysUntil === 0 ? t('common.today') : `${Math.abs(daysUntil)} gün önce`}
                            </div>
                          </div>
                          
                          {reminder.note && (
                            <p className="text-sm text-muted-foreground mt-2" data-testid={`text-reminder-note-${reminder.id}`}>
                              {reminder.note}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Henüz hatırlatıcı eklenmedi</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Check-in Wizard Dialog */}
      <Dialog open={checkInWizardOpen} onOpenChange={(open) => {
        setCheckInWizardOpen(open);
        if (!open) {
          setWizardStep(1);
          setWizardData({
            startDate: "",
            endDate: "",
            searchCity: "all",
            searchType: "any",
            employmentId: "",
            workerName: "",
            houseId: "",
            houseName: "",
            roomId: "",
            bedId: "",
            monthlyRate: 600,
            depositAmount: 500,
            depositCollected: false,
            depositCollector: "",
          });
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('checkIn.wizard.title')}</DialogTitle>
            <DialogDescription>
              {wizardStep === 1 && t('checkIn.wizard.step1Description')}
              {wizardStep === 2 && t('checkIn.wizard.step2Description')}
              {wizardStep === 3 && t('checkIn.wizard.step3Description')}
              {wizardStep === 4 && t('checkIn.wizard.step4Description')}
            </DialogDescription>
          </DialogHeader>

          {/* Horizontal Stepper - 4 Steps */}
          <div className="flex items-center justify-center gap-2 py-6">
            {/* Step 1: Tarih & Filtreler */}
            <div className="flex flex-col items-center gap-2">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-colors",
                wizardStep > 1 ? "bg-green-500 text-white" : wizardStep === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {wizardStep > 1 ? <Check className="w-6 h-6" /> : "1"}
              </div>
              <span className="text-xs text-muted-foreground text-center">
                {t('checkIn.wizard.step1Line1')}<br/>{t('checkIn.wizard.step1Line2')}
              </span>
            </div>

            {/* Connector 1-2 */}
            <div className={cn(
              "w-16 h-1 rounded-full transition-colors",
              wizardStep > 1 ? "bg-green-500" : "bg-muted"
            )} />

            {/* Step 2: İşçi */}
            <div className="flex flex-col items-center gap-2">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-colors",
                wizardStep > 2 ? "bg-green-500 text-white" : wizardStep === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {wizardStep > 2 ? <Check className="w-6 h-6" /> : "2"}
              </div>
              <span className="text-xs text-muted-foreground">{t('checkIn.wizard.step2')}</span>
            </div>

            {/* Connector 2-3 */}
            <div className={cn(
              "w-16 h-1 rounded-full transition-colors",
              wizardStep > 2 ? "bg-green-500" : "bg-muted"
            )} />

            {/* Step 3: Oda/Yatak */}
            <div className="flex flex-col items-center gap-2">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-colors",
                wizardStep > 3 ? "bg-green-500 text-white" : wizardStep === 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {wizardStep > 3 ? <Check className="w-6 h-6" /> : "3"}
              </div>
              <span className="text-xs text-muted-foreground text-center">
                {t('checkIn.wizard.step3Line1')}<br/>{t('checkIn.wizard.step3Line2')}
              </span>
            </div>

            {/* Connector 3-4 */}
            <div className={cn(
              "w-16 h-1 rounded-full transition-colors",
              wizardStep > 3 ? "bg-green-500" : "bg-muted"
            )} />

            {/* Step 4: Fiyat */}
            <div className="flex flex-col items-center gap-2">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-colors",
                wizardStep === 4 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                4
              </div>
              <span className="text-xs text-muted-foreground">{t('checkIn.wizard.step4')}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Step 1: Tarih & Filtreler */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wizard-start-date">{t('checkIn.wizard.startDateRequired')}</Label>
                  <ModernDatePicker
                    date={wizardData.startDate ? new Date(wizardData.startDate) : undefined}
                    onDateChange={(date) => {
                      const dateString = date ? date.toISOString().split('T')[0] : "";
                      setWizardData({ ...wizardData, startDate: dateString });
                    }}
                    placeholder={t('checkIn.wizard.selectDate')}
                    data-testid="input-wizard-start-date"
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    {t('checkIn.wizard.firstDayStaying')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{t('filters.city')}</Label>
                  <SearchCombobox
                    options={[
                      { value: "all", label: t('checkIn.wizard.allCities') },
                      ...Array.from(new Set(houses.map(h => h.city))).map(city => ({
                        value: city.toLowerCase(),
                        label: city
                      }))
                    ]}
                    value={wizardData.searchCity}
                    onValueChange={(value) => setWizardData({ ...wizardData, searchCity: value })}
                    placeholder={t('checkIn.wizard.selectCity')}
                    searchPlaceholder={t('filters.searchCity')}
                    emptyText={t('filters.noCityFound')}
                    data-testid="select-wizard-city"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('checkIn.wizard.whatLookingFor')}</Label>
                  <SearchCombobox
                    options={[
                      { value: "any", label: t('checkIn.wizard.doesntMatter') },
                      { value: "room", label: t('checkIn.wizard.wholeRoom') },
                      { value: "bed", label: t('checkIn.wizard.singleBed') }
                    ]}
                    value={wizardData.searchType}
                    onValueChange={(value) => setWizardData({ ...wizardData, searchType: value as "room" | "bed" | "any" })}
                    placeholder={t('common.search')}
                    searchPlaceholder={t('common.search')}
                    emptyText={t('filters.noHouseFound')}
                    data-testid="select-wizard-search-type"
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    {t('checkIn.wizard.lookingForRoomOrBed')}
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Worker Selection */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="worker-select">{t('checkIn.wizard.selectWorker')}</Label>
                  <Popover open={workerComboboxOpen} onOpenChange={setWorkerComboboxOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={workerComboboxOpen}
                        className="w-full justify-between"
                        data-testid="select-wizard-worker"
                      >
                        {wizardData.employmentId 
                          ? (() => {
                              const worker = workers.find(w => w.employmentId === wizardData.employmentId);
                              return worker ? `${worker.firstName} ${worker.lastName} (${worker.dateOfBirth})` : t('checkIn.wizard.selectWorkerPrompt');
                            })()
                          : t('checkIn.wizard.selectWorkerPrompt')}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder={t('checkIn.wizard.searchWorker')} />
                        <CommandList>
                          <CommandEmpty>{t('checkIn.wizard.noWorkerFound')}</CommandEmpty>
                          <CommandGroup>
                            {workers.map(worker => (
                              <CommandItem
                                key={worker.employmentId}
                                value={`${worker.firstName} ${worker.lastName} ${worker.dateOfBirth}`}
                                onSelect={() => {
                                  setWizardData({
                                    ...wizardData,
                                    employmentId: worker.employmentId,
                                    workerName: `${worker.firstName} ${worker.lastName}`
                                  });
                                  setWorkerComboboxOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    wizardData.employmentId === worker.employmentId ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {worker.firstName} {worker.lastName} ({worker.dateOfBirth})
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Quick Worker Registration */}
                <Collapsible open={quickRegisterOpen} onOpenChange={setQuickRegisterOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full"
                      data-testid="button-quick-register-toggle"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {t('checkIn.newWorker.quickRegistration')}
                      {quickRegisterOpen ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                      <p className="text-sm text-muted-foreground">
                        {t('checkIn.newWorker.quickRegistrationDescription')}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="quick-firstname">{t('checkIn.newWorker.firstName')}</Label>
                          <Input
                            id="quick-firstname"
                            placeholder="Mehmet"
                            value={quickRegisterData.firstName}
                            onChange={(e) => setQuickRegisterData({ ...quickRegisterData, firstName: e.target.value })}
                            data-testid="input-quick-firstname"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="quick-lastname">{t('checkIn.newWorker.lastName')}</Label>
                          <Input
                            id="quick-lastname"
                            placeholder="Yılmaz"
                            value={quickRegisterData.lastName}
                            onChange={(e) => setQuickRegisterData({ ...quickRegisterData, lastName: e.target.value })}
                            data-testid="input-quick-lastname"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>{t('worker.birthDateRequired')}</Label>
                        <ModernDatePicker
                          date={quickRegisterData.dateOfBirth ? new Date(quickRegisterData.dateOfBirth) : undefined}
                          onDateChange={(date) => {
                            setQuickRegisterData({
                              ...quickRegisterData,
                              dateOfBirth: date ? date.toISOString().split('T')[0] : ""
                            });
                          }}
                          placeholder={t('checkIn.wizard.selectDate')}
                          className="w-full"
                          data-testid="input-quick-dob"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quick-gender">{t('worker.genderRequired')}</Label>
                        <Select
                          value={quickRegisterData.gender}
                          onValueChange={(value: "male" | "female") => setQuickRegisterData({ ...quickRegisterData, gender: value })}
                        >
                          <SelectTrigger id="quick-gender" data-testid="select-quick-gender">
                            <SelectValue placeholder={t('worker.selectGender')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">{t('gender.male')}</SelectItem>
                            <SelectItem value="female">{t('gender.female')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        onClick={handleQuickRegister}
                        className="w-full"
                        data-testid="button-quick-register-save"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        {t('checkIn.newWorker.saveAndSelect')}
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            {/* Step 3: Room/Bed Selection */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>{t('housing.selectAvailableRoomAndBed')}</Label>
                  <div className="border rounded-lg max-h-[400px] overflow-y-auto">
                    {housesLoading ? (
                      <div className="p-8 text-center text-muted-foreground">
                        Yükleniyor...
                      </div>
                    ) : getAvailableRoomsAndBeds().length > 0 ? (
                      <div className="divide-y">
                        {getAvailableRoomsAndBeds().map((option: any) => (
                          <div
                            key={`${option.houseId}-${option.roomId}-${option.bedId}`}
                            onClick={async () => {
                              console.log('Bed clicked:', option.bedId, 'Start date:', wizardData.startDate);
                              
                              // Select bed first
                              setWizardData({
                                ...wizardData,
                                houseId: option.houseId,
                                houseName: option.houseName,
                                roomId: option.roomId,
                                bedId: option.bedId,
                              });
                              
                              // Then check for future reservations
                              try {
                                const url = `/api/beds/${option.bedId}/future-reservations?afterDate=${wizardData.startDate}`;
                                console.log('Fetching future reservations:', url);
                                
                                const response = await fetch(url, {
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                });
                                
                                console.log('Future reservations response:', response.status);
                                
                                if (response.ok) {
                                  const futureReservations = await response.json();
                                  console.log('Future reservations data:', futureReservations);
                                  
                                  if (futureReservations && futureReservations.length > 0) {
                                    const nextReservation = futureReservations[0];
                                    const reservationDate = new Date(nextReservation.checkInDate).toLocaleDateString('tr-TR');
                                    
                                    const warningData = {
                                      show: true,
                                      message: `Bu yatak ${reservationDate} tarihinde başka birine rezerve edilmiş. Devam etmek istiyor musunuz?`,
                                      reservationDate: nextReservation.checkInDate,
                                    };
                                    
                                    console.log('Setting conflict warning:', warningData);
                                    
                                    // Show conflict warning after a brief delay to ensure state update
                                    setTimeout(() => {
                                      console.log('Calling setConflictWarning...');
                                      setConflictWarning(warningData);
                                    }, 100);
                                  } else {
                                    console.log('No future reservations found');
                                  }
                                }
                              } catch (error) {
                                console.error('Error checking future reservations:', error);
                              }
                            }}
                            className={cn(
                              "p-4 cursor-pointer transition-colors hover-elevate",
                              wizardData.bedId === option.bedId
                                ? "bg-primary/10 border-l-4 border-l-primary"
                                : ""
                            )}
                            data-testid={`bed-option-${option.bedId}`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{option.houseName}</p>
                                  <Badge variant="outline" className="text-xs">
                                    {option.houseCity}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Oda {option.roomNumber} • Yatak {option.bedNumber}
                                </p>
                              </div>
                              {wizardData.bedId === option.bedId && (
                                <CheckCircle className="w-5 h-5 text-primary" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        Şu anda müsait yatak bulunmamaktadır
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Pricing & Deposit */}
            {wizardStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="monthly-rate">{t('checkIn.wizard.monthlyFee')}</Label>
                  <Input
                    id="monthly-rate"
                    type="number"
                    value={wizardData.monthlyRate}
                    onChange={(e) => setWizardData({ ...wizardData, monthlyRate: Number(e.target.value) })}
                    data-testid="input-wizard-monthly-rate"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-date">{t('checkIn.wizard.endDate')}</Label>
                  <ModernDatePicker
                    date={wizardData.endDate ? new Date(wizardData.endDate) : undefined}
                    onDateChange={(date) => {
                      const dateString = date ? date.toISOString().split('T')[0] : "";
                      setWizardData({ ...wizardData, endDate: dateString });
                    }}
                    placeholder="Tarih seçin"
                    data-testid="input-wizard-end-date"
                    className="w-full"
                    minDate={wizardData.startDate ? new Date(wizardData.startDate) : undefined}
                  />
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="deposit-collected"
                      checked={wizardData.depositCollected}
                      onCheckedChange={(checked) =>
                        setWizardData({ ...wizardData, depositCollected: checked as boolean })
                      }
                      data-testid="checkbox-wizard-deposit"
                    />
                    <Label htmlFor="deposit-collected" className="cursor-pointer">
                      {t('checkIn.wizard.depositReceived')}
                    </Label>
                  </div>

                  {wizardData.depositCollected && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="deposit-amount">{t('checkIn.wizard.depositAmount')}</Label>
                        <Input
                          id="deposit-amount"
                          type="number"
                          value={wizardData.depositAmount}
                          onChange={(e) => setWizardData({ ...wizardData, depositAmount: Number(e.target.value) })}
                          data-testid="input-wizard-deposit-amount"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deposit-collector">{t('checkIn.wizard.depositCollector')}</Label>
                        <Input
                          id="deposit-collector"
                          value={user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "Kullanıcı"}
                          disabled
                          data-testid="input-wizard-deposit-collector"
                          className="bg-muted"
                        />
                        <p className="text-sm text-muted-foreground">
                          {t('checkIn.wizard.depositCollectorAuto')}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <Button
              variant="outline"
              onClick={handleWizardBack}
              disabled={wizardStep === 1}
              data-testid="button-wizard-back"
            >
              {t('checkIn.wizard.back')}
            </Button>
            
            <div className="flex gap-2">
              {wizardStep < 4 ? (
                <Button
                  onClick={handleWizardNext}
                  disabled={
                    (wizardStep === 1 && !wizardData.startDate) ||
                    (wizardStep === 2 && !wizardData.employmentId) ||
                    (wizardStep === 3 && !wizardData.bedId)
                  }
                  data-testid="button-wizard-next"
                >
                  {t('checkIn.wizard.next')}
                </Button>
              ) : (
                <Button
                  onClick={handleWizardComplete}
                  disabled={!wizardData.startDate}
                  data-testid="button-wizard-complete"
                >
                  {t('checkIn.wizard.complete')}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Conflict Warning Alert Dialog */}
      <AlertDialog open={conflictWarning?.show || false} onOpenChange={(open) => {
        if (!open) {
          setConflictWarning(null);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Rezervasyon Çakışması Uyarısı
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {conflictWarning?.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              // Clear bed selection
              setWizardData({
                ...wizardData,
                bedId: "",
                houseId: "",
                houseName: "",
                roomId: "",
              });
              setConflictWarning(null);
            }}>
              Vazgeç
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => setConflictWarning(null)}>
              Devam Et
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Color System Info Dialog */}
      <Dialog open={colorInfoDialogOpen} onOpenChange={setColorInfoDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Info className="w-6 h-6 text-primary" />
              {t('dashboard.colorInfoTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('dashboard.colorInfoSubtitle')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Green - Available */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-status-empty flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                  <span className="text-status-empty">●</span>
                  {t('dashboard.greenTitle')}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('dashboard.greenDesc')}
                </p>
              </div>
            </div>

            {/* Orange - Occupied */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-status-occupied flex items-center justify-center">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                  <span className="text-status-occupied">●</span>
                  {t('dashboard.orangeTitle')}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('dashboard.orangeDesc')}
                </p>
              </div>
            </div>

            {/* Yellow - Reserved */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-status-reserved flex items-center justify-center">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                  <span className="text-status-reserved">●</span>
                  {t('dashboard.yellowTitle')}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('dashboard.yellowDesc')}
                </p>
              </div>
            </div>

            {/* Red - Out of Service */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-status-oos flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                  <span className="text-status-oos">●</span>
                  {t('dashboard.redTitle')}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('dashboard.redDesc')}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">{t('dashboard.colorTip')}</strong> {t('dashboard.colorTipDesc')}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lease Contract Dialog */}
      {selectedHouseForLease && (
        <LeaseContractDialog
          open={isLeaseDialogOpen}
          onOpenChange={setIsLeaseDialogOpen}
          houseName={selectedHouseForLease.name}
          existingContract={selectedHouseForLease.leaseContract ? {
            startDate: selectedHouseForLease.leaseContract.startDate,
            endDate: selectedHouseForLease.leaseContract.endDate || "",
            monthlyRent: selectedHouseForLease.leaseContract.monthlyRent,
            paymentDay: selectedHouseForLease.leaseContract.paymentDay,
          } : undefined}
          onSave={(contract) => {
            // Update houses state with new contract
            setHouses((prevHouses) =>
              prevHouses.map((h) =>
                h.id === selectedHouseForLease.id
                  ? {
                      ...h,
                      leaseContract: {
                        startDate: contract.startDate,
                        endDate: contract.endDate,
                        monthlyRent: contract.monthlyRent,
                        currency: "EUR",
                        paymentDay: contract.paymentDay,
                      },
                    }
                  : h
              )
            );
          }}
        />
      )}
    </div>
  );
}
