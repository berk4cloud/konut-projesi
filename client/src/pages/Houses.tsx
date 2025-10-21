import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Building2, MapPin, Edit, Bed, Trash2, ChevronsUpDown, Check, Zap, Droplet, Flame, FileText, Bell, Calendar, AlertCircle, Camera, X, Eye, Archive, ArchiveRestore, Save } from "lucide-react";
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

// Country type from API
type Country = {
  isoCode: string;
  nameTr: string;
  nameEn: string;
  nameDe: string;
  nameNl: string;
  nameFr: string;
  namePl: string;
  nameBg: string;
};

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

// Default pricing settings (used as fallback)
const defaultPricingSettings = {
  currency: "EUR" as "EUR" | "USD" | "TRY" | "GBP" | "CHF" | "CAD" | "MXN" | "CNY" | "JPY" | "RUB" | "SEK" | "NOK" | "DKK" | "HUF" | "PLN" | "CZK" | "RON" | "BGN" | "RSD" | "UAH",
  dailyRentalEnabled: false,
  standardPricing: {
    bedDailyPrice: 25,
    bedMonthlyPrice: 600,
    roomDailyPrice: 70,
    roomMonthlyPrice: 1700,
  }
};

// Pricing calculation helper functions
type HouseWithPricing = typeof initialMockHouses[0];

/**
 * Get the applicable price for a bed/room based on priority hierarchy:
 * 1. Room-specific pricing (if enabled)
 * 2. House-specific pricing (if enabled)
 * 3. Standard system pricing (from tenant settings)
 */
