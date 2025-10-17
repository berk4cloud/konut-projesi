import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Building2, MapPin, Edit, Bed, Trash2, ChevronsUpDown, Check, Zap, Droplet, Flame, FileText, Bell, Calendar, AlertCircle, Camera, X, Eye, Archive, ArchiveRestore } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// Pricing type definition
type PricingInfo = {
  useCustomPricing: boolean;
  bedDailyPrice?: number;
  bedMonthlyPrice?: number;
  roomDailyPrice?: number;
  roomMonthlyPrice?: number;
};

// Room type definition
type RoomInfo = {
  roomNumber: string;
  beds: number;
  canRentAsRoom: boolean;
  useFloor: boolean;
  floor?: number;
  pricing?: PricingInfo;
};

// Meter reading type
type MeterReading = {
  id: string;
  date: string;
  value: number;
  note?: string;
  photo?: string; // Base64 encoded image
};

type MeterLogs = {
  electricity: MeterReading[];
  water: MeterReading[];
  gas: MeterReading[];
};

// Lease contract type (for rented properties)
type LeaseContract = {
  startDate: string;
  endDate?: string; // Optional for indefinite leases
  monthlyRent: number;
  currency: string;
  paymentDay: number; // Day of month (1-31)
};

// Reminder/Alert type
type Reminder = {
  id: string;
  type: "maintenance" | "lease_end" | "meter_reading" | "inspection" | "other";
  title: string;
  date: string;
  alertDaysBefore: number; // How many days before to alert
  note?: string;
  recurring?: "monthly" | "yearly" | "none";
  completed?: boolean;
  completedAt?: string;
};

// Global system settings for pricing
export const systemSettings = {
  dailyRentalEnabled: true, // Günlük Kiralama Modu ON
  standardPricing: {
    bedDailyPrice: 25, // €25/gün
    bedMonthlyPrice: 600, // €600/ay
    roomDailyPrice: 60, // €60/gün
    roomMonthlyPrice: 1500, // €1500/ay
  }
};

// Pricing calculation helper functions
type HouseWithPricing = typeof initialMockHouses[0];

/**
 * Get the applicable price for a bed/room based on priority hierarchy:
 * 1. Room-specific pricing (if enabled)
 * 2. House-specific pricing (if enabled)
 * 3. Standard system pricing
 */
export function getApplicablePrice(
  room: RoomInfo,
  house: HouseWithPricing,
  priceType: 'bedDaily' | 'bedMonthly' | 'roomDaily' | 'roomMonthly'
): number {
  const priceField = priceType === 'bedDaily' ? 'bedDailyPrice' :
                     priceType === 'bedMonthly' ? 'bedMonthlyPrice' :
                     priceType === 'roomDaily' ? 'roomDailyPrice' :
                     'roomMonthlyPrice';
  
  // Priority 1: Room-specific pricing
  if (room.pricing?.useCustomPricing && room.pricing[priceField]) {
    return room.pricing[priceField]!;
  }
  
  // Priority 2: House-specific pricing
  if (house.pricing?.useCustomPricing && house.pricing[priceField]) {
    return house.pricing[priceField]!;
  }
  
  // Priority 3: Standard pricing
  return systemSettings.standardPricing[priceField];
}

/**
 * Calculate rental price for a given number of days
 * Logic:
 * - If days < 30: Use daily rate × days
 * - If days >= 30: Use (full months × monthly rate) + (remaining days × daily rate)
 */
export function calculateRentalPrice(
  days: number,
  dailyPrice: number,
  monthlyPrice: number
): { total: number; breakdown: string } {
  if (days < 30) {
    return {
      total: days * dailyPrice,
      breakdown: `${days} gün × €${dailyPrice}/gün`
    };
  }
  
  const fullMonths = Math.floor(days / 30);
  const remainingDays = days % 30;
  const monthlyTotal = fullMonths * monthlyPrice;
  const dailyTotal = remainingDays * dailyPrice;
  const total = monthlyTotal + dailyTotal;
  
  const parts = [];
  if (fullMonths > 0) parts.push(`${fullMonths} ay × €${monthlyPrice}/ay`);
  if (remainingDays > 0) parts.push(`${remainingDays} gün × €${dailyPrice}/gün`);
  
  return {
    total,
    breakdown: parts.join(' + ')
  };
}

