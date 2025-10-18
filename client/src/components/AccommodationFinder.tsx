import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, MapPin, Users, Bed, Euro, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

type AvailableBed = {
  houseId: string;
  houseName: string;
  houseAddress: string;
  city: string;
  roomNumber: string;
  roomType: string;
  roomGenderRestriction: string;
  bedNumber: string;
  totalBedsInRoom: number;
  occupiedBedsInRoom: number;
  pricePerDay: number;
  pricePerMonth: number;
};

type AccommodationFinderProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workerGender: "Erkek" | "Kadın";
  workerName: string;
  workerCity?: string;
  onAssign: (accommodation: { house: string; room: string; bed: string }) => void;
};

// Mock available beds data
const mockAvailableBeds: AvailableBed[] = [
  {
    houseId: "h1",
    houseName: "Geldernstrasse 13",
    houseAddress: "Geldernstrasse 13, Düsseldorf",
    city: "Almanya",
    roomNumber: "45",
    roomType: "Standart",
    roomGenderRestriction: "Erkek",
    bedNumber: "2",
    totalBedsInRoom: 4,
    occupiedBedsInRoom: 2,
    pricePerDay: 15,
    pricePerMonth: 350,
  },
  {
    houseId: "h1",
    houseName: "Geldernstrasse 13",
    houseAddress: "Geldernstrasse 13, Düsseldorf",
    city: "Almanya",
    roomNumber: "46",
    roomType: "Standart",
    roomGenderRestriction: "Erkek",
    bedNumber: "1",
    totalBedsInRoom: 4,
    occupiedBedsInRoom: 0,
    pricePerDay: 15,
    pricePerMonth: 350,
  },
  {
    houseId: "h2",
    houseName: "Hauptstrasse 45",
    houseAddress: "Hauptstrasse 45, Köln",
    city: "Almanya",
    roomNumber: "101",
    roomType: "Standart",
    roomGenderRestriction: "Kadın",
    bedNumber: "4",
    totalBedsInRoom: 4,
    occupiedBedsInRoom: 3,
    pricePerDay: 18,
    pricePerMonth: 400,
  },
  {
    houseId: "h2",
    houseName: "Hauptstrasse 45",
    houseAddress: "Hauptstrasse 45, Köln",
    city: "Hollanda",
    roomNumber: "103",
    roomType: "Aile",
    roomGenderRestriction: "Kadın",
    bedNumber: "1",
    totalBedsInRoom: 2,
    occupiedBedsInRoom: 0,
    pricePerDay: 25,
    pricePerMonth: 550,
  },
  {
    houseId: "h3",
    houseName: "Marktplatz 7",
    houseAddress: "Marktplatz 7, Essen",
    city: "Türkiye",
    roomNumber: "201",
    roomType: "Standart",
    roomGenderRestriction: "Erkek",
    bedNumber: "3",
    totalBedsInRoom: 4,
    occupiedBedsInRoom: 1,
    pricePerDay: 12,
    pricePerMonth: 280,
  },
  {
    houseId: "h4",
    houseName: "Atatürk Caddesi 42",
    houseAddress: "Atatürk Caddesi 42, Kadıköy, İstanbul",
    city: "Türkiye",
    roomNumber: "1",
    roomType: "Standart",
    roomGenderRestriction: "Erkek",
    bedNumber: "1",
    totalBedsInRoom: 4,
    occupiedBedsInRoom: 1,
    pricePerDay: 10,
    pricePerMonth: 250,
  },
  {
    houseId: "h4",
    houseName: "Atatürk Caddesi 42",
    houseAddress: "Atatürk Caddesi 42, Kadıköy, İstanbul",
    city: "Türkiye",
    roomNumber: "2",
    roomType: "Standart",
    roomGenderRestriction: "Kadın",
    bedNumber: "3",
    totalBedsInRoom: 4,
    occupiedBedsInRoom: 2,
    pricePerDay: 10,
    pricePerMonth: 250,
  },
];

