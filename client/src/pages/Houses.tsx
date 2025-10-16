import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Building2, MapPin, Edit, Bed, Trash2, ChevronsUpDown, Check, Zap, Droplet } from "lucide-react";
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
import { cn } from "@/lib/utils";

// Room type definition
type RoomInfo = {
  roomNumber: string;
  beds: number;
  canRentAsRoom: boolean;
  useFloor: boolean;
  floor?: number;
};

// Meter reading type
type MeterReading = {
  id: string;
  date: string;
  value: number;
  note?: string;
};

type MeterLogs = {
  electricity: MeterReading[];
  water: MeterReading[];
};

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
      { roomNumber: "45", beds: 3, canRentAsRoom: false, useFloor: true, floor: 2 },
      { roomNumber: "46", beds: 2, canRentAsRoom: true, useFloor: true, floor: 2 },
      { roomNumber: "47", beds: 2, canRentAsRoom: false, useFloor: true, floor: 2 },
    ],
    totalBeds: 7,
    occupiedBeds: 5,
    ownershipType: "Kiralık",
    meterLogs: {
      electricity: [
        { id: "e1", date: "2024-12-15", value: 15420, note: "Normal okuma" },
        { id: "e2", date: "2024-11-15", value: 15180 },
        { id: "e3", date: "2024-10-15", value: 14950 },
      ],
      water: [
        { id: "w1", date: "2024-12-15", value: 8520, note: "Normal okuma" },
        { id: "w2", date: "2024-11-15", value: 8410 },
        { id: "w3", date: "2024-10-15", value: 8305 },
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
      { roomNumber: "101", beds: 4, canRentAsRoom: false, useFloor: true, floor: 1 },
      { roomNumber: "102", beds: 2, canRentAsRoom: false, useFloor: true, floor: 1 },
    ],
    totalBeds: 6,
    occupiedBeds: 4,
    ownershipType: "Mülk",
    meterLogs: {
      electricity: [
        { id: "e4", date: "2024-12-10", value: 22150, note: "Yılsonu okuması" },
        { id: "e5", date: "2024-11-10", value: 21890 },
      ],
      water: [
        { id: "w4", date: "2024-12-10", value: 12340 },
        { id: "w5", date: "2024-11-10", value: 12210 },
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
      { roomNumber: "201", beds: 3, canRentAsRoom: true, useFloor: true, floor: 2 },
      { roomNumber: "202", beds: 2, canRentAsRoom: false, useFloor: true, floor: 2 },
    ],
    totalBeds: 5,
    occupiedBeds: 3,
    ownershipType: "3. Taraf",
    meterLogs: {
      electricity: [
        { id: "e6", date: "2024-12-01", value: 18920 },
        { id: "e7", date: "2024-11-01", value: 18720 },
      ],
      water: [
        { id: "w6", date: "2024-12-01", value: 9850, note: "Kaçak kontrol edildi" },
        { id: "w7", date: "2024-11-01", value: 9730 },
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHouse, setEditingHouse] = useState<typeof initialMockHouses[0] | null>(null);
  const [countryOpen, setCountryOpen] = useState(false);
  
  // Meter logs state
  const [isMeterDialogOpen, setIsMeterDialogOpen] = useState(false);
  const [selectedHouseForMeters, setSelectedHouseForMeters] = useState<typeof initialMockHouses[0] | null>(null);
  const [isAddReadingOpen, setIsAddReadingOpen] = useState(false);
  const [newReading, setNewReading] = useState({
    meterType: "electricity" as "electricity" | "water",
    date: new Date().toISOString().split("T")[0],
    value: "",
    note: "",
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
  });

  const filteredHouses = houses.filter(
    (house) =>
      house.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      house.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      house.address.toLowerCase().includes(searchQuery.toLowerCase())
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
    });
    setIsDialogOpen(true);
  };

  const handleAddRoom = () => {
    setFormData({
      ...formData,
      rooms: [...formData.rooms, { roomNumber: "", beds: 1, canRentAsRoom: false, useFloor: false, floor: undefined }],
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
    };

    // Update the house with the new reading
    setHouses(houses.map(h => {
      if (h.id === selectedHouseForMeters.id) {
        const updatedLogs = { ...h.meterLogs };
        if (newReading.meterType === "electricity") {
          updatedLogs.electricity = [newReadingData, ...(updatedLogs.electricity || [])];
        } else {
          updatedLogs.water = [newReadingData, ...(updatedLogs.water || [])];
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
      } else {
        updatedLogs.water = [newReadingData, ...(updatedLogs.water || [])];
      }
      setSelectedHouseForMeters({ ...updatedHouse, meterLogs: updatedLogs });
    }

    // Reset form
    setNewReading({
      meterType: "electricity",
      date: new Date().toISOString().split("T")[0],
      value: "",
      note: "",
    });
    setIsAddReadingOpen(false);
    
    toast({
      title: "Başarılı",
      description: `${newReading.meterType === "electricity" ? "Elektrik" : "Su"} sayacı okuması eklendi`,
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
      <Header tenantName="Cova B.V." userName="Admin" />

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

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Konut ara (adres, şehir)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-house"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHouses.map((house) => {
              const occupancyRate = ((house.occupiedBeds / house.totalBeds) * 100).toFixed(0);
              const emptyBeds = house.totalBeds - house.occupiedBeds;

              return (
                <Card key={house.id} className="hover:shadow-lg transition-shadow" data-testid={`house-card-${house.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg" data-testid={`text-house-name-${house.id}`}>
                            {house.name}
                          </CardTitle>
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
                {formData.rooms.map((room, index) => (
                  <div
                    key={index}
                    className="p-4 bg-muted/30 rounded-lg border space-y-3"
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
                              handleRoomChange(index, "useFloor", !!checked);
                              if (!checked) {
                                handleRoomChange(index, "floor", undefined);
                              }
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
                  </div>
                ))}
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
          </div>

          <div className="flex gap-3 justify-end">
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
        </DialogContent>
      </Dialog>

      {/* Meter Logs Dialog */}
      <Dialog open={isMeterDialogOpen} onOpenChange={setIsMeterDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sayaç Bilgileri</DialogTitle>
            <DialogDescription>
              {selectedHouseForMeters?.name} için elektrik ve su sayacı okumaları
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
                  <div className="space-y-2">
                    {selectedHouseForMeters.meterLogs.electricity.map((reading, index) => {
                      const prevReading = selectedHouseForMeters.meterLogs.electricity[index + 1];
                      const consumption = prevReading ? reading.value - prevReading.value : null;
                      
                      return (
                        <div 
                          key={reading.id} 
                          className="p-3 border rounded-lg bg-card"
                          data-testid={`electricity-reading-${reading.id}`}
                        >
                          <div className="flex items-center justify-between">
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
                        </div>
                      );
                    })}
                  </div>
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
                  <div className="space-y-2">
                    {selectedHouseForMeters.meterLogs.water.map((reading, index) => {
                      const prevReading = selectedHouseForMeters.meterLogs.water[index + 1];
                      const consumption = prevReading ? reading.value - prevReading.value : null;
                      
                      return (
                        <div 
                          key={reading.id} 
                          className="p-3 border rounded-lg bg-card"
                          data-testid={`water-reading-${reading.id}`}
                        >
                          <div className="flex items-center justify-between">
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
                        </div>
                      );
                    })}
                  </div>
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
              Elektrik veya su sayacı için yeni okuma değeri girin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meter-type">Sayaç Türü *</Label>
              <Select
                value={newReading.meterType}
                onValueChange={(value: "electricity" | "water") => 
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
    </div>
  );
}