// Initial mock data
const initialMockHouses = [
  {
    id: "h1",
    name: "Geldernstrasse 13, 52511", // Display name = address (no custom name)
    useCustomName: false,
    customName: "",
    address: "Geldernstrasse 13, 52511",
    city: "Geilenkirchen",
    country: "Almanya",
    rooms: [
      { 
        roomNumber: "45", 
        beds: 3, 
        canRentAsRoom: false, 
        useFloor: true, 
        floor: 2,
        pricing: {
          useCustomPricing: true,
          bedDailyPrice: 30, // €30/gün (standart fiyattan daha pahalı)
          bedMonthlyPrice: 700, // €700/ay
        }
      },
      { 
        roomNumber: "46", 
        beds: 2, 
        canRentAsRoom: true, 
        useFloor: true, 
        floor: 2,
        pricing: {
          useCustomPricing: true,
          bedDailyPrice: 28,
          bedMonthlyPrice: 650,
          roomDailyPrice: 75, // Tüm oda için
          roomMonthlyPrice: 1800,
        }
      },
      { 
        roomNumber: "47", 
        beds: 2, 
        canRentAsRoom: false, 
        useFloor: true, 
        floor: 2,
        pricing: {
          useCustomPricing: false, // Standart fiyat kullanılacak
        }
      },
    ],
    totalBeds: 7,
    occupiedBeds: 5,
    ownershipType: "Kiralık",
    archived: false,
    pricing: {
      useCustomPricing: true, // Bu konut için özel fiyat
      bedDailyPrice: 28, // €28/gün
      bedMonthlyPrice: 650, // €650/ay
      roomDailyPrice: 70, // €70/gün
      roomMonthlyPrice: 1700, // €1700/ay
    },
    leaseContract: {
      startDate: "2023-01-15",
      endDate: "2025-01-14",
      monthlyRent: 2500,
      currency: "EUR",
      paymentDay: 1,
    },
    reminders: [
      {
        id: "r1",
        type: "lease_end" as const,
        title: "Kira sözleşmesi bitiyor",
        date: "2025-11-15",
        alertDaysBefore: 30,
        note: "Yenileme görüşmesi yapılmalı",
        recurring: "none" as const,
      },
      {
        id: "r2",
        type: "maintenance" as const,
        title: "Yıllık bakım",
        date: "2025-10-20",
        alertDaysBefore: 10,
        note: "Kalorifer bakımı",
        recurring: "yearly" as const,
      },
    ],
    meterLogs: {
      electricity: [
        { id: "e1", date: "2024-12-15", value: 15420, note: "Normal okuma", photo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23666' font-size='24'%3EElektrik Sayacı%3C/text%3E%3C/svg%3E" },
        { id: "e2", date: "2024-11-15", value: 15180 },
        { id: "e3", date: "2024-10-15", value: 14950 },
      ],
      water: [
        { id: "w1", date: "2024-12-15", value: 8520, note: "Normal okuma", photo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e0f0ff' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23006699' font-size='24'%3ESu Sayacı%3C/text%3E%3C/svg%3E" },
        { id: "w2", date: "2024-11-15", value: 8410 },
        { id: "w3", date: "2024-10-15", value: 8305 },
      ],
      gas: [
        { id: "g1", date: "2024-12-15", value: 3420, note: "Normal okuma", photo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23fff8e0' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23cc8800' font-size='24'%3EGaz Sayacı%3C/text%3E%3C/svg%3E" },
        { id: "g2", date: "2024-11-15", value: 3280 },
        { id: "g3", date: "2024-10-15", value: 3150 },
      ],
    },
  },
  {
    id: "h2",
    name: "Hauptstrasse 45, 5911",
    useCustomName: false,
    customName: "",
    address: "Hauptstrasse 45, 5911",
    city: "Venlo",
    country: "Hollanda",
    rooms: [
      { 
        roomNumber: "101", 
        beds: 4, 
        canRentAsRoom: false, 
        useFloor: true, 
        floor: 1,
        pricing: {
          useCustomPricing: false, // Standart veya konut fiyatı kullan
        }
      },
      { 
        roomNumber: "102", 
        beds: 2, 
        canRentAsRoom: false, 
        useFloor: true, 
        floor: 1,
        pricing: {
          useCustomPricing: false,
        }
      },
    ],
    totalBeds: 6,
    occupiedBeds: 4,
    ownershipType: "Mülk",
    archived: false,
    pricing: {
      useCustomPricing: false, // Standart fiyatları kullan
    },
    reminders: [
      {
        id: "r3",
        type: "inspection" as const,
        title: "Yangın güvenlik kontrolü",
        date: "2025-10-22",
        alertDaysBefore: 7,
        recurring: "yearly" as const,
      },
      {
        id: "r4",
        type: "meter_reading" as const,
        title: "Sayaç okuma günü",
        date: "2025-10-18",
        alertDaysBefore: 3,
        recurring: "monthly" as const,
      },
    ],
    meterLogs: {
      electricity: [
        { id: "e4", date: "2024-12-10", value: 22150, note: "Yılsonu okuması" },
        { id: "e5", date: "2024-11-10", value: 21890 },
      ],
      water: [
        { id: "w4", date: "2024-12-10", value: 12340 },
        { id: "w5", date: "2024-11-10", value: 12210 },
      ],
      gas: [
        { id: "g4", date: "2024-12-10", value: 4580 },
        { id: "g5", date: "2024-11-10", value: 4420 },
      ],
    },
  },
  {
    id: "h3",
    name: "Marktplatz 7, 6041",
    useCustomName: false,
    customName: "",
    address: "Marktplatz 7, 6041",
    city: "Roermond",
    country: "Hollanda",
    rooms: [
      { 
        roomNumber: "201", 
        beds: 3, 
        canRentAsRoom: true, 
        useFloor: true, 
        floor: 2,
        pricing: {
          useCustomPricing: true,
          bedDailyPrice: 22,
          bedMonthlyPrice: 550,
          roomDailyPrice: 65, // Tüm oda için özel fiyat
          roomMonthlyPrice: 1600,
        }
      },
      { 
        roomNumber: "202", 
        beds: 2, 
        canRentAsRoom: false, 
        useFloor: true, 
        floor: 2,
        pricing: {
          useCustomPricing: false, // Konut fiyatını kullan
        }
      },
    ],
    totalBeds: 5,
    occupiedBeds: 3,
    ownershipType: "3. Taraf",
    archived: false,
    pricing: {
      useCustomPricing: true, // Konut için özel fiyat
      bedDailyPrice: 24, // €24/gün
      bedMonthlyPrice: 580, // €580/ay
      roomDailyPrice: 65, // €65/gün
      roomMonthlyPrice: 1600, // €1600/ay
    },
    leaseContract: {
      startDate: "2024-06-01",
      monthlyRent: 1800,
      currency: "EUR",
      paymentDay: 5,
    },
    reminders: [
      {
        id: "r5",
        type: "other" as const,
        title: "Bina toplantısı",
        date: "2025-10-21",
        alertDaysBefore: 5,
        note: "Yönetim kurulu toplantısı",
        recurring: "none" as const,
      },
    ],
    meterLogs: {
      electricity: [
        { id: "e6", date: "2024-12-01", value: 18920 },
        { id: "e7", date: "2024-11-01", value: 18720 },
      ],
      water: [
        { id: "w6", date: "2024-12-01", value: 9850, note: "Kaçak kontrol edildi" },
        { id: "w7", date: "2024-11-01", value: 9730 },
      ],
      gas: [
        { id: "g6", date: "2024-12-01", value: 3850 },
        { id: "g7", date: "2024-11-01", value: 3720 },
      ],
    },
  },
];

const countries = [
  { value: "Türkiye", label: "Türkiye" },
  { value: "Hollanda", label: "Hollanda" },
  { value: "Almanya", label: "Almanya" },
  { value: "Polonya", label: "Polonya" },
  { value: "Romanya", label: "Romanya" },
];

export default function Houses() {
  const { toast } = useToast();
  const [houses, setHouses] = useState(initialMockHouses);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHouse, setEditingHouse] = useState<typeof initialMockHouses[0] | null>(null);
  const [countryOpen, setCountryOpen] = useState(false);
  
  // Meter logs state
  const [isMeterDialogOpen, setIsMeterDialogOpen] = useState(false);
  const [selectedHouseForMeters, setSelectedHouseForMeters] = useState<typeof initialMockHouses[0] | null>(null);
  const [isAddReadingOpen, setIsAddReadingOpen] = useState(false);
  const [showAllElectricity, setShowAllElectricity] = useState(false);
  const [showAllWater, setShowAllWater] = useState(false);
  const [showAllGas, setShowAllGas] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [newReading, setNewReading] = useState({
    meterType: "electricity" as "electricity" | "water" | "gas",
    date: new Date().toISOString().split("T")[0],
    value: "",
    note: "",
    photo: "",
  });

  // WhatsApp-style photo compression
  const compressPhoto = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          // Max dimensions (WhatsApp-style)
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1920;
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions maintaining aspect ratio
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = (height * MAX_WIDTH) / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = (width * MAX_HEIGHT) / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with quality reduction (0.8 = 80% quality)
          const compressed = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressed);
        };
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('File read failed'));
      reader.readAsDataURL(file);
    });
  };
  
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
  
  // Lease contract state
  const [isLeaseDialogOpen, setIsLeaseDialogOpen] = useState(false);
  const [selectedHouseForLease, setSelectedHouseForLease] = useState<typeof initialMockHouses[0] | null>(null);
  
  // Reminders state
  const [isRemindersDialogOpen, setIsRemindersDialogOpen] = useState(false);
  const [selectedHouseForReminders, setSelectedHouseForReminders] = useState<typeof initialMockHouses[0] | null>(null);
  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);
  const [newReminder, setNewReminder] = useState({
    type: "maintenance" as Reminder["type"],
    title: "",
    date: new Date().toISOString().split("T")[0],
    alertDaysBefore: 7,
    note: "",
    recurring: "none" as Reminder["recurring"],
  });
  
  // Form state
  const [formData, setFormData] = useState({
    useCustomName: false,
    customName: "",
    address: "",
    city: "",
    country: "Hollanda", // Default from settings
    rooms: [] as RoomInfo[],
    ownershipType: "Kiralık",
    pricing: {
      useCustomPricing: false,
      bedDailyPrice: undefined as number | undefined,
      bedMonthlyPrice: undefined as number | undefined,
      roomDailyPrice: undefined as number | undefined,
      roomMonthlyPrice: undefined as number | undefined,
    },
  });

  const filteredHouses = houses.filter(
    (house) => {
      // Filter by search query
      const matchesSearch = 
        house.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        house.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        house.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by archived status
      const matchesArchiveFilter = showArchived ? true : !house.archived;
      
      return matchesSearch && matchesArchiveFilter;
    }
  );

  const handleAddNew = () => {
    setEditingHouse(null);
    setFormData({
      useCustomName: false,
      customName: "",
      address: "",
      city: "",
      country: "Hollanda",
      rooms: [],
      ownershipType: "Kiralık",
      pricing: {
        useCustomPricing: false,
        bedDailyPrice: undefined,
        bedMonthlyPrice: undefined,
        roomDailyPrice: undefined,
        roomMonthlyPrice: undefined,
      },
    });
    setIsDialogOpen(true);
  };
  
  // Display name helper: if custom name enabled, show "CustomName - Address", else just "Address"
  const getDisplayName = (customName: string, address: string, useCustomName: boolean) => {
    if (useCustomName && customName.trim()) {
      return `${customName.trim()} - ${address}`;
    }
    return address;
  };

  const handleEdit = (house: typeof initialMockHouses[0]) => {
    setEditingHouse(house);
    setFormData({
      useCustomName: house.useCustomName || false,
      customName: house.customName || "",
      address: house.address,
      city: house.city,
      country: house.country,
      rooms: [...house.rooms],
      ownershipType: house.ownershipType,
      pricing: house.pricing || {
        useCustomPricing: false,
        bedDailyPrice: undefined,
        bedMonthlyPrice: undefined,
        roomDailyPrice: undefined,
        roomMonthlyPrice: undefined,
      },
    });
    setIsDialogOpen(true);
  };

  const handleAddRoom = () => {
    setFormData({
      ...formData,
      rooms: [...formData.rooms, { 
        roomNumber: "", 
        beds: 1, 
        canRentAsRoom: false, 
        useFloor: false, 
        floor: undefined,
        pricing: {
          useCustomPricing: false,
        }
      }],
    });
  };

  const handleRemoveRoom = (index: number) => {
    setFormData({
      ...formData,
      rooms: formData.rooms.filter((_, i) => i !== index),
    });
  };

  const handleRoomChange = (index: number, field: keyof RoomInfo, value: any) => {
    const newRooms = [...formData.rooms];
    newRooms[index] = { ...newRooms[index], [field]: value };
    setFormData({ ...formData, rooms: newRooms });
  };

  const calculateTotalBeds = () => {
    return formData.rooms.reduce((sum, room) => sum + (room.beds || 0), 0);
  };

  const handleAddMeterReading = () => {
    if (!selectedHouseForMeters || !newReading.value) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun",
        variant: "destructive",
      });
      return;
    }

    const readingValue = parseFloat(newReading.value);
    if (isNaN(readingValue) || readingValue <= 0) {
      toast({
        title: "Hata",
        description: "Geçerli bir sayaç değeri girin",
        variant: "destructive",
      });
      return;
    }

    const newReadingData: MeterReading = {
      id: `${newReading.meterType.charAt(0)}${Date.now()}`,
      date: newReading.date,
      value: readingValue,
      note: newReading.note || undefined,
      photo: newReading.photo || undefined,
    };

    // Update the house with the new reading
    setHouses(houses.map(h => {
      if (h.id === selectedHouseForMeters.id) {
        const updatedLogs = { ...h.meterLogs };
        if (newReading.meterType === "electricity") {
          updatedLogs.electricity = [newReadingData, ...(updatedLogs.electricity || [])];
        } else if (newReading.meterType === "water") {
          updatedLogs.water = [newReadingData, ...(updatedLogs.water || [])];
        } else {
          updatedLogs.gas = [newReadingData, ...(updatedLogs.gas || [])];
        }
        return { ...h, meterLogs: updatedLogs };
      }
      return h;
    }));

    // Update selectedHouseForMeters to reflect changes
    const updatedHouse = houses.find(h => h.id === selectedHouseForMeters.id);
    if (updatedHouse) {
      const updatedLogs = { ...updatedHouse.meterLogs };
      if (newReading.meterType === "electricity") {
        updatedLogs.electricity = [newReadingData, ...(updatedLogs.electricity || [])];
      } else if (newReading.meterType === "water") {
        updatedLogs.water = [newReadingData, ...(updatedLogs.water || [])];
      } else {
        updatedLogs.gas = [newReadingData, ...(updatedLogs.gas || [])];
      }
      setSelectedHouseForMeters({ ...updatedHouse, meterLogs: updatedLogs });
    }

    // Reset form
    setNewReading({
      meterType: "electricity",
      date: new Date().toISOString().split("T")[0],
      value: "",
      note: "",
      photo: "",
    });
    setIsAddReadingOpen(false);
    
    const meterTypeLabel = newReading.meterType === "electricity" ? "Elektrik" : newReading.meterType === "water" ? "Su" : "Gaz";
    toast({
      title: "Başarılı",
      description: `${meterTypeLabel} sayacı okuması eklendi`,
    });
  };

  const handleSave = () => {
    // Validation
    if (!formData.address.trim()) {
      toast({
        title: "Hata",
        description: "Adres zorunludur",
        variant: "destructive",
      });
      return;
    }
    if (!formData.city.trim()) {
      toast({
        title: "Hata",
        description: "Şehir zorunludur",
        variant: "destructive",
      });
      return;
    }
    if (formData.useCustomName && !formData.customName.trim()) {
      toast({
        title: "Hata",
        description: "Özel isim kullanıyorsanız, isim girmelisiniz",
        variant: "destructive",
      });
      return;
    }
    if (formData.rooms.length === 0) {
      toast({
        title: "Hata",
        description: "En az bir oda eklemelisiniz",
        variant: "destructive",
      });
      return;
    }
    
    // Validate each room
    for (let i = 0; i < formData.rooms.length; i++) {
      const room = formData.rooms[i];
      if (!room.roomNumber.trim()) {
        toast({
          title: "Hata",
          description: `Oda ${i + 1}: Oda numarası zorunludur`,
          variant: "destructive",
        });
        return;
      }
      if (!room.beds || room.beds < 1) {
        toast({
          title: "Hata",
          description: `Oda ${i + 1}: Yatak sayısı en az 1 olmalıdır`,
          variant: "destructive",
        });
        return;
      }
      if (room.useFloor && (room.floor === undefined || room.floor === null)) {
        toast({
          title: "Hata",
          description: `Oda ${i + 1}: Kat bilgisi girmelisiniz`,
          variant: "destructive",
        });
        return;
      }
    }
    
    console.log("Saving house:", formData);
    
    const totalBeds = calculateTotalBeds();
    
    if (editingHouse) {
      // Update existing house
      setHouses(houses.map(h => 
        h.id === editingHouse.id 
          ? {
              ...h,
              name: getDisplayName(formData.customName, formData.address, formData.useCustomName),
              useCustomName: formData.useCustomName,
              customName: formData.customName,
              address: formData.address,
              city: formData.city,
              country: formData.country,
              rooms: formData.rooms,
              totalBeds,
              ownershipType: formData.ownershipType,
              pricing: formData.pricing,
            }
          : h
      ));
    } else {
      // Add new house (mock - no occupiedBeds data)
      const newHouse = {
        id: `h${houses.length + 1}`,
        name: getDisplayName(formData.customName, formData.address, formData.useCustomName),
        useCustomName: formData.useCustomName,
        customName: formData.customName,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        rooms: formData.rooms,
        totalBeds,
        occupiedBeds: 0, // Default to 0 for new houses
        ownershipType: formData.ownershipType,
        archived: false,
        pricing: formData.pricing,
        meterLogs: {
          electricity: [],
          water: [],
          gas: [],
        },
      };
      setHouses([...houses, newHouse]);
    }
    
    setIsDialogOpen(false);
    
    toast({
      title: "Başarılı",
      description: editingHouse ? "Konut güncellendi" : "Yeni konut eklendi",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        tenantName="Cova B.V." 
        userName="Admin" 
        upcomingRemindersCount={upcomingRemindersCount}
        upcomingReminders={allRemindersForDialog as any}
        onCompleteReminder={handleCompleteReminder}
        onAddNote={handleAddNoteToReminder}
      />

      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Konutlar</h2>
              <p className="text-muted-foreground">Tüm konutları görüntüleyin ve yönetin</p>
            </div>
            <Button onClick={handleAddNew} data-testid="button-add-house">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Konut Ekle
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Konut ara (adres, şehir)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-house"
              />
            </div>
            
            <div className="flex items-center gap-3 px-4 py-2 border rounded-lg bg-card">
              <Archive className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Arşiv olanları da göster</span>
              <Switch
                checked={showArchived}
                onCheckedChange={setShowArchived}
                data-testid="switch-show-archived"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHouses.map((house) => {
              const occupancyRate = ((house.occupiedBeds / house.totalBeds) * 100).toFixed(0);
              const emptyBeds = house.totalBeds - house.occupiedBeds;

              return (
                <Card 
                  key={house.id} 
                  className={cn(
                    "hover:shadow-lg transition-shadow",
                    house.archived && "opacity-60 border-dashed"
                  )} 
                  data-testid={`house-card-${house.id}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg" data-testid={`text-house-name-${house.id}`}>
                              {house.name}
                            </CardTitle>
                            {house.archived && (
                              <Badge variant="secondary" className="text-xs" data-testid={`badge-archived-${house.id}`}>
                                <Archive className="w-3 h-3 mr-1" />
                                Arşiv
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="flex items-center gap-1 mt-1" data-testid={`text-house-city-${house.id}`}>
                            <MapPin className="w-3 h-3" />
                            {house.city}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" data-testid={`text-ownership-type-${house.id}`}>
                        {house.ownershipType}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      <p data-testid={`text-house-address-${house.id}`}>{house.address}</p>
                      <p className="text-xs mt-1" data-testid={`text-house-country-${house.id}`}>
                        {house.country}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-3 border-t border-b">
                      <div>
                        <p className="text-xs text-muted-foreground">Oda Sayısı</p>
                        <p className="text-lg font-semibold" data-testid={`text-room-count-${house.id}`}>
                          {house.rooms.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Toplam Yatak</p>
                        <p className="text-lg font-semibold flex items-center gap-1" data-testid={`text-total-beds-${house.id}`}>
                          <Bed className="w-4 h-4" />
                          {house.totalBeds}
                        </p>
                      </div>
                    </div>

                    {/* Room details with rental status */}
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">Odalar:</p>
                      <div className="space-y-1.5">
                        {house.rooms.map((room) => (
                          <div 
                            key={room.roomNumber} 
                            className="flex items-center justify-between text-sm bg-muted/40 rounded px-2 py-1.5"
                            data-testid={`room-info-${house.id}-${room.roomNumber}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Oda {room.roomNumber}</span>
                              {room.useFloor && room.floor !== undefined && (
                                <span className="text-xs text-muted-foreground" data-testid={`text-floor-${house.id}-${room.roomNumber}`}>
                                  (Kat {room.floor})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">{room.beds} yatak</span>
                              {room.canRentAsRoom && (
                                <Badge variant="outline" className="text-xs" data-testid={`badge-can-rent-${house.id}-${room.roomNumber}`}>
                                  Oda kirası
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Doluluk</span>
                        <span className="font-semibold" data-testid={`text-occupancy-rate-${house.id}`}>
                          {occupancyRate}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${occupancyRate}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span data-testid={`text-occupied-beds-${house.id}`}>
                          Dolu: {house.occupiedBeds}
                        </span>
                        <span data-testid={`text-empty-beds-${house.id}`}>
                          Boş: {emptyBeds}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleEdit(house)}
                        data-testid={`button-edit-house-${house.id}`}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Düzenle
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedHouseForMeters(house);
                          setIsMeterDialogOpen(true);
                        }}
                        data-testid={`button-meters-${house.id}`}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Sayaçlar
                      </Button>
                      
                      {(house.ownershipType === "Kiralık" || house.ownershipType === "3. Taraf") && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedHouseForLease(house);
                            setIsLeaseDialogOpen(true);
                          }}
                          data-testid={`button-lease-${house.id}`}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Kira Detayları
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedHouseForReminders(house);
                          setIsRemindersDialogOpen(true);
                        }}
                        data-testid={`button-reminders-${house.id}`}
                      >
                        <Bell className="w-4 h-4 mr-2" />
                        Hatırlatıcılar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredHouses.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground" data-testid="text-no-houses">
                Konut bulunamadı
              </p>
            </div>
          )}
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingHouse ? "Konut Düzenle" : "Yeni Konut Ekle"}
            </DialogTitle>
            <DialogDescription>
              {editingHouse 
                ? "Konut bilgilerini güncelleyin" 
                : "Yeni konut bilgilerini girin. Varsayılan ülke ayarlardan otomatik seçilir."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="address">Adres *</Label>
              <Input
                id="address"
                placeholder="örn: Geldernstrasse 13, 52511"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                data-testid="input-house-address"
              />
              <p className="text-xs text-muted-foreground">
                Konut adı olarak varsayılan adres kullanılır
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useCustomName"
                  checked={formData.useCustomName}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, useCustomName: checked as boolean })
                  }
                  data-testid="checkbox-custom-name"
                />
                <Label 
                  htmlFor="useCustomName" 
                  className="text-sm font-normal cursor-pointer"
                >
                  Özel bir isim kullan
                </Label>
              </div>

              {formData.useCustomName && (
                <div className="space-y-2 pl-6">
                  <Label htmlFor="customName">Özel İsim *</Label>
                  <Input
                    id="customName"
                    placeholder="örn: Villa Sunset"
                    value={formData.customName}
                    onChange={(e) => setFormData({ ...formData, customName: e.target.value })}
                    data-testid="input-custom-name"
                  />
                  <p className="text-xs text-muted-foreground">
                    Girilen isim: "{formData.customName || "..."} - {formData.address || "..."}"
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Şehir *</Label>
                <Input
                  id="city"
                  placeholder="örn: Geilenkirchen"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  data-testid="input-house-city"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Ülke *</Label>
                <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={countryOpen}
                      className="w-full justify-between"
                      data-testid="select-house-country"
                    >
                      {formData.country || "Ülke seçin"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Ülke ara..." />
                      <CommandList>
                        <CommandEmpty>Ülke bulunamadı.</CommandEmpty>
                        <CommandGroup>
                          {countries.map((country) => (
                            <CommandItem
                              key={country.value}
                              value={country.label}
                              onSelect={() => {
                                setFormData({ ...formData, country: country.value });
                                setCountryOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.country === country.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {country.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownershipType">Mülkiyet Tipi *</Label>
              <Select
                value={formData.ownershipType}
                onValueChange={(value) => setFormData({ ...formData, ownershipType: value })}
              >
                <SelectTrigger id="ownershipType" data-testid="select-ownership-type">
                  <SelectValue placeholder="Mülkiyet tipi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kiralık">Kiralık</SelectItem>
                  <SelectItem value="Mülk">Mülk</SelectItem>
                  <SelectItem value="3. Taraf">3. Taraf</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rooms Section */}
            <div className="space-y-4 pt-4 border-t">
              <div>
                <Label className="text-base font-semibold">Odalar</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Her oda için detaylı bilgi girin
                </p>
              </div>

              {formData.rooms.length === 0 && (
                <div className="text-center py-8 bg-muted/50 rounded-lg border-2 border-dashed">
                  <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Henüz oda eklenmedi. "Oda Ekle" butonuna tıklayarak başlayın.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {formData.rooms.map((room, index) => {
                  const isLastRoom = index === formData.rooms.length - 1;
                  return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border space-y-3 transition-colors duration-300 ${
                      isLastRoom 
                        ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' 
                        : 'bg-muted/30'
                    }`}
                    data-testid={`room-item-${index}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold">Oda {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRoom(index)}
                        data-testid={`button-remove-room-${index}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor={`room-number-${index}`}>Oda Numarası *</Label>
                        <Input
                          id={`room-number-${index}`}
                          placeholder="örn: 45"
                          value={room.roomNumber}
                          onChange={(e) => handleRoomChange(index, "roomNumber", e.target.value)}
                          data-testid={`input-room-number-${index}`}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`beds-${index}`}>Yatak Sayısı *</Label>
                        <Input
                          id={`beds-${index}`}
                          type="number"
                          min="1"
                          placeholder="örn: 3"
                          value={room.beds === 0 ? "" : room.beds}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              handleRoomChange(index, "beds", 0);
                            } else {
                              handleRoomChange(index, "beds", parseInt(val) || 1);
                            }
                          }}
                          data-testid={`input-beds-${index}`}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`can-rent-${index}`}
                          checked={room.canRentAsRoom}
                          onCheckedChange={(checked) => handleRoomChange(index, "canRentAsRoom", !!checked)}
                          data-testid={`checkbox-can-rent-${index}`}
                        />
                        <Label
                          htmlFor={`can-rent-${index}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          Oda olarak kiraya verilebilir
                        </Label>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`use-floor-${index}`}
                            checked={room.useFloor}
                            onCheckedChange={(checked) => {
                              const isChecked = !!checked;
                              const newRooms = [...formData.rooms];
                              newRooms[index] = { 
                                ...newRooms[index], 
                                useFloor: isChecked,
                                floor: isChecked ? newRooms[index].floor : undefined
                              };
                              setFormData({ ...formData, rooms: newRooms });
                            }}
                            data-testid={`checkbox-use-floor-${index}`}
                          />
                          <Label
                            htmlFor={`use-floor-${index}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            Kat bilgisi gir
                          </Label>
                        </div>

                        {room.useFloor && (
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`floor-${index}`} className="text-sm">Kat:</Label>
                            <Input
                              id={`floor-${index}`}
                              type="number"
                              min="0"
                              placeholder="2"
                              value={room.floor ?? ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleRoomChange(index, "floor", val === "" ? undefined : parseInt(val));
                              }}
                              className="w-20"
                              data-testid={`input-floor-${index}`}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Room Pricing */}
                    <div className="space-y-2 pt-3 border-t mt-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`use-room-pricing-${index}`}
                          checked={room.pricing?.useCustomPricing || false}
                          onCheckedChange={(checked) => {
                            const newRooms = [...formData.rooms];
                            newRooms[index] = { 
                              ...newRooms[index], 
                              pricing: {
                                useCustomPricing: !!checked,
                                bedDailyPrice: room.pricing?.bedDailyPrice,
                                bedMonthlyPrice: room.pricing?.bedMonthlyPrice,
                                roomDailyPrice: room.pricing?.roomDailyPrice,
                                roomMonthlyPrice: room.pricing?.roomMonthlyPrice,
                              }
                            };
                            setFormData({ ...formData, rooms: newRooms });
                          }}
                          data-testid={`checkbox-use-room-pricing-${index}`}
                        />
                        <Label
                          htmlFor={`use-room-pricing-${index}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          Oda için özel fiyat
                        </Label>
                      </div>

                      {room.pricing?.useCustomPricing && (
                        <div className="space-y-3 pl-6">
                          <div className="grid grid-cols-2 gap-3">
                            {systemSettings.dailyRentalEnabled && (
                              <div className="space-y-2">
                                <Label htmlFor={`room-bed-daily-${index}`} className="text-xs">Yatak Günlük (€)</Label>
                                <Input
                                  id={`room-bed-daily-${index}`}
                                  data-testid={`input-room-bed-daily-${index}`}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder={`€${getApplicablePrice(room, formData as any, 'bedDaily')}`}
                                  value={room.pricing?.bedDailyPrice ?? ""}
                                  onChange={(e) => {
                                    const newRooms = [...formData.rooms];
                                    newRooms[index] = {
                                      ...newRooms[index],
                                      pricing: {
                                        ...newRooms[index].pricing!,
                                        bedDailyPrice: e.target.value ? parseFloat(e.target.value) : undefined
                                      }
                                    };
                                    setFormData({ ...formData, rooms: newRooms });
                                  }}
                                />
                              </div>
                            )}
                            <div className="space-y-2">
                              <Label htmlFor={`room-bed-monthly-${index}`} className="text-xs">Yatak Aylık (€)</Label>
                              <Input
                                id={`room-bed-monthly-${index}`}
                                data-testid={`input-room-bed-monthly-${index}`}
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder={`€${getApplicablePrice(room, formData as any, 'bedMonthly')}`}
                                value={room.pricing?.bedMonthlyPrice ?? ""}
                                onChange={(e) => {
                                  const newRooms = [...formData.rooms];
                                  newRooms[index] = {
                                    ...newRooms[index],
                                    pricing: {
                                      ...newRooms[index].pricing!,
                                      bedMonthlyPrice: e.target.value ? parseFloat(e.target.value) : undefined
                                    }
                                  };
                                  setFormData({ ...formData, rooms: newRooms });
                                }}
                              />
                            </div>
                          </div>

                          {room.canRentAsRoom && (
                            <div className="grid grid-cols-2 gap-3">
                              {systemSettings.dailyRentalEnabled && (
                                <div className="space-y-2">
                                  <Label htmlFor={`room-room-daily-${index}`} className="text-xs">Oda Günlük (€)</Label>
                                  <Input
                                    id={`room-room-daily-${index}`}
                                    data-testid={`input-room-room-daily-${index}`}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder={`€${getApplicablePrice(room, formData as any, 'roomDaily')}`}
                                    value={room.pricing?.roomDailyPrice ?? ""}
                                    onChange={(e) => {
                                      const newRooms = [...formData.rooms];
                                      newRooms[index] = {
                                        ...newRooms[index],
                                        pricing: {
                                          ...newRooms[index].pricing!,
                                          roomDailyPrice: e.target.value ? parseFloat(e.target.value) : undefined
                                        }
                                      };
                                      setFormData({ ...formData, rooms: newRooms });
                                    }}
                                  />
                                </div>
                              )}
                              <div className="space-y-2">
                                <Label htmlFor={`room-room-monthly-${index}`} className="text-xs">Oda Aylık (€)</Label>
                                <Input
                                  id={`room-room-monthly-${index}`}
                                  data-testid={`input-room-room-monthly-${index}`}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder={`€${getApplicablePrice(room, formData as any, 'roomMonthly')}`}
                                  value={room.pricing?.roomMonthlyPrice ?? ""}
                                  onChange={(e) => {
                                    const newRooms = [...formData.rooms];
                                    newRooms[index] = {
                                      ...newRooms[index],
                                      pricing: {
                                        ...newRooms[index].pricing!,
                                        roomMonthlyPrice: e.target.value ? parseFloat(e.target.value) : undefined
                                      }
                                    };
                                    setFormData({ ...formData, rooms: newRooms });
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleAddRoom}
                data-testid="button-add-room"
              >
                <Plus className="w-4 h-4 mr-2" />
                Oda Ekle
              </Button>

              {formData.rooms.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium text-blue-900">Toplam Yatak Sayısı:</span>
                  <span className="text-lg font-bold text-blue-900" data-testid="text-calculated-total-beds">
                    {calculateTotalBeds()}
                  </span>
                </div>
              )}
            </div>

            {/* House Pricing Section */}
            <div className="space-y-4 pt-4 border-t">
              <div>
                <Label className="text-base font-semibold">Konut Fiyatlandırma</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Bu konut için özel fiyat belirleyin (isteğe bağlı)
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-custom-house-pricing"
                  checked={formData.pricing.useCustomPricing}
                  onCheckedChange={(checked) => 
                    setFormData({ 
                      ...formData, 
                      pricing: { 
                        ...formData.pricing, 
                        useCustomPricing: checked as boolean 
                      } 
                    })
                  }
                  data-testid="checkbox-use-custom-house-pricing"
                />
                <Label 
                  htmlFor="use-custom-house-pricing" 
                  className="text-sm font-normal cursor-pointer"
                >
                  Özel fiyat kullan
                </Label>
              </div>

              {formData.pricing.useCustomPricing && (
                <div className="space-y-3 pl-6">
                  <div className="grid grid-cols-2 gap-4">
                    {systemSettings.dailyRentalEnabled && (
                      <div className="space-y-2">
                        <Label htmlFor="house-bed-daily-price">Yatak Günlük (€)</Label>
                        <Input
                          id="house-bed-daily-price"
                          data-testid="input-house-bed-daily-price"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder={`Standart: €${systemSettings.standardPricing.bedDailyPrice}`}
                          value={formData.pricing.bedDailyPrice ?? ""}
                          onChange={(e) => 
                            setFormData({ 
                              ...formData, 
                              pricing: { 
                                ...formData.pricing, 
                                bedDailyPrice: e.target.value ? parseFloat(e.target.value) : undefined 
                              } 
                            })
                          }
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="house-bed-monthly-price">Yatak Aylık (€)</Label>
                      <Input
                        id="house-bed-monthly-price"
                        data-testid="input-house-bed-monthly-price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={`Standart: €${systemSettings.standardPricing.bedMonthlyPrice}`}
                        value={formData.pricing.bedMonthlyPrice ?? ""}
                        onChange={(e) => 
                          setFormData({ 
                            ...formData, 
                            pricing: { 
                              ...formData.pricing, 
                              bedMonthlyPrice: e.target.value ? parseFloat(e.target.value) : undefined 
                            } 
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {systemSettings.dailyRentalEnabled && (
                      <div className="space-y-2">
                        <Label htmlFor="house-room-daily-price">Oda Günlük (€)</Label>
                        <Input
                          id="house-room-daily-price"
                          data-testid="input-house-room-daily-price"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder={`Standart: €${systemSettings.standardPricing.roomDailyPrice}`}
                          value={formData.pricing.roomDailyPrice ?? ""}
                          onChange={(e) => 
                            setFormData({ 
                              ...formData, 
                              pricing: { 
                                ...formData.pricing, 
                                roomDailyPrice: e.target.value ? parseFloat(e.target.value) : undefined 
                              } 
                            })
                          }
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="house-room-monthly-price">Oda Aylık (€)</Label>
                      <Input
                        id="house-room-monthly-price"
                        data-testid="input-house-room-monthly-price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={`Standart: €${systemSettings.standardPricing.roomMonthlyPrice}`}
                        value={formData.pricing.roomMonthlyPrice ?? ""}
                        onChange={(e) => 
                          setFormData({ 
                            ...formData, 
                            pricing: { 
                              ...formData.pricing, 
                              roomMonthlyPrice: e.target.value ? parseFloat(e.target.value) : undefined 
                            } 
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-between">
            {editingHouse && (
              <Button
                variant="outline"
                onClick={() => {
                  const updatedHouses = houses.map(h =>
                    h.id === editingHouse.id
                      ? { ...h, archived: !h.archived }
                      : h
                  );
                  setHouses(updatedHouses);
                  setIsDialogOpen(false);
                  toast({
                    title: editingHouse.archived ? "Arşivden Çıkarıldı" : "Arşive Kaldırıldı",
                    description: editingHouse.archived 
                      ? "Konut arşivden çıkarıldı ve aktif hale getirildi" 
                      : "Konut arşive kaldırıldı",
                  });
                }}
                data-testid="button-toggle-archive"
              >
                {editingHouse.archived ? (
                  <>
                    <ArchiveRestore className="w-4 h-4 mr-2" />
                    Arşivden Çıkar
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4 mr-2" />
                    Arşive Kaldır
                  </>
                )}
              </Button>
            )}
            
            <div className="flex gap-3 ml-auto">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                data-testid="button-cancel"
              >
                İptal
              </Button>
              <Button onClick={handleSave} data-testid="button-save-house">
                {editingHouse ? "Güncelle" : "Kaydet"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Meter Logs Dialog */}
      <Dialog open={isMeterDialogOpen} onOpenChange={setIsMeterDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sayaç Bilgileri</DialogTitle>
            <DialogDescription>
              {selectedHouseForMeters?.name} için elektrik, su ve gaz sayacı okumaları
            </DialogDescription>
          </DialogHeader>

          {selectedHouseForMeters && (
            <div className="space-y-6">
              {/* Electricity Meter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-amber-600" />
                  </div>
                  <h3 className="font-semibold">Elektrik Sayacı</h3>
                </div>
                
                {selectedHouseForMeters.meterLogs?.electricity && selectedHouseForMeters.meterLogs.electricity.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {(showAllElectricity 
                        ? selectedHouseForMeters.meterLogs.electricity 
                        : selectedHouseForMeters.meterLogs.electricity.slice(0, 3)
                      ).map((reading, index) => {
                        const allReadings = selectedHouseForMeters.meterLogs.electricity;
                        const actualIndex = showAllElectricity ? index : index;
                        const prevReading = allReadings[actualIndex + 1];
                        const consumption = prevReading ? reading.value - prevReading.value : null;
                        
                        return (
                          <div 
                            key={reading.id} 
                            className="p-3 border rounded-lg bg-card"
                            data-testid={`electricity-reading-${reading.id}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="space-y-1">
                                <p className="text-sm font-medium" data-testid={`text-reading-date-${reading.id}`}>
                                  {new Date(reading.date).toLocaleDateString("tr-TR", { 
                                    day: "numeric", 
                                    month: "long", 
                                    year: "numeric" 
                                  })}
                                </p>
                                {reading.note && (
                                  <p className="text-xs text-muted-foreground" data-testid={`text-reading-note-${reading.id}`}>
                                    {reading.note}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold" data-testid={`text-reading-value-${reading.id}`}>
                                  {reading.value.toLocaleString("tr-TR")} kWh
                                </p>
                                {consumption !== null && (
                                  <p className="text-xs text-muted-foreground" data-testid={`text-consumption-${reading.id}`}>
                                    +{consumption.toLocaleString("tr-TR")} kWh
                                  </p>
                                )}
                              </div>
                            </div>
                            {reading.photo && (
                              <button
                                onClick={() => {
                                  setSelectedPhoto(reading.photo);
                                  setPhotoModalOpen(true);
                                }}
                                className="mt-2 text-sm text-primary hover:underline flex items-center gap-1"
                                data-testid={`button-photo-${reading.id}`}
                              >
                                <Eye className="w-3 h-3" />
                                {reading.photo.split('/').pop() || 'foto.jpg'}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {!showAllElectricity && selectedHouseForMeters.meterLogs.electricity.length > 3 && (
                      <button
                        onClick={() => setShowAllElectricity(true)}
                        className="text-sm text-primary hover:underline"
                        data-testid="button-show-more-electricity"
                      >
                        Daha fazla göster ({selectedHouseForMeters.meterLogs.electricity.length - 3} kayıt)
                      </button>
                    )}
                    {showAllElectricity && selectedHouseForMeters.meterLogs.electricity.length > 3 && (
                      <button
                        onClick={() => setShowAllElectricity(false)}
                        className="text-sm text-primary hover:underline"
                        data-testid="button-show-less-electricity"
                      >
                        Daha az göster
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Kayıt bulunamadı</p>
                )}
              </div>

              {/* Water Meter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Droplet className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">Su Sayacı</h3>
                </div>
                
                {selectedHouseForMeters.meterLogs?.water && selectedHouseForMeters.meterLogs.water.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {(showAllWater 
                        ? selectedHouseForMeters.meterLogs.water 
                        : selectedHouseForMeters.meterLogs.water.slice(0, 3)
                      ).map((reading, index) => {
                        const allReadings = selectedHouseForMeters.meterLogs.water;
                        const actualIndex = showAllWater ? index : index;
                        const prevReading = allReadings[actualIndex + 1];
                        const consumption = prevReading ? reading.value - prevReading.value : null;
                        
                        return (
                          <div 
                            key={reading.id} 
                            className="p-3 border rounded-lg bg-card"
                            data-testid={`water-reading-${reading.id}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="space-y-1">
                                <p className="text-sm font-medium" data-testid={`text-reading-date-${reading.id}`}>
                                  {new Date(reading.date).toLocaleDateString("tr-TR", { 
                                    day: "numeric", 
                                    month: "long", 
                                    year: "numeric" 
                                  })}
                                </p>
                                {reading.note && (
                                  <p className="text-xs text-muted-foreground" data-testid={`text-reading-note-${reading.id}`}>
                                    {reading.note}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold" data-testid={`text-reading-value-${reading.id}`}>
                                  {reading.value.toLocaleString("tr-TR")} m³
                                </p>
                                {consumption !== null && (
                                  <p className="text-xs text-muted-foreground" data-testid={`text-consumption-${reading.id}`}>
                                    +{consumption.toLocaleString("tr-TR")} m³
                                  </p>
                                )}
                              </div>
                            </div>
                            {reading.photo && (
                              <button
                                onClick={() => {
                                  setSelectedPhoto(reading.photo);
                                  setPhotoModalOpen(true);
                                }}
                                className="mt-2 text-sm text-primary hover:underline flex items-center gap-1"
                                data-testid={`button-photo-${reading.id}`}
                              >
                                <Eye className="w-3 h-3" />
                                {reading.photo.split('/').pop() || 'foto.jpg'}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {!showAllWater && selectedHouseForMeters.meterLogs.water.length > 3 && (
                      <button
                        onClick={() => setShowAllWater(true)}
                        className="text-sm text-primary hover:underline"
                        data-testid="button-show-more-water"
                      >
                        Daha fazla göster ({selectedHouseForMeters.meterLogs.water.length - 3} kayıt)
                      </button>
                    )}
                    {showAllWater && selectedHouseForMeters.meterLogs.water.length > 3 && (
                      <button
                        onClick={() => setShowAllWater(false)}
                        className="text-sm text-primary hover:underline"
                        data-testid="button-show-less-water"
                      >
                        Daha az göster
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Kayıt bulunamadı</p>
                )}
              </div>

              {/* Gas Meter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Flame className="w-4 h-4 text-orange-600" />
                  </div>
                  <h3 className="font-semibold">Gaz Sayacı</h3>
                </div>
                
                {selectedHouseForMeters.meterLogs?.gas && selectedHouseForMeters.meterLogs.gas.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {(showAllGas 
                        ? selectedHouseForMeters.meterLogs.gas 
                        : selectedHouseForMeters.meterLogs.gas.slice(0, 3)
                      ).map((reading, index) => {
                        const allReadings = selectedHouseForMeters.meterLogs.gas;
                        const actualIndex = showAllGas ? index : index;
                        const prevReading = allReadings[actualIndex + 1];
                        const consumption = prevReading ? reading.value - prevReading.value : null;
                        
                        return (
                          <div 
                            key={reading.id} 
                            className="p-3 border rounded-lg bg-card"
                            data-testid={`gas-reading-${reading.id}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="space-y-1">
                                <p className="text-sm font-medium" data-testid={`text-reading-date-${reading.id}`}>
                                  {new Date(reading.date).toLocaleDateString("tr-TR", { 
                                    day: "numeric", 
                                    month: "long", 
                                    year: "numeric" 
                                  })}
                                </p>
                                {reading.note && (
                                  <p className="text-xs text-muted-foreground" data-testid={`text-reading-note-${reading.id}`}>
                                    {reading.note}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold" data-testid={`text-reading-value-${reading.id}`}>
                                  {reading.value.toLocaleString("tr-TR")} m³
                                </p>
                                {consumption !== null && (
                                  <p className="text-xs text-muted-foreground" data-testid={`text-consumption-${reading.id}`}>
                                    +{consumption.toLocaleString("tr-TR")} m³
                                  </p>
                                )}
                              </div>
                            </div>
                            {reading.photo && (
                              <button
                                onClick={() => {
                                  setSelectedPhoto(reading.photo);
                                  setPhotoModalOpen(true);
                                }}
                                className="mt-2 text-sm text-primary hover:underline flex items-center gap-1"
                                data-testid={`button-photo-${reading.id}`}
                              >
                                <Eye className="w-3 h-3" />
                                {reading.photo.split('/').pop() || 'foto.jpg'}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {!showAllGas && selectedHouseForMeters.meterLogs.gas.length > 3 && (
                      <button
                        onClick={() => setShowAllGas(true)}
                        className="text-sm text-primary hover:underline"
                        data-testid="button-show-more-gas"
                      >
                        Daha fazla göster ({selectedHouseForMeters.meterLogs.gas.length - 3} kayıt)
                      </button>
                    )}
                    {showAllGas && selectedHouseForMeters.meterLogs.gas.length > 3 && (
                      <button
                        onClick={() => setShowAllGas(false)}
                        className="text-sm text-primary hover:underline"
                        data-testid="button-show-less-gas"
                      >
                        Daha az göster
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Kayıt bulunamadı</p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsMeterDialogOpen(false)}
              data-testid="button-close-meter-dialog"
            >
              Kapat
            </Button>
            <Button 
              onClick={() => setIsAddReadingOpen(true)}
              data-testid="button-add-meter-reading"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Okuma Ekle
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add New Meter Reading Dialog */}
      <Dialog open={isAddReadingOpen} onOpenChange={setIsAddReadingOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Sayaç Okuması Ekle</DialogTitle>
            <DialogDescription>
              Elektrik, su veya gaz sayacı için yeni okuma değeri girin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meter-type">Sayaç Türü *</Label>
              <Select
                value={newReading.meterType}
                onValueChange={(value: "electricity" | "water" | "gas") => 
                  setNewReading({ ...newReading, meterType: value })
                }
              >
                <SelectTrigger id="meter-type" data-testid="select-meter-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electricity">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-600" />
                      Elektrik
                    </div>
                  </SelectItem>
                  <SelectItem value="water">
                    <div className="flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-blue-600" />
                      Su
                    </div>
                  </SelectItem>
                  <SelectItem value="gas">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-600" />
                      Gaz
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reading-date">Tarih *</Label>
              <Input
                id="reading-date"
                type="date"
                value={newReading.date}
                onChange={(e) => setNewReading({ ...newReading, date: e.target.value })}
                data-testid="input-reading-date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reading-value">
                Sayaç Değeri * ({newReading.meterType === "electricity" ? "kWh" : "m³"})
              </Label>
              <Input
                id="reading-value"
                type="number"
                step="0.01"
                placeholder={newReading.meterType === "electricity" ? "örn: 15420" : "örn: 8520"}
                value={newReading.value}
                onChange={(e) => setNewReading({ ...newReading, value: e.target.value })}
                data-testid="input-reading-value"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reading-note">Not (Opsiyonel)</Label>
              <Input
                id="reading-note"
                placeholder="örn: Normal okuma, kaçak kontrol edildi"
                value={newReading.note}
                onChange={(e) => setNewReading({ ...newReading, note: e.target.value })}
                data-testid="input-reading-note"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reading-photo">Sayaç Fotoğrafı (Opsiyonel)</Label>
              {newReading.photo ? (
                <div className="relative">
                  <img 
                    src={newReading.photo} 
                    alt="Sayaç fotoğrafı" 
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => setNewReading({ ...newReading, photo: "" })}
                    data-testid="button-remove-photo"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="reading-photo"
                  className="flex items-center justify-center gap-2 w-full p-6 border-2 border-dashed rounded-lg cursor-pointer hover-elevate"
                >
                  <Camera className="w-5 h-5" />
                  <span className="text-sm">Fotoğraf Ekle</span>
                  <input
                    id="reading-photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          // Compress photo WhatsApp-style
                          const compressed = await compressPhoto(file);
                          setNewReading({ ...newReading, photo: compressed });
                        } catch (error) {
                          toast({
                            title: "Hata",
                            description: "Fotoğraf yüklenemedi",
                            variant: "destructive",
                          });
                        }
                      }
                    }}
                    data-testid="input-reading-photo"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddReadingOpen(false);
                setNewReading({
                  meterType: "electricity",
                  date: new Date().toISOString().split("T")[0],
                  value: "",
                  note: "",
                  photo: "",
                });
              }}
              data-testid="button-cancel-reading"
            >
              İptal
            </Button>
            <Button 
              onClick={handleAddMeterReading}
              data-testid="button-save-reading"
            >
              Kaydet
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                        )} gün sonra bitiyor
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
            <DialogTitle>Hatırlatıcılar</DialogTitle>
            <DialogDescription>
              {selectedHouseForReminders?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedHouseForReminders?.reminders && selectedHouseForReminders.reminders.length > 0 ? (
              <>
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
                                {daysUntil > 0 ? `${daysUntil} gün sonra` : daysUntil === 0 ? "Bugün" : `${Math.abs(daysUntil)} gün önce`}
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
                
                <Button
                  onClick={() => setIsAddReminderOpen(true)}
                  className="w-full"
                  data-testid="button-add-reminder"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Hatırlatıcı Ekle
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Henüz hatırlatıcı eklenmedi</p>
                <Button
                  onClick={() => setIsAddReminderOpen(true)}
                  data-testid="button-add-first-reminder"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  İlk Hatırlatıcıyı Ekle
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Reminder Dialog */}
      <Dialog open={isAddReminderOpen} onOpenChange={setIsAddReminderOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Yeni Hatırlatıcı Ekle</DialogTitle>
            <DialogDescription>
              {selectedHouseForReminders?.name} için hatırlatıcı oluştur
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reminder-type">Hatırlatıcı Türü *</Label>
              <Select
                value={newReminder.type}
                onValueChange={(value) => setNewReminder({ ...newReminder, type: value as Reminder["type"] })}
              >
                <SelectTrigger id="reminder-type" data-testid="select-reminder-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">Bakım</SelectItem>
                  <SelectItem value="lease_end">Kira Sonu</SelectItem>
                  <SelectItem value="meter_reading">Sayaç Okuma</SelectItem>
                  <SelectItem value="inspection">Denetim</SelectItem>
                  <SelectItem value="other">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-title">Başlık *</Label>
              <Input
                id="reminder-title"
                placeholder="örn: Yıllık bakım"
                value={newReminder.title}
                onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                data-testid="input-reminder-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-date">Tarih *</Label>
              <Input
                id="reminder-date"
                type="date"
                value={newReminder.date}
                onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })}
                data-testid="input-reminder-date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-alert">Kaç Gün Önce Uyarı? *</Label>
              <Select
                value={newReminder.alertDaysBefore.toString()}
                onValueChange={(value) => setNewReminder({ ...newReminder, alertDaysBefore: parseInt(value) })}
              >
                <SelectTrigger id="reminder-alert" data-testid="select-reminder-alert">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 gün önce</SelectItem>
                  <SelectItem value="3">3 gün önce</SelectItem>
                  <SelectItem value="7">1 hafta önce</SelectItem>
                  <SelectItem value="14">2 hafta önce</SelectItem>
                  <SelectItem value="30">1 ay önce</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-recurring">Tekrarlama</Label>
              <Select
                value={newReminder.recurring || "none"}
                onValueChange={(value) => setNewReminder({ ...newReminder, recurring: value as Reminder["recurring"] })}
              >
                <SelectTrigger id="reminder-recurring" data-testid="select-reminder-recurring">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tekrarlanmaz</SelectItem>
                  <SelectItem value="monthly">Aylık</SelectItem>
                  <SelectItem value="yearly">Yıllık</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-note">Not (Opsiyonel)</Label>
              <Input
                id="reminder-note"
                placeholder="örn: Kalorifer bakımı yapılacak"
                value={newReminder.note}
                onChange={(e) => setNewReminder({ ...newReminder, note: e.target.value })}
                data-testid="input-reminder-note"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddReminderOpen(false);
                setNewReminder({
                  type: "maintenance",
                  title: "",
                  date: new Date().toISOString().split("T")[0],
                  alertDaysBefore: 7,
                  note: "",
                  recurring: "none",
                });
              }}
              data-testid="button-cancel-reminder"
            >
              İptal
            </Button>
            <Button
              onClick={() => {
                if (!newReminder.title || !newReminder.date) {
                  toast({
                    title: "Eksik Bilgi",
                    description: "Lütfen tüm zorunlu alanları doldurun",
                    variant: "destructive",
                  });
                  return;
                }

                if (selectedHouseForReminders) {
                  const updatedHouses = houses.map((h) => {
                    if (h.id === selectedHouseForReminders.id) {
                      return {
                        ...h,
                        reminders: [
                          ...(h.reminders || []),
                          {
                            id: `r${Date.now()}`,
                            ...newReminder,
                          },
                        ],
                      };
                    }
                    return h;
                  });
                  
                  setHouses(updatedHouses);
                  setSelectedHouseForReminders(updatedHouses.find(h => h.id === selectedHouseForReminders.id) || null);
                  
                  toast({
                    title: "Başarılı",
                    description: "Hatırlatıcı eklendi",
                  });

                  setIsAddReminderOpen(false);
                  setNewReminder({
                    type: "maintenance",
                    title: "",
                    date: new Date().toISOString().split("T")[0],
                    alertDaysBefore: 7,
                    note: "",
                    recurring: "none",
                  });
                }
              }}
              data-testid="button-save-reminder"
            >
              Kaydet
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Modal */}
      <Dialog open={photoModalOpen} onOpenChange={setPhotoModalOpen}>
        <DialogContent className="max-w-4xl p-0">
          <button
            onClick={() => setPhotoModalOpen(false)}
            className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
            data-testid="button-close-photo-modal"
          >
            <X className="w-4 h-4" />
          </button>
          {selectedPhoto && (
            <img 
              src={selectedPhoto} 
              alt="Sayaç fotoğrafı" 
              className="w-full h-auto"
              data-testid="img-modal-photo"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