export default function AccommodationFinder({
  open,
  onOpenChange,
  workerGender,
  workerName,
  workerCity,
  onAssign,
}: AccommodationFinderProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [showOnlyEmpty, setShowOnlyEmpty] = useState(false);

  // Get unique cities
  const cities = ["all", ...Array.from(new Set(mockAvailableBeds.map((bed) => bed.city)))];

  // Filter beds based on criteria
  const filteredBeds = mockAvailableBeds.filter((bed) => {
    // City filter
    if (selectedCity !== "all" && bed.city !== selectedCity) return false;

    // Gender compatibility filter
    if (
      bed.roomGenderRestriction !== "Karışık" &&
      bed.roomGenderRestriction !== workerGender
    ) {
      return false;
    }

    // Only show empty beds filter (rooms with 0 occupancy)
    if (showOnlyEmpty && bed.occupiedBedsInRoom > 0) {
      return false;
    }

    return true;
  });

  // Sort beds: same city first, then by occupancy (less occupied rooms first)
  const sortedBeds = [...filteredBeds].sort((a, b) => {
    // Prioritize worker's city first
    if (workerCity) {
      const aSameCity = a.city === workerCity ? 1 : 0;
      const bSameCity = b.city === workerCity ? 1 : 0;
      if (aSameCity !== bSameCity) {
        return bSameCity - aSameCity; // Same city comes first
      }
    }

    // Then prioritize less occupied rooms
    const occupancyA = a.occupiedBedsInRoom / a.totalBedsInRoom;
    const occupancyB = b.occupiedBedsInRoom / b.totalBedsInRoom;
    return occupancyA - occupancyB;
  });

  const handleAssign = (bed: AvailableBed) => {
    onAssign({
      house: bed.houseName,
      room: bed.roomNumber,
      bed: bed.bedNumber,
    });
    onOpenChange(false);
    toast({
      title: "Konaklama Atandı",
      description: `${workerName} için ${bed.houseName}, Oda ${bed.roomNumber}, Yatak ${bed.bedNumber} atandı`,
    });
  };

  const getGenderBadgeColor = (restriction: string) => {
    if (restriction === "Erkek") return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
    if (restriction === "Kadın") return "bg-pink-500/10 text-pink-700 dark:text-pink-400";
    return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Uygun Konaklama Bul</DialogTitle>
          <DialogDescription>
            {workerName} ({workerGender}) için uygun yatak bulun ve atayın
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Filters */}
          <div className="space-y-3 pb-4 border-b">
            <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="city-filter">Ülke</Label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger id="city-filter" data-testid="select-city-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Ülkeler</SelectItem>
                  {cities
                    .filter((c) => c !== "all")
                    .map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="check-in">Giriş Tarihi</Label>
              <Input
                id="check-in"
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                data-testid="input-check-in"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="check-out">Çıkış Tarihi (Opsiyonel)</Label>
              <Input
                id="check-out"
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                data-testid="input-check-out"
              />
            </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-only-empty"
                checked={showOnlyEmpty}
                onCheckedChange={(checked) => setShowOnlyEmpty(checked as boolean)}
                data-testid="checkbox-only-empty"
              />
              <Label htmlFor="show-only-empty" className="text-sm cursor-pointer">
                Sadece boş yatakları göster
              </Label>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {sortedBeds.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Seçilen kriterlere uygun boş yatak bulunamadı
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {sortedBeds.length} uygun yatak bulundu
                  </p>
                </div>

                {sortedBeds.map((bed, index) => (
                  <div
                    key={`${bed.houseId}-${bed.roomNumber}-${bed.bedNumber}`}
                    className="border rounded-lg p-4 hover-elevate"
                    data-testid={`accommodation-card-${index}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Bed className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{bed.houseName}</h4>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" />
                              {bed.houseAddress}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">
                            Oda {bed.roomNumber}
                          </Badge>
                          <Badge variant="secondary">
                            Yatak {bed.bedNumber}
                          </Badge>
                          <Badge variant="outline">
                            {bed.roomType}
                          </Badge>
                          <Badge
                            className={getGenderBadgeColor(bed.roomGenderRestriction)}
                          >
                            {bed.roomGenderRestriction}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>
                              {bed.occupiedBedsInRoom}/{bed.totalBedsInRoom} {t('dashboard.occupiedBeds')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Euro className="w-4 h-4" />
                            <span>
                              €{bed.pricePerMonth}/ay
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleAssign(bed)}
                        data-testid={`button-assign-${index}`}
                      >
                        Ata
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