export function getApplicablePrice(
  room: RoomInfo,
  house: HouseWithPricing,
  priceType: 'bedDaily' | 'bedMonthly' | 'roomDaily' | 'roomMonthly',
  tenantPricing?: typeof defaultPricingSettings
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
  
  // Priority 3: Standard pricing (from tenant settings or default)
  const pricing = tenantPricing || defaultPricingSettings;
  return pricing.standardPricing[priceField];
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
        completed: false,
      },
      {
        id: "r2",
        type: "maintenance" as const,
        title: "Yıllık bakım",
        date: "2025-10-20",
        alertDaysBefore: 10,
        note: "Kalorifer bakımı",
        recurring: "yearly" as const,
        completed: false,
      },
    ],
    meterLogs: {
      electricity: [
        { id: "e1", date: "2024-12-15", value: 15420, note: "Normal okuma", photo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23666' font-size='24'%3EElektrik Sayacı%3C/text%3E%3C/svg%3E" },
        { id: "e2", date: "2024-11-15", value: 15180, note: "", photo: "" },
        { id: "e3", date: "2024-10-15", value: 14950, note: "", photo: "" },
      ],
      water: [
        { id: "w1", date: "2024-12-15", value: 8520, note: "Normal okuma", photo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e0f0ff' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23006699' font-size='24'%3ESu Sayacı%3C/text%3E%3C/svg%3E" },
        { id: "w2", date: "2024-11-15", value: 8410, note: "", photo: "" },
        { id: "w3", date: "2024-10-15", value: 8305, note: "", photo: "" },
      ],
      gas: [
        { id: "g1", date: "2024-12-15", value: 3420, note: "Normal okuma", photo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23fff8e0' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23cc8800' font-size='24'%3EGaz Sayacı%3C/text%3E%3C/svg%3E" },
        { id: "g2", date: "2024-11-15", value: 3280, note: "", photo: "" },
        { id: "g3", date: "2024-10-15", value: 3150, note: "", photo: "" },
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
        note: "",
        recurring: "yearly" as const,
        completed: false,
      },
      {
        id: "r4",
        type: "meter_reading" as const,
        title: "Sayaç okuma günü",
        date: "2025-10-18",
        alertDaysBefore: 3,
        note: "",
        recurring: "monthly" as const,
        completed: false,
      },
    ],
    meterLogs: {
      electricity: [
        { id: "e4", date: "2024-12-10", value: 22150, note: "Yılsonu okuması", photo: "" },
        { id: "e5", date: "2024-11-10", value: 21890, note: "", photo: "" },
      ],
      water: [
        { id: "w4", date: "2024-12-10", value: 12340, note: "", photo: "" },
        { id: "w5", date: "2024-11-10", value: 12210, note: "", photo: "" },
      ],
      gas: [
        { id: "g4", date: "2024-12-10", value: 4580, note: "", photo: "" },
        { id: "g5", date: "2024-11-10", value: 4420, note: "", photo: "" },
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
        completed: false,
      },
    ],
    meterLogs: {
      electricity: [
        { id: "e6", date: "2024-12-01", value: 18920, note: "", photo: "" },
        { id: "e7", date: "2024-11-01", value: 18720, note: "", photo: "" },
      ],
      water: [
        { id: "w6", date: "2024-12-01", value: 9850, note: "Kaçak kontrol edildi", photo: "" },
        { id: "w7", date: "2024-11-01", value: 9730, note: "", photo: "" },
      ],
      gas: [
        { id: "g6", date: "2024-12-01", value: 3850, note: "", photo: "" },
        { id: "g7", date: "2024-11-01", value: 3720, note: "", photo: "" },
      ],
    },
  },
];

export default function Houses() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHouse, setEditingHouse] = useState<typeof initialMockHouses[0] | null>(null);
  const [countryOpen, setCountryOpen] = useState(false);

  // Auth guard
  if (!isAuthenticated || !user) {
    return null;
  }

  // Load countries
  const { data: countriesData = [], isLoading: isLoadingCountries } = useQuery<Country[]>({
    queryKey: ["/api/countries"],
  });

  // Fetch tenant pricing settings
  const { data: tenantData } = useQuery<{pricingSettings: typeof defaultPricingSettings}>({
    queryKey: [`/api/tenants/${user.tenantId}`],
    enabled: !!user.tenantId,
  });
  const systemSettings = tenantData?.pricingSettings || defaultPricingSettings;

  // Fetch houses from API with fallback to initialMockHouses
  const { data: apiHouses, isLoading: isLoadingHouses, error: housesError } = useQuery({
    queryKey: [`/api/houses?tenantId=${user.tenantId}`],
    enabled: !!user.tenantId,
  });

  // Merge API data with client-side features from localStorage
  const getClientSideData = (houseId: string) => {
    const stored = localStorage.getItem(`house_client_data_${houseId}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return {};
      }
    }
    return {};
  };

  // Save client-side data to localStorage
  const saveClientSideData = (houseId: string, data: any) => {
    localStorage.setItem(`house_client_data_${houseId}`, JSON.stringify(data));
  };

  // Merge API houses with client-side data (pricing, meterLogs, leaseContract, reminders)
  const houses = useMemo(() => {
    const baseHouses = apiHouses || [];
    
    return baseHouses.map((house: any) => {
      const clientData = getClientSideData(house.id);
      return {
        ...house,
        totalBeds: house.totalBeds || house.rooms?.reduce((sum: number, r: any) => sum + (r.beds || 0), 0) || 0,
        occupiedBeds: clientData.occupiedBeds || 0,
        archived: clientData.archived || false,
        pricing: clientData.pricing || { useCustomPricing: false },
        leaseContract: clientData.leaseContract,
        reminders: clientData.reminders || [],
        meterLogs: clientData.meterLogs || { electricity: [], water: [], gas: [] },
        useCustomName: clientData.useCustomName || false,
        customName: clientData.customName || "",
      };
    });
  }, [apiHouses]);

  // Create house mutation
  const createHouseMutation = useMutation({
    mutationFn: async (houseData: any) => {
      const response = await apiRequest("POST", "/api/houses", {
        tenantId: user.tenantId,
        name: houseData.name,
        address: houseData.address,
        city: houseData.city,
        country: houseData.country,
        ownershipType: houseData.ownershipType,
        rooms: houseData.rooms,
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Save client-side data (pricing, meterLogs, etc.)
      saveClientSideData(data.id, {
        pricing: data.pricing,
        leaseContract: data.leaseContract,
        reminders: data.reminders || [],
        meterLogs: data.meterLogs || { electricity: [], water: [], gas: [] },
        occupiedBeds: data.occupiedBeds || 0,
        archived: false,
        useCustomName: data.useCustomName || false,
        customName: data.customName || "",
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["/api/houses", user.tenantId] });
    },
  });

  // Update house mutation
  const updateHouseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/houses/${id}`, {
        name: data.name,
        address: data.address,
        city: data.city,
        country: data.country,
        ownershipType: data.ownershipType,
        rooms: data.rooms,
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Update client-side data
      const existingClientData = getClientSideData(variables.id);
      saveClientSideData(variables.id, {
        ...existingClientData,
        pricing: variables.data.pricing,
        useCustomName: variables.data.useCustomName,
        customName: variables.data.customName,
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["/api/houses", user.tenantId] });
    },
  });

  // Delete house mutation
  const deleteHouseMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/houses/${id}`, undefined);
      return { success: true };
    },
    onSuccess: (_, id) => {
      // Clean up localStorage for this house
      localStorage.removeItem(`house_client_data_${id}`);
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["/api/houses", user.tenantId] });
    },
  });

  // Get localized country name with proper language normalization
  const getCountryName = (country: Country, language: string) => {
    // Normalize language code (handle en-US → en, etc.)
    const normalizedLang = language.split('-')[0] as 'tr' | 'en' | 'de' | 'nl' | 'fr' | 'pl' | 'bg';
    const nameKey = `name${normalizedLang.charAt(0).toUpperCase()}${normalizedLang.slice(1)}` as keyof Country;
    return country[nameKey] as string;
  };

  // Build prioritized country list (default → favorites → alphabetical)
  // useMemo for stability across re-renders
  const countries = useMemo(() => {
    if (!countriesData.length) return [];
    
    const currentLang = i18n.resolvedLanguage || i18n.language;
    const favoriteIsoCodes = user.favoriteCountries || [];
    const defaultIso = user.defaultCountry;
    
    // Separate into categories
    const defaultCountry = defaultIso ? countriesData.find(c => c.isoCode === defaultIso) : null;
    const favoriteCountries = countriesData.filter(c => favoriteIsoCodes.includes(c.isoCode) && c.isoCode !== defaultIso);
    const otherCountries = countriesData.filter(c => !favoriteIsoCodes.includes(c.isoCode) && c.isoCode !== defaultIso);
    
    // Sort alphabetically by localized name
    favoriteCountries.sort((a, b) => getCountryName(a, currentLang).localeCompare(getCountryName(b, currentLang)));
    otherCountries.sort((a, b) => getCountryName(a, currentLang).localeCompare(getCountryName(b, currentLang)));
    
    // Combine: default → favorites → others
    const result = [];
    if (defaultCountry) result.push(defaultCountry);
    result.push(...favoriteCountries, ...otherCountries);
    
    return result.map(c => ({
      value: c.isoCode,
      label: getCountryName(c, currentLang)
    }));
  }, [countriesData, user.favoriteCountries, user.defaultCountry, i18n.resolvedLanguage, i18n.language]);
  
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
    // Find which house has this reminder
    const house = houses.find(h => h.reminders?.some(r => r.id === reminderId));
    if (!house) return;
    
    // Update client-side data in localStorage
    const existingClientData = getClientSideData(house.id);
    const updatedReminders = existingClientData.reminders?.map((reminder: any) =>
      reminder.id === reminderId
        ? { ...reminder, completed: true, completedAt: new Date().toISOString() }
        : reminder
    ) || [];
    
    saveClientSideData(house.id, {
      ...existingClientData,
      reminders: updatedReminders,
    });
    
    // Trigger re-render
    queryClient.invalidateQueries({ queryKey: ["/api/houses", user.tenantId] });
    
    toast({
      title: "Hatırlatma tamamlandı",
      description: "Hatırlatma başarıyla tamamlandı olarak işaretlendi.",
    });
  };
  
  const handleAddNoteToReminder = (reminderId: string, note: string) => {
    // Find which house has this reminder
    const house = houses.find(h => h.reminders?.some(r => r.id === reminderId));
    if (!house) return;
    
    // Update client-side data in localStorage
    const existingClientData = getClientSideData(house.id);
    const updatedReminders = existingClientData.reminders?.map((reminder: any) =>
      reminder.id === reminderId ? { ...reminder, note } : reminder
    ) || [];
    
    saveClientSideData(house.id, {
      ...existingClientData,
      reminders: updatedReminders,
    });
    
    // Trigger re-render
    queryClient.invalidateQueries({ queryKey: ["/api/houses", user.tenantId] });
    
    toast({
      title: "Not eklendi",
      description: "Hatırlatmaya not başarıyla eklendi.",
    });
  };
  
  // Lease contract state
  const [isLeaseDialogOpen, setIsLeaseDialogOpen] = useState(false);
  const [selectedHouseForLease, setSelectedHouseForLease] = useState<typeof initialMockHouses[0] | null>(null);
  const [isEditingLease, setIsEditingLease] = useState(false);
  const [editedLeaseData, setEditedLeaseData] = useState<{
    startDate: string;
    endDate: string;
    monthlyRent: string;
    paymentDay: string;
  }>({
    startDate: "",
    endDate: "",
    monthlyRent: "",
    paymentDay: "1",
  });
  
  const handleEditLease = () => {
    if (selectedHouseForLease?.leaseContract) {
      setEditedLeaseData({
        startDate: selectedHouseForLease.leaseContract.startDate,
        endDate: selectedHouseForLease.leaseContract.endDate || "",
        monthlyRent: selectedHouseForLease.leaseContract.monthlyRent.toString(),
        paymentDay: selectedHouseForLease.leaseContract.paymentDay.toString(),
      });
      setIsEditingLease(true);
    }
  };
  
  const handleSaveLease = () => {
    if (!selectedHouseForLease) return;
    
    const monthlyRent = parseFloat(editedLeaseData.monthlyRent);
    const paymentDay = parseInt(editedLeaseData.paymentDay);
    
    if (isNaN(monthlyRent) || monthlyRent <= 0) {
      toast({
        title: "Hata",
        description: "Geçerli bir kira tutarı girin",
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(paymentDay) || paymentDay < 1 || paymentDay > 31) {
      toast({
        title: "Hata",
        description: "Ödeme günü 1-31 arasında olmalıdır",
        variant: "destructive",
      });
      return;
    }
    
    // Update client-side data in localStorage
    const existingClientData = getClientSideData(selectedHouseForLease.id);
    saveClientSideData(selectedHouseForLease.id, {
      ...existingClientData,
      leaseContract: {
        ...existingClientData.leaseContract,
        startDate: editedLeaseData.startDate,
        endDate: editedLeaseData.endDate || null,
        monthlyRent,
        paymentDay,
      },
    });
    
    // Trigger re-render
    queryClient.invalidateQueries({ queryKey: ["/api/houses", user.tenantId] });
    
    toast({
      title: "Başarılı",
      description: "Kira sözleşmesi güncellendi",
    });
    
    setIsEditingLease(false);
  };
  
  const handleCancelEditLease = () => {
    setIsEditingLease(false);
    setEditedLeaseData({
      startDate: "",
      endDate: "",
      monthlyRent: "",
      paymentDay: "1",
    });
  };
  
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

  // State to track newly added room for temporary highlighting
  const [newlyAddedRoomIndex, setNewlyAddedRoomIndex] = useState<number | null>(null);
  
  // Track previous room count to detect when new room is added
  const prevRoomsLength = useRef(formData.rooms.length);

  // Effect to highlight newly added room
  useEffect(() => {
    // If a new room was added (rooms length increased)
    if (formData.rooms.length > prevRoomsLength.current) {
      const newRoomIndex = formData.rooms.length - 1;
      setNewlyAddedRoomIndex(newRoomIndex);
      
      // Remove highlight after 3 seconds
      const timeoutId = setTimeout(() => {
        setNewlyAddedRoomIndex(null);
      }, 3000);
      
      // Cleanup timeout if component unmounts or rooms change again
      return () => clearTimeout(timeoutId);
    }
    
    // Update previous rooms length
    prevRoomsLength.current = formData.rooms.length;
  }, [formData.rooms.length]);

  const filteredHouses = houses
    .filter((house) => {
      // Filter by search query
      const matchesSearch = 
        house.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        house.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        house.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by archived status
      const matchesArchiveFilter = showArchived ? true : !house.archived;
      
      return matchesSearch && matchesArchiveFilter;
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'tr-TR')); // Sort alphabetically by name

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
      rooms: house.rooms.map(room => ({
        id: room.id,
        roomNumber: room.roomNumber,
        floor: room.floor,
        beds: Array.isArray(room.beds) ? room.beds.length : (room.beds || 0),
        canRentAsRoom: room.canRentAsRoom || false,
        useFloor: room.useFloor !== undefined ? room.useFloor : (room.floor !== null && room.floor !== undefined),
        pricing: room.pricing || {
          useCustomPricing: false,
        },
      })),
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
    setFormData(prevFormData => ({
      ...prevFormData,
      rooms: [...prevFormData.rooms, { 
        roomNumber: "", 
        beds: 1, 
        canRentAsRoom: false, 
        useFloor: false, 
        floor: undefined,
        pricing: {
          useCustomPricing: false,
        }
      }],
    }));
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
    return formData.rooms.reduce((sum, room) => {
      // Handle beds: can be number (from form) or array (from API GET response)
      const bedCount = Array.isArray(room.beds) ? room.beds.length : (room.beds || 0);
      return sum + bedCount;
    }, 0);
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
      note: newReading.note || "",
      photo: newReading.photo || "",
    };

    // Update client-side data in localStorage
    const existingClientData = getClientSideData(selectedHouseForMeters.id);
    const updatedLogs = { ...(existingClientData.meterLogs || { electricity: [], water: [], gas: [] }) };
    
    if (newReading.meterType === "electricity") {
      updatedLogs.electricity = [newReadingData, ...(updatedLogs.electricity || [])] as MeterReading[];
    } else if (newReading.meterType === "water") {
      updatedLogs.water = [newReadingData, ...(updatedLogs.water || [])] as MeterReading[];
    } else {
      updatedLogs.gas = [newReadingData, ...(updatedLogs.gas || [])] as MeterReading[];
    }
    
    saveClientSideData(selectedHouseForMeters.id, {
      ...existingClientData,
      meterLogs: updatedLogs,
    });

    // Update selectedHouseForMeters to reflect changes
    setSelectedHouseForMeters({ ...selectedHouseForMeters, meterLogs: updatedLogs });
    
    // Trigger re-render
    queryClient.invalidateQueries({ queryKey: ["/api/houses", user.tenantId] });

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

  const handleSave = async () => {
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
    
    // Prepare house data for API
    const houseData = {
      name: getDisplayName(formData.customName, formData.address, formData.useCustomName),
      address: formData.address,
      city: formData.city,
      country: formData.country,
      ownershipType: formData.ownershipType,
      rooms: formData.rooms,
      // Client-side data (will be saved to localStorage)
      pricing: formData.pricing,
      useCustomName: formData.useCustomName,
      customName: formData.customName,
      leaseContract: formData.ownershipType === "Kiralık" ? {
        startDate: new Date().toISOString().split('T')[0],
        monthlyRent: 0,
        currency: "EUR",
        paymentDay: 1,
      } : undefined,
      reminders: editingHouse?.reminders || [],
      meterLogs: editingHouse?.meterLogs || {
        electricity: [],
        water: [],
        gas: [],
      },
      occupiedBeds: editingHouse?.occupiedBeds || 0,
    };
    
    try {
      if (editingHouse) {
        // Update existing house
        await updateHouseMutation.mutateAsync({
          id: editingHouse.id,
          data: houseData,
        });
        
        toast({
          title: t("houses.success"),
          description: t("houses.houseUpdated"),
        });
      } else {
        // Create new house
        await createHouseMutation.mutateAsync(houseData);
        
        toast({
          title: t("houses.success"),
          description: t("houses.houseAdded"),
        });
      }
      
      setIsDialogOpen(false);
      setNewlyAddedRoomIndex(null); // Clear highlight when saving
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Kaydetme başarısız oldu",
        variant: "destructive",
      });
    }
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
              <h2 className="text-2xl font-bold mb-2">{t("houses.title")}</h2>
              <p className="text-muted-foreground">{t("houses.description")}</p>
            </div>
            <Button onClick={handleAddNew} data-testid="button-add-house">
              <Plus className="w-4 h-4 mr-2" />
              {t("houses.addNew")}
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("houses.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-house"
              />
            </div>
            
            <div className="flex items-center gap-3 px-4 py-2 border rounded-lg bg-card">
              <Archive className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t("houses.showArchived")}</span>
              <Switch
                checked={showArchived}
                onCheckedChange={setShowArchived}
                data-testid="switch-show-archived"
              />
            </div>
          </div>

          {/* Loading state */}
          {isLoadingHouses ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">{t("common.loading") || "Yükleniyor..."}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHouses.map((house) => {
                const occupancyRate = ((house.occupiedBeds / house.totalBeds) * 100).toFixed(0);
                const emptyBeds = house.totalBeds - house.occupiedBeds;
              
              // Get translated ownership type
              const getOwnershipTypeLabel = (type: string) => {
                if (type === "Kiralık") return t("houses.rented");
                if (type === "Mülk") return t("houses.owned");
                if (type === "3. Taraf") return t("houses.thirdParty");
                return type;
              };

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
                                {t("houses.archived")}
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
                        {getOwnershipTypeLabel(house.ownershipType)}
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
                        <p className="text-xs text-muted-foreground">{t("houses.roomCount")}</p>
                        <p className="text-lg font-semibold" data-testid={`text-room-count-${house.id}`}>
                          {house.rooms.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("houses.totalBeds")}</p>
                        <p className="text-lg font-semibold flex items-center gap-1" data-testid={`text-total-beds-${house.id}`}>
                          <Bed className="w-4 h-4" />
                          {house.totalBeds}
                        </p>
                      </div>
                    </div>

                    {/* Room details with rental status */}
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">{t("houses.rooms")}</p>
                      <div className="space-y-1.5">
                        {house.rooms.map((room) => (
                          <div 
                            key={room.roomNumber} 
                            className="flex items-center justify-between text-sm bg-muted/40 rounded px-2 py-1.5"
                            data-testid={`room-info-${house.id}-${room.roomNumber}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{t("houses.room")} {room.roomNumber}</span>
                              {room.useFloor && room.floor !== undefined && (
                                <span className="text-xs text-muted-foreground" data-testid={`text-floor-${house.id}-${room.roomNumber}`}>
                                  ({t("houses.floor")} {room.floor})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">
                                {Array.isArray(room.beds) ? room.beds.length : room.beds} {t("houses.beds")}
                              </span>
                              {room.canRentAsRoom && (
                                <Badge variant="outline" className="text-xs" data-testid={`badge-can-rent-${house.id}-${room.roomNumber}`}>
                                  {t("houses.canRentRoom")}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t("houses.occupancy")}</span>
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
                          {t("houses.occupied")} {house.occupiedBeds}
                        </span>
                        <span data-testid={`text-empty-beds-${house.id}`}>
                          {t("houses.empty")} {emptyBeds}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(house)}
                        data-testid={`button-edit-house-${house.id}`}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        {t("houses.edit")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedHouseForMeters(house);
                          setIsMeterDialogOpen(true);
                        }}
                        data-testid={`button-meters-${house.id}`}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        {t("houses.meters")}
                      </Button>
                      
                      {(house.ownershipType === "Kiralık" || house.ownershipType === "3. Taraf") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedHouseForLease(house);
                            setIsLeaseDialogOpen(true);
                          }}
                          data-testid={`button-lease-${house.id}`}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          {t("houses.leaseDetails")}
                        </Button>
                      )}
                      
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
                        {t("houses.reminders")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          )}

          {!isLoadingHouses && filteredHouses.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground" data-testid="text-no-houses">
                {t("houses.noHouses")}
              </p>
            </div>
          )}
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingHouse ? t("houses.editHouse") : t("houses.addHouse")}
            </DialogTitle>
            <DialogDescription>
              {editingHouse 
                ? t("houses.editHouseDescription") 
                : t("houses.addHouseDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="address">{t("houses.address")} *</Label>
              <Input
                id="address"
                placeholder={t("houses.addressPlaceholder")}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                data-testid="input-house-address"
              />
              <p className="text-xs text-muted-foreground">
                {t("houses.addressHelper")}
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
                  {t("houses.useCustomName")}
                </Label>
              </div>

              {formData.useCustomName && (
                <div className="space-y-2 pl-6">
                  <Label htmlFor="customName">{t("houses.customName")} *</Label>
                  <Input
                    id="customName"
                    placeholder={t("houses.customNamePlaceholder")}
                    value={formData.customName}
                    onChange={(e) => setFormData({ ...formData, customName: e.target.value })}
                    data-testid="input-custom-name"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("houses.customNamePreview", { name: formData.customName || "...", address: formData.address || "..." })}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">{t("houses.city")} *</Label>
                <Input
                  id="city"
                  placeholder={t("houses.cityPlaceholder")}
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  data-testid="input-house-city"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">{t("houses.country")} *</Label>
                <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={countryOpen}
                      className="w-full justify-between"
                      data-testid="select-house-country"
                    >
                      {formData.country 
                        ? countries.find(c => c.value === formData.country)?.label || formData.country
                        : t("houses.selectCountry")}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command shouldFilter={false}>
                      <CommandInput placeholder={t("houses.searchCountry")} />
                      <CommandList>
                        <CommandEmpty>{t("houses.countryNotFound")}</CommandEmpty>
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
              <Label htmlFor="ownershipType">{t("houses.ownershipType")} *</Label>
              <Select
                value={formData.ownershipType}
                onValueChange={(value) => setFormData({ ...formData, ownershipType: value })}
              >
                <SelectTrigger id="ownershipType" data-testid="select-ownership-type">
                  <SelectValue placeholder={t("houses.selectOwnershipType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kiralık">{t("houses.rented")}</SelectItem>
                  <SelectItem value="Mülk">{t("houses.owned")}</SelectItem>
                  <SelectItem value="3. Taraf">{t("houses.thirdParty")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* House Pricing Section - Moved before Rooms */}
            <div className="space-y-4 pt-4 border-t p-4 rounded-lg bg-orange-50/40 dark:bg-orange-950/20">
              <div>
                <Label className="text-base font-semibold">{t("houses.housePricing")}</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("houses.housePricingDesc")}
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
                  {t("houses.useCustomPricing")}
                </Label>
              </div>

              {formData.pricing.useCustomPricing && (
                <div className="space-y-3 pl-6">
                  <div className="grid grid-cols-2 gap-4">
                    {systemSettings.dailyRentalEnabled && (
                      <div className="space-y-2">
                        <Label htmlFor="house-bed-daily-price">{t("houses.bedDaily")}</Label>
                        <Input
                          id="house-bed-daily-price"
                          data-testid="input-house-bed-daily-price"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder={`${t("houses.standard")}: €${systemSettings.standardPricing.bedDailyPrice}`}
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
                      <Label htmlFor="house-bed-monthly-price">{t("houses.bedMonthly")}</Label>
                      <Input
                        id="house-bed-monthly-price"
                        data-testid="input-house-bed-monthly-price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={`${t("houses.standard")}: €${systemSettings.standardPricing.bedMonthlyPrice}`}
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
                        <Label htmlFor="house-room-daily-price">{t("houses.roomDaily")}</Label>
                        <Input
                          id="house-room-daily-price"
                          data-testid="input-house-room-daily-price"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder={`${t("houses.standard")}: €${systemSettings.standardPricing.roomDailyPrice}`}
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
                      <Label htmlFor="house-room-monthly-price">{t("houses.roomMonthly")}</Label>
                      <Input
                        id="house-room-monthly-price"
                        data-testid="input-house-room-monthly-price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={`${t("houses.standard")}: €${systemSettings.standardPricing.roomMonthlyPrice}`}
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

            {/* Rooms Section */}
            <div className="space-y-4 pt-4 border-t">
              <div>
                <Label className="text-base font-semibold">{t("houses.roomsSection")}</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("houses.roomsSectionDesc")}
                </p>
              </div>

              {formData.rooms.length === 0 && (
                <div className="text-center py-8 bg-muted/50 rounded-lg border-2 border-dashed">
                  <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {t("houses.noRoomsAdded")}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {formData.rooms.map((room, index) => {
                  const isNewlyAdded = index === newlyAddedRoomIndex;
                  return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border space-y-3 transition-colors duration-300 ${
                      isNewlyAdded 
                        ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' 
                        : 'bg-muted/30'
                    }`}
                    data-testid={`room-item-${index}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold">{t("houses.room")} {index + 1}</span>
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
                        <Label htmlFor={`room-number-${index}`}>{t("houses.roomNumber")} *</Label>
                        <Input
                          id={`room-number-${index}`}
                          placeholder={t("houses.roomNumberPlaceholder")}
                          value={room.roomNumber}
                          onChange={(e) => handleRoomChange(index, "roomNumber", e.target.value)}
                          data-testid={`input-room-number-${index}`}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`beds-${index}`}>{t("houses.bedCount")} *</Label>
                        <Input
                          id={`beds-${index}`}
                          type="number"
                          min="1"
                          placeholder={t("houses.bedCountPlaceholder")}
                          value={(() => {
                            const bedCount = Array.isArray(room.beds) ? room.beds.length : (room.beds || 0);
                            return bedCount === 0 ? "" : bedCount;
                          })()}
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
                          {t("houses.canRentAsRoom")}
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
                            {t("houses.includeFloor")}
                          </Label>
                        </div>

                        {room.useFloor && (
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`floor-${index}`} className="text-sm">{t("houses.floor")}:</Label>
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
                          {t("houses.roomPricing")}
                        </Label>
                      </div>

                      {room.pricing?.useCustomPricing && (
                        <div className="space-y-3 pl-6">
                          <div className="grid grid-cols-2 gap-3">
                            {systemSettings.dailyRentalEnabled && (
                              <div className="space-y-2">
                                <Label htmlFor={`room-bed-daily-${index}`} className="text-xs">{t("houses.bedDaily")}</Label>
                                <Input
                                  id={`room-bed-daily-${index}`}
                                  data-testid={`input-room-bed-daily-${index}`}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder={`€${getApplicablePrice(room, formData as any, 'bedDaily')}`}
                                  value={room.pricing?.bedDailyPrice ?? ""}
                                  onChange={(e) => {
                                    const value = e.target.value ? parseFloat(e.target.value) : undefined;
                                    const newRooms = [...formData.rooms];
                                    const existingPricing = newRooms[index].pricing || {};
                                    newRooms[index] = {
                                      ...newRooms[index],
                                      pricing: {
                                        ...existingPricing,
                                        useCustomPricing: value !== undefined ? true : (existingPricing.useCustomPricing || false),
                                        bedDailyPrice: value
                                      }
                                    };
                                    setFormData({ ...formData, rooms: newRooms });
                                  }}
                                />
                              </div>
                            )}
                            <div className="space-y-2">
                              <Label htmlFor={`room-bed-monthly-${index}`} className="text-xs">{t("houses.bedMonthly")}</Label>
                              <Input
                                id={`room-bed-monthly-${index}`}
                                data-testid={`input-room-bed-monthly-${index}`}
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder={`€${getApplicablePrice(room, formData as any, 'bedMonthly')}`}
                                value={room.pricing?.bedMonthlyPrice ?? ""}
                                onChange={(e) => {
                                  const value = e.target.value ? parseFloat(e.target.value) : undefined;
                                  const newRooms = [...formData.rooms];
                                  const existingPricing = newRooms[index].pricing || {};
                                  newRooms[index] = {
                                    ...newRooms[index],
                                    pricing: {
                                      ...existingPricing,
                                      useCustomPricing: value !== undefined ? true : (existingPricing.useCustomPricing || false),
                                      bedMonthlyPrice: value
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
                                  <Label htmlFor={`room-room-daily-${index}`} className="text-xs">{t("houses.roomDaily")}</Label>
                                  <Input
                                    id={`room-room-daily-${index}`}
                                    data-testid={`input-room-room-daily-${index}`}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder={`€${getApplicablePrice(room, formData as any, 'roomDaily')}`}
                                    value={room.pricing?.roomDailyPrice ?? ""}
                                    onChange={(e) => {
                                      const value = e.target.value ? parseFloat(e.target.value) : undefined;
                                      const newRooms = [...formData.rooms];
                                      const existingPricing = newRooms[index].pricing || {};
                                      newRooms[index] = {
                                        ...newRooms[index],
                                        pricing: {
                                          ...existingPricing,
                                          useCustomPricing: value !== undefined ? true : (existingPricing.useCustomPricing || false),
                                          roomDailyPrice: value
                                        }
                                      };
                                      setFormData({ ...formData, rooms: newRooms });
                                    }}
                                  />
                                </div>
                              )}
                              <div className="space-y-2">
                                <Label htmlFor={`room-room-monthly-${index}`} className="text-xs">{t("houses.roomMonthly")}</Label>
                                <Input
                                  id={`room-room-monthly-${index}`}
                                  data-testid={`input-room-room-monthly-${index}`}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder={`€${getApplicablePrice(room, formData as any, 'roomMonthly')}`}
                                  value={room.pricing?.roomMonthlyPrice ?? ""}
                                  onChange={(e) => {
                                    const value = e.target.value ? parseFloat(e.target.value) : undefined;
                                    const newRooms = [...formData.rooms];
                                    const existingPricing = newRooms[index].pricing || {};
                                    newRooms[index] = {
                                      ...newRooms[index],
                                      pricing: {
                                        ...existingPricing,
                                        useCustomPricing: value !== undefined ? true : (existingPricing.useCustomPricing || false),
                                        roomMonthlyPrice: value
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
                {t("houses.addRoom")}
              </Button>

              {formData.rooms.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium text-blue-900">{t("houses.totalBedCount")}</span>
                  <span className="text-lg font-bold text-blue-900" data-testid="text-calculated-total-beds">
                    {calculateTotalBeds()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-between">
            {editingHouse && (
              <Button
                variant="outline"
                onClick={() => {
                  if (!editingHouse) return;
                  
                  // Update client-side data in localStorage
                  const existingClientData = getClientSideData(editingHouse.id);
                  saveClientSideData(editingHouse.id, {
                    ...existingClientData,
                    archived: !editingHouse.archived,
                  });
                  
                  // Trigger re-render
                  queryClient.invalidateQueries({ queryKey: ["/api/houses", user.tenantId] });
                  
                  setIsDialogOpen(false);
                  toast({
                    title: editingHouse.archived ? t("houses.unarchivedTitle") : t("houses.archivedTitle"),
                    description: editingHouse.archived 
                      ? t("houses.unarchivedDesc")
                      : t("houses.archivedDesc"),
                  });
                }}
                data-testid="button-toggle-archive"
              >
                {editingHouse.archived ? (
                  <>
                    <ArchiveRestore className="w-4 h-4 mr-2" />
                    {t("houses.unarchive")}
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4 mr-2" />
                    {t("houses.archive")}
                  </>
                )}
              </Button>
            )}
            
            <div className="flex gap-3 ml-auto">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setNewlyAddedRoomIndex(null); // Clear highlight when closing dialog
                }}
                data-testid="button-cancel"
              >
                {t("common.cancel")}
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={createHouseMutation.isPending || updateHouseMutation.isPending}
                data-testid="button-save-house"
              >
                {(createHouseMutation.isPending || updateHouseMutation.isPending) ? t("common.saving") : (editingHouse ? t("common.update") : t("common.save"))}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Meter Logs Dialog */}
      <Dialog open={isMeterDialogOpen} onOpenChange={setIsMeterDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("meters.title")}</DialogTitle>
            <DialogDescription>
              {t("meters.description", { houseName: selectedHouseForMeters?.name })}
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
                  <h3 className="font-semibold">{t("meters.electricity")}</h3>
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
                                  {new Date(reading.date).toLocaleDateString(i18n.language, { 
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
                                  {reading.value.toLocaleString(i18n.language)} kWh
                                </p>
                                {consumption !== null && (
                                  <p className="text-xs text-muted-foreground" data-testid={`text-consumption-${reading.id}`}>
                                    +{consumption.toLocaleString(i18n.language)} kWh
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
                        {t("meters.showMore", { count: selectedHouseForMeters.meterLogs.electricity.length - 3 })}
                      </button>
                    )}
                    {showAllElectricity && selectedHouseForMeters.meterLogs.electricity.length > 3 && (
                      <button
                        onClick={() => setShowAllElectricity(false)}
                        className="text-sm text-primary hover:underline"
                        data-testid="button-show-less-electricity"
                      >
                        {t("meters.showLess")}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("meters.noRecords")}</p>
                )}
              </div>

              {/* Water Meter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Droplet className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">{t("meters.water")}</h3>
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
                                  {new Date(reading.date).toLocaleDateString(i18n.language, { 
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
                                  {reading.value.toLocaleString(i18n.language)} m³
                                </p>
                                {consumption !== null && (
                                  <p className="text-xs text-muted-foreground" data-testid={`text-consumption-${reading.id}`}>
                                    +{consumption.toLocaleString(i18n.language)} m³
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
                        {t("meters.showMore", { count: selectedHouseForMeters.meterLogs.water.length - 3 })}
                      </button>
                    )}
                    {showAllWater && selectedHouseForMeters.meterLogs.water.length > 3 && (
                      <button
                        onClick={() => setShowAllWater(false)}
                        className="text-sm text-primary hover:underline"
                        data-testid="button-show-less-water"
                      >
                        {t("meters.showLess")}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("meters.noRecords")}</p>
                )}
              </div>

              {/* Gas Meter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Flame className="w-4 h-4 text-orange-600" />
                  </div>
                  <h3 className="font-semibold">{t("meters.gas")}</h3>
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
                                  {new Date(reading.date).toLocaleDateString(i18n.language, { 
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
                                  {reading.value.toLocaleString(i18n.language)} m³
                                </p>
                                {consumption !== null && (
                                  <p className="text-xs text-muted-foreground" data-testid={`text-consumption-${reading.id}`}>
                                    +{consumption.toLocaleString(i18n.language)} m³
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
                        {t("meters.showMore", { count: selectedHouseForMeters.meterLogs.gas.length - 3 })}
                      </button>
                    )}
                    {showAllGas && selectedHouseForMeters.meterLogs.gas.length > 3 && (
                      <button
                        onClick={() => setShowAllGas(false)}
                        className="text-sm text-primary hover:underline"
                        data-testid="button-show-less-gas"
                      >
                        {t("meters.showLess")}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("meters.noRecords")}</p>
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
              {t("common.close")}
            </Button>
            <Button 
              onClick={() => setIsAddReadingOpen(true)}
              data-testid="button-add-meter-reading"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("meters.addReading")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add New Meter Reading Dialog */}
      <Dialog open={isAddReadingOpen} onOpenChange={setIsAddReadingOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("meters.addReadingTitle")}</DialogTitle>
            <DialogDescription>
              {t("meters.addReadingDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meter-type">{t("meters.meterType")}</Label>
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
                      {t("meters.electricityOption")}
                    </div>
                  </SelectItem>
                  <SelectItem value="water">
                    <div className="flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-blue-600" />
                      {t("meters.waterOption")}
                    </div>
                  </SelectItem>
                  <SelectItem value="gas">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-600" />
                      {t("meters.gasOption")}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reading-date">{t("meters.dateRequired")}</Label>
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
                {t("meters.valueLabel", { unit: newReading.meterType === "electricity" ? "kWh" : "m³" })}
              </Label>
              <Input
                id="reading-value"
                type="number"
                step="0.01"
                placeholder={t("meters.valuePlaceholder", { value: newReading.meterType === "electricity" ? "15420" : "8520" })}
                value={newReading.value}
                onChange={(e) => setNewReading({ ...newReading, value: e.target.value })}
                data-testid="input-reading-value"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reading-note">{t("meters.noteOptional")}</Label>
              <Input
                id="reading-note"
                placeholder={t("meters.notePlaceholder")}
                value={newReading.note}
                onChange={(e) => setNewReading({ ...newReading, note: e.target.value })}
                data-testid="input-reading-note"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reading-photo">{t("meters.photoOptional")}</Label>
              {newReading.photo ? (
                <div className="relative">
                  <img 
                    src={newReading.photo} 
                    alt={t("meters.photoAlt")} 
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
                  <span className="text-sm">{t("meters.addPhoto")}</span>
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
                            title: t("common.error"),
                            description: t("meters.photoError"),
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
              {t("common.cancel")}
            </Button>
            <Button 
              onClick={handleAddMeterReading}
              data-testid="button-save-reading"
            >
              {t("common.save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lease Contract Dialog */}
      <Dialog open={isLeaseDialogOpen} onOpenChange={(open) => {
        setIsLeaseDialogOpen(open);
        if (!open) {
          setIsEditingLease(false);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("lease.title")}</DialogTitle>
            <DialogDescription>
              {selectedHouseForLease?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedHouseForLease?.leaseContract ? (
            <>
              {!isEditingLease ? (
                // View Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{t("lease.startDate")}</p>
                      <p className="font-medium" data-testid="text-lease-start">
                        {new Date(selectedHouseForLease.leaseContract.startDate).toLocaleDateString(i18n.language)}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{t("lease.endDate")}</p>
                      <p className="font-medium" data-testid="text-lease-end">
                        {selectedHouseForLease.leaseContract.endDate 
                          ? new Date(selectedHouseForLease.leaseContract.endDate).toLocaleDateString(i18n.language)
                          : t("lease.indefinite")}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{t("lease.monthlyRent")}</p>
                      <p className="text-2xl font-semibold" data-testid="text-lease-rent">
                        {selectedHouseForLease.leaseContract.monthlyRent.toLocaleString()} {selectedHouseForLease.leaseContract.currency}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{t("lease.paymentDay")}</p>
                      <p className="font-medium" data-testid="text-lease-payment-day">
                        {t("lease.dayOfMonth", { day: selectedHouseForLease.leaseContract.paymentDay })}
                      </p>
                    </div>
                  </div>
                  
                  {selectedHouseForLease.leaseContract.endDate && (
                    <div className="p-4 bg-muted/50 rounded-lg border">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">{t("lease.contractEndWarning")}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t("lease.contractEndsInDays", { 
                              days: Math.ceil(
                                (new Date(selectedHouseForLease.leaseContract.endDate).getTime() - new Date().getTime()) / 
                                (1000 * 60 * 60 * 24)
                              )
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end pt-4 border-t">
                    <Button onClick={handleEditLease} data-testid="button-edit-lease">
                      <Edit className="w-4 h-4 mr-2" />
                      {t("common.edit")}
                    </Button>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-lease-start">{t("lease.startDateRequired")}</Label>
                      <Input
                        id="edit-lease-start"
                        type="date"
                        value={editedLeaseData.startDate}
                        onChange={(e) => setEditedLeaseData({ ...editedLeaseData, startDate: e.target.value })}
                        data-testid="input-edit-lease-start"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-lease-end">{t("lease.endDateRequired")}</Label>
                      <Input
                        id="edit-lease-end"
                        type="date"
                        value={editedLeaseData.endDate}
                        onChange={(e) => setEditedLeaseData({ ...editedLeaseData, endDate: e.target.value })}
                        data-testid="input-edit-lease-end"
                      />
                      <p className="text-xs text-muted-foreground">{t("lease.indefiniteHelper")}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-lease-rent">{t("lease.monthlyRentRequired", { currency: selectedHouseForLease.leaseContract.currency })}</Label>
                      <Input
                        id="edit-lease-rent"
                        type="number"
                        step="0.01"
                        min="0"
                        value={editedLeaseData.monthlyRent}
                        onChange={(e) => setEditedLeaseData({ ...editedLeaseData, monthlyRent: e.target.value })}
                        data-testid="input-edit-lease-rent"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-lease-payment-day">{t("lease.paymentDayRequired")}</Label>
                      <Input
                        id="edit-lease-payment-day"
                        type="number"
                        min="1"
                        max="31"
                        value={editedLeaseData.paymentDay}
                        onChange={(e) => setEditedLeaseData({ ...editedLeaseData, paymentDay: e.target.value })}
                        data-testid="input-edit-lease-payment-day"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 justify-end pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={handleCancelEditLease}
                      data-testid="button-cancel-edit-lease"
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button
                      onClick={handleSaveLease}
                      data-testid="button-save-lease"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {t("common.save")}
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{t("lease.noContractInfo")}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reminders Dialog */}
      <Dialog open={isRemindersDialogOpen} onOpenChange={setIsRemindersDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("reminders.title")}</DialogTitle>
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
                      maintenance: t("reminders.typeMaintenance"),
                      lease_end: t("reminders.typeLeaseEnd"),
                      meter_reading: t("reminders.typeMeterReading"),
                      inspection: t("reminders.typeInspection"),
                      other: t("reminders.typeOther"),
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
                                  {reminder.recurring === "monthly" ? t("reminders.recurringMonthly") : t("reminders.recurringYearly")}
                                </Badge>
                              )}
                              {shouldAlert && (
                                <Badge variant="default" className="bg-amber-600">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  {t("reminders.approaching")}
                                </Badge>
                              )}
                            </div>
                            
                            <h4 className="font-semibold mb-1" data-testid={`text-reminder-title-${reminder.id}`}>
                              {reminder.title}
                            </h4>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(reminder.date).toLocaleDateString(i18n.language)}
                              </div>
                              <div>
                                {daysUntil > 0 ? t("reminders.daysLater", { days: daysUntil }) : daysUntil === 0 ? t("reminders.today") : t("reminders.daysAgo", { days: Math.abs(daysUntil) })}
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
                  {t("reminders.addReminder")}
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">{t("reminders.noReminders")}</p>
                <Button
                  onClick={() => setIsAddReminderOpen(true)}
                  data-testid="button-add-first-reminder"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t("reminders.addFirstReminder")}
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
            <DialogTitle>{t("reminders.addReminderTitle")}</DialogTitle>
            <DialogDescription>
              {t("reminders.createFor", { houseName: selectedHouseForReminders?.name })}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reminder-type">{t("reminders.reminderType")}</Label>
              <Select
                value={newReminder.type}
                onValueChange={(value) => setNewReminder({ ...newReminder, type: value as Reminder["type"] })}
              >
                <SelectTrigger id="reminder-type" data-testid="select-reminder-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">{t("reminders.typeMaintenance")}</SelectItem>
                  <SelectItem value="lease_end">{t("reminders.typeLeaseEnd")}</SelectItem>
                  <SelectItem value="meter_reading">{t("reminders.typeMeterReading")}</SelectItem>
                  <SelectItem value="inspection">{t("reminders.typeInspection")}</SelectItem>
                  <SelectItem value="other">{t("reminders.typeOther")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-title">{t("reminders.titleRequired")}</Label>
              <Input
                id="reminder-title"
                placeholder={t("reminders.titlePlaceholder")}
                value={newReminder.title}
                onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                data-testid="input-reminder-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-date">{t("reminders.dateRequired")}</Label>
              <Input
                id="reminder-date"
                type="date"
                value={newReminder.date}
                onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })}
                data-testid="input-reminder-date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-alert">{t("reminders.alertDays")}</Label>
              <Select
                value={newReminder.alertDaysBefore.toString()}
                onValueChange={(value) => setNewReminder({ ...newReminder, alertDaysBefore: parseInt(value) })}
              >
                <SelectTrigger id="reminder-alert" data-testid="select-reminder-alert">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t("reminders.alert1Day")}</SelectItem>
                  <SelectItem value="3">{t("reminders.alert3Days")}</SelectItem>
                  <SelectItem value="7">{t("reminders.alert1Week")}</SelectItem>
                  <SelectItem value="14">{t("reminders.alert2Weeks")}</SelectItem>
                  <SelectItem value="30">{t("reminders.alert1Month")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-recurring">{t("reminders.recurring")}</Label>
              <Select
                value={newReminder.recurring || "none"}
                onValueChange={(value) => setNewReminder({ ...newReminder, recurring: value as Reminder["recurring"] })}
              >
                <SelectTrigger id="reminder-recurring" data-testid="select-reminder-recurring">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("reminders.recurringNone")}</SelectItem>
                  <SelectItem value="monthly">{t("reminders.recurringMonthly")}</SelectItem>
                  <SelectItem value="yearly">{t("reminders.recurringYearly")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-note">{t("reminders.noteOptional")}</Label>
              <Input
                id="reminder-note"
                placeholder={t("reminders.notePlaceholder")}
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
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => {
                if (!newReminder.title || !newReminder.date) {
                  toast({
                    title: t("reminders.missingInfo"),
                    description: t("reminders.fillRequired"),
                    variant: "destructive",
                  });
                  return;
                }

                if (selectedHouseForReminders) {
                  // Update client-side data in localStorage
                  const existingClientData = getClientSideData(selectedHouseForReminders.id);
                  const newReminderData = {
                    id: `r${Date.now()}`,
                    ...newReminder,
                  };
                  
                  saveClientSideData(selectedHouseForReminders.id, {
                    ...existingClientData,
                    reminders: [
                      ...(existingClientData.reminders || []),
                      newReminderData,
                    ],
                  });
                  
                  // Trigger re-render
                  queryClient.invalidateQueries({ queryKey: ["/api/houses", user.tenantId] });
                  
                  toast({
                    title: t("common.success"),
                    description: t("reminders.reminderAdded"),
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
              {t("common.save")}
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
